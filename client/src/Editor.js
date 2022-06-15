import {
  DIALOGS, FILE_TYPE_ASSET, FILE_TYPE_COMPONENT, FILE_TYPE_DIR, FILE_TYPE_DISPLAY,
  FILE_TYPE_MODEL, FILE_TYPE_SCENE, FILE_TYPE_SYMBOL, FILE_TYPE_UI
} from "./constants.js";
import config from "./config.js";
import {
  clone, copy, createItem, fileNameToDisplayName, getFileExt,
  getQueryString, getString, isAsset, isComponent, isCtrlDown, isDisplay,
  isDXF, isEmptyObject, isEsc, isImage, isInput, isJSON, isModel, isNumber,
  isObject,
  isOTF, isScene, isShiftDown, isString, isSVG, isSymbol, isTTF, isUI, jsonToPNG, layoutMainView,
  msClass, parse, readLocalFile, removeCache, snapshot, stringify, trimExtension, useI18Param, xhrLoad
} from "./util/index.js";
import { createAlert, getInput } from "./util/DialogHelper.js";
import { getInstance } from "./util/Instances.js";
import WebSocketService from "./util/WebSocketService.js";
import ShapeHelper from "./util/ShapeHelper.js";
import DND from "./util/DND.js";
import { toJson, toNode } from "./util/editor.js";

import Image from "./type/Image.js";

import EventView from "./dialog/EventView.js";
import ObjectView from "./dialog/ObjectView.js";
import TextView from "./dialog/TextView.js";
import FontView from "./dialog/FontView.js";
import ComponentView from "./dialog/ComponentView.js";
import ConfirmView from "./dialog/ConfirmView.js";
import AttachPointsView from "./dialog/AttachPointsView.js";
import SymbolLayoutView from "./dialog/SymbolLayoutView.js";
import FunctionView from "./dialog/FunctionView.js";
import DNDFromOutside from "./util/DNDFromOutside.js";

import MainToolbar from "./toolbar/MainToolbar.js";
import RightToolbar from "./toolbar/RightToolbar.js";

import ListPane from "./pane/ListPane.js";
import Overview from "./pane/Overview.js";
import LayerPane from "./pane/LayerPane.js";
import FuncView from "./pane/FuncView.js";
import IconsView from "./pane/IconsView.js";
import DataView from "./pane/DataView.js";
import SymbolStatePane from "./pane/SymbolStatePane.js";
import InspectorTool from "./pane/InspectorTool.js";
import InspectorPane from "./pane/InspectorPane.js";

import TabView from "./view/TabView.js";
import SplitView from "./view/SplitView.js";
import MainTabView from "./view/MainTabView.js";
import DisplayView from "./view/DisplayView.js";
import SymbolView from "./view/SymbolView.js";
import MessageView from "./view/MessageView.js";
import Explorer from "./view/Explorer.js";
import Scenes from "./view/Scenes.js"
import Models from "./view/Models.js"
import Assets from "./view/Assets.js"
import Components from "./view/Components.js"
import Displays from "./view/Displays.js";
import Symbols from "./view/Symbols.js";
import Uis from "./view/Uis.js";
import CompType from "./type/CompType.js";

class Editor {
  constructor(params = {}) {
    this.params = params;
    this.body = this.params.body;
    this._eventNotifier = new ht.Notifier;
    var Service = ht.Default.getClass(config.serviceClass) || WebSocketService;
    this.service = new Service(e => {
      this.handleServiceEvent(e);
      this.fireEvent(e.type, e)
    }, this);
  }

  addEventListener(listener, scope, ahead) {
    this._eventNotifier.add(listener, scope, ahead);
  }

  removeEventListener(listener, scope) {
    this._eventNotifier.remove(listener, scope);
  }

  fireViewEvent(view, type, params = {}, changed = true) {
    if (view.sceneView) {
      changed && (type = "sceneView" + type);
      params.sceneView = view.sceneView;
    } else if (view.type === "symbol") {
      changed && (type = "symbolView" + type);
      params.symbolView = view;
    } else if (view.type === "display") {
      changed && (type = "displayView" + type);
      params.displayView = view;
    } else if (view.type === "scene") {
      changed && (type = "sceneView" + type);
      params.sceneView = view;
    }
    this.fireEvent(type, params)
  }

  fireEvent(type, params = {}) {
    config.handleEvent?.(this, type, params);
    var name = "on" + type.charAt(0).toUpperCase() + type.slice(1);
    config[name]?.(this, params);
    this.params[name]?.(this, params);
    this._eventNotifier.fire({
      editor: this,
      type,
      params
    })
  }

  handleServiceEvent(e) {
    if (e.type === "connected") {
      if (this.init) {
        this.init();
        this.init = null;
      }
    } else if (e.type === "fileChanged") {
      const path = e.path;
      this.updateUIRefs(path);

      let removeHandler = removeCache(path);
      const getHandler = this.getFileNode(path);
      if (getHandler) {
        removeHandler = removeCache(getHandler.getFileUUID()) || removeHandler;
      }
      removeHandler && this.deleteTexture(path);
      if (isDisplay(path)) {
        this.requestDisplays();
      } else if (isSymbol(path)) {
        this.requestSymbols()
      } else if (isComponent(path)) {
        this.requestComponents();
      } else if (isScene(path)) {
        this.requestScenes();
      } else if (isModel(path)) {
        this.requestModels();
      } else if (isUI(path)) {
        this.requestUIs()
      } else if (isAsset(path)) {
        this.requestAssets()
      }
    } else if (e.type === "download") {
      this.downloadFile(e.path);
    } else if (e.type === "confirm") {
      this.requestImport(e.path);
    }
  }

  init() {
    this._inspectorCompact = !isEmptyObject(config.compactFilter);
    this.menus = [];
    this.cloneInfo = {
      type: null,
      funcArray: [],
      jsonArray: []
    };
    this.shapeHelper = new ShapeHelper(this);
    this.initSID();
    this.initUI();
    this.requestDisplays();
    this.requestSymbols();
    this.requestComponents();
    this.requestScenes();
    this.requestModels();
    this.requestUIs();
    this.requestAssets();
    this.body && this.body.addEventListener("keydown", this.handleKeydown.bind(this), false);
    this.dnd = new DND(this);
    this.dndFromOutside = new DNDFromOutside(this, this.mainPane.getView());
    this.fireEvent("editorCreated");
    this.fireEvent("mainMenuCreated");
    this.fireEvent("mainToolbarCreated");
    this.fireEvent("rightToolbarCreated");
    const value = this.params.open || getQueryString("tpeditor");
    if (value) {
      var handler = config.paramHandlers[value];
      if (handler && !handler(this)) return;
      if (isJSON(value)) {
        this._pendingOpenJSON = value;
      } else if (value === "newdisplay") {
        this.newDisplayView();
      } else if (value === "newsymbol") {
        this.newSymbolView();
      } else if (value === "newcomponent") {
        this.newComponent();
      }
    }
  }

  initUI() {
    this.mainTabView = new MainTabView(this);
    this.funcView = new FuncView(this);
    this.eventView = new EventView(this);
    this.functionView = new FunctionView(this);
    this.objectView = new ObjectView(this);
    this.textView = new TextView(this);
    this.fontView = new FontView(this);
    this.iconsView = new IconsView(this);
    this.componentView = new ComponentView(this);
    this.messageView = new MessageView(this);
    this.confirmView = new ConfirmView(this);
    this.attachPointsView = new AttachPointsView(this);
    this.symbolLayoutView = new SymbolLayoutView(this);
    this.initTop();
    this.initLeftTop();
    this.initRightBottom();
    this.initRightTop();
    this.leftSplitView = new SplitView(this.leftTopTabView, this.mainTabView, "h", config.leftSplitViewPosition);
    this.rightSplitView = new SplitView(this.rightTopBorderPane, this.rightBottomTabView, "v", config.rightSplitViewPosition);
    this.mainSplitView = new SplitView(this.leftSplitView, this.rightSplitView, "h", config.mainSplitViewPosition);
    this.mainPane = new ht.widget.BorderPane;
    this.mainPane.setTopView(this.topBorderPane);
    this.mainPane.setCenterView(this.mainSplitView);
    layoutMainView(this.mainPane, this.body);
    this.mainPane.validateImpl();
  }

