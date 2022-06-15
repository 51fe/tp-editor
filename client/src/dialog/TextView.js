import config from "../config.js";
import { getString } from "../util/index.js";
import { createCodeEditor } from "../util/CodeEditor.js";
import FormPane from "../pane/FormPane.js";
import Dialog from "./index.js";

export default class TextView extends Dialog {
  constructor(editor) {
    super()
    this.editor = editor;
    this.formPane = new FormPane;
    this.formPane.addRow([{
      id: "text",
      element: createCodeEditor({
        value: "",
        language: "text",
        minimap: { enabled: false }
      })
    }], [.1], .1);
    const btns = [];
    btns.push({
      label: getString("editor.ok"), action: () => {
        this.ok();
      }
    });
    btns.push({
      label: getString("editor.cancel"), action: () => {
        this.hide();
      }
    });
    this.setConfig({
      closable: true,
      draggable: true,
      width: config.textViewSize.width,
      height: config.textViewSize.height,
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
    this?.setValue(this.formPane.v("text").replace(/\r/g, ""));
    this.hide();
  }

  open(text, setValue, title) {
    this.setValue = setValue;
    this.setTitle(title);
    this.formPane.v("text", text || "");
    this.show(this.editor.root);
  }
}
