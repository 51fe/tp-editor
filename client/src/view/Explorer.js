import { getString, isEsc, isJSON, jsonToPNG, trimExtension } from "../util/index.js";
import {
  FILE_TYPE_DISPLAY, FILE_TYPE_SYMBOL, FILE_TYPE_COMPONENT, FILE_TYPE_ROOT,
  FILE_TYPE_SCENE, FILE_TYPE_MODEL, FILE_TYPE_UI, FILE_TYPE_DIR, FILE_LAYOUT_TiLE, FILE_LAYOUT_LIST, FILE_TYPE_UNKNOWN
} from "../constants.js"
import config from "../config.js";
import SplitView from "./SplitView.js";
import FileNode from "../type/FileNode.js";
import FileTree from "./FileTree.js";
import FormPane from "../pane/FormPane.js";
import FileList from "../view/FileList.js";
import Accordion from "./Accordion.js";
import ContextMenu from "../menu/ContextMenu.js";
import { createAlert } from "../util/DialogHelper.js";

const ACCORDION = "accordion";

export default class Explorer extends SplitView {
  constructor(editor, rootDir, editable = true) {
    super();
    this.editor = editor;
    this.rootDir = rootDir;
    this.copyFileInfos = [];
    this.dataModel = new ht.DataModel;
    this.dataModel.setAutoAdjustIndex(false);
    this.urlUUIDMap = {};
    this.uuidURLMap = {};
    const mode = this.mode = config.explorerMode;
    if (mode === ACCORDION) {
      this.accordion = new Accordion(this, editable)
    }
    this.tree = new FileTree(this, editable);
    this.list = new FileList(this, editable);
    this.controlPane = new FormPane;
    this.controlPane.addRow([{
      id: "filter",
      textField: {}
    }, { id: "url", textField: { editable: false } }, {
      id: "slider",
      slider: {
        min: 1,
        max: this.getFileListView().getMaxFileSize(),
        step: 1,
        onValueChanged: (e, value) => {
          this.getFileListView().setFileSize(value);
          this.getFileListView().setLayoutType(value > 16 ? FILE_LAYOUT_TiLE : FILE_LAYOUT_LIST)
        }
      }
    }], [.1, .2, ht.Default.isTouchable ? 70 : 50]);
    const filter = this.controlPane.getViewById("filter").getElement();
    filter.onkeyup = e => {
      isEsc(e) && (filter.value = "");
      if (mode === ACCORDION) {
        this.accordion.setFilter(filter.value);
        this.accordion.ivm();
      } else {
        this.list.setFilter(filter.value);
      }
    };
    (mode === ACCORDION ? this.accordion : this.list).mp(e => {
      "filter" === e.property && (filter.value = e.newValue || "")
    });
    const slider = this.controlPane.getItemById("slider").element;
    slider.getToolTip = () => {
    };
    this.getFileListView().mp(e => {
      e.property === "fileSize" && slider.setValue(e.newValue)
    });
    this.bottomPane = new ht.widget.BorderPane;
    this.bottomPane.setCenterView(this.getFileListView());
    this.bottomPane.setBottomView(this.controlPane);
    this.bottomPane.setBottomHeight(ht.Default.widgetRowHeight + 8);
    this.setOrientation("vertical");
    if (mode === ACCORDION) {
      this.setLeftView(this.bottomPane);
      this.setPosition(1);
      this.accordion.sm().ms(() => {
        this.setFileUUID(this.accordion);
      });
      this.accordion.setFileSize(config.fileSize);
      this.setDraggable(false);
    } else {
      this.setLeftView(this.tree);
      this.setRightView(this.bottomPane);
      this.setPosition(config.explorerSplitViewPosition);
      this.list.setSelectionModelShared(false);
      this.list.sm().ms(() => {
        this.setFileUUID(this.list)
      });
      this.list.setFileSize(config.fileSize)
    }
    this.tree.menu = new ContextMenu;
    this.treeMenuItems = [];
    this.initTreeMenu(this.tree.menu, this.treeMenuItems);
    this.tree.menu.setItems(this.treeMenuItems);
    this.tree.menu.addTo(this.tree.getView());
    this.editor.menus.push(this.tree.menu);
    this.list.menu = new ContextMenu;
    this.listMenuItems = [];
    this.initListMenu(this.list.menu, this.listMenuItems);
    this.list.menu.setItems(this.listMenuItems);
    this.list.menu.addTo(this.list.getView());
    this.editor.menus.push(this.list.menu);
    if (this.isAccordionMode()) {
      this.accordion.menu = new ContextMenu;
      this.accordionMenuItems = [];
      this.initAccordionMenu(this.accordion.menu, this.accordionMenuItems);
      this.accordion.menu.setItems(this.accordionMenuItems);
      this.accordion.menu.addTo(this.accordion.getView());
      this.editor.menus.push(this.accordion.menu)
    }
  }

