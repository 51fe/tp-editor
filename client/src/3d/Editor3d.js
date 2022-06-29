import WebSocketService from "../util/WebSocketService.js";
import config from "./config3d.js";
import {
  isScene, isModel, isSymbol, isAsset,
  isJSON, removeCache, getQueryString,
  getString, createItem, layoutMainView, trimExtension
} from "../util";


import DND from "../util/DND.js";
import DNDFromOutside from "../util/DNDFromOutside.js";
import { getInput } from "../util/DialogHelper.js";
import Editor from "../Editor.js";

import { addTab } from "./util.js";
import MainToolbar3d from "./MainToolbar3d.js";
import RightToolbar3d from "./RightToolbar3d.js";
import DefaultInteractor from "./DefaultInteractor.js";
import DataView3d from "./DataView3d.js";
import Dialog3d from "./Dialog3d.js";

import Scenes3d from "./Scenes3d.js";
import Models3d from "./Models3d.js";
import Symbols from "./Symbols3d.js";
import Assets3d from "./Assets3d.js";
import GraphView3d from "./GraphView3d.js";
import Scene3d from "./Scene3d.js";
import RulerView from "./RulerView.js";

import TreePane from "./TreePane.js";
import BatchView from "./BatchView.js";
import AlignPane from "./AlignPane.js";

import SceneInspector from "./SceneInspector.js";
import DataInspector from "./DataInspector.js";
import ConeInspector from "./ConeInspector.js";
import CubeInspector from "./CubeInspector.js";
import CylinderInspector from "./CylinderInspector.js";
import ModelInspector from "./ModelInspector.js";
import RoundRectInspector from "./RoundRectInspector.js";
import SphereInspector from "./SphereInspector.js";
import TorusInspector from "./TorusInspector.js";
import TriangleInspector from "./TriangleInspector.js";
import BillboardInspector from "./BillboardInspector.js";
import WallInspector from "./WallInspector.js";
import FloorInspector from "./FloorInspector.js";
import PipelineInspector from "./PipelineInspector.js";
import PolylineInspector from "./PolylineInspector.js";
import EdgeInspector from "./EdgeInspector.js";
import BlockInspector from "./BlockInspector.js";
import FunctionView from "../dialog/FunctionView.js";
import FontView from "../dialog/FontView.js";
import ObjectView from "../dialog/ObjectView.js";
import EventView from "../dialog/EventView.js";

export default class Editor3d {
  constructor(params = {}) {
    this.params = params;
    this._eventNotifier = new ht.Notifier;
    this._clones = [];
    this.modelDialogs = {};
    this.body = params.body;
    const Service = ht.Default.getClass(config.serviceClass || WebSocketService);
    this.service = new Service(this.handleServiceEvent.bind(this), this);
    ht.Default.handleModelLoaded = () => {
      this.inspector && this.inspector.updateProperties();
    };
    const serializer = this.serializer = new ht.JSONSerializer;
    serializer.isSerializable = data => {
      return this.scene.sm().contains(data)
    };
    serializer.getProperties = (name) => {
      const prop = this.serializer.getProperties(name);
      config.cloneTag || delete prop.tag;
      return prop;
    };
    this.editable = true;
  }

  addEventListener() {
    Editor.prototype.addEventListener.apply(this, arguments)
  }

  removeEventListener() {
    Editor.prototype.removeEventListener.apply(this, arguments);
  }

  fireEvent() {
    Editor.prototype.fireEvent.apply(this, arguments);
  }

  handleServiceEvent(e) {
    if (e.type === "connected") {
      if (this.init) {
        this.init();
        this.init = null;
      }
    } else if (e.type === "fileChanged") {
      const path = e.path;
      if (removeCache(path)) {
        const scene = this.scene,
          textureMap = scene.getTextureMap();
        textureMap[path] && scene.deleteTexture(path);
        scene.invalidateAll();
        this.gv.invalidateAll();
      }
      if (isScene(path)) {
        this.requestScenes();
      } else if (isModel(path)) {
        this.requestModels();
        this.scene.invalidateAll();
        this.gv.invalidateAll();
      } else if (isSymbol(path)) {
        this.requestSymbols();
      } else if (isAsset(path)) {
        this.requestAssets();
      }
    } else if (e.type === "download") {
      this.downloadFile(e.path);
    } else if (e.type === "confirm") {
      this.requestImport(e.path);
    }
    this.fireEvent(e.type, e);
  }

  downloadFile() {
    Editor.prototype.downloadFile.apply(this, arguments);
  }

  requestImport() {
    Editor.prototype.requestImport.apply(this, arguments);
  }

  beginTransaction() {
    this.dm.beginTransaction();
  }

  endTransaction() {
    this.dm.endTransaction();
  }

