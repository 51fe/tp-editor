import { getString } from "../util";
import Shape3dInspector from "./Shape3dInspector.js";

export default class CylinderInspector extends Shape3dInspector {
  constructor(editor, name) {
    super(editor, name || "Cylinder");
  }

  addEffectProperties() {
    super.addEffectProperties();
    const items = [];
    this.addLabelCheckBox(items, getString("editor.smooth"), 
    function (node) {
      return node.s("shape3d.smooth");
    }, 
    function (node, value) {
      return node.s("shape3d.smooth", value);
    });
    this.addRow(items, [this.indent, .1]);
  }
}