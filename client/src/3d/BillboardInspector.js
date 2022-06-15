import { getString, getter, setter } from "../util";
import DataInspector from "./DataInspector.js";

export default class BillboardInspector extends DataInspector {
  constructor(editor) {
    super(editor, "Billboard");
  }

  initForm() {
    super.initForm();
    this.addReflectorProperties();
  }

  addFormProperties() {
    super.addFormProperties();
    this.addTitle("TitlePanel");
    let items = [];
    this.addLabelImage(items, getString("editor.image"),
      shape3d => {
        const img = shape3d.s("shape3d.image"),
          fileNode = this.editor.getFileNode(img);
        return fileNode ? fileNode.url : img;
      },
      (shape3d, value) => {
        shape3d.s("shape3d.image", value);
        if (shape3d.s("texture.cache")) {
          this.editor.scene.invalidateShape3dCachedImage(shape3d);
        }
      });
    this.addOneRow(items);
    items = [];
    this.addLabelCheckBox(items,
      getString("editor.transparent"),
      getter("s", "shape3d.transparent"),
      setter("s", "shape3d.transparent"));
    this.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelColor(items,
      getString("editor.color"),
      getter("s", "shape3d.color"),
      setter("s", "shape3d.color"));
    this.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelColor(items,
      getString("editor.reversecolor"),
      getter("s", "shape3d.reverse.color"),
      setter("s", "shape3d.reverse.color"));
    this.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelCheckBox(items,
      getString("editor.reversecull"),
      getter("s", "shape3d.reverse.cull"),
      setter("s", "shape3d.reverse.cull"));
    this.addLabelCheckBox(items,
      getString("editor.reverseflip"),
      getter("s", "shape3d.reverse.flip"),
      setter("s", "shape3d.reverse.flip"));
    this.addRow(items, [this.indent, .1, this.indent2, .1]);
  }

  addReflectorProperties() {
    this.addTitle("TitleReflector");
    let items = [];
    this.addLabelCheckBox(items,
      getString("editor.reflector"),
      getter("s", "shape3d.reflector"),
      setter("s", "shape3d.reflector"));
    this.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelColor(items,
      getString("editor.reflectorcolor"),
      getter("s", "shape3d.reflector.color"),
      setter("s", "shape3d.reflector.color"));
    this.addRow(items, [this.indent, .1]);
  }
}