  setFileUUID(list) {
    const data = list.sm().ld();
    this.controlPane.v("url", data ? data.getFileUUID() : "");
  }

  isAccordionMode() {
    return this.mode === ACCORDION;
  }

  findFileNode(id) {
    let data = this.dataModel.getDataById(id);
    if (!data && this.uuidURLMap[id]) {
      data = this.dataModel.getDataById(this.uuidURLMap[id])
    }
    return data;
  }

  parse(props) {
    let ty = undefined,
      expandIds = undefined,
      selectionIds = undefined,
      size = undefined;
    if (this.mode === ACCORDION) {
      expandIds = this.accordion.expandIds;
      ty = this.accordion.ty();
    } else {
      ty = this.tree.ty();
      expandIds = this.tree.expandIds;
      selectionIds = this.tree.selectionIds;
      size = this.tree.dm().size();
    }
    this.dataModel.clear();
    if (Array.isArray(props)) {
      props.forEach(prop => {
        if (prop) {
          const path = prop?.attrs?.path ?? "",
            rootNode = this.rootNode = this.addFileNode(this.rootDir, path, prop.name, prop);
          this.parseRoot(rootNode, prop);
        }
      });
    } else {
      const rootNode = this.rootNode = this.addFileNode(this.rootDir, "", this.rootDir);
      this.parseRoot(rootNode, props)
    }
    const list = this.dataModel.getDatas(),
      map = {};
    this.urlUUIDMap = {};
    this.uuidURLMap = {};
    list.toArray().forEach((fileNode, index) => {
      map[fileNode._id] = index;
      this.uuidURLMap[fileNode.getFileUUID()] = fileNode.url;
      this.urlUUIDMap[fileNode.url] = fileNode.getFileUUID();
    });
    list.sort(function (prev, next) {
      if (prev.fileType === FILE_TYPE_ROOT) {
        return -1;
      } else if (next.fileType === FILE_TYPE_ROOT) {
        return 1;
      } else if (next.fileType === FILE_TYPE_DIR && next.fileType !== FILE_TYPE_DIR) {
        return -1;
      } else if (prev.fileType !== FILE_TYPE_DIR && next.fileType === FILE_TYPE_DIR) {
        return 1;
      } else {
        return map[prev._id] - map[next._id];
      }
    });
    if (this.mode === ACCORDION) {
      this.accordion.expandIds = expandIds;
      this.accordion.ty(ty);
    } else {
      this.tree.expandIds = expandIds;
      this.tree.selectionIds = selectionIds;
      this.tree.ty(ty);
      if (size === 0) {
        this.tree.expand(this.rootNode);
        this.tree.sm().ss(this.rootNode);
      }
    }
    this.list.doLayout();
    const params = { explorer: this };
    this.editor.fireEvent("explorerUpdated", params);
  }

