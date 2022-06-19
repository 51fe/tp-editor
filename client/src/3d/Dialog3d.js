import { getString, isMTL, isOBJ, isObject, isString } from "../util";
import config from "./config3d";

export default class Dialog3d extends ht.widget.Dialog {
  constructor(editor) {
    super()
    this.editor = editor;
    const buttons = [];
    buttons.push({
      label: getString("editor.save"),
      action: () => {
        this.ok();
      }
    });
    buttons.push({
      label: getString("editor.save.import"),
      action: () => {
        this.ok(true);
      }
    });
    buttons.push({
      label: getString("editor.cancel"),
      action: () => {
        this.hide();
      }
    });
    this.dm = new ht.DataModel;
    this.node = new ht.Node;
    this.node.s({
      "wf.visible": "selected",
      "select.brightness": 1
    });
    this.node.setAnchor3d(.5, 0, .5);
    this.dm.add(this.node);
    this.g3d = new ht.graph3d.Graph3dView(this.dm);
    this.formPane = this.createFromPane();
    this.splitView = new ht.widget.SplitView(this.g3d, this.formPane, "h", .55);
    this.setConfig({
      title: getString("editor.objsetting"),
      closable: true,
      draggable: true,
      width: 666,
      height: 500,
      contentPadding: 0,
      resizeMode: "wh",
      maximizable: true,
      content: this.splitView,
      buttons,
      buttonsAlign: "right"
    });
    this.setModal(false);
    editor.addEventListener(e => {
      if ("fileChanged" === e.type) {
        const path = e.params.path,
          g3d = this.g3d;
        g3d.getTextureMap()[path] && g3d.deleteTexture(path);
        document.body.contains(g3d.getView()) && g3d.invalidateAll();
      }
    });
  }

  toJSON() {
    const json = { modelType: "obj" },
      obj = json.obj = this.formPane.v("obj");
    if (!obj || !isOBJ(obj)) return void this.showError("obj");
    const mtl = json.mtl = this.formPane.v("mtl");
    if (mtl && !isMTL(mtl)) {
      this.showError("mtl");
      return false;
    } else {
      json.image = this.formPane.v("imageURL");
      json.prefix = this.formPane.v("prefix");
      json.center = this.formPane.v("center");
      this.formPane.v("reverseFlipMtls") && (json.reverseFlipMtls = "*");
      json.ignoreImage = !!this.formPane.v("ignoreImage");
      json.ignoreColor = !!this.formPane.v("ignoreColor");
      json.s3 = [
        Number(this.formPane.v("sX")),
        Number(this.formPane.v("sY")),
        Number(this.formPane.v("sZ"))
      ];
      json.r3 = [
        Number(this.formPane.v("rX")),
        Number(this.formPane.v("rY")),
        Number(this.formPane.v("rZ"))
      ];
      json.image || delete json.image;
      json.prefix || delete json.prefix;
      json.center && delete json.center;
      json.ignoreImage || delete json.ignoreImage;
      json.ignoreColor || delete json.ignoreColor;
      "1,1,1" === json.s3.toString() && delete json.s3;
      "0,0,0" === json.r3.toString() && delete json.r3;
      return json;
    }
  }

  ok(callback) {
    let json = this.toJSON();
    if (json) {
      let url = this.formPane.v("url");
      if (!url) {
        return false;
      }
      this.showError("name");
      url = this.editor.models.currentDir + "/" + url + ".json";
      this.json = json;
      const param = { path: url, content: ht.Default.stringify(this.json) };
      this.editor.request("upload", param, () => {
        if (this.editor.saveImage(this.g3d, url.substr(0, url.length - 5) + ".png", () => {
          this.hide();
        }), callback) {
          const node = new ht.Node;
          node.s("shape3d", url);
          node.setAnchor3d([.5, 0, .5]);
          this.editor.dm.add(node);
          this.editor.sm.ss(node);
        }
        const node = this.node,
          value = node.s("shape3d");
        value && ht.Default.setShape3dModel(value.uuid, undefined);
        node.s("shape3d", "box")
      })
    }
  }

  open(url, json) {
    if (!this.isShowing()) {
      this.show();
      this.__oldHandleModelLoadedFunc__ = ht.Default.handleModelLoaded;
      ht.Default.handleModelLoaded = (name, model) => {
        let value = this.node.s("shape3d");
        isObject(value) && (value = value.uuid);
        name === value && this.updateScene(model);
      }
    }
    this.url = url;
    this.json = json;
    this.node.s("shape3d", url);
    this.node.p3(0, 0, 0);
    this.g3d.reset();
    this.update();
  }

  hide() {
    super.hide();
    ht.Default.handleModelLoaded = this.__oldHandleModelLoadedFunc__;
    this.__oldHandleModelLoadedFunc__ = null;
  }