  initSID() {
    const result = window.location.href.match("sid=([0-9a-z-]*)");
    if (result) {
      this.sid = result[1];
    }
  }

  initTop() {
    this.mainToolbar = new MainToolbar(this);
    this.rightToolbar = new RightToolbar(this);
    this.topBorderPane = new ht.widget.BorderPane;
    this.topBorderPane.setCenterView(this.mainToolbar);
    this.topBorderPane.setRightView(this.rightToolbar);
    this.topBorderPane.setHeight(28);
    this.rightToolbar.onSumWidthChanged = () => {
      this.topBorderPane.setRightWidth(this.rightToolbar.getSumWidth());
    }
  }

  initLeftTop() {
    this.displays = new Displays(this, config.displaysEditable);
    this.symbols = new Symbols(this, config.symbolsEditable);
    this.components = new Components(this, config.componentsEditable);
    this.scenes = new Scenes(this, config.scenesEditable);
    this.models = new Models(this, config.modelsEditable);
    this.uis = new Uis(this, config.uisEditable);
    this.assets = new Assets(this, config.assetsEditable);
    this.leftTopTabView = new TabView;
    this.scenesTab = this.leftTopTabView.add(getString("editor.scenes"), this.scenes, false, config.scenesVisible);
    this.displaysTab = this.leftTopTabView.add(getString("editor.displays"), this.displays, false, config.displaysVisible);
    this.symbolsTab = this.leftTopTabView.add(getString("editor.symbols"), this.symbols, false, config.symbolsVisible);
    this.componentsTab = this.leftTopTabView.add(getString("editor.components"), this.components, false, config.componentsVisible);
    this.modelsTab = this.leftTopTabView.add(getString("editor.models"), this.models, false, config.modelsVisible);
    this.uisTab = this.leftTopTabView.add(getString("editor.uis"), this.uis, false, config.uisVisible);
    this.assetsTab = this.leftTopTabView.add(getString("editor.assets"), this.assets, false, config.assetsVisible);
    this.leftTopTabView.select(config.scenesVisible ? this.scenesTab : this.displaysTab)
  }

  initRightTop() {
    this.inspectorTool = new InspectorTool(this);
    this.inspectorPane = new InspectorPane(this);
    this.rightTopBorderPane = new ht.widget.BorderPane;
    this.rightTopBorderPane.setTopView(this.inspectorTool);
    this.rightTopBorderPane.setCenterView(this.inspectorPane);
    this.rightTopBorderPane.setTopHeight(ht.Default.widgetHeaderHeight + 6);
  }

  initRightBottom() {
    this.listPane = new ListPane(this);
    this.layerPane = new LayerPane(this);
    this.overview = new Overview(this);
    this.dataView = new DataView(this);
    this.symbolStatePane = new SymbolStatePane(this);
    tpeditor.BatchView && (this.batchView = new tpeditor.BatchView(this));
    tpeditor.ProblemsPane && (this.problemsView = new tpeditor.ProblemsPane(this));
    const tv = this.rightBottomTabView = new TabView;
    this.listPaneTab = this.rightBottomTabView.add(getString("editor.list"), this.listPane, true);
    config.layerEnabled && (this.layerTab = this.rightBottomTabView.add(getString("editor.layer"), this.layerPane, false, false));
    config.symbolStateEnabled && (this.symbolStateTab = this.rightBottomTabView.add(getString("editor.state"), this.symbolStatePane, false, false));
    config.overviewEnabled && (this.overviewTab = this.rightBottomTabView.add(getString("editor.overview"), this.overview));
    config.batchViewEnabled && tpeditor.BatchView && (this.batchViewTab = this.rightBottomTabView.add(getString("editor.batch"), this.batchView));
    config.problemsEnabled && tpeditor.ProblemsPane && (this.problemsTab = this.rightBottomTabView.add(getString("editor.problems"), this.problemsView, false, true));
    config.dataViewEnabled && (this.dataViewTab = this.rightBottomTabView.add(getString("editor.data"), this.dataView));
    const sm = this.rightBottomTabView.getTabModel().sm();
    sm.ms(() => {
      const ld = sm.ld();
      if (ld) {
        this.dataView.visible = ld.getView() === this.dataView;
        this.overview.setAutoUpdate(ld.getView() === this.overview);
      }
    });
    tv.getLabel = tab => {
      const label = tab.toLabel();
      if (tab === this.symbolStateTab) {
        const ld = this.symbolStatePane.tableModel.sm().ld();
        if (ld) {
          const name = ld.a("stateDisplayName") || ld.a("stateName");
          return label + (name ? " - " + name : "");
        }
      }
      return label;
    }
  }

  newFolder(fileTree) {
    const explorer = this.explorer;
    if (explorer) {
      let ld = fileTree.sm().ld();
      if (fileTree === fileTree.explorer.list && ld?.fileType !== FILE_TYPE_DIR) {
        ld = fileTree.explorer.tree.sm().ld();
      }
      if (!ld || explorer.isAccordionMode()) {
        ld = fileTree.explorer.rootNode;
      }
      getInput(getString("editor.inputnewfoldername"), "", {
        nullable: false,
        trim: true,
        maxLength: config.maxFileNameLength,
        checkFunc: config.checkFileName,
        body: this.body
      }, (_dir, action) => {
        if (action === "ok") {
          const dir = (ld ? ld.url : explorer.rootDir) + "/" + _dir;
          if (this.getFileNode(dir)) {
            createAlert(getString("editor.filenameconflict"), dir);
            return;
          }
          let params = dir;
          if (config.vision) {
            params = { dir, parent_uuid: ld.uuid, root_dir: ld.rootDir };
          }
          this.request("mkdir", params, () => { });
        }
      })
    }
  }

  getFileNode(url) {
    const list = this.leftTopTabView.getTabModel().getDatas();
    for (let i = 0; i < list.size(); i++) {
      var data = list.get(i);
      if (data.getView() instanceof Explorer) {
        var fileNode = data.getView().findFileNode(url);
        if (fileNode) {
          return fileNode
        }
      }
    }
    return null;
  }

  selectFileNode(path) {
    const list = this.leftTopTabView.getTabModel().getDatas();
    for (let i = 0; i < list.size(); i++) {
      const data = list.get(i);
      if (data.isVisible() && data.getView() instanceof Explorer) {
        const callback = () => {
          const view = data.getView(),
            fileNode = view.findFileNode(path);
          if (fileNode) {
            this.leftTopTabView.getTabModel().sm().ss(data);
            if (view.isAccordionMode()) {
              if (fileNode.fileType === FILE_TYPE_DIR) {
                view.accordion.sm().ss(fileNode);
              } else {
                fileNode.getParent().expanded = true;
                view.accordion.sm().ss(fileNode);
              }
              view.accordion.ivm();
            } else if (fileNode.fileType === FILE_TYPE_DIR) {
              view.tree.sm().ss(fileNode),
                setTimeout(() => {
                  view.tree.makeVisible(fileNode)
                }, 500);
            } else {
              view.tree.sm().ss(fileNode.getParent());
              view.list.sm().ss(fileNode);
              setTimeout(() => {
                view.tree.makeVisible(fileNode.getParent());
                view.list.makeVisible(fileNode);
              }, 500);
            }
            delete this._pendingSelectURL;
            return { v: undefined };
          }
        };
        callback();
        if (isObject(callback)) {
          return callback.v;
        }
      }
    }
    this._pendingSelectURL = path;
  }