  parseRoot(node, props) {
    node.a("editable", false);
    let children = props;
    if (props.fileType === FILE_TYPE_DIR || props.fileType === FILE_TYPE_ROOT) {
      node.a(props.attrs);
      node.s(props.styles);
      if (props.fileIcon) {
        node.setIcon(props.fileIcon);
        node.setImage(props.fileIcon);
      }
      children = props.children
    } else {
      children = props;
    }
    for (const key in children) {
      this.parseChild(node, key, children[key]);
    }
  }

  parseChild(node, key, prop) {
    const fileNode = this.addFileNode(this.rootDir, node.url, key, prop);
    fileNode.setParent(node);
    let children = undefined;
    if (prop?.fileType === FILE_TYPE_DIR) {
      children = prop.children;
    } else if (fileNode.fileType === FILE_TYPE_DIR) {
      children = prop;
    }
    for (const key in children) {
      this.parseChild(fileNode, key, children[key]);
    }
    return fileNode;
  }

  deleteSelection(fileList) {
    const items = [];
    fileList.sm().getTopSelection().forEach(data => {
      const params = { data, url: data.url };
      this.editor.fireEvent("fileDeleting", params);
      params.preventDefault || items.push(data);
    });
    if (items.length) {
      const name = fileList.getLabel(items[0]) || items[0].getName();
      let title = getString("editor.delete") + " [" + name + "]";
      items.length > 1 && (title += " (" + items.length + ")");
      const setter = () => {
        this.editor.removeFiles(items);
      };
      if (config.deleteFileConfirm) {
        createAlert(title, getString("editor.deleteselection"), setter);
      } else {
        setter();
      }
    }
  }

  addNewItem(items, fileList, id, silent) {
    const item = {
      id,
      label: getString("editor." + id.toLowerCase()),
      action: () => {
        if (fileList instanceof FileList) {
          const fileNode = this.tree.sm().ld();
          if (fileNode?.fileType === FILE_TYPE_DIR) {
            this.editor._rightClickURL = fileNode.url;
          }
        }
        this.editor[id](this.editor._rightClickURL);
        silent && this.editor.save();
        delete this.editor._rightClickURL;
      },
      visible: () => {
        let fileNode = this.tree.sm().ld();
        if (!fileList.editable || config.vision &&
          fileNode?.a("dir_type") !== 2 && !fileNode.a("editable")) {
          return false;
        }
        if (this.isAccordionMode()) {
          fileNode = this.accordion.sm().ld();
          return fileNode && fileNode.fileType === FILE_TYPE_DIR;
        }
        return true
      }
    };
    items.push(item);
    return item;
  }

  addDeleteItem(items, item) {
    const menuItem = {
      id: "delete",
      label: getString("editor.delete"),
      action: () => {
        this.deleteSelection(item)
      },
      visible: () => {
        const fileNode = item.sm().ld();
        return fileNode && item.isEditable(item.sm().ld())
      }
    };
    items.push(menuItem);
    return menuItem
  }

  addNewFolderItem(items, item) {
    const menuItem = {
      id: "newFolder",
      label: getString("editor.newfolder"),
      action: () => {
        this.editor.newFolder(item);
      },
      visible: () => {
        const fileNode = this.tree.sm().ld();
        if (item.editable) {
          return item.isEditable(fileNode) || config.vision &&
            fileNode && 2 === fileNode.a("dir_type")
        }
        return false;
      }
    };
    items.push(menuItem);
    return menuItem;
  }

  addLocateTreeFileItem(items) {
    let item = undefined;
    if (config.locateFileEnabled && !config.vision) {
      item = {
        id: "locateFile",
        label: getString("editor.locatefile"),
        action: () => {
          const fileNode = this.tree.sm().ld() || this.rootNode;
          this.editor.locate(fileNode)
        }
      };
    }
    items.push(item);
    return item;
  }