  update() {
    let json = this.json;
    if (this.url) {
      const ld = this.editor.models.ld,
        label = ld.s("label");
      this.formPane.getViewById("url").setEditable(false), this.formPane.v("url", label);
      const model = ht.Default.getShape3dModel(this.url);
      if (model) {
        this.updateScene(model);
        json = this.json = ht.Default.parse(ht.Default.stringify(model.json));
      }
    } else {
      this.formPane.getViewById("url").setEditable(true);
      this.formPane.v("url", "");
    }
    if (!json) {
      json = {};
    }
    this.formPane.v("obj", json.obj || "");
    this.formPane.v("mtl", json.mtl || "");
    this.formPane.v("imageURL", json.image || "");
    this.formPane.v("prefix", json.prefix || "");
    this.formPane.v("reverseFlipMtls", !!json.reverseFlipMtls);
    this.formPane.v("center", undefined == json.center);
    this.formPane.v("ignoreImage", !!json.ignoreImage);
    this.formPane.v("ignoreColor", !!json.ignoreColor);
    const s3 = json.s3 || [1, 1, 1];
    this.formPane.v("sX", s3[0]);
    this.formPane.v("sY", s3[1]);
    this.formPane.v("sZ", s3[2]);
    const r3 = json.r3 || [0, 0, 0];
    this.formPane.v("rX", r3[0]);
    this.formPane.v("rY", r3[1]);
    this.formPane.v("rZ", r3[2]);
    this.formPane.getItemById("image").element.setIcon(json.image);
  }

  createFromPane() {
    const pane = new ht.widget.FormPane;
    pane.addRow([{ element: getString("editor.name") }, {
      id: "url",
      textField: {}
    }], [60, .1]);
    pane.addRow([{ element: "obj" }, {
      id: "obj",
      textField: {
        handleChange: e => {
          if (!e) {
            this.resetModel();
            this.clearInput();
            return undefined;
          }
          this.autoFillInput("obj", e) && this.updateModel();
        }
      }
    }, {
      image: {
        icon: "editor.obj",
        onClicked: () => {
          this.editor.selectFileNode(pane.v("obj"));
        }
      }
    }], [60, .1, 20]);
    let view = pane.getViewById("obj");
    this.handleDragAndDrop(view, (info, e) => {
      return !!e.view.draggingData && isOBJ(e.view.draggingData.getFileUUID());
    });
    pane.addRow([{ element: "mtl" }, {
      id: "mtl", textField: {
        handleChange: e => {
          e && !this.autoFillInput("mtl", e) || this.updateModel();
        }
      }
    }, {
      image: {
        icon: "editor.mtl",
        onClicked: () => {
          this.editor.selectFileNode(pane.v("mtl"));
        }
      }
    }], [60, .1, 20]);
    view = pane.getViewById("mtl");
    this.handleDragAndDrop(view, (info, e) => {
      return !!e.view.draggingData && isMTL(e.view.draggingData.getFileUUID())
    });
    pane.addRow([{ element: getString("editor.imageprefix") }, {
      id: "prefix", textField: {
        handleChange: () => {
          this.updateModel();
        }
      }
    }], [60, .1]);
    this.handleBlurAndKeydown(pane.getViewById("prefix").getElement(), () => {
      this.updateModel();
    });
    pane.addRow([{ element: getString("editor.reverseFlipMtls") }, {
      id: "reverseFlipMtls",
      checkBox: {
        onClicked: () => {
          this.updateModel();
        }
      }
    }, { element: getString("editor.modelcenter"), align: "right" }, {
      id: "center", checkBox: {
        onClicked: () => {
          this.updateModel();
        }
      }
    }], [60, .1, 60, .1]);
    pane.addRow([{ element: getString("editor.modelignoreImage") }, {
      id: "ignoreImage",
      checkBox: {
        onClicked: () => {
          this.updateModel();
        }
      }
    }, { element: getString("editor.modelignoreColor"), align: "right" }, {
      id: "ignoreColor",
      checkBox: {
        onClicked: () => {
          this.updateModel();
        }
      }
    }], [60, .1, 60, .1]);
    pane.addRow([], [.1], 1.01, { background: "#E4E4E4" });
    pane.addRow([null, "X", "Y", "Z"], [60, .1, .1, .1]);
    pane.addRow([getString("editor.scale"), {
      id: "sX",
      textField: { type: "number" }
    }, {
      id: "sY",
      textField: { type: "number" }
    }, {
      id: "sZ",
      textField: { type: "number" }
    }
    ], [60, .1, .1, .1]);
    const numberPrecision = config.numberPrecision,
      rotation = numberPrecision.rotation || 0;
    pane.addRow([getString("editor.rotation"), {
      id: "rX",
      textField: {
        getValue: function () {
          return Number(this.getText()) / 180 * Math.PI
        },
        setValue: function (value) {
          this.setText((value / Math.PI * 180).toFixed(rotation));
        },
        type: "number"
      }
    }, {
      id: "rY",
      textField: {
        getValue: function () {
          return Number(this.getText()) / 180 * Math.PI;
        },
        setValue: function (value) {
          this.setText((value / Math.PI * 180).toFixed(rotation));
        },
        type: "number"
      }
    }, {
      id: "rZ",
      textField: {
        getValue: function () {
          return Number(this.getText()) / 180 * Math.PI;
        },
        setValue: function (value) {
          this.setText((value / Math.PI * 180).toFixed(rotation));
        },
        type: "number"
      }
    }], [60, .1, .1, .1]);
    ["s", "r"].forEach(i => {
      ["X", "Y", "Z"].forEach(j => {
        const el = pane.getViewById(i + j).getElement();
        el.onblur = () => {
          return this.updateModel()
        }, el.onkeydown = function (e) {
          ht.Default.isEnter(e) && this.updateModel();
        }
      })
    });
    pane.addRow([], [.1], 1.01, { background: "#E4E4E4" });
    pane.addRow([{ element: getString("editor.image") }, {
      id: "imageURL",
      textField: {}
    }], [60, .1]);
    pane.addRow([{
      id: "image",
      image: {}
    }], [.1], 70);
    this.handleBlurAndKeydown(pane.getViewById("imageURL").getElement(), e => {
      this.formPane.getItemById("image").element.setIcon(e);
    });
    return pane;
  }