  init() {
    this.menus = [];
    this.dm = new ht.DataModel;
    this.gv = new GraphView3d(this);
    this.rulerView = new RulerView(this, this.gv);
    this.eventView = new EventView(this);
    this.scene = new Scene3d(this);
    this.functionView = new FunctionView(this);
    this.fontView = new FontView(this);
    this.objectView = new ObjectView(this);
    this.mainToolbar = new MainToolbar3d(this);
    this.fireEvent("mainToolbarCreated");
    this.rightToolbar = new RightToolbar3d(this);
    this.fireEvent("rightToolbarCreated");
    this.topBorderPane = new ht.widget.BorderPane;
    this.topBorderPane.setCenterView(this.mainToolbar);
    this.topBorderPane.setRightView(this.rightToolbar);
    this.topBorderPane.setHeight(28);
    this.rightToolbar.onSumWidthChanged = () => {
      this.topBorderPane.setRightWidth(this.rightToolbar.getSumWidth());
    };
    this.resetInteractionState();
    this.mainTabView = new ht.widget.TabView;
    this.scenes = new Scenes3d(this);
    this.models = new Models3d(this);
    this.symbols = new Symbols(this);
    this.assets = new Assets3d(this);
    this.leftTopTabView = new ht.widget.TabView;
    addTab(this.leftTopTabView, getString("editor.scenes"), this.scenes, true);
    addTab(this.leftTopTabView, getString("editor.models"), this.models);
    addTab(this.leftTopTabView, getString("editor.symbols"), this.symbols);
    addTab(this.leftTopTabView, getString("editor.assets"), this.assets);
    this.treePane = new TreePane(this);
    this.dataView = new DataView3d(this);
    this.rightBottomTabView = new ht.widget.TabView;
    addTab(this.rightBottomTabView, getString("editor.list"), this.treePane, true);
    addTab(this.rightBottomTabView, getString("editor.data"), this.dataView);
    if (config.batchEditable) {
      this.batchView = new BatchView(this);
      addTab(this.rightBottomTabView, getString("editor.batch"), this.batchView);
    }
    const sm = this.rightBottomTabView.getTabModel().sm();
    sm.ms(() => {
      const ld = sm.ld();
      this.dataView.visible = ld?.getView() === this.dataView;
    });
    this.alignPane = new AlignPane(this);
    this.rightTopBorderPane = new ht.widget.BorderPane;
    this.rightTopBorderPane.setTopView(this.alignPane);
    this.rightTopBorderPane.setCenterView(this.inspectorPane);
    this.rightTopBorderPane.setTopHeight(ht.Default.widgetHeaderHeight + 6);
    this.centerSplitView = new ht.widget.SplitView(this.rulerView, this.scene, "v");
    this.leftSplitView = new ht.widget.SplitView(this.leftTopTabView, this.centerSplitView, "h", 260);
    this.rightSplitView = new ht.widget.SplitView(this.rightTopBorderPane, this.rightBottomTabView, "v", -300);
    this.mainSplitView = new ht.widget.SplitView(this.leftSplitView, this.rightSplitView, "h", -360);
    this.mainPane = new ht.widget.BorderPane;
    this.mainPane.setTopView(this.topBorderPane);
    this.mainPane.setCenterView(this.mainSplitView);
    layoutMainView(this.mainPane, this.body);
    this.body && this.body.addEventListener("keydown", this.handleKeydown.bind(this), false);
    this.dnd = new DND(this);
    this.dndFromOutside = new DNDFromOutside(this, this.body);
    this.requestScenes();
    this.requestModels();
    this.requestSymbols();
    this.requestAssets();
    this.dm.addDataModelChangeListener(this.handleDataModelChange, this);
    this.dm.addPropertyChangeListener(this.handleDataModelPropertyChange, this);
    this.dm.addDataPropertyChangeListener(this.handleDataPropertyChange, this);
    this.sm.ms(this.handleSelectionChange, this);
    this.scene.addPropertyChangeListener(this.handleScenelPropertyChange, this);
    this.scene.mi(this.handleSceneInteractive, this);
    this.gv.addInteractorListener(this.handleInteractor, this);
    this.updateInspector();
    this.fireEvent("editor3dCreated");
    this.dm.enableHistoryManager(config.maxUndoRedoSteps);
    this.initSID();
    const value = this.params.open || getQueryString("tpeditor") || config.open;
    if (value) {
      if (isJSON(value)) {
        this._pendingOpenJSON = value;
      } else {
        value === "newscene" && this.newScene();
      }
    }
    this.reset();
  }

  initSID() {
    const result = window.location.href.match("sid=([0-9a-z-]*)");
    result && (this.sid = result[1]);
  }

