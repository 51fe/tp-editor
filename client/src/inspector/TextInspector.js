import { getString } from "../util/index.js";
import BaseInspector from "./BaseInspector.js";

export default class TextInspector extends BaseInspector {
  constructor(editor, name) {
    super(editor, name)
  }

  initForm() {
    super.initForm();
    this.addTitle("TitleText");
    this.addStyleLabel(getString("editor.text"), "text", "text");
    this.addStyleAlign(getString("editor.align"), "text.align", "align");
    this.addStyleVAlign(getString("editor.valign"), "text.vAlign", "vAlign");
    this.addStyleColor(getString("editor.color"), "text.color", "color");
    this.addStyleFont(getString("editor.font"), "text.font", "font")
  }

  addShadowProperties () {
    this.addTitle("TitleShadow");
    this.addStyleCheckBox(getString("editor.shadow"), "text.shadow", "shadow");
    this.addStyleColor(getString("editor.shadowcolor"), "text.shadow.color", "shadowColor");
    this.addStyleInput(getString("editor.shadowblur"), "text.shadow.blur", "number", 1, "shadowblur");
    this.addStyleInput(getString("editor.shadowoffsetx"), "text.shadow.offset.x", "number", 1, "shadowOffsetX");
    this.addStyleInput(getString("editor.shadowoffsety"), "text.shadow.offset.y", "number", 1, "shadowOffsetYs")
  }
}