  makeFileNodeVisible(path) {
    const list = this.leftTopTabView.getTabModel().getDatas();
    for (let i = 0; i < list.size(); i++) {
      const data = list.get(i),
        view = data.getView();
      if (view instanceof Explorer) {
        const node = view.findFileNode(path);
        if (node) {
          const parent = node.getParent();
          view.tree.sm().ss(parent);
          view.tree.makeVisible(parent);
          view.list.makeVisible(node);
        }
      }
    }
  }

  renameFile(fileNode, fileName, callback) {
    if (!fileNode || fileNode._tag || fileNode.a("editable") === false || !fileName) return false;
    if (isJSON(fileNode.getName()) && !isJSON(fileName)) {
      fileName += ".json";
    }
    const url = fileNode.path + "/" + fileName,
      result = config.checkFileName(fileName, url);
    if (!result) {
      createAlert(getString("editor.invalidinput"), fileName);
      return false;
    }
    if (fileName.length > config.maxFileNameLength + 5) {
      createAlert(getString("editor.inputmax"), fileName);
      return false;
    }
    if (fileNode.getName() === fileName) return false;
    if (this.getFileNode(url)) {
      createAlert(getString("editor.filenameconflict"), url);
      return false;
    }
    fileNode._tag = url;
    const params = { old: fileNode.url, new: fileNode._tag, fileType: fileNode.fileType };
    if (isJSON(params.old)) {
      this.request("rename", {
        old: jsonToPNG(params.old),
        new: jsonToPNG(params.new),
        fileType: FILE_TYPE_ASSET
      }, () => { });
    }
    this.request("rename", params, silent => {
      if (silent) {
        this.mainTabView.getTabModel().each(data => {
          if (data.getTag() === fileNode.url) {
            data.setTag(fileNode._tag);
            data.getView().url = fileNode._tag;
            data.setName(trimExtension(fileName));
          }
        });
        callback();
        const _params = clone(params);
        _params.data = fileNode;
        this.fireEvent("fileRenamed", _params);
        return true;
      }
      delete fileNode._tag;
      return false;
    })
  }

  moveFile(fileNode, parent) {
    if (fileNode?.a("editable") !== false && !fileNode._tag && !parent?._tag) {
      let params = { data: fileNode, url: fileNode.url, parent };
      if (this.fireEvent("fileMoving", params), !params.preventDefault) {
        var data = fileNode.getParent();
        fileNode.setParent(parent);
        if (data !== fileNode.getParent()) {
          fileNode._tag = parent.url + "/" + fileNode.getName();
          params = { old: fileNode.url, new: fileNode._tag };
          if (isJSON(params.old)) {
            this.request("rename", {
              old: jsonToPNG(params.old),
              new: jsonToPNG(params.new)
            }, () => { });
          }
          this.request("rename", params, () => { });
        }
      }
    }
  }

  removeFiles(fileNodes) {
    fileNodes.forEach(fileNode => {
      if (!fileNode._tag && fileNode.a("editable") !== false) {
        const path = fileNode.url || fileNode;
        if (isJSON(path)) {
          let params = jsonToPNG(path);
          if (config.vision) {
            params = {
              path: jsonToPNG(path),
              uuid: fileNode.uuid,
              root_dir: fileNode.rootDir
            }
          }
          this.request("remove", params, () => { });
        }
        let params = path;
        if (config.vision) {
          params = {
            path,
            uuid: fileNode.uuid,
            root_dir: fileNode.rootDir
          }
        }
        this.request("remove", params, () => {
          this.fireEvent("fileDeleted", { data: fileNode, url: path })
        })
      }
    })
  }

  requestBase64(url, callback) {
    this.request("source", {
      url,
      encoding: "base64",
      prefix: "data:;base64,"
    }, callback)
  }

  request(cmd, params, callback = () => { }, ms) {
    if (ms) {
      setTimeout(() => {
        this.service.request(cmd, params, callback);
      }, ms)
    } else {
      this.service.request(cmd, params, callback);
    }
  }

  requestDisplays() {
    if (!this._requestingDisplays) {
      this.request("explore", "/displays", res => {
        this._requestingDisplays = false;
        this.displays.parse(res);
        if (this._pendingOpenJSON && isDisplay(this._pendingOpenJSON)) {
          if (this.displays.findFileNode(this._pendingOpenJSON)) {
            this.open(this._pendingOpenJSON), this.selectFileNode(this._pendingOpenJSON);
          } else if (config.newIfFailToOpen) {
            this.newDisplayView();
            this.save(null, this._pendingOpenJSON);
          }
          delete this._pendingOpenJSON;
        }
        if (this._pendingSelectURL && isDisplay(this._pendingSelectURL)) {
          this.selectFileNode(this._pendingSelectURL)
        }
      }, config.requestDelay);
      this._requestingDisplays = true;
    }
  }

  requestSymbols() {
    if (!this._requestingSymbols) {
      this.request("explore", "/symbols", res => {
        this._requestingSymbols = false;
        this.symbols.parse(res);
        if (this._pendingOpenJSON && isSymbol(this._pendingOpenJSON)) {
          if (this.symbols.findFileNode(this._pendingOpenJSON)) {
            this.open(this._pendingOpenJSON);
            this.selectFileNode(this._pendingOpenJSON);
          } else if (config.newIfFailToOpen) {
            this.newSymbolView();
            this.save(null, this._pendingOpenJSON);
          }
          delete this._pendingOpenJSON;
        }
        if (this._pendingSelectURL && isSymbol(this._pendingSelectURL)) {
          this.selectFileNode(this._pendingSelectURL);
        }
      }, config.requestDelay);
      this._requestingSymbols = true;
    }
  }

  requestComponents() {
    if (!this._requestingComponents) {
      this.request("explore", "/components", res => {
        this._requestingComponents = false;
        this.components.parse(res);
        if (this._pendingOpenJSON && isComponent(this._pendingOpenJSON)) {
          if (this.components.findFileNode(this._pendingOpenJSON)) {
            this.open(this._pendingOpenJSON);
          } else {
            config.newIfFailToOpen && this.newComponent()
          }
          delete this._pendingOpenJSON;
        }
        if (this._pendingSelectURL && isComponent(this._pendingSelectURL)) {
          this.selectFileNode(this._pendingSelectURL);
        }
      }, config.requestDelay);
      this._requestingComponents = true;
    }
  }

  requestScenes() {
    if (config.scenesVisible & !this._requestingScenes) {
      this.request("explore", "/scenes", res => {
        this._requestingScenes = false;
        this.scenes.parse(res);
        if (this._pendingOpenJSON && isScene(this._pendingOpenJSON)) {
          if (this.scenes.findFileNode(this._pendingOpenJSON)) {
            this.open(this._pendingOpenJSON);
            this.selectFileNode(this._pendingOpenJSON);
          } else if (config.newIfFailToOpen) {
            this.newSceneView();
            this.save(null, this._pendingOpenJSON);
          }
          delete this._pendingOpenJSON;
        }
        if (this._pendingSelectURL && isScene(this._pendingSelectURL)) {
          this.selectFileNode(this._pendingSelectURL);
        }
      }, config.requestDelay);
      this._requestingScenes = true;
    }
  }

  requestModels() {
    if (!this._requestingModels) {
      this.request("explore", "/models", res => {
        this._requestingModels = false;
        this.models.parse(res);
        if (this._pendingOpenJSON && isModel(this._pendingOpenJSON)) {
          this.open(this._pendingOpenJSON);
          delete this._pendingOpenJSON;
        }
        if (this._pendingSelectURL && isModel(this._pendingSelectURL)) {
          this.selectFileNode(this._pendingSelectURL);
        }
      }, config.requestDelay);
      this._requestingModels = true
    }
  }