  handleDataModelPropertyChange(e) {
    this.inspector?.global && this.inspector.invalidateProperties(e);
    this.dataView.updateContentLater(e);
    const scene = this.scene,
      property = e.property,
      newValue = e.newValue;
    if (newValue !== undefined) {
      if ("a:sceneEditHelperDisabled" === property) {
        scene.setEditHelperDisabled(newValue);
        this.rightToolbar.iv();
      } else if ("a:sceneGridEnabled" === property) {
        scene.setGridVisible(newValue);
        scene.setOriginAxisVisible(newValue);
        this.gv.getEditInteractor().gridEnabled = newValue;
        this.rightToolbar.iv();
      } else if ("a:sceneGridBlockCount" === property) {
        scene.setGridSize(newValue);
      } else if ("a:sceneGridBlockSize" === property) {
        scene.setGridGap(newValue);
        this.gv.setEditStyle("gridBlockSize", newValue);
      } else if ("a:sceneGridColor" === property) {
        const colors = ht.Default.toColorData(newValue);
        scene.setGridColor([colors[0] / 255, colors[1] / 255, colors[2] / 255, 1]);
        this.gv.setEditStyle("gridThickColor", newValue);
        this.gv.setEditStyle("gridLightColor", "rgba(" + colors[0] + ", " + colors[1] + ", " + colors[2] + ", 0.4)");
      } else if ("a:sceneNear" === property) {
        scene.setNear(newValue);
      } else if ("a:sceneFar" === property) {
        scene.setFar(newValue);
      } else if ("a:sceneBloom" === property) {
        scene.setPostProcessingValue("Bloom", "enable", newValue);
      } else if ("a:sceneBloomStrength" === property) {
        scene.setPostProcessingValue("Bloom", "strength", newValue);
      } else if ("a:sceneBloomThreshold" === property) {
        scene.setPostProcessingValue("Bloom", "threshold", newValue);
      } else if ("a:sceneBloomRadius" === property) {
        scene.setPostProcessingValue("Bloom", "radius", newValue);
      } else if ("a:sceneDof" === property) {
        scene.setPostProcessingValue("Dof", "enable", newValue);
      } else if ("a:sceneDofAperture" === property) {
        scene.setPostProcessingValue("Dof", "aperture", newValue);
      } else if ("a:sceneDofImage" === property) {
        scene.setPostProcessingValue("Dof", "image", newValue);
      } else if ("a:sceneHighlightMode" === property) {
        scene.setHighlightMode(newValue);
      } else if ("a:sceneHighlightWidth" === property) {
        scene.setHighlightWidth(newValue);
      } else if ("a:sceneHighlightColor" === property) {
        scene.setHighlightColor(newValue);
      } else if ("a:sceneDashEnable" === property) {
        scene.setDashDisabled(!newValue);
      } else if ("a:sceneHeadlightEnable" === property) {
        scene.setHeadlightDisabled(!newValue);
      } else if ("a:sceneHeadlightRange" === property) {
        scene.setHeadlightRange(newValue);
      } else if ("a:sceneHeadlightColor" === property) {
        scene.setHeadlightColor(newValue);
      } else if ("a:sceneHeadlightIntensity" === property) {
        scene.setHeadlightIntensity(newValue);
      } else if ("a:sceneHeadlightAmbientIntensity" === property) {
        scene.setHeadlightAmbientIntensity(newValue);
      } else if ("a:sceneFogEnable" === property) {
        scene.setFogDisabled(!newValue);
      } else if ("a:sceneFogColor" === property) {
        scene.setFogColor(newValue);
      } else if ("a:sceneFogNear" === property) {
        scene.setFogNear(newValue);
      } else if ("a:sceneFogFar" === property) {
        scene.setFogFar(newValue);
      } else if ("a:sceneBatchBrightnessDisabled" === property) {
        scene.setBatchBrightnessDisabled(newValue);
      } else if ("a:sceneBatchBlendDisabled" === property) {
        scene.setBatchBlendDisabled(newValue);
      } else if ("a:sceneBatchColorDisabled" === property) {
        scene.setBatchColorDisabled(newValue);
      } else if ("a:sceneShadowEnabled" === property) {
        newValue ? scene.enableShadow() : scene.disableShadow();
      } else if ("a:sceneShadowDegreeX" === property) {
        scene.setShadowDegreeX(newValue);
      } else if ("a:sceneShadowDegreeZ" === property) {
        scene.setShadowDegreeZ(newValue);
      } else if ("a:sceneShadowIntensity" === property) {
        scene.setShadowIntensity(newValue);
      } else if ("a:sceneShadowQuality" === property) {
        scene.setShadowQuality(newValue);
      } else if ("a:sceneShadowType" === property) {
        scene.setShadowType(newValue);
      } else if ("a:sceneShadowRadius" === property) {
        scene.setShadowRadius(newValue);
      } else if ("a:sceneShadowBias" === property) {
        scene.setShadowBias(newValue);
      } else if ("a:sceneBatchInfoMap" === property) {
        scene.setBatchInfoMap(newValue);
        const batchView = this.batchView;
        batchView?.parseBatchInfoMap(newValue);
        batchView?.updateProperties();
      } else if ("a:sceneOrthographic" === property) {
        this._setSceneOrtho(newValue);
      }
    }
  }

  _setSceneOrtho(ortho) {
    const scene = this.scene;
    let updateEye = this.__updateEye__;
    if (!updateEye) {
      updateEye = this.__updateEye__ = function () {
        const center_v3 = new ht.Math.Vector3,
          eye_v3 = new ht.Math.Vector3,
          v3 = new ht.Math.Vector3;
        return function (direction) {
          if (direction) {
            center_v3.fromArray(scene.getCenter());
            eye_v3.fromArray(scene.getEye());
            eye_v3.sub(center_v3);
            let xyz = [0, 1, 0];
            if (direction === "right") {
              xyz = [1, 0, 0];
            } else if (direction === "front") {
              xyz = [0, 0, 1];
            }
            v3.fromArray(xyz).setLength(eye_v3.length()).add(center_v3);
            scene.setEye(v3.toArray());
          }
        }
      }();
    }
    let defaultInteractor = this.__defaultInteractor__;
    if (!defaultInteractor) {
      const interactors = scene.getInteractors(),
        length = interactors.length;
      for (let i = 0; i < length; i++) {
        const interactor = interactors.get(0);
        if (interactor instanceof ht.graph3d.DefaultInteractor) {
          defaultInteractor = this.__defaultInteractor__ = interactor;
          break;
        }
      }
    }
    let orthoPanInteractor = this.__orthoPanInteractor__;
    if (!orthoPanInteractor) {
      orthoPanInteractor = this.__orthoPanInteractor__ = new DefaultInteractor(scene);
    }
    scene.setOrtho(!!ortho);
    if (ortho) {
      scene.setInteractors([orthoPanInteractor]);
      updateEye(ortho);
    } else {
      scene.setInteractors([defaultInteractor]);
    }
  }

  handleScenelPropertyChange(e) {
    this.inspector?.global && this.inspector.invalidateProperties(e);
    this._sceneInteracting || this.dataView.updateContentLater(e);
  }

  handleSceneInteractive(e) {
    this._sceneInteracting = ["betweenRotate", "betweenPan"].includes(e.kind);
    if (!this._sceneInteracting) {
      this.dataView.updateContentLater(e);
    }
  }

  handleDataModelChange(e) {
    this.inspector?.global && this.inspector.updateProperties();
    this.dataView.updateContentLater(e);
  }

