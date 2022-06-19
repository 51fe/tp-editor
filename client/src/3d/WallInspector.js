import { getString, getter, setter } from "../util";
import CubeInspector from "./CubeInspector.js";

export default class WallInspector extends CubeInspector {
  constructor(editor) {
    super(editor, "Wall");
  }

  addFormProperties() {
    super.addFormProperties();
    let items = [];
    this.addLabelCheckBox(items,
      getString("editor.closepath"),
      getter("p", "closePath"),
      setter("p", "closePath"));
    this.addRow(items, [this.indent, .1]);
  }

  addTransformProperties() {
    super.addTransformProperties(this);
    const items = [];
    this.addLabelRange(items,
      getString("editor.uvlength"),
      getter("s", "repeat.uv.length"),
      setter("s", "repeat.uv.length"), 0, undefined, 1, "int");
    this.addLabelRange(items,
      getString("editor.thickness"),
      getter("p", "thickness"),
      setter("p", "thickness"), 0, Number.MAX_VALUE, 1, "number");
    this.addLabelRange(items,
      getString("editor.resolution"),
      getter("s", "shape3d.resolution"),
      setter("s", "shape3d.resolution"), 0, 200, 1, "int");
    this.addRow(items, [this.indent, .1, 30, .1, 30, .1]);
  }
}
