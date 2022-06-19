import {
  FILE_TYPE_ASSET, FILE_TYPE_COMPONENT, FILE_TYPE_DIR, FILE_TYPE_DISPLAY, FILE_TYPE_MODEL,
  FILE_TYPE_ROOT, FILE_TYPE_SCENE, FILE_TYPE_SYMBOL, FILE_TYPE_UNKNOWN, FILE_TYPE_UI, FILE_LAYOUT_LIST
} from "./constants.js";
import config from "./config.js";
import { initConsts, initCustomProperties, initValueTypes, toJson, toNode } from "./util/editor.js";
import { createAlert, getInput } from "./util/DialogHelper.js";
import {
  createButton, createItem, createLabel,
  fileNameToDisplayName, getDataBindingMap, getString, getter, initContext,
  initImageIcon, initInputDND, isAsset, isComponent, isDisplay, isImage,
  isJSON, isModel, isMTL, isOBJ, isScene, isSymbol, isUI,
  jsonToPNG, layoutMainView, msClass, parseFunction, readLocalFile, removeCache,
  removeItem, setter, snapshot, stringifyFunction, trimExtension
} from "./util/index.js";
import CodeEditor from "./util/CodeEditor.js";
import { createCodeEditor } from "./util/CodeEditor.js";
import { getInstance } from "./util/Instances.js";
import DNDFromOutside from "./util/DNDFromOutside.js";
import DND from "./util/DND.js";
import WebSocketService from "./util/WebSocketService.js";
import HTTPService from "./util/HTTPService.js";
import Image from "./type/Image.js";

import Dialog from "./dialog/index.js";
import ComponentView from "./dialog/ComponentView.js";
import EventView from "./dialog/EventView.js";
import FontView from "./dialog/FontView.js";
import FunctionView from "./dialog/FunctionView.js";
import ObjectView from "./dialog/ObjectView.js";

import ContextMenu from "./menu/ContextMenu.js";
import MainMenu from "./menu/MainMenu.js";
import MainToolbar from "./toolbar/MainToolbar.js";
import RightToolbar from "./toolbar/RightToolbar.js";
import CreateNodeInteractor from "./interactor/CreateNodeInteractor.js";
import CreateEdgeInteractor from "./interactor/CreateEdgeInteractor.js";
import CreateShapeInteractor from "./interactor/CreateShapeInteractor.js";

import TablePane from "./pane/TablePane.js";
import FormPane from "./pane/FormPane.js";
import DataView from "./pane/DataView.js";
import InspectorPane from "./pane/InspectorPane.js";
import InspectorTool from "./pane/InspectorTool.js";

import SplitView from "./view/SplitView.js";
import DisplayGraphView from "./view/DisplayGraphView.js";
import EditGraphView from "./view/EditGraphView.js";
import DNDTree from "./view/DNDTree.js";
import FileTree from "./view/FileTree.js";
import DisplayTree from "./view/DisplayTree.js";
import FileList from "./view/FileList.js";
import Displays from "./view/Displays.js";
import Symbols from "./view/Symbols.js"
import Components from "./view/Components.js"
import Assets from "./view/Assets.js"
import Scenes from "./view/Scenes.js"
import Models from "./view/Models.js"
import Explorer from "./view/Explorer.js";
import MessageView from "./view/MessageView.js";
import MainTabView from "./view/MainTabView.js";
import EditView from "./view/EditView.js";
import DisplayView from "./view/DisplayView.js";
import SymbolView from "./view/SymbolView.js";
import DNDIndexList from "./view/DNDIndexList.js";
import SymbolList from "./view/SymbolList.js";

import Inspector from "./inspector/index.js";
import SymbolInspector from "./inspector/SymbolInspector.js";
import DisplayInspector from "./inspector/DisplayInspector.js";
import HTBlockInspector from "./inspector/HTBlockInspector.js";
import HTDataInspector from "./inspector/HTDataInspector.js";
import HTNodeInspector from "./inspector/HTNodeInspector.js";
import HTGroupInspector from "./inspector/HTGroupInspector.js";
import HTEdgeInspector from "./inspector/HTEdgeInspector.js";
import HTShapeInspector from "./inspector/HTShapeInspector.js";
import HTTextInspector from "./inspector/HTTextInspector.js";
import HTRefGraphInspector from "./inspector/HTRefGraphInspector.js";
import Editor from "./Editor.js";