  requestUIs() {
    if (config.uisVisible && !this._requestingUIs) {
      this.request("explore", "/uis", res => {
        this._requestingUIs = false;
        this.uis.parse(res);
        if (this._pendingOpenJSON && isUI(this._pendingOpenJSON)) {
          if (this.uis.findFileNode(this._pendingOpenJSON)) {
            this.open(this._pendingOpenJSON), this.selectFileNode(this._pendingOpenJSON)
          } else if (config.newIfFailToOpen) {
            this.newUIView();
            this.save(null, this._pendingOpenJSON);
          }
        }
        if (this._pendingSelectURL && isUI(this._pendingSelectURL)) {
          this.selectFileNode(this._pendingSelectURL)
        }
      }, config.requestDelay);
      this._requestingUIs = true;
    }
  }

  requestAssets() {
    if (!this._requestingAssets) {
      this.request("explore", "/assets", result => {
        this._requestingAssets = false;
        this.assets.parse(result);
        if (this._pendingOpenJSON && isAsset(this._pendingOpenJSON)) {
          this.open(this._pendingOpenJSON);
          delete this._pendingOpenJSON;
        }
        if (this._pendingSelectURL && isAsset(this._pendingSelectURL)) {
          this.selectFileNode(this._pendingSelectURL);
        }
      }, config.requestDelay);
      this.requestingAssets = true;
    }
  }

  requestImport(path) {
    if (config.importConfirm) {
      createAlert("", getString("editor.importconfirm"), () => {
        this.request("import", { path, move: true })
      }, () => {
        this.request("import", { path, move: false })
      })
    } else {
      this.request("import", { path, move: true })
    }
  }

  downloadFile(file) {
    try {
      const url = location.origin + file,
        iframe = document.createElement("iframe");
      iframe.src = url;
      iframe.style.display = "none";
      document.body.appendChild(iframe);
    } catch (err) { console.log(err); }
  }

  initTab(tab) {
    const oldTab = this._currentTab,
      sm = this.rightBottomTabView.getTabModel().sm();
    this._currentTab = tab;
    this.inspectorPane.initTab(tab);
    this.listPane.initTab(tab);
    config.overviewEnabled && this.overview.initTab(tab);
    config.dataViewEnabled && this.dataView.initTab(tab);
    config.layerEnabled && this.layerPane.initTab(tab);
    config.symbolStateEnabled && this.symbolStatePane.initTab(tab);
    config.batchViewEnabled && tpeditor.BatchView && this.batchView.initTab(tab);
    config.problemsEnabled && this.problemsView.initTab(tab);
    this.mainToolbar.initTab(tab);
    this.rightToolbar.initTab(tab);
    this.inspectorTool.initTab(tab);
    config.layerEnabled && this.layerTab.setVisible(!!this.displayView || !!this.sceneView);
    config.symbolStateEnabled && this.symbolStateTab.setVisible(!!this.symbolView);
    if (config.batchViewEnabled && tpeditor.BatchView) {
      this.batchViewTab.setVisible(!!this.sceneView);
    }
    if (!this.symbolView && this.symbolStateTab && sm.co(this.symbolStateTab) ||
      this.symbolView && this.layerTab && sm.co(this.layerTab) ||
      !this.sceneView && this.batchViewTab && sm.co(this.batchViewTab) ||
      !tab && (this.symbolStateTab && sm.co(this.symbolStateTab) ||
        this.layerTab && sm.co(this.layerTab) ||
        this.batchViewTab && sm.co(this.batchViewTab) ||
        this.problemsTab && sm.co(this.problemsTab))
    ) {
      sm.ss(this.listPaneTab);
    }
    this.fireEvent("tabUpdated", {
      tab,
      oldTab
    })
  }

  updateInspectorPropertiesLater() {
    this.inspector?.invalidateProperties?.();
  }

  beginTransaction() {
    this.dm?.beginTransaction();
  }

  endTransaction() {
    this.dm?.endTransaction();
  }

  getCurrentEditingPointValue(index) {
    const ep = this.currentEditingPoint;
    return ep ? ep[index] : 0;
  }

  setCurrentEditingPointValue(name, vlaue) {
    const gv = this.gv;
    gv?.getEditInteractor().getSubModule("Curve").setCurrentPoint(name, vlaue)
  }

  deleteTexture(dir) {
    this.mainTabView.deleteTexture(dir)
  }

  updateUIRefs(e) {
    this.mainTabView.updateUIRefs(e)
  }

  getDragPoint(e) {
    if (this.dnd.getTargetView(e) instanceof ht.graph3d.Graph3dView) {
      return this.sceneView.lp(e);
    }
    return this.gv.lp(e);
  }

  dropLocalFileOnView(event) {
    if (this.currentView) {
      const params = { event };
      this.fireViewEvent(this.currentView, "OutsideDropping", params);
      if (!params.preventDefault) {
        const files = event.dataTransfer.files;
        for (let i = 0; i < files.length; i++) {
          const file = files[i],
            name = file.name;
          if (isImage(name)) {
            this.insertLocalImageFile(event, file);
          } else if (isJSON(name)) {
            this.insertLocalJSONFile(event, file);
          }
        }
      }
    }
  }

  insertLocalImageFile(e, file) {
    readLocalFile(file, name => {
      if (this.sceneView) {
        const node = new ht.Node;
        node.setAnchor3d(.5, 0, .5);
        node.s({
          shape3d: "billboard",
          "shape3d.image": name,
          autorotate: true
        });
        node.p(this.getDragPoint(e));
        node.setDisplayName(fileNameToDisplayName(file.name));
        this.sceneView.addData(node);
      } else if (this.displayView) {
        const node = new ht.Node;
        node.setImage(name);
        node.p(this.gv.lp(e));
        node.setDisplayName(fileNameToDisplayName(file.name));
        this.displayView.addData(node);
      } else if (this.symbolView) {
        const { x, y } = this.gv.lp(e),
          image = new Image({ type: "image", name, rect: [x, y, -1, -1] });
        image.setDisplayName(fileNameToDisplayName(file.name));
        this.symbolView.addData(image);
      }
    }, true);
  }

  insertLocalJSONFile(e, file) {
    readLocalFile(file, json => {
      this.initView(json);
    })
  }

  initView(json) {
    if (json) {
      this.beginTransaction();
      json = parse(json);
      const currentView = this.sceneView || this.displayView;
      if (currentView && Array.isArray(json.d)) {
        const gv = this.gv,
          list = gv.dm().deserialize(json, gv.getCurrentSubGraph(), { justDatas: true });
        gv.sm().ss(list.toList(gv.isSelectable, gv));
        list.each(data => {
          currentView.addData(data, true, true);
        })
      } else if (this.symbolView && Array.isArray(json.comps)) {
        json.comps.forEach(comp => {
          getInstance(comp, this.symbolView);
        });
        this.gv.setFocus();
        this.endTransaction();
      }
    }
  }

  dropLocalFileOnDir(e, file) {
    const files = e.dataTransfer.files;
    const url = file.url;
    for (let i = 0; i < files.length; i++) {
      var fileName = files[i].name;
      if (!config.checkFileName(fileName, url + "/" + fileName)) {
        createAlert(getString("editor.invalidfilename"), fileName);
        return false;
      }
    }
    for (let i = 0; i < files.length; i++) {
      this.uploadLocalFile(files[i], url, file.uuid, file.rootDir);
    }
  }

  uploadLocalFile(file, url, parent_uuid, root_dir) {
    const result = config.checkFileName(file.name, this + "/" + file.name);
    result && readLocalFile(file, content => {
      const params = { path: url + "/" + result, content, parent_uuid, root_dir };
      this.request(config.vision ? "drag" : "upload", params)
    }, true);
  }

  addTab(tab, selected) {
    this.mainTabView.add(tab);
    this.fireEvent("tabCreated", { tab });
    if (selected) {
      this.mainTabView.getTabModel().sm().ss(tab);
    }
    this.mainTabView.validate();
  }

