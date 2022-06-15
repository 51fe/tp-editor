import config from "../config.js";
import { getString, stringifyFunction, toFunction } from "../util/index.js";
import { createCodeEditor } from "../util/CodeEditor.js";
import Dialog from "./index.js";
import FormPane from "../pane/FormPane.js";

export default class ObjectView extends Dialog {
  constructor(editor) {
    super()
    this.editor = editor;
    this.formPane = new FormPane;
    this.formPane.addRow([{
      id: "object",
      element: createCodeEditor()
    }], [.1], .1);
    var btns = [];
    btns.push({
      label: getString("editor.ok"), action: () => {
        this.ok()
      }
    });
    btns.push({
      label: getString("editor.cancel"), action: () => {
        this.hide()
      }
    });
    this.setConfig({
      title: getString("editor.object"),
      closable: true,
      draggable: true,
      width: config.objectViewSize.width,
      height: config.objectViewSize.height,
      contentPadding: 6,
      resizeMode: "wh",
      maximizable: true,
      content: this.formPane,
      buttons: btns,
      buttonsAlign: "right"
    });
    this.setModal(false);
  }

  cancel() {
    this.hide();
  }

  save() {
    this.ok();
  }

  ok() {
    this?.setValue(toFunction(this.formPane.v("object")));
    this.hide();
  }

  open(extraInfo, setValue, title) {
    this.setValue = setValue;
    this.setTitle(title);
    extraInfo = this.stringify(extraInfo);
    if (extraInfo) {
      this._funcMap;
      for (let key in this._funcMap) {
        extraInfo = extraInfo.replace('"' + key + '"', stringifyFunction(this._funcMap[key]))
      }
    }
    this.formPane.v("object", extraInfo);
    this.show(this.editor.root)
  }

  stringify(value, space) {
    const fun = Date.prototype.toJSON;
    Date.prototype.toJSON = () => {
      return "__ht__date" + this.getTime()
    };
    this._funcMap = {};
    const str = JSON.stringify(value, (space, replacer) => {
      if (typeof replacer === "function") {
        const key = Math.random().toString().substring(3, 16) + Date.now();
        this._funcMap[key] = replacer;
        return key;
      }
      return replacer;
    }, space === undefined ? 2 : space);
    Date.prototype.toJSON = fun;
    return str;
  }
}