  updateModel() {
    const json = this.toJSON();
    if (json) {
      json.center === undefined && (json.center = true);
      this.setModel(json);
    }
  }

  handleDragAndDrop(info, isDroppable) {
    function clear() {
      el.style.border = border;
      border = null;
    }

    const el = info.getElement();
    info.isDroppable = isDroppable;
    let border = undefined;
    info.handleCrossDrag = (e, state, _) => {
      if ("enter" === state) {
        border = el.style.border;
        el.style.border = "solid " + config.color_select_dark + " 2px";
      } else if (["exit", "cancel"].includes(state)) {
        clear();
      } else if (state === "over") {
        return;
      } else if (state === "drop") {
        const oldValue = el.value;
        el.value = _.view.draggingData.getFileUUID();
        clear();
        info.setFocus();
        info.handleChange(el.value, oldValue)
      }
    };
    this.handleBlurAndKeydown(el, function (e) {
      info.handleChange(e);
    })
  }

  handleBlurAndKeydown(el, callback) {
    el.onblur = function () {
      callback(el.value);
    };
    el.onkeydown = function (e) {
      ht.Default.isEnter(e) && callback(el.value);
    }
  }

  autoFillInput(type, e) {
    if (!this.__error__) {
      if (e.length <= 4) {
        this.showError(type);
        return false;
      }
      const formPane = this.formPane,
        length = e.length,
        index = e.lastIndexOf("/") + 1,
        path = e.substr(0, length - 4).substr(index),
        url = formPane.v("url"),
        obj = formPane.v("obj"),
        mtl = formPane.v("mtl"),
        prefix = formPane.v("prefix");
      if (!url) {
        formPane.v("url", path);
      }
      if (type === "obj") {
        mtl || formPane.v("mtl", e.substr(0, length - 3) + "mtl");
      } else if (type === "mtl") {
        obj || formPane.v("obj", e.substr(0, length - 3) + "obj");
      }
      if (!prefix) {
        formPane.v("prefix", e.substr(0, index));
      }
      return true;
    }
  }

  showError(type) {
    if (!this.__error__) {
      let title = undefined;
      if (type === "name") {
        title = getString("editor.error.name");
      } else if (["obj", "mtl"].includes(type)) {
        title = getString("editor.error." + type + ".file");
      }
      this.__error__ = true;
      tpeditor.alert(getString("editor.error.title"), title, function () {
        ht.Default.callLater(function () {
          return this.__error__ = false;
        })
      })
    }
  }

  resetModel() {
    this.setModel("box");
  }

  setModel(value) {
    const json = isString(value) ? value : JSON.stringify(value);
    if (this._currentJSON !== json) {
      const node = this.node,
        shape3d = node.s("shape3d");
      if (shape3d && isObject(shape3d)) {
        ht.Default.setShape3dModel(shape3d.uuid, undefined);
      }
      node.s("shape3d", value);
      this._currentJSON = json;
    }
  }

  clearInput() {
    const pane = this.formPane;
    pane.v("obj", "");
    pane.v("mtl", "");
    pane.v("prefix", "");
    if (pane.getViewById("url").isEditable()) {
      pane.v("url", "");
    }
  }

  updateScene(info) {
    if (info && info.rawS3) {
      const g3d = this.g3d,
        x = info.rawS3[0],
        y = info.rawS3[1],
        z = info.rawS3[2],
        max = Math.max(y, x / (g3d.getAspect() || 1));
      let fovy = max / 2 / Math.tan(g3d.getFovy() / 2);
      fovy = 2 * Math.max(z / 2, fovy);
      g3d.setEye(0, y / 2, fovy);
      g3d.setCenter(0, y / 2, 0);
      g3d.setNear(Math.min(10, fovy / 4));
      g3d.setFar(Math.max(10000, 4 * fovy));
    }
  }
}