"use strict";
const tpeditor = {
  strings: {},
  customStrings: {},
  config,
  version: "1.0.0",
  FILE_TYPE_UNKNOWN,
  FILE_TYPE_ROOT,
  FILE_TYPE_DIR,
  FILE_TYPE_ASSET,
  FILE_TYPE_SYMBOL,
  FILE_TYPE_DISPLAY,
  FILE_TYPE_COMPONENT,
  FILE_TYPE_MODEL,
  FILE_TYPE_UI,
  FILE_TYPE_SCENE,
  FILE_LAYOUT_LIST,
  MESSAGE_TYPE_NORMAL: "normal",
  MESSAGE_TYPE_ERROR: "error",
  DIRECTORY_TYPE_NORMAL: 1,
  DIRECTORY_TYPE_PROJECT: 2,
  DIRECTORY_TYPE_ROOT: 3,
  DIRECTORY_TYPE_SYSTEM: 4,
  getString,
  stringifyFunction,
  parseFunction,
  createLabel,
  createButton,
  createItem,
  layoutMainView,
  msClass,
  initContext,
  getInput,
  trimExtension,
  fileNameToDisplayName,
  isJSON,
  isOBJ,
  isDisplay,
  isScene,
  isSymbol,
  isAsset,
  isComponent,
  isUI,
  isImage,
  isModel,
  isMTL,
  getter,
  setter,
  snapshot,
  removeItem,
  createAlert,
  createCodeEditor,
  initImageIcon,
  initInputDND,
  jsonToPNG,
  getDataBindingMap,
  readLocalFile,
  removeCache,
  Editor,
  CodeEditor,
  ContextMenu,
  Dialog,
  DataView,
  EventView,
  SplitView,
  FormPane,
  TablePane,
  DND,
  DNDFromOutside,
  DNDTree,
  DNDIndexList,
  EditGraphView,
  DisplayGraphView,
  SymbolList,
  FileTree,
  FileList,
  DisplayTree,
  DisplayView,
  MainTabView,
  MainToolbar,
  MainMenu,
  MessageView,
  ObjectView,
  EditView,
  FontView,
  FunctionView,
  ComponentView,
  SymbolView,
  RightToolbar,
  InspectorTool,
  Inspector,
  HTBlockInspector,
  HTDataInspector,
  HTNodeInspector,
  HTGroupInspector,
  HTEdgeInspector,
  HTShapeInspector,
  HTTextInspector,
  HTRefGraphInspector,
  DisplayInspector,
  SymbolInspector,
  InspectorPane,
  Explorer,
  Scenes,
  Models,
  Assets,
  Components,
  Displays,
  Symbols,
  WebSocketService,
  HTTPService,
  CreateNodeInteractor,
  CreateEdgeInteractor,
  CreateShapeInteractor,
  symbol: { Image },

  toDatas: (items, popup) => {
    const datas = [];
    items.forEach(function (item) {
      const instance = getInstance(item);
      if (instance) {
        const json = toJson(instance),
          data = toNode(json, popup);
        data && datas.push(data)
      }
    });
    return datas;
  },

  createEditor: (parentDOM = {}) => {
    if (parentDOM) {
      if (ht.Default.isString(parentDOM)) {
        parentDOM = { container: parentDOM }
      } else {
        parentDOM.tagName && parentDOM.appendChild && (parentDOM = { container: parentDOM })
      }
    }
    let div = undefined,
      container = parentDOM.container;
    if (parentDOM.container === undefined) {
      container = parentDOM.container;
    }
    if (container === null) {
      div = null;
    } else if (container) {
      if (ht.Default.isString(container)) {
        div = document.getElementById(container)
      } else if (container.length) {
        div = ht.Default.createDiv();
        div.style.left = container[0] + "px";
        div.style.top = container[1] + "px";
        div.style.width = container[2] + "px";
        div.style.height = container[3] + "px";
        document.body.appendChild(div);
      } else {
        div = container;
      }
    } else {
      div = document.body;
    }
    parentDOM.body = div;
    return new Editor(parentDOM)
  },

  init: () => {
    if (!tpeditor.consts) {
      let maxIndent = getString("MAX_INDENT_TEST_STRING", true);
      if (maxIndent) {
        config.indent = ht.Default.getTextSize(undefined, maxIndent).width;
      }
      maxIndent = getString("MAX_INDENT2_TEST_STRING", true);
      if (maxIndent) {
        config.indent2 = ht.Default.getTextSize(undefined, maxIndent).width;
      }
      initConsts();
      initValueTypes();
      initCustomProperties();
      config.initStudio && config.initStudio();
    }
  }
}

if (!window.onbeforeunload && config.promptBeforeClosing) {
  window.onbeforeunload = function (e) {
    e.returnValue = getString("editor.closetip")
    return e.returnValue;
  }
}

window.tpeditor = tpeditor;
export default tpeditor;
