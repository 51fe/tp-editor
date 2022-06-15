import { getString, getter, setter } from "../util";
import Shape3dInspector from "./Shape3dInspector.js";

export default class PipelineInspector extends Shape3dInspector {
  constructor(editor) {
    super(editor, "Pipeline");
  }

  addTransformProperties() {
    super.addTransformProperties();
    var items = [];
    this.addLabelRange(items,
      getString("editor.uvlength"),
      getter("s", "repeat.uv.length"),
      setter("s", "repeat.uv.length"), 0, undefined, 1, "int");
    this.addLabelRange(items,
      getString("editor.thickness"),
      getter("p", "thickness"),
      setter("p", "thickness"), 0, Number.MAX_VALUE, 1);
    this.addLabelRange(items,
      getString("editor.resolution"),
      getter("s", "shape3d.resolution"),
      setter("s", "shape3d.resolution"), 0, 200, 1, "int");
    this.addRow(items, [this.indent, .1, 30, .1, 30, .1]);
  }

  addExtraProperties(pane) {
    super.addExtraProperties();
    let items = [];
    this.addLabelInput(items, getString("editor.startangle"), function (shape3d) {
      return Math.round(180 / Math.PI * shape3d.s("shape3d.start.angle"));
    }, function (shape3d, value) {
      shape3d.s("shape3d.start.angle", value * Math.PI / 180);
    }, "int", 1);
    pane.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelInput(items, getString("editor.sweepangle"), function (shape3d) {
      return Math.round(180 / Math.PI * shape3d.s("shape3d.sweep.angle"))
    }, function (shape3d, value) {
      shape3d.s("shape3d.sweep.angle", value * Math.PI / 180);
    }, "int", 1), pane.addRow(items, [this.indent, .1])
  }

  get simple() {
    return true;
  }
}
