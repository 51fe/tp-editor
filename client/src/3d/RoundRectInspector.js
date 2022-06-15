import { getString } from "../util";
import Shape3dInspector from "./Shape3dInspector.js";

export default class RoundRectInspector extends Shape3dInspector {
  constructor(editor, name) {
    super(editor, name, "RoundRect");
  }

  addEffectProperties() {
    super.addEffectProperties();
    const items = [];
    this.addLabelCheckBox(items, getString("editor.smooth"), function (data) {
      return data.s("shape3d.smooth")
    }, function (data, value) {
      return data.s("shape3d.smooth", value)
    });
    this.addRow(items, [this.indent, .1])
  }
}
