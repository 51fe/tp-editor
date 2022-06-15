import { getString, getter, setter } from "../util";
import DataInspector from "./DataInspector.js";

export default class ModelInspector extends DataInspector {
  constructor(editor, name) {
    super(editor, name, "Model");
  }

  addFormProperties () {
    super.addFormProperties();
    let items = [];
    this.addLabelColor(items, getString("editor.color"),
      getter("s", "shape3d.color"),
      setter("s", "shape3d.color"));
    this.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelColor(items, getString("editor.blend"),
      getter("s", "shape3d.blend"),
      setter("s", "shape3d.blend"));
    this.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelRange(items, getString("editor.opacity"),
      getter("s", "shape3d.opacity"), setter("s", "shape3d.opacity"), 0, 1, .01, "number");
    this.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelCheckBox(items, getString("editor.transparent"),
      getter("s", "shape3d.transparent"),
      setter("s", "shape3d.transparent"));
    this.addLabelCheckBox(items, getString("editor.reversecull"),
      getter("s", "shape3d.reverse.cull"),
      setter("s", "shape3d.reverse.cull"));
    this.addRow(items, [this.indent, .1, this.indent2, .1]);
    items = [];
    this.addButton(items, getString("editor.resetposition"), null, null, data => {
      const model = ht.Default.getShape3dModel(data.s("shape3d"));
      if (model && model.center) {
        this.editor.beginTransaction();
        data.setAnchor3d(.5, .5, .5);
        data.p3(model.center);
        this.editor.endTransaction();
      }
    });
    this.addRow(items, [.1]).visible = () => {
      const ld = this.editor.ld;
      if (!ld) return false;
      const model = ht.Default.getShape3dModel(ld.s("shape3d"));
      return model && model.center
    }
  }
}