  handleDataPropertyChange(e) {
    const data = e.data;
    if (e.property === "parent" && data instanceof ht.Node && !ht.Default.isIsolating()) {
      let parent = data.getParent();
      if (parent instanceof ht.Block) {
        parent = null;
      }
      if (!parent || parent instanceof ht.Node) {
        data.setHost(parent);
      }
    }
    if (!this.inspector?.global && this.inspector.data === data) {
      this.inspector.invalidateProperties(e);
    }
    this.dataView.updateContentLater(e);
  }

  handleSelectionChange() {
    this.updateInspector()
  }

  handleInteractor(event) {
    if (event.kind === "selectPoint") {
      if (event.x === undefined) {
        this.currentPoint = null;
      } else {
        this.currentPoint = {
          x: event.x,
          y: event.y,
          e: event.e
        };
      }
      this.updateInspector();
    }
  }

  updateInspector() {
    this.inspector = null;
    this.inspector = null;
    var data = this.ld;
    if (data) {
      const shape = data.s("shape3d");
      data instanceof ht.Block ? this.inspector = this.blockInspector : data instanceof ht.Polyline ? this.inspector = this.polylineInspector : data instanceof ht.Shape ? "cylinder" === shape ? this.inspector = this.pipelineInspector : data.getThickness() > 0 ? this.inspector = this.wallInspector : this.inspector = this.floorInspector : data instanceof ht.Node ? shape ? tpeditor.isJSON(shape) ? this.inspector = this.modelInspector : "billboard" === shape || "plane" === shape ? this.inspector = this.billboardInspector : "cube" === shape ? this.inspector = this.cubeInspector : "cone" === shape ? this.inspector = this.coneInspector : "cylinder" === shape ? this.inspector = this.cylinderInspector : "roundRect" === shape ? this.inspector = this.roundRectInspector : "sphere" === shape ? this.inspector = this.sphereInspector : "torus" === shape ? this.inspector = this.torusInspector : "triangle" === shape && (this.inspector = this.triangleInspector) : this.inspector = this.cubeInspector : data instanceof ht.Edge && (this.inspector = this.edgeInspector), this.inspector || (this.inspector = this.dataInspector)
    } else {
      this.inspector = this.sceneInspector;
    }
    if (this.inspector) {
      this.inspector.data = data;
      this.inspector.filterPropertiesLater();
    }
    this.rightTopBorderPane.setCenterView(this.inspector);
  }

  reset(needReload) {
    if (!needReload) {
      this.url = null;
    }
    const dm = this.dm;
    dm.disableHistoryManager();
    dm.setPostProcessingData(undefined);
    dm.setName(undefined);
    dm.setBackground(undefined);
    dm.setHierarchicalRendering(true);
    dm.setLayers(undefined);
    dm.setAttrObject(undefined);
    dm.setEnvmap(undefined);
    dm.clear();
    const gv = this.gv;
    gv.setZoom(1);
    gv.tx(0);
    gv.ty(0);
    const scene = this.scene;
    scene.setEye(config.sceneEye);
    scene.setCenter(config.sceneCenter);
    dm.a("sceneNear", config.sceneNear);
    dm.a("sceneFar", config.sceneFar);
    dm.a("connectActionType", config.sceneConnectActionType);
    dm.a("sceneEditHelperDisabled", config.sceneEditHelperDisabled);
    dm.a("sceneGridEnabled", config.sceneGridEnabled);
    dm.a("sceneGridBlockCount", config.sceneGridBlockCount);
    dm.a("sceneGridBlockSize", config.sceneGridBlockSize);
    dm.a("sceneGridColor", config.sceneGridColor);
    dm.a("sceneBatchBrightnessDisabled", config.sceneBatchBrightnessDisabled);
    dm.a("sceneBatchBlendDisabled", config.sceneBatchBlendDisabled);
    dm.a("sceneBatchColorDisabled", config.sceneBatchColorDisabled);
    dm.a("sceneHighlightMode", config.sceneHighlightMode);
    dm.a("sceneHighlightColor", config.sceneHighlightColor);
    dm.a("sceneHighlightWidth", config.sceneHighlightWidth);
    dm.a("sceneDashEnable", config.sceneDashEnable);
    dm.a("sceneHeadlightEnable", config.sceneHeadlightEnable);
    dm.a("sceneHeadlightRange", config.sceneHeadlightRange);
    dm.a("sceneHeadlightColor", config.sceneHeadlightColor);
    dm.a("sceneHeadlightIntensity", config.sceneHeadlightIntensity);
    dm.a("sceneHeadlightAmbientIntensity", config.sceneHeadlightAmbientIntensity);
    dm.a("sceneFogEnable", config.sceneFogEnable);
    dm.a("sceneFogColor", config.sceneFogColor);
    dm.a("sceneFogNear", config.sceneFogNear);
    dm.a("sceneFogFar", config.sceneFogFar);
    dm.a("sceneShadowEnabled", config.sceneShadowEnabled);
    dm.a("sceneShadowDegreeX", config.sceneShadowDegreeX);
    dm.a("sceneShadowDegreeZ", config.sceneShadowDegreeZ);
    dm.a("sceneShadowIntensity", config.sceneShadowIntensity);
    dm.a("sceneShadowQuality", config.sceneShadowQuality);
    dm.a("sceneShadowType", config.sceneShadowType);
    dm.a("sceneShadowRadius", config.sceneShadowRadius);
    dm.a("sceneShadowBias", config.sceneShadowBias);
    dm.a("sceneDof", config.sceneDof);
    dm.a("sceneDofAperture", config.sceneDofAperture);
    dm.a("sceneDofImage", config.sceneDofImage);
    dm.a("sceneBloom", config.sceneBloom);
    dm.a("sceneBloomStrength", config.sceneBloomStrength);
    dm.a("sceneBloomThreshold", config.sceneBloomThreshold);
    dm.a("sceneBloomRadius", config.sceneBloomRadius);
    dm.a("sceneOrthographic", config.sceneOrthographic);
    this.batchView && this.batchView.clearBatchInfo();
    dm.enableHistoryManager();
    dm.clearHistoryManager();
  }

