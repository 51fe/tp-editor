import {
  isJSON, isObject, isString, isAudio, isDXF, isImage,
  isMTL, isOBJ, isOTF, isVideo, jsonToPNG, trimExtension, isTTF, isJS,
} from "../util/index.js";
import { FILE_TYPE_ASSET, FILE_TYPE_COMPONENT, FILE_TYPE_DIR, FILE_TYPE_DISPLAY, FILE_TYPE_MODEL, FILE_TYPE_ROOT, FILE_TYPE_SCENE, FILE_TYPE_SYMBOL, FILE_TYPE_UI, FILE_TYPE_UNKNOWN } from "../constants.js";

export default class FileNode extends ht.Node {
  constructor(rootDir, path, name, value) {
    super();
    this.setSize(20, 20);
    this.setAnchor(.5, .5);
    this._id = this.url = path ? path + "/" + name : name;
    this.path = path;
    this.value = value;
    this.rootDir = rootDir;
    if (isObject(value) && isString(value.fileType) && null != value.uuid) {
      this.uuid = value.uuid;
    } else {
      this.uuid = this.url;
    }
    this.postfix = value?.postfix ?? "";
    let fileType = FILE_TYPE_UNKNOWN,
      icon = undefined,
      img = undefined,
      url = this.url,
      _label = name;
    if (value?.uuid && this.postfix) {
      url = this.uuid + "." + this.postfix;
    }
    if (value?.attrs?.label) {
      this.label = _label = value.attrs.label;
    }
    this.s({
      "select.width": 0,
      pixelPerfect: false,
      "image.stretch": "centerUniform",
      "label.position": 17
    });
    if (path === "") {
      fileType = FILE_TYPE_ROOT;
      img = "editor.root.state";
    } else if (rootDir === "assets") {
      img = this.getFileImage(name);
      if (img) {
        fileType = FILE_TYPE_ASSET;
        this.s("label", _label);
      }
    } else if (isJSON(name) && rootDir === "displays") {
      fileType = FILE_TYPE_DISPLAY;
      img = jsonToPNG(url);
      this.s("label", trimExtension(name));
    } else if (isJSON(name) && rootDir === "symbols") {
      fileType = FILE_TYPE_SYMBOL;
      img = jsonToPNG(url);
      this.s("label", trimExtension(name));
    } else if (isJSON(name) && rootDir === "components") {
      fileType = FILE_TYPE_COMPONENT;
      img = jsonToPNG(url);
      this.s("label", trimExtension(name));
    } else if (isJSON(name) && rootDir === "scenes") {
      fileType = FILE_TYPE_SCENE;
      img = jsonToPNG(url);
      this.s("label", trimExtension(name));
    } else if (isJSON(name) && rootDir === "models") {
      fileType = FILE_TYPE_MODEL;
      img = jsonToPNG(url);
      this.s("label", trimExtension(name));
    } else if (isJSON(name) && rootDir === "uis") {
      fileType = FILE_TYPE_UI;
      img = jsonToPNG(url);
      this.s("label", trimExtension(name));
    } else {
      this.s("label", _label);
    }
    if (isObject(value)) {
      if (isString(value.fileType)) {
        fileType = value.fileType;
        icon = value.fileIcon;
        img = value.fileImage || img || icon;
        img || value.fileType !== FILE_TYPE_DIR || (img = "editor.dir");
        this.a(value.attrs);
        this.s(value.styles);
      } else if (value.dir || value.dir === undefined && value.fileType === undefined) {
        fileType = FILE_TYPE_DIR;
        img = "editor.dir";
      }
    }
    if (!img) {
      img = "editor.unknown";
    }
    this.fileType = fileType;
    this.setIcon(icon);
    this.setImage(img);
    this.setName(name);
  }

  getFileUUID() {
    if (this.postfix) {
      return this.uuid + "." + this.postfix;
    }
    return this.uuid;
  }

  getFileImage(data) {
    if (isImage(data)) {
      return this.url;
    } else if (isDXF(data)) {
      return "editor.dxf.state";
    } else if (isOBJ(data)) {
      return "editor.obj.state";
    } else if (isMTL(data)) {
      return "editor.mtl.state";
    } else if (isTTF(data)) {
      return "editor.ttf.state";
    } else if (isOTF(data)) {
      return "editor.otf.state";
    } else if (isAudio(data)) {
      return "editor.sound.state";
    } else if (isVideo(data)) {
      return "editor.video.state";
    } else if (isJS(data)) {
      return "editor.js.state";
    }
    return undefined;
  }

  setAnchor(...rest) {
    return super.setAnchor(rest);
  }
}