  openByJSON(type, url, name, json, path) {
    this.mainTabView.getTabModel();
    let tab = null;
    if (type === FILE_TYPE_DISPLAY) {
      this.mainTabView.getTabModel().getDataByTag(url);
      if (!tab) {
        tab = new ht.Tab;
        tab.setTag(url);
        tab.setIcon("editor.display");
        tab.setClosable(true);
        tab.setName(name);
        new DisplayView(this, tab, url, json);
        this.addTab(tab);
      }
      this.mainTabView.getTabModel().sm().ss(tab);
    } else if (type === FILE_TYPE_SYMBOL) {
      tab = this.mainTabView.getTabModel().getDataByTag(url);
      if (!tab) {
        tab = new ht.Tab;
        tab.setTag(url);
        tab.setIcon("editor.symbol");
        tab.setClosable(true);
        tab.setName(name);
        new SymbolView(this, tab, url, json);
        this.addTab(tab);
      }
      this.mainTabView.getTabModel().sm().ss(tab);
    } else if (type === FILE_TYPE_COMPONENT) {
      this.componentView.update(url, path, name, json);
    } else if (type === FILE_TYPE_UI) {
      tab = this.mainTabView.getTabModel().getDataByTag(url);
      if (!tab) {
        tab = new ht.Tab;
        tab._isUI = true;
        tab.setTag(url);
        tab.setIcon("editor.ui-tab");
        tab.setClosable(true);
        tab.setName(name);
        new tpeditor.UIView(this, tab, url, json);
        this.addTab(tab);
      }
      this.mainTabView.getTabModel().sm().ss(tab);
    }
  }

  isOpenable(fileNode) {
    return config?.isOpenable?.(fileNode);
  }

  open(fileNode, popup, blank) {
    if (isString(fileNode)) {
      fileNode = this.getFileNode(fileNode);
      !fileNode?._tag && this.isOpenable(fileNode);
    }
    if ([FILE_TYPE_DISPLAY, FILE_TYPE_SYMBOL, FILE_TYPE_SCENE, FILE_TYPE_UI].includes(fileNode.fileType)) {
      this.mainTabView.open(fileNode);
    } else if (fileNode.fileType === FILE_TYPE_COMPONENT) {
      this.componentView.open(fileNode);
    } else if (fileNode.fileType === FILE_TYPE_MODEL) {
      this.openModel && this.openModel(fileNode);
    } else if (fileNode.fileType === FILE_TYPE_ASSET) {
      const url = fileNode.url,
        ext = getFileExt(url),
        opener = config.fileOpeners[ext];
      if (opener && !opener(this, fileNode, popup, blank)) return;
      if (isSVG(url)) {
        xhrLoad(url, res => {
          const shape = ht.Default.svgToShape(res, {
            segments: config.svgSegments,
            minimumFontSize: config.svgMinimumFontSize
          });
          setTimeout(() => {
            const output = shape.output,
              converter = shape.converter;
            if (converter._canvas) {
              output.width = converter._canvas.width;
              output.height = converter._canvas.height;
            }
            const ext = trimExtension(fileNode.getName());
            if (popup) {
              this.newSymbolView(ext, false)
            } else {
              this.newDisplayView(ext)
            }
            output.comps.forEach(function (comp) {
              delete comp.repeatImage;
            });
            this.beginTransaction();
            tpeditor.toDatas(output.comps, popup).forEach(data => {
              this.currentView.addData(data, true);
            });
            if (popup) {
              output.width && this.dm.a("width", output.width);
              output.height && this.dm.a("height", output.height);
            }
            this.zoomToFit();
            this.endTransaction();
          }, config.svgWaitingTime);
        });
      } else if (isDXF(url)) {
        xhrLoad(url, res => {
          let boundingType = config.cadToDisplayBoundingType;
          if (popup) {
            boundingType = config.cadToSymbolBoundingType;
          }
          const ext = trimExtension(fileNode.getName()),
            shape = ht.Default.cadToShape(res, { boundingType }),
            map = {},
            createView = () => {
              popup ? this.newSymbolView(ext, false) : this.newDisplayView(ext);
              this.beginTransaction();
              shape.comps.forEach(comp => {
                if (comp.type === "image" && map[comp.name]) {
                  comp.name = map[comp.name];
                }
              });
              tpeditor.toDatas(shape.comps, popup).forEach(data => {
                this.currentView.addData(data, true)
              });
              if (popup) {
                shape.width && this.dm.a("width", shape.width);
                shape.height && this.dm.a("height", shape.height);
              }
              this.zoomToFit(), this.endTransaction()
            };
          let len = Object.keys(shape.blockDef).length;
          const func = () => {
            const callback = () => {
              --len === 0 && createView();
            };
            let path = "symbols/" + fileNode.path.substr("assets/".length) + "/" + ext + "/";
            for (const key in shape.blockDef) {
              shape.blockDef[key].comps.forEach(comp => {
                if (comp.type === "image") {
                  comp.name = path + comp.name + ".json";
                }
              });
              const params = {
                path: map[key] = path + key + ".json",
                content: stringify(shape.blockDef[key]),
                parent_uuid: fileNode.uuid,
                root_dir: fileNode.rootDir
              };
              this.request("upload", params, callback)
            }
          }
          len ? func() : createView();
        });
      } else if (isTTF(fileNode) || isOTF(fileNode)) {
        if (!tpeditor.FontConverterOptionView || !this.openFont) return false;
        this.openFont(fileNode);
      }
    }
  }

  addViewData(fileNode, lastPoint) {
    if (fileNode) {
      if (!this.tab) {
        this.open(fileNode);
        return;
      }
      if (this.editable) {
        const setPosition = (node, point) => {
          if (point) {
            node.p(point.x, point.y);
          } else {
            const vr = this.gv.getViewRect();
            vr && node.p(vr.x + vr.width / 2, vr.y + vr.height / 2)
          }
        }
        if (fileNode.fileType !== FILE_TYPE_DISPLAY) {
          if (this.url !== fileNode.url) {
            if (fileNode.fileType !== FILE_TYPE_COMPONENT) {
              if (fileNode.fileType === FILE_TYPE_SYMBOL || isImage(fileNode.url)) {
                if (this.displayView) {
                  const node = new ht.Node;
                  node.setImage(fileNode.getFileUUID());
                  setPosition(node, lastPoint);
                  node.setDisplayName(fileNameToDisplayName(fileNode.url));
                  this.displayView.addData(node)
                } else if (this.symbolView) {
                  const img = ht.Default.getImage(fileNode.getFileUUID()),
                    w = img ? img.width : -1,
                    h = img ? img.height : -1,
                    x = lastPoint?.x ?? (this.dm?.a("width") ?? 0) / 2,
                    y = lastPoint?.y ?? (this.dm?.a("height") ?? 0) / 2,
                    image = new Image({
                      type: "image",
                      name: fileNode.getFileUUID(),
                      rect: [x - (w > 0 ? w / 2 : 0), y - (h > 0 ? h / 2 : 0), w, h]
                    });
                  image.setDisplayName(fileNameToDisplayName(fileNode.url));
                  this.symbolView.addData(image);
                } else if (this.sceneView) {
                  const uuId = fileNode.getFileUUID(),
                    node = new ht.Node;
                  node.setAnchor3d(.5, 0, .5);
                  node.s({
                    shape3d: "billboard",
                    "shape3d.image": uuId,
                    autorotate: true
                  });
                  node.a("image2d.url", fileNode.getFileUUID());
                  setPosition(node, lastPoint);
                  node.setDisplayName(fileNameToDisplayName(fileNode.url));
                  this.sceneView.addData(node);
                }
              }
            } else {
              if (fileNode.fileType === FILE_TYPE_SCENE) {
                if (this.displayView && config.handleInsertSceneFileToDisplayView) {
                  config.handleInsertSceneFileToDisplayView(this.displayView, fileNode, lastPoint);
                }
              } else if (this.displayView) {
                config?.handleInsertModelFileToDisplayView(this.displayView, fileNode, lastPoint);
              } else if (this.sceneView) {
                const node = new ht.Node;
                node.setAnchor3d(.5, 0, .5);
                node.s({ shape3d: fileNode.getFileUUID() });
                setPosition(node, lastPoint);
                node.setDisplayName(fileNameToDisplayName(fileNode.url));
                this.sceneView.addData(node);
              }
            }
          } else if (this.symbolView) {
            const comp = new CompType({
              type: fileNode.getFileUUID(),
              rect: [
                lastPoint ? lastPoint.x : (this.dm.a("width") || 0) / 2,
                lastPoint ? lastPoint.y : (this.dm.a("height") || 0) / 2, -1, -1
              ]
            }, undefined, undefined, true);
            comp.setDisplayName(fileNameToDisplayName(fileNode.url));
            this.symbolView.addData(comp);
          }
        } else if (this.displayView) {
          if (config.insertDisplayViewAsRefGraph) {
            const refGraph = new ht.RefGraph;
            refGraph.setRef(fileNode.getFileUUID());
            refGraph.onPendingUpdated = () => {
              this.onPendingUpdated = null;
              this.p(lastPoint);
            };
            refGraph.setDisplayName(fileNameToDisplayName(fileNode.url));
            this.displayView.addData(refGraph);
          }
        } else {
          xhrLoad(fileNode.url, json => {
            this.initView(json, lastPoint);
          });
        }
      }
    }
  }

