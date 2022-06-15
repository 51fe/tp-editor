import { getString } from "../util/index.js";
import Dialog from "./index.js";

export default class ConfirmView extends Dialog {
  constructor(editor) {
    super()
    this.editor = editor;
  }

  init() {
    const content = this.contentDiv = ht.Default.createDiv();
    content.style.lineHeight = "28px";
    content.style.textAlign = "center";
    content.style.fontSize = "14px";
    content.style.color = ht.Default.labelColor;
    this.setConfig({
      closable: true,
      draggable: true,
      width: 320,
      height: 120,
      content,
      buttons: [{
        label: getString("editor.yes"),
        action: () => {
          this.onYes?.();
          this.hide();
        }
      }, {
        label: getString("editor.no"),
        action: () => {
          this.onNo?.();
          this.hide();
        }
      }, {
        label: getString("editor.cancel"),
        action: () => {
          this.hide();
        }
      }]
    });
    this._init = true;
  }

  show(title = getString("editor.tooltip"), content = "", onYes, onNo) {
    this._init || this.init();
    this.setTitle(title);
    this.contentDiv.innerHTML = content;
    this.onYes = onYes;
    this.onNo = onNo;
    super.show(this, this.editor.root);
  }
}