  getModelDialog(index) {
    let modelDialog = this.modelDialogs[index];
    if (!modelDialog) {
      let ModelDialog = config.modelDialogClasses ? config.modelDialogClasses[index] : null;
      if (!ModelDialog) {
        ModelDialog = Dialog3d;
      }
      modelDialog = this.modelDialogs[index] = new ModelDialog(this);
    }
    return modelDialog;
  }

  open(fileNode) {
    ht.Default.isString(fileNode) && (fileNode = this.getFileNode(fileNode));
    if (!fileNode?.tag) {
      const url = fileNode.url;
      if (fileNode.fileType === "scene") {
        this.newScene(url);
      } else if (fileNode.fileType === "model") {
        ht.Default.xhrLoad(url, res => {
          res = ht.Default.parse(res);
          this.getModelDialog(res.modelType).open(url, res)
        })
      }
    }
  }

  newOBJModel() {
    this.getModelDialog("obj").open();
  }

  newScene(url) {
    if (url) {
      this.opened = false;
      this.url = url;
      this.reload();
    } else {
      this.reset();
      this.fireEvent("sceneViewCreated", { sceneView: this });
    }
  }

  readForOld3dEditorFormat(prop) {
    const dm = this.dm,
      scene = prop.scene;
    if (scene) {
      scene.near && dm.a("sceneNear", scene.near);
      scene.far && dm.a("sceneFar", scene.far);
      if (scene.shadow === undefined && scene.shadowParams) {
        dm.a("sceneShadowEnabled", scene.shadow);
        const params = scene.shadowParams;
        for (const key in params) {
          const value = params[key];
          if (value !== undefined) {
            dm.a("sceneShadow" + key.charAt(0).toUpperCase() + key.substring(1), value)
          }
        }
      }
    }
    const data = dm.getPostProcessingData();
    if (data) {
      dm.setPostProcessingData(undefined);
      const bloom = data.bloom;
      if (bloom) {
        if (bloom.enable !== undefined) {
          dm.a("sceneBloom", bloom.enable);
        }
        if (bloom.strength !== undefined) {
          dm.a("sceneBloomStrength", bloom.strength);
        }

        if (bloom.threshold !== undefined) {
          dm.a("sceneBloomThreshold", bloom.threshold);
        }

        if (bloom.radius !== undefined) {
          dm.a("sceneBloomRadius", bloom.radius);
        }
      }
      const dof = data.dof;
      if (dof) {
        if (dof.enable !== undefined) {
          dm.a("sceneDof", dof.enable);
        }
        if (dof.aperture !== undefined) {
          dm.a("sceneDofAperture", dof.aperture);
        }
        if (dof.image !== undefined) {
          dm.a("sceneDofImage", dof.image);
        }
      }
    }
  }

  reload() {
    const url = this.url;
    if (url) {
      this.fireEvent(this.opened ? "SceneViewReloading" : "SceneViewOpening", {
        sceneView: this,
        url
      });
      const scene = this.scene;
      this.reset(true);
      this.dm.disableHistoryManager();
      scene.deserialize(url, {
        setId: config.setId,
        finishFunc: (json, dm) => {
          this.gv.fitContent(true);
          this.readForOld3dEditorFormat(json);
          const _scene = json.scene;
          _scene?.eye && this.scene.setEye(_scene.eye);
          _scene?.center && this.scene.setCenter(_scene.center);
          dm.setPostProcessingData(undefined);
          this.dm.enableHistoryManager();
          this.dm.clearHistoryManager();
          this.fireEvent(this.opened ? "SceneViewReloaded" : "SceneViewOpened", {
            sceneView: this,
            url
          });
          this.opened = true;
        },
        disableOnPreDeserialize: true,
        disableOnPostDeserialize: true
      })
    }
  }

  save() {
    if (this.url) {
      this.saveImpl(this.url);
    } else {
      const currentDir = this.scenes.currentDir,
        title = getString("editor.inputnewscenename"),
        callback = (fileName, action) => {
          if (action === "ok") {
            const ext = isJSON(fileName) ? trimExtension(fileName) : fileName,
              url = currentDir + "/" + ext + ".json";
            let found = false;
            this.scenes.dataModel.each(data => {
              if (data.url === url) {
                found = true;
              }
            });
            if (found) {
              const buttons = [{
                label: getString("editor.ok"),
                action: function () {
                  dialog.hide();
                }
              }],
                dialog = new ht.widget.Dialog({
                  title: getString("editor.filenameconflict"),
                  contentPadding: 20,
                  width: 300,
                  draggable: true,
                  content: "<p>" + url + "</p>",
                  buttons
                });
              dialog.show();
            } else {
              this.saveImpl(url);
            }
          }
        },
        params = { name: undefined, scene: this.scene };
      this.fireEvent("sceneNewNameInputing", params);
      params.name ? callback(params.name, "ok") : getInput(title, "", {
        nullable: false,
        trim: true,
        maxLength: config.maxFileNameLength
      }, callback)
    }
  }

  saveImpl(url) {
    if (url) {
      this.url = url;
      let params = { url, scene: this.scene };
      this.fireEvent("sceneSaving", params);
      if (params.preventDefault) return false;
      params = { path: params.url, content: this.serialize() };
      this.request("upload", params, res => {
        if (res === true) {
          this.fireEvent("sceneSaved", params);
          params = {
            path: url.substr(0, url.length - 5) + ".png",
            content: this.scene.toImage(this.dm.getBackground())
          };
          this.request("upload", params, res => {
            if (res === true) {
              this.selectFileNode(url);
            }
          })
        }
      })
    }
  }