  newDisplayView(title) {
    return this.mainTabView.newDisplayView(title);
  }

  newSymbolView(title, zoomable) {
    return this.mainTabView.newSymbolView(title, zoomable);
  }

  newUIView(title) {
    return this.mainTabView.newUIView(title);
  }

  newComponent(path) {
    this.componentView.open(null, path);
  }

  isDebugTipShowing() {
    const view = this.g3d || this.gv;
    return view?.isDebugTipShowing();
  }

  toggleDebugTip() {
    const view = this.g3d || this.gv;
    if (view?.isDebugTipShowing()) {
      view.hideDebugTip();
      view.disableToolTip();
      this.list.disableToolTip();
    } else {
      view.showDebugTip();
      view.enableToolTip();
      this.list.enableToolTip();
    }
  }

  save(callback, url) {
    const isSafari = /safari/.test(window.navigator.userAgent.toLowerCase());
    if (isSafari) {
      const el = document.activeElement;
      el?.blur?.();
    }
    this.mainTabView.save(callback, url);
  }

  saveAll(callback) {
    this.mainTabView.saveAll(callback);
  }

  reload() {
    this.mainTabView.reload();
  }

  preview() {
    this.mainTabView.preview();
  }

  closeTab(tab, callback, silent) {
    this.mainTabView.closeTab(tab, callback, silent);
  }

  closeOtherTabs(callback, silent) {
    this.mainTabView.closeOtherTabs(callback, silent);
  }

  closeTabsToTheRight(callback, silent) {
    this.mainTabView.closeTabsToTheRight(callback, silent);
  }

  closeAllTabs(callback, silent) {
    this.mainTabView.closeAllTabs(callback, silent);
  }

  filterProperties() {
    this.inspector?.filterPropertiesLater();
  }

  isRulerEnabled() {
    return this.currentView?.isRulerEnabled();
  }

  setRulerEnabled(enabled) {
    this.currentView?.setRulerEnabled(enabled);
  }

  toggleRulerEnabled() {
    this.setRulerEnabled(!this.isRulerEnabled());
  }

  isGridEnabled() {
    return this.currentView?.isGridEnabled();
  }

  setGridEnabled(enabled) {
    this.currentView?.setGridEnabled(enabled);
  }

  toggleGridEnabled() {
    this.setGridEnabled(!this.isGridEnabled());
  }

  toggleLeft() {
    if (this.leftSplitView.getStatus() === "normal") {
      this.leftSplitView.setStatus("cl");
    } else {
      this.leftSplitView.setStatus("normal");
    }
  }

  toggleRight() {
    if (this.currentView?.getPreferredSize) {
      const currentView = this.currentView;
      if (currentView.isRightExpanded()) {
        currentView.setRightExpanded(false);
      } else {
        currentView.setRightExpanded(true);
      }
    } else {
      if (this.mainSplitView.getStatus() === "normal") {
        this.mainSplitView.setStatus("cr");
      } else {
        this.mainSplitView.setStatus("normal");
      }
    }
  }

  toggleBoth() {
    if (this.mainSplitView.getStatus() === "normal" || this.leftSplitView.getStatus() === "normal") {
      this.leftSplitView.setStatus("cl");
      if (this.currentView?.getPreferredSize) {
        const currentView = this.currentView;
        currentView.setRightExpanded(false);
      } else {
        this.mainSplitView.setStatus("cr");
      }
    } else if (this.leftSplitView.setStatus("normal"), this.currentView?.getPreferredSize) {
      const currentView = this.currentView;
      currentView.setRightExpanded(true);
    } else {
      this.mainSplitView.setStatus("normal");
    }
  }

  zoomIn() {
    this.gv?.zoomIn(config.animate);
  }

  zoomOut() {
    this.gv?.zoomOut(config.animate)
  }

  zoomReset() {
    this.gv?.zoomReset(config.animate)
  }

  zoomToFit() {
    this.gv?.fitContent(config.animate, config.fitPadding);
    this.g3d?.flyTo(this.dm.getDatas(), { animation: config.animate });
  }

  fitSelection() {
    const gv = this.gv,
      sm = this.sm,
      g3d = this.g3d;
    g3d?.flyTo(sm.getSelection(), { animation: config.animate });
    gv?.fitSelection(config.fitPadding, config.animate);
  }

  delete() {
    this.gv?.removeSelection();
  }

  copyFiles() {
    this.explorer.copyFiles();
  }

  pasteFiles() {
    this.explorer.pasteFiles();
  }

  copy() {
    if (this.ld) {
      let info = this.cloneInfo;
      info.funcArray.length = 0;
      info.jsonArray.length = 0;
      info.offset = {
        x: 0,
        y: 0,
        e: 0
      };
      info.lastCheck = null;
      info.lastView = this.gv;
      info.sourceView = this.gv;
      if (this.displayView) {
        info.type = "display";
      } else if (this.symbolView) {
        info.type = "symbol";
      } else {
        if (!this.sceneView) {
          info.type = null;
        }
        info.type = "scene"
        return undefined;
      }
      let index = 0,
        ld = undefined;
      const _map = {};
      const findIndex = (dm, data) => {
        for (let parent = data.getParent(); parent;) {
          data = parent;
          parent = data.getParent();
        }
        return dm.getRoots().indexOf(data);
      }
      this.selection.forEach(data => {
        if (!data._refGraph) {
          _map[data._id] = data;
          if (data instanceof ht.Block && !(data instanceof ht.RefGraph)) {
            copy(data, _map);
          }
          const i = findIndex(this.gv.dm(), data);
          index = Math.max(index, i);
          if (index === i) {
            ld = data;
          }
        }
      });
      info.lastData = ld;
      const items = [];
      let rect = undefined;
      this.gv.each(data => {
        if (_map[data._id]) {
          items.push(data);
          if (data instanceof ht.Node) {
            if (rect) {
              rect = ht.Default.unionRect(rect, data.getRect());
            } else {
              rect = data.getRect();
            }
          }
        }
      });
      info.rect = rect;
      this.gv.copyMap = _map;
      items.forEach(data => {
        const selected = this.gv.isSelected(data),
          itemJson = data.toJSON(this.gv);
        if (itemJson.length > 0) {
          info.funcArray.push([data._id, selected].concat(itemJson));
          const json = toJson(data);
          json && info.jsonArray.push([selected, json]);
        }
      });
      this.fireEvent("copy", { datas: items, info });
      this.gv.copyMap = null;
    }
  }

  hasCopyInfo() {
    return this.cloneInfo.funcArray.length > 0;
  }