  addLocateListFileItem(items) {
    let item = undefined;
    if (config.locateFileEnabled && !config.vision) {
      item = {
        id: "locateFile",
        label: getString("editor.locatefile"),
        action: () => {
          const fileNode = this.ld || this.tree.sm().ld() || this.rootNode;
          this.editor.locate(fileNode);
        },
        visible: () => {
          return !this.isAccordionMode() || !!this.getFileListView().sm().ld();
        }
      };
      items.push(item);
    }
    return item;
  }

  addExportItem(items) {
    const item = {
      id: "export",
      label: getString("editor.export"),
      action: () => {
        const urls = [],
          sm = this.getFileListView().sm();
        if (sm.size() > 0) {
          sm.each(data => {
            urls.push(data.url);
          });
          this.editor.request("export", urls);
        }
      },
      visible: () => {
        const fileNode = this.getFileListView().sm().ld();
        if (!fileNode) return false;
        const type = fileNode.fileType;
        return [FILE_TYPE_DISPLAY, FILE_TYPE_SYMBOL, FILE_TYPE_COMPONENT,
          FILE_TYPE_SCENE, FILE_TYPE_MODEL, FILE_TYPE_UI, FILE_TYPE_DIR].includes(type);
      }
    };
    items.push(item);
    return item;
  }

  addRenameItem(items, item) {
    const menuItem = {
      id: "rename",
      label: getString("editor.rename"),
      action: () => {
        const fileNode = item.sm().ld();
        if (fileNode && false !== fileNode.a("editable")) {
          item.beginEditing(fileNode);
        }
      },
      visible: () => {
        const fileNode = item.sm().ld();
        return fileNode && item.isEditable(fileNode);
      }
    };
    items.push(menuItem);
    return menuItem;
  }

  addCopyItem(items) {
    const menu = {
      id: "copy",
      label: getString("editor.copy"),
      action: () => {
        this.copyFiles();
      },

      visible: () => {
        if (!this.getFileListView().editable) return false;
        const fileNode = this.getFileListView().sm().ld();
        return fileNode?.a("editable");
      }
    };
    items.push(menu);
    return menu;
  }

  addPasteItem(items) {
    const menuItem = {
      id: "paste",
      label: getString("editor.paste"),
      action: () => {
        this.pasteFiles();
      },
      visible: () => {
        if (!this.copyFileInfos.length) return false;
        const fileNode = this.tree.sm().ld();
        if (!fileNode) return false;
        const editable = fileNode.a("editable");
        if (config.vision) {
          if (editable === false && fileNode.a("dir_type") !== 2) {
            return false;
          }
        } else if (editable === false && fileNode !== this.rootNode) {
          return false;
        }
        return !!this.getFileListView().editable && (!this.isAccordionMode() || !!this.ld);
      }
    };
    items.push(menuItem);
    return menuItem;
  }

  copyFiles() {
    this.copyFileInfos.length = 0;
    this.getFileListView().sm().each(fileNode => {
      this.prepareCopyFileInfos(fileNode);
    })
  }

  prepareCopyFileInfos(fileNode, parentInfo) {
    if (![FILE_TYPE_ROOT, FILE_TYPE_UNKNOWN].includes(fileNode.fileType)) {
      const fileInfo = {
        url: fileNode.url,
        name: fileNode.getName(),
        fileNode,
        parentInfo,
        parent_uuid: fileNode.parent_uuid
      };
      this.copyFileInfos.push(fileInfo);
      this.editor.fireEvent("copyFile", { url: fileNode.url });
      if (!config.copyFileByServer && fileNode.fileType === FILE_TYPE_DIR) {
        fileInfo.isDir = true;
        fileNode.eachChild(child => {
          this.prepareCopyFileInfos(child, fileInfo);
        })
        return;
      }
      this.loadFileInfo(fileInfo);
    }
  }

