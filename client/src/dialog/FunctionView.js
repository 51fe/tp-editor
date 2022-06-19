import config from "../config.js";
import { getString, parseFunction, stringifyFunction } from "../util/index.js";
import { createCodeEditor } from "../util/CodeEditor.js";
import FormPane from "../pane/FormPane.js";
import Dialog from "./index.js";

export default class FunctionView extends Dialog {
  constructor(editor) {
    super()
    this.editor = editor;
    this.formPane = new FormPane;
    let raws = this.raws = [],
      mains = this.formPane.addRow([{ id: "head", element: "function() {" }], [.1]);
    raws.push(mains);
    mains = this.formPane.addRow([{
      id: "function",
      element: createCodeEditor()
    }], [.1], .1);
    raws.push(mains);
    mains = this.formPane.addRow(["}"], [.1]), raws.push(mains);
    const btns = [];
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
      title: getString("editor.function"),
      closable: true,
      draggable: true,
      width: config.functionViewSize.width,
      height: config.functionViewSize.height,
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
    this.hide()
  }

  save() {
    this.ok()
  }

  parse(str) {
    if (str) {
      const head = this.parseFunctionHead();
      str = str.trim();
      if (head) {
        str = "" + head + str + "}";
      } else if (!str.startsWith("function")) {
        str = "function() {\n" + str + "\n}";
      }
      return parseFunction(str);
    }
  }

  ok() {
    this?.setValue(this.parse(this.formPane.v("function")));
    this.hide();
  }

  setFormRows() {
    const formPane = this.formPane,
      raws = this.raws,
      args = this._argList;
    this._argList ? formPane._rows = raws : formPane._rows = [raws[1]];
    formPane.iv();
    args && formPane.v("head", this.parseFunctionHead());
  }

  parseFunctionHead() {
    const args = this._argList;
    if (args) return "function(" + (Array.isArray(args) ? args.join(", ") : args) + ") {"
  }

  stringifyFunction(json) {
    let str = stringifyFunction(json);
    if (this._argList) {
      const index = str.indexOf("{"),
        end = str.lastIndexOf("}");
      str = str.substring(index + 1, end);
    }
    return str;
  }

  open(extraInfo, setValue, title, args) {
    this.setValue = setValue;
    this._argList = args;
    this.setTitle(title);
    this.setFormRows();
    this.formPane.v("function", this.stringifyFunction(extraInfo));
    this.show(this.editor.root)
  }
}