  paste(json, name) {
    if (this.editable) {
      const gv = this.gv,
        currentView = this.currentView,
        info = this.cloneInfo;
      if (info.funcArray.length && gv) {
        const datas = [],
          nodes = [];
        this.beginTransaction();
        ht.Default.setIsolating(true);
        if (info.type === "display" && this.displayView
          || info.type === "display" && this.sceneView
          || info.type === "symbol" && this.symbolView
          || info.type === "scene" && this.sceneView
          || info.type === "scene" && this.displayView) {
          const jsonArray = [];
          info.funcArray.forEach(func => {
            const appended = func[1],
              json = func[2],
              clone = func[3],
              node = clone(json, gv);
            currentView.addData(node, true);
            info[name] = node;
            datas.push(node);
            jsonArray.push(json);
            appended && nodes.push(node)
          });
          for (let i = 0; i < datas.length; i++) {
            datas[i].clone(jsonArray[i], gv, info);
          }
          if (config.pasteToLastSelectedIndex && info.sourceView === gv) {
            var dm = gv.dm(),
              ld = info.lastData,
              parent = ld.getParent(),
              index = dm.getSiblings(ld).indexOf(ld) + 1,
              length = datas.length;
            for (let i = 0; i < length; i++) {
              let data = jsonArray[i];
              if (!info[data.parent]) {
                data = datas[i];
                data.setParent(parent);
                dm.moveTo(data, index++);
              }
            }
          }
        } else {
          info?.jsonArray?.forEach?.((item, index) => {
            var popup = item[0],
              json = item[1],
              func = info.funcArray[index][2];
            if (info.type === "symbol" && !this.symbolView && func.clazz === CompType) {
              this.showMessage(getString("editor.componentsusederror"), "error");
              return false;
            }
            const node = toNode(json, !!this.symbolView);
            if (node) {
              node.setParent(gv.getCurrentSubGraph());
              this.currentView.addData(node, true);
              datas.push(node);
              popup && nodes.push(node);
            }
          });
        }
        ht.Default.setIsolating(false);
        var offset = config.pasteOffset,
          x = 0,
          z = 0,
          y = 0;
        if (isNumber(offset)) {
          x = z = offset;
        } else if (Array.isArray(offset)) {
          if (offset.length === 3) {
            x = offset[0];
            y = offset[1];
            z = offset[2];
          } else if (offset.length === 2) {
            x = offset[0];
            z = offset[1];
          } else if (offset) {
            "x" in offset && (x = offset.x);
            "y" in offset && (y = offset.y);
            "z" in offset && (z = offset.z);
          }
        }
        nodes.length && this.sm.ss(nodes);
        if (info.lastView !== gv) {
          info.offset.x = -x;
          info.offset.y = -z;
          info.offset.e = -y;
        }
        if (!json && datas.length) {
          const rect = info.rect;
          if (name && rect) {
            info.offset.x = name.x - rect.x - rect.width / 2;
            info.offset.y = name.y - rect.y - rect.height / 2
          } else {
            info.offset.x += x;
            info.offset.y += z;
          }
          info.offset.e += y;
          ht.Default.moveDatas(datas, info.offset.x, info.offset.e, info.offset.y);
          if (!name && !this.g3d) {
            const point = gv.getCenterDatas(datas);
            if (point) {
              info.offset.x += point.x;
              info.offset.y += point.y;
              if (!info.lastCheck) {
                ht.Default.moveDatas(datas, -x, -y, -z);
                info.offset.x -= x;
                info.offset.y -= z;
                info.offset.e -= y;
              }
            }
            info.lastCheck = point;
          }
        }
        info.lastView = gv;
        this.fireEvent("paste", { datas, info });
        gv.setFocus();
        this.endTransaction();
      }
    }
  }

  block() {
    if (this.editable) {
      const view = this.displayView || this.sceneView;
      if (view) {
        const selection = this.selection;
        if (selection.length) {
          this.beginTransaction();
          const block = new ht.Block;
          selection.forEach(data => {
            data?.setHost(undefined);
            data.setParent(block);
          });
          view.addData(block);
          this.endTransaction();
        }
      }
    }
  }

  unblock() {
    if (this.editable) {
      if (this.displayView || this.sceneView) {
        this.beginTransaction();
        const selections = [];
        this.selection.forEach(data => {
          if (data instanceof ht.Block && !(data instanceof ht.RefGraph)) {
            const parent = data.getParent();
            data.getChildren().toArray().forEach(child => {
              child.setParent(parent);
              selections.push(child);
            });
            this.dm.remove(data);
          }
        });
        if (selections.length) {
          this.sm.ss(selections);
          this.gv.setFocus();
        }
        this.endTransaction();
      }
    }
  }

  bringForward() {
    if (this.editable && this.dm) {
      this.dm.isHierarchicalRendering() ?
        this.dm.moveSelectionDown() :
        this.dm.bringSelectionForward();
    }
  }

  bringToFront() {
    if (this.editable && this.dm) {
      this.dm.isHierarchicalRendering() ?
        this.dm.moveSelectionToBottom() :
        this.dm.bringSelectionToFront();
    }
  }

  sendBackward() {
    if (this.editable && this.dm) {
      this.dm.isHierarchicalRendering() ?
        this.dm.moveSelectionUp() :
        this.dm.sendSelectionBackward();
    }
  }

  sendToBack() {
    if (this.editable && this.dm) {
      this.dm.isHierarchicalRendering() ?
        this.dm.moveSelectionToTop() :
        this.dm.sendSelectionToBack();
    }
  }

  undo() {
    this.pointsEditingMode = false;
    if (this.editable) {
      if (this._currentTab && this._currentTab._isUI) {
        this._currentTab.getView().undo();
      } else if (this.dm?.getHistoryManager().canUndo()) {
        this.dm.undo();
        this.fireEvent("undo", {});
      }
    }
  }

  redo() {
    this.pointsEditingMode = false;
    if (this.editable) {
      if (this._currentTab && this._currentTab._isUI) {
        this._currentTab.getView().undo();
      } else if (this.dm?.getHistoryManager().canRedo()) {
        this.dm.redo();
        this.fireEvent("redo", {});
      }
    }
  }

  distributeHorizontal() {
    this.editable && this.inspectorTool.distributeHorizontal();
  }

  distributeVertical() {
    this.editable && this.inspectorTool.distributeVertical();
  }

  alignLeft() {
    this.editable && this.inspectorTool.alignLeft();
  }

  alignHorizontal() {
    this.editable && this.inspectorTool.alignHorizontal();
  }

  alignRight() {
    this.editable && this.inspectorTool.alignRight();
  }

  alignTop() {
    this.editable && this.inspectorTool.alignTop();
  }

  alignVertical() {
    this.editable && this.inspectorTool.alignVertical();
  }

  alignBottom() {
    this.editable && this.inspectorTool.alignBottom();
  }

  folder() {
    if (this.editable && this.displayView) {
      this.beginTransaction();
      var data = new ht.Data;
      data.s("editor.folder", true);
      this.dm.add(data);
      this.list.getTopRowOrderSelection().each(child => {
        data.addChild(child);
      });
      this.sm.ss(data);
      this.endTransaction();
    }
  }

  unfolder() {
    if (this.editable && this.displayView) {
      this.beginTransaction();
      const folders = this.sm.toSelection(data => {
        return data.s("editor.folder");
      });
      folders.forEach(folder => {
        folder.toChildren().forEach(child => {
          child.setParent(folder.getParent());
        })
      });
      folders.forEach(data => {
        this.dm.remove(data);
      });
      this.endTransaction();
    }
  }

  locate(fileNode) {
    fileNode && this.request("locate", fileNode.url || fileNode);
  }