  loadFileInfo(file) {
    const url = file.url,
      copyFileByServer = config.copyFileByServer;
    if (!copyFileByServer) {
      this.editor.requestBase64(url, content => {
        file.content = content;
      });
    }
    if (isJSON(url)) {
      const id = jsonToPNG(url);
      if (this.findFileNode(id)) {
        if (copyFileByServer) {
          file.image = true;
        } else {
          this.editor.requestBase64(id, image => {
            file.image = image;
          })
        }
      }
    }
  }

  pasteFiles() {
    if (config.copyFileByServer) {
      const fileList = [],
        destDir = this.currentDir;
      this.copyFileInfos.forEach(info => {
        fileList.push(info.url);
        info.image && fileList.push(jsonToPNG(info.url));
      });
      this.editor.request("paste", { fileList: fileList, destDir });
    } else {
      this.copyFileInfos.forEach(info => {
        this.pasteFileImpl(info);
      });
    }
  }

  pasteFileImpl(info) {
    const url = info.url,
      parentInfo = info.parentInfo,
      dir = parentInfo ? parentInfo.pasteURL : this.currentDir;
    let path = undefined,
      index = 2;
    if (info.isDir) {
      const _path = dir + "/" + info.name;
      for (path = _path; this.findFileNode(path);) {
        path = _path + " " + index++;
      }
    } else if (info.content) {
      const _path = dir + "/" + trimExtension(info.name),
        ext = url.substring(url.lastIndexOf("."), url.length);
      for (path = _path + ext; this.findFileNode(path);) {
        path = _path + " " + index++ + ext;
      }
    }
    if (path) {
      if (info.content) {
        const params = {
          path,
          content: info.content,
          parent_uuid: info.uuid,
          root_dir: info.rootDir
        };
        this.editor.request("upload", params);
        this.editor.fireEvent("pasteFile", { url: path });
        if (info.image) {
          params.path = jsonToPNG(path);
          params.content = info.image;
          this.editor.request("upload", params);
          this.editor.fireEvent("pasteFile", { url: params.path });
        }
      }
      if (info.isDir) {
        info.pasteURL = path;
        this.editor.request("mkdir", path, () => { });
      }
    }
  }

  enableDroppableToSymbolView() {
    let list = this.list;
    this.mode === ACCORDION && (list = this.accordion);
    list.isDroppableToSymbolView = true;
  }

  enableDroppableToDisplayView() {
    let list = this.list;
    this.mode === ACCORDION && (list = this.accordion);
    list.isDroppableToDisplayView = true;
  }

  enableDroppableToSceneView() {
    let list = this.list;
    this.mode === ACCORDION && (list = this.accordion);
    list.isDroppableToSceneView = true;
  }

  enableDroppableToUIView() {
    let list = this.list;
    this.mode === ACCORDION && (list = this.accordion);
    list.isDroppableToUIView = true;
  }

  enableDroppableToUIImage() {
    let list = this.list;
    this.mode === ACCORDION && (list = this.accordion);
    list.isDroppableToUIImage = true;
  }

  getFileListView() {
    if (this.mode === ACCORDION) {
      return this.accordion;
    }
    return this.list;
  }

  initTreeMenu() {
  }

  initListMenu() {
  }

  initAccordionMenu() {
  }

  addFileNode(rootDir, path, name, value) {
    const fileNode = new FileNode(rootDir, path, name, value);
    this.dataModel.add(fileNode);
    return fileNode;
  }

  get currentDir() {
    let fileNode = undefined;
    if (this.isAccordionMode()) {
      fileNode = this.ld;
      if (fileNode?.fileType !== FILE_TYPE_DIR) {
        fileNode = fileNode.getParent();
      }
      if (fileNode) {
        return fileNode.url
      } else if (this.accordion.dirs.length) {
        return this.accordion.dirs[this.accordion.dirs.length - 1].url;
      }
      return this.rootDir;
    } else {
      fileNode = this.tree.sm().ld();
      if (fileNode) {
        return fileNode.url;
      }
      return this.rootDir;
    }
  }

  get ld() {
    return this.getFileListView().sm().ld();
  }
}
