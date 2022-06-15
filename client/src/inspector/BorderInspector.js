import { getString } from "../util/index.js";
import BaseInspector from "./BaseInspector.js";

export default class BorderInspector extends BaseInspector {
  constructor(editor, name) {
    super(editor, name);
  }

  initForm() {
    super.initForm();
    this.addTitle("TitleBorder");
    this.addStyleInput(getString("editor.width"), "border_width", "number", 1, "border");
    this.addStyleColor(getString("editor.color"), "border_color", "color");
  }
}
