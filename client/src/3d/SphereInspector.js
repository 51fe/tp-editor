import { getString, getter, setter } from "../util";
import CylinderInspector from "./CylinderInspector.js";

export default class SphereInspector extends CylinderInspector {
  constructor(editor, name) {
    super(editor, name || "Sphere");
  }

  addEffectProperties() {
    super.addEffectProperties();
    const items = [];
    this.addLabelRange(items, getString("editor.resolution"),
      getter("s", "shape3d.resolution"),
      setter("s", "shape3d.resolution"), 0, 200, 1, "int")
    this.addRow(items, [this.indent, .1]);
  }

  get faces() {
    return  ["shape3d", "shape3d.from", "shape3d.to"];
  }
}