  saveImage(url, path, callback, uuid, parent_uuid, root_dir) {
    const handler = () => {
      var params = { uuid, path, content: snapshot(url), parent_uuid, root_dir };
      this.request("upload", params, callback)
    };
    if (isString(url) && !ht.Default.getImage(url)) {
      if (/.json$/.test(url)) {
        xhrLoad(url, callback => {
          if (callback) {
            ht.Default.setImage(url, ht.Default.parse(callback));
            handler();
          }
        })
      } else {
        const Image = new window.Image;
        Image.onload = () => {
          ht.Default.setImage(url, Image);
          handler();
        };
        Image.src = url;
      }
    } else {
      handler();
    }
  }

  handleKeydown(event) {
    const code = event.keyCode;
    if (isCtrlDown(event) && code === 83) {
      event.preventDefault();
    }
    if (DIALOGS.length) {
      if ((event.target._ignore || !isInput(event.target)) && !ht.Default.popup) {
        const last = DIALOGS[DIALOGS.length - 1];
        if (isEsc(event) && last.cancel) {
          last.cancel();
        } else if (last.save) {
          last.save();
        }
      }
    } else {
      const params = { event };
      this.fireEvent("keydown", params);
      if (!params.preventDefault) {
        if (isCtrlDown(event) && 83 === code) {
          this.save();
          return false;
        }
        if (!isInput(event.target)) {
          if (isEsc(event)) {
            for (let i = 0; i < this.menus.length; i++) {
              if (this.menus[i].isShowing()) {
                this.menus[i].hide();
                return false;
              }
            }
            if (this.funcView?.smartClose && this.funcView?.getView().parentNode) {
              this.funcView.hide();
              return false;
            }
            if (this.iconsView?.getView().parentNode) {
              this.iconsView.hide();
              return false;
            }
            if (this.tab) {
              var el = this.tab.getView();
              [el.graphView, el.g3d].forEach(gv => {
                if (gv) {
                  var interactors = gv?.getInteractors();
                  interactors?.each?.(interactor => {
                    !interactor.disabled && interactor?.cancel(event)
                  })
                }
              })
            }
          }
          switch (code) {
            case 80:
              this.preview();
              break;
            case 187:
              this.zoomIn();
              break;
            case 189:
              this.zoomOut()
              break;
            case 48:
              this.zoomToFit();
              break;
            case 57:
              this.zoomReset();
              break;
            case 67:
              isCtrlDown(event) && this.copy();
              break;
            case 86:
              isCtrlDown(event) && this.paste();
              break;
            case 90:
              isCtrlDown(event) && isShiftDown(event) && this.redo();
              isCtrlDown(event) && this.undo();
              break;
            case 221:
              event.altKey && isCtrlDown(event) && this.bringToFront();
              isCtrlDown(event) && this.bringForward();
              break;
            case 219:
              event.altKey && isCtrlDown(event) && this.sendToBack();
              isCtrlDown(event) && this.sendBackward();
              break;
            case 71:
              this.unblock();
              isCtrlDown(event) && this.block();
              break;
            default:
              break;
          }
        }
      }
    }
  }

  createDisplayItem(state, tooltip, name, type, callback, fill) {
    const getter = () => {
      return this.displayView?.getState() === state;
    },
      item = createItem(state, tooltip, name, getter);
    item.visible = () => {
      return !!this.displayView && this.editable;
    };
    item.action = () => {
      this.displayView?.setState(state, type, callback, fill);
    };
    return item;
  }

  createSymbolItem(state, tooltip, name, type, callback, fill) {
    const getter = () => {
      return this.symbolView?.getState() === state;
    },
      item = createItem(state, tooltip, name, getter);
    item.visible = () => {
      return !!this.symbolView && this.editable;
    };
    item.action = () => {
      this.symbolView?.setState(state, type, callback, fill);
    };
    return item;
  }

  showMessage(content, state, ms) {
    this.messageView.show(content, state, ms);
  }

  showConfirm(title, content, onYes, onNo) {
    this.confirmView.show(title, content, onYes, onNo);
  }

  batchConvertSVG(items) {
    const urls = [],
      svgs = [];
    items.forEach(item => {
      if (isSVG(item.url)) {
        urls.push(item.url);
        svgs.push(item)
      }
    });
    let i = 0;
    const len = 2 * urls.length,
      showSuccess = () => {
        if (++i === len) {
          this.showMessage(useI18Param(
            getString("editor.batchconvertsuccess"), urls.length + ""))
        }
      };
    xhrLoad(urls, res => {
      res.forEach((item, i) => {
        const svg = svgs[i],
          svgConverter = ht.Default.svgToShape(item, {
            segments: config.svgSegments,
            minimumFontSize: config.svgMinimumFontSize
          }),
          path = svg.path.replace(/^assets/g, "symbols");
        let ext = svg.getName().replace(/svg$/g, "json");
        setTimeout(() => {
          const output = svgConverter.output,
            converter = svgConverter.converter;
          if (converter._canvas) {
            output.width = converter._canvas.width;
            output.height = converter._canvas.height;
          }
          this.request("upload", {
            path: path + "/" + ext,
            content: stringify(output)
          }, showSuccess);
          ext = svg.getName().replace(/svg$/g, "png");
          this.request("upload", { path: path + "/" + ext, content: snapshot(output) }, showSuccess);
        }, config.svgWaitingTime);
      })
    })
  }

  get editable() {
    return this.currentView?.editable;
  }

  set editable(value) {
    this.currentView && (this.currentView.editable = value);
  }

  get dm() {
    return this.gv?.dm() ?? null;
  }

  get gv() {
    const ld = this.mainTabView.getTabModel().sm().ld();
    return ld?.getView().graphView ?? null;
  }

  get editInteractor() {
    return this.gv?.getEditInteractor() ?? null;
  }

  get pointsEditingMode() {
    return this.editInteractor?.pointsEditingMode;
  }

  set pointsEditingMode(value) {
    this.editInteractor && (this.editInteractor.pointsEditingMode = value);
  }

  get anchorVisible() {
    return this.gv?.getEditStyle("anchorVisible");
  }

  set anchorVisible(value) {
    this.gv?.setEditStyle("anchorVisible", value);
  }

  get sm() {
    return this.gv?.sm() ?? null
  }

  get ld() {
    return this.sm?.ld() ?? null
  }

  get selection() {
    return this.sm?.toSelection().toArray();
  }

  get tabs() {
    return this.mainTabView.tabs;
  }

  get inspector() {
    return this.inspectorPane.inspector;
  }

  get list() {
    return this.listPane.list;
  }

  get tab() {
    return this.mainTabView.currentTab;
  }

  get url() {
    return this.tab?.getTag() ?? null;
  }

  get explorer() {
    return this.leftTopTabView.getCurrentTab().getView();
  }

  get dir() {
    return this.explorer?.tree.getSelectionModel().getLastData() ?? null;
  }

  get file() {
    return this.explorer?.getFileListView().getSelectionModel().getLastData() ?? null;
  }

  get currentLayer() {
    return this.layerPane.currentLayer;
  }

  get currentView() {
    return this.tab?.getView() ?? null;
  }

  get displayTree() {
    return this.displayView?.displayTree ?? null;
  }

  get displayView() {
    const currentView = this.currentView;
    return currentView instanceof DisplayView ? currentView : null;
  }

  get symbolList() {
    return this.symbolView?.symbolList ?? null;
  }

  get symbolView() {
    const currentView = this.currentView;
    return currentView instanceof SymbolView ? currentView : null;
  }

  get currentEditingPoint() {
    return this.currentView?.currentEditingPoint ?? null;
  }

  get inspectorCompact() {
    return this._inspectorCompact;
  }

  set inspectorCompact(valie) {
    this._inspectorCompact = valie;
    this.filterProperties();
    this.inspectorTool.iv();
  }

  get inspectorInputFilter() {
    return this.inspectorTool.searchField.getValue();
  }

  set inspectorInputFilter(value) {
    this.inspectorTool.searchField.setValue(value);
    this.filterProperties();
  }
}

msClass(Editor, { ms_fire: 1 });
export default Editor;
