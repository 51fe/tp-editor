import { getString, getter, setter } from "../util";
import Shape3dInspector from "./Shape3dInspector.js";

export default class PolylineInspector extends Shape3dInspector {
  constructor(editor) {
    super(editor, "Polyline");
  }

  addTransformProperties() {
    super.addTransformProperties();
    let items = [];
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
    items = [];
    items.push(getString("editor.point"));
    this.addButton(items, null,
      getString("editor.reset"),
      "editor.resetsize.state", () => {
        this.setCurrentPoint("e", 0);
      });
    this.addLabelInput(items, "X", () => {
      return this.getCurrentPoint("x");
    }, function (scope, value) {
      this.setCurrentPoint("x", value);
    }, "int", 1);
    this.addLabelInput(items, "Y", () => {
      return this.getCurrentPoint("e")
    }, function (scope, value) {
      this.setCurrentPoint("e", value)
    }, "int", 1);
    this.addLabelInput(items, "Z", () => {
      return this.getCurrentPoint("y")
    }, function (scope, value) {
      this.setCurrentPoint("y", value)
    }, "int", 1);
    this.addRow(items, [this.indent - 40 - 8, 20, 20, .1, 20, .1, 20, .1]);
  }

  get simple() {
    return true;
  }
}