  preview() {
    let url = this.dm.a("previewURL") || "scene.html";
    if (this.url && url.indexOf("?") === - 1) {
      url += "?tag=" + encodeURI(this.url)
    }
    let params = { url };
    this.fireEvent("sceneViewPreviewing", params);
    window.open(params.url, params.url);
    params = {
      path: "previews/scene.json",
      content: this.serialize()
    };
    this.request("upload", params, function () { });
  }

  deserialize(url) {
    this.scene.deserialize(url, function () { })
  }

  serialize() {
    return ht.Default.stringify(this.toJSON())
  }

  toJSON() {
    const dm = this.dm,
      json = dm.toJSON(),
      scene = {},
      eye = ht.Default.clone(this.scene.getEye());
    if (eye.join(",") !== config.sceneEye.join(",")) {
      scene.eye = eye;
    }
    const center = ht.Default.clone(this.scene.getCenter());
    if (center.join(",") !== config.sceneCenter.join(",")) {
      scene.center = center;
    }
    if (!ht.Default.isEmptyObject(scene)) {
      json.scene = scene
    }
    const map = this.scene.getBatchInfoMap();
    if (!ht.Default.isEmptyObject(map)) {
      json.a.sceneBatchInfoMap = map;
    }
    if (dm.a("sceneNear") === config.sceneNear) {
      delete json.a.sceneNear;
    }
    if (dm.a("sceneFar") === config.sceneFar) {
      delete json.a.sceneFar;
    }
    if (dm.a("sceneEditHelperDisabled") === config.sceneEditHelperDisabled) {
      delete json.a.sceneEditHelperDisabled;
    }
    if (dm.a("sceneEditHelperDisabled") === config.sceneEditHelperDisabled) {
      delete json.a.sceneGridEnabled;
    }
    if (dm.a("sceneGridBlockCount") === config.sceneGridBlockCount) {
      delete json.a.sceneGridBlockCount;
    }
    if (dm.a("sceneGridBlockSize") === config.sceneGridBlockSize) {
      delete json.a.sceneGridBlockSize;
    }
    if (dm.a("sceneGridColor") === config.sceneGridColor) {
      delete json.a.sceneGridColor;
    }
    if (dm.a("sceneBatchBrightnessDisabled") === config.sceneBatchBrightnessDisabled) {
      delete json.a.sceneBatchBrightnessDisabled;
    }
    if (dm.a("sceneBatchBlendDisabled") === config.sceneBatchBlendDisabled) {
      delete json.a.sceneBatchBlendDisabled;
    }
    if (dm.a("sceneBatchColorDisabled") === config.sceneBatchColorDisabled) {
      delete json.a.sceneBatchColorDisabled;
    }
    if (dm.a("sceneHighlightMode") === config.sceneHighlightMode) {
      delete json.a.sceneHighlightMode;
    }
    if (dm.a("sceneHighlightColor") === config.sceneHighlightColor) {
      delete json.a.sceneHighlightColor;
    }
    if (dm.a("sceneHighlightWidth") === config.sceneHighlightWidth) {
      delete json.a.sceneHighlightWidth;
    }
    if (dm.a("sceneDashEnable") === config.sceneDashEnable) {
      delete json.a.sceneDashEnable;
    }
    if (dm.a("sceneHeadlightEnable") === config.sceneHeadlightEnable) {
      delete json.a.sceneHeadlightEnable;
    }
    if (dm.a("sceneHeadlightRange") === config.sceneHeadlightRange) {
      delete json.a.sceneHeadlightRange;
    }

    if (dm.a("sceneHeadlightColor") === config.sceneHeadlightColor) {
      delete json.a.sceneHeadlightColor;
    }
    if (dm.a("sceneHeadlightIntensity") === config.sceneHeadlightIntensity) {
      delete json.a.sceneHeadlightIntensity;
    }
    if (dm.a("sceneHeadlightAmbientIntensity") === config.sceneHeadlightAmbientIntensity) {
      delete json.a.sceneHeadlightAmbientIntensity;
    }
    if (dm.a("sceneFogEnable") === config.sceneFogEnable) {
      delete json.a.sceneFogEnable;
    }
    if (dm.a("sceneFogColor") === config.sceneFogColor) {
      delete json.a.sceneFogColor;
    }
    if (dm.a("sceneFogNear") === config.sceneFogNear) {
      delete json.a.sceneFogNear;
    }
    if (dm.a("sceneFogFar") === config.sceneFogFar) {
      delete json.a.sceneFogFar;
    }
    if (dm.a("sceneFogMode") === config.sceneFogMode) {
      delete json.a.sceneFogMode;
    }
    if (dm.a("sceneFogDensity") === config.sceneFogDensity) {
      delete json.a.sceneFogDensity;
    }
    if (dm.a("sceneShadowEnabled") === config.sceneShadowEnabled) {
      delete json.a.sceneShadowEnabled;
    }
    if (dm.a("sceneShadowDegreeX") === config.sceneShadowDegreeX) {
      delete json.a.sceneShadowDegreeX;
    }
    if (dm.a("sceneShadowDegreeZ") === config.sceneShadowDegreeZ) {
      delete json.a.sceneShadowDegreeZ;
    }
    if (dm.a("sceneShadowIntensity") === config.sceneShadowIntensity) {
      delete json.a.sceneShadowIntensity;
    }
    if (dm.a("sceneShadowQuality") === config.sceneShadowQuality) {
      delete json.a.sceneShadowQuality;
    }
    if (dm.a("sceneShadowType") === config.sceneShadowType) {
      delete json.a.sceneShadowType;
    }
    if (dm.a("sceneShadowRadius") === config.sceneShadowRadius) {
      delete json.a.sceneShadowRadius;
    }
    if (dm.a("sceneShadowBias") === config.sceneShadowBias) {
      delete json.a.sceneShadowBias;
    }
    if (dm.a("sceneDof") === config.sceneDof) {
      delete json.a.sceneDof;
    }
    if (dm.a("sceneDofAperture") === config.sceneDofAperture) {
      delete json.a.sceneDofAperture;
    }
    if (dm.a("sceneDofImage") === config.sceneDofImage) {
      delete json.a.sceneDofImage;
    }
    if (dm.a("sceneBloom") === config.sceneBloom) {
      delete json.a.sceneBloom;
    }
    if (dm.a("sceneBloomStrength") === config.sceneBloomStrength) {
      delete json.a.sceneBloomStrength;
    }
    if (dm.a("sceneBloomThreshold") === config.sceneBloomThreshold) {
      delete json.a.sceneBloomThreshold;
    }
    if (dm.a("sceneBloomRadius") === config.sceneBloomRadius) {
      delete json.a.sceneBloomRadius;
    }
    return json;
  }

  getState() {
    return this._interactionState;
  }

  setState(state, interactor) {
    if (this._interactionState !== state) {
      this._interactionState = state;
      this.pointsEditingMode = false;
      const items = [];
      this.gv.getInteractors().each(item => {
        if (item.keep) {
          item.interactiveDisabled = state !== "edit";
        } else {
          items.push(item);
        }
      });
      items.forEach(item => {
        item.tearDown();
        this.gv.getInteractors().remove(item);
      });
      if (state !== "edit") {
        interactor.setUp();
        this.gv.getInteractors().add(interactor);
      }
      this.gv.invalidateSelection();
      this.rulerView.validateCanvas();
      this.mainToolbar.iv();
    }
  }

  request(cmd, data, callback = () => { }, ms) {
    if (ms) {
      setTimeout(() => {
        this.service.request(cmd, data, callback)
      }, ms);
    } else {
      this.service.request(cmd, data, callback);
    }
  }

  requestScenes() {
    if (!this._requestingScenes) {
      this.request("explore", "/scenes", res => {
        this._requestingScenes = false;
        this.scenes.parse(res);
        if (this._pendingOpenJSON && isScene(this._pendingOpenJSON)) {
          if (this.scenes.dataModel.getDataById(this._pendingOpenJSON)) {
            this.open(this._pendingOpenJSON);
            this.selectFileNode(this._pendingOpenJSON);
          } else if (config.newIfFailToOpen) {
            this.newScene();
            this.url = this._pendingOpenJSON;
            this.save();
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

  requestSymbols() {
    Editor.prototype.requestSymbols.apply(this, arguments);
  }

  requestModels() {
    Editor.prototype.requestModels.apply(this, arguments);
  }

  requestAssets() {
    Editor.prototype.requestAssets.apply(this, arguments);
  }

  requestBase64(url, callback) {
    this.request("source", {
      url,
      encoding: "base64",
      prefix: "data:;base64,"
    }, callback)
  }

  copy() {
    if (this.ld) {
      this.serializer.dm = this.scene.dm();
      const json = this.serializer.toJSON();
      delete json.p;
      delete json.a;
      this._cloneJSON = ht.Default.stringify(json);
    }
  }

  paste() {
    if (this._cloneJSON) {
      const datas = this.serializer.deserialize(this._cloneJSON);
      this.scene.sm().ss(datas);
    }
  }

  hasCopyInfo() {
    return !!this._cloneJSON
  }

  undo() {
    Editor.prototype.undo.apply(this, arguments);
  }

  redo() {
    Editor.prototype.redo.apply(this, arguments);
  }

  renameFile() {
    Editor.prototype.renameFile.apply(this, arguments);
  }

  getFileNode() {
    return Editor.prototype.getFileNode.apply(this, arguments);
  }

  moveFile() {
    Editor.prototype.moveFile.apply(this, arguments)
  }

  removeFiles() {
    Editor.prototype.removeFiles.apply(this, arguments)
  }

  locate() {
    Editor.prototype.locate.apply(this, arguments)
  }

  newFolder() {
    Editor.prototype.newFolder.apply(this, arguments)
  }

  toggleLeft() {
    if (this.leftSplitView.getStatus() === "normal") {
      this.leftSplitView.setStatus("cl");
    } else {
      this.leftSplitView.setStatus("normal");
    }
  }

  toggleRight() {
    if (this.mainSplitView.getStatus() === "normal") {
      this.mainSplitView.setStatus("cr");
    } else {
      this.mainSplitView.setStatus("normal");
    }
  }

  fitSelection() {
    let sm = this.dm.sm().getSelection();
    if (sm.length === 0) {
      sm = null;
    }
    this.zoomToFit(sm);
  }

  handleKeydown() {
    Editor.prototype.handleKeydown.apply(this, arguments);
  }

  selectFileNode() {
    Editor.prototype.selectFileNode.apply(this, arguments);
  }

  dropLocalFileOnDir() {
    Editor.prototype.dropLocalFileOnDir.apply(this, arguments);
  }

  uploadLocalFile() {
    Editor.prototype.uploadLocalFile.apply(this, arguments);
  }

  zoomIn() {
    this.gv?.zoomIn(config.animate);
    this.scene?.zoomIn(config.animate)
  }

  zoomOut() {
    this.gv?.zoomOut(config.animate);
    this.scene?.zoomOut(config.animate)
  }

  zoomToFit(target) {
    this.scene.flyTo(target, { animation: config.animate });
    const gv = this.gv;
    if (!target) {
      gv.fitContent(config.animate, config.fitPadding);
      return;
    }
    let rect = undefined;
    target.each(function (data) {
      rect = ht.Default.unionRect(rect, gv.getDataUIBounds(data));
    });
    ht.Default.grow(rect, 20, 20);
    gv.fitRect(rect, config.animate);
  }

  zoomReset() {
    this.gv?.zoomReset(config.animate);
    this.scene?.isResettable() && this.scene.reset();
  }

  saveImage() {
    Editor.prototype.saveImage.apply(this, arguments);
  }

  createSceneItem(state, tooltip, name, interactor) {
    const _getter = () => {
      return this.getState() === state;
    },
      item = createItem(state, tooltip, name, _getter);
    item.action = () => {
      this.setState(state, interactor);
    };
    return item;
  }

  resetInteractionState() {
    this.setState("edit");
  }

  isRulerEnabled() {
    return this.rulerView.isRulerEnabled();
  }

  setRulerEnabled(enabled) {
    this.rulerView.setRulerEnabled(enabled);
  }

  toggleRulerEnabled() {
    this.setRulerEnabled(!this.isRulerEnabled())
  }

  block() {
    if (this.editable) {
      const sel = this.dm.sm().getSelection();
      if (sel.length) {
        this.beginTransaction();
        const block = new ht.Block;
        sel.forEach(item => {
          item.setParent(block);
        });
        this.dm.add(block);
        this.endTransaction();
      }
    }
  }

  unblock() {
    if (this.editable) {
      this.beginTransaction();
      const items = [];
      this.sm.toSelection().each(data => {
        if (data instanceof ht.Block && !(data instanceof ht.RefGraph)) {
          const parent = data.getParent();
          data.getChildren().toArray().forEach(node => {
            node.setParent(parent);
            items.push(node);
          });
          this.dm.remove(data);
        }
      });
      if (items.length) {
        this.sm.ss(items);
      }
      this.endTransaction();
    }
  }

  bringToFront() {
  }

  sendToBack() {
  }

  bringForward() {
  }

  sendBackward() {
  }

  get url() {
    return this._url;
  }

  set url(value) {
    this._url = value;
    this.dataView.updateUrl();
  }

  get explorer() {
    return this.leftTopTabView.getCurrentTab().getView();
  }

  get dir() {
    return this.explorer ? this.explorer.tree.getSelectionModel().getLastData() : null;
  }

  get file() {
    return this.explorer ? this.explorer.getFileListView().getSelectionModel().getLastData() : null;
  }

  get ld() {
    return this.sm.ld();
  }

  get sm() {
    return this.dm.sm();
  }

  get editInteractor() {
    return this.gv.getEditInteractor()
  }

  get pointsEditingMode() {
    return this.editInteractor.pointsEditingMode;
  }

  set pointsEditingMode(value) {
    this.editInteractor.pointsEditingMode = value;
  }

  get anchorVisible() {
    return this.editInteractor.getStyle("anchorVisible");
  }

  set anchorVisible(value) {
    this.editInteractor.setStyle("anchorVisible", value);
  }

  get sceneInspector() {
    this._sceneInspector || (this._sceneInspector = new SceneInspector(this));
    return this._sceneInspector;
  }

  get dataInspector() {
    this._dataInspector || (this._dataInspector = new DataInspector(this));
    return this._dataInspector;
  }

  get cubeInspector() {
    this._cubeInspector || (this._cubeInspector = new CubeInspector(this));
    return this._cubeInspector;
  }

  get coneInspector() {
    this._coneInspector || (this._coneInspector = new ConeInspector(this));
    return this._coneInspector;
  }

  get cylinderInspector() {
    this._cylinderInspector || (this._cylinderInspector = new CylinderInspector(this));
    return this._cylinderInspector;
  }

  get roundRectInspector() {
    this._roundRectInspector || (this._roundRectInspector = new RoundRectInspector(this));
    return this._roundRectInspector;
  }

  get sphereInspector() {
    this._sphereInspector || (this._sphereInspector = new SphereInspector(this));
    return this._sphereInspector;
  }

  get torusInspector() {
    this._torusInspector || (this._torusInspector = new TorusInspector(this));
    return this._torusInspector;
  }

  get triangleInspector() {
    this._triangleInspector || (this._triangleInspector = new TriangleInspector(this));
    return this._triangleInspector;
  }

  get modelInspector() {
    this._modelInspector || (this._modelInspector = new ModelInspector(this));
    return this._modelInspector;
  }

  get billboardInspector() {
    this._billboardInspector || (this._billboardInspector = new BillboardInspector(this));
    return this._billboardInspector;
  }

  get wallInspector() {
    this._wallInspector || (this._wallInspector = new WallInspector(this));
    return this._wallInspector;
  }

  get floorInspector() {
    this._floorInspector || (this._floorInspector = new FloorInspector(this));
    return this._floorInspector;
  }

  get pipelineInspector() {
    this._pipelineInspector || (this._pipelineInspector = new PipelineInspector(this));
    return this._pipelineInspector;
  }

  get polylineInspector() {
    this._polylineInspector || (this._polylineInspector = new PolylineInspector(this));
    return this._polylineInspector;
  }

  get edgeInspector() {
    return this._edgeInspector || (this._edgeInspector = new EdgeInspector(this)), this._edgeInspector;
  }

  get blockInspector() {
    return this._blockInspector || (this._blockInspector = new BlockInspector(this)), this._blockInspector;
  }
}
