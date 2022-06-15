import { addTab, getU, getV, setNull, setU, setV } from "./util.js";
import { getString, getter, setter } from "../util/index.js";
import DataInspector from "./DataInspector.js";

export default class Shape3dInspector extends DataInspector {
  constructor(editor, name) {
    super(editor, name || "Shape3d");
  }

  initForm() {
    super.initForm();
    this.addEffectProperties();
    this.addTopBodyBottomProperties();
  }

  getCurrentPoint(index) {
    return this.editor.currentPoint ? this.editor.currentPoint[index] : 0
  }

  setCurrentPoint(p, e) {
    this.editor.gv.getEditInteractor().getSubModule("Curve").setCurrentPoint(p, e)
  }

  addTopBodyBottomProperties() {
    this.addTitle("TitleFace");
    let items = [],
      count = 0;
    const view = new ht.widget.TabView,
      faces = this.faces;
    let pane = new ht.widget.FormPane;
    for (let i = 0; i < faces.length; i++) {
      const image = faces[i] + ".image";
      items = [];
      this.addLabelImage(items, getString("editor.face." + faces[i]),
        name => {
          const url = getter("s", image)(name),
            fileNode = this.editor.getFileNode(url);
          return fileNode ? fileNode.url : url
        }, setter("s", image));
      pane.addRow(items, [this.indent, .1, 20])
    }

    addTab(view, getString("editor.image"), pane, true);
    pane.validateImpl();
    count = Math.max(count, pane.getScrollHeight());
    pane = new ht.widget.FormPane;
    for (let i = 0; i < faces.length; i++) {
      const scale = faces[i] + ".uv.scale";
      items = [];
      this.addLabel(items, getString("editor.face." + faces[i]));
      this.addButton(items, null, getString("editor.reset"),
        "editor.resetsize.state", setNull(scale));
      this.addLabelInput(items, "U", getU(scale), setU(scale), "number", 1);
      this.addLabelInput(items, "V", getV(scale), setV(scale), "number", 1);
      pane.addRow(items, [this.indent - 20 - 8, 20, 20, .1, 20, .1])
    }
    addTab(view, getString("editor.repeat"), pane, true);
    pane.validateImpl();
    count = Math.max(count, pane.getScrollHeight());
    pane = new ht.widget.FormPane;
    for (let i = 0; i < faces.length; i++) {
      const color = faces[i] + ".color";
      items = [];
      this.addLabelColor(items, getString("editor.face." + faces[i]),
        getter("s", color), setter("s", color));
      pane.addRow(items, [this.indent, .1, 20])
    }
    addTab(view, getString("editor.color"), pane);
    pane.validateImpl(), count = Math.max(count, pane.getScrollHeight());
    pane = new ht.widget.FormPane;
    for (let i = 0; i < faces.length; i++) {
      const visible = faces[i] + ".visible";
      items = [];
      this.addLabelCheckBox(items,
        getString("editor.face." + faces[i]),
        getter("s", visible), setter("s", visible));
      pane.addRow(items, [this.indent, .1, 20])
    }
    addTab(view, getString("editor.visible"), pane);
    pane.validateImpl();
    count = Math.max(count, pane.getScrollHeight());
    pane = new ht.widget.FormPane;
    items = [];
    this.addLabelColor(items,
      getString("editor.color"),
      getter("s", "shape3d.reverse.color"),
      setter("s", "shape3d.reverse.color"));
    pane.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelCheckBox(items,
      getString("editor.flip"),
      getter("s", "shape3d.reverse.flip"),
      setter("s", "shape3d.reverse.flip"));
    pane.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelCheckBox(items,
      getString("editor.cull"),
      getter("s", "shape3d.reverse.cull"),
      setter("s", "shape3d.reverse.cull"));
    pane.addRow(items, [this.indent, .1]);
    addTab(view, getString("editor.reverse"), pane);
    pane.validateImpl();
    count = Math.max(count, pane.getScrollHeight());
    const height = view.getTabHeight() + count;
    items = [];
    items.push(view);
    this.addRow(items, [.1], height)
  }

  addEffectProperties() {
    this.addTitle("TitleEffect");
    let items = [];
    this.addLabelCheckBox(items, getString("editor.transparent"),
      getter("s", "shape3d.transparent"),
      setter("s", "shape3d.transparent"));
    this.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelColor(items, getString("editor.blend"),
      getter("s", "shape3d.blend"), setter("s", "shape3d.blend"));
    this.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelRange(items,
      getString("editor.opacity"),
      getter("s", "shape3d.opacity"),
      setter("s", "shape3d.opacity"), 0, 1, .01, "number");
    this.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelRange(items,
      getString("editor.side"),
      getter("s", "shape3d.side"),
      setter("s", "shape3d.side"), 0, undefined, 1, "int");
    this.addRow(items, [this.indent, .1]);
    if (!this.simple) {
      items = [], this.addLabelRange(items,
        getString("editor.side.from"),
        getter("s", "shape3d.side.from"),
        setter("s", "shape3d.side.from"), 0, undefined, 1, "int");
      this.addRow(items, [this.indent, .1]);
      items = [];
      this.addLabelRange(items,
        getString("editor.side.to"),
        getter("s", "shape3d.side.to"),
        setter("s", "shape3d.side.to"), 0, undefined, 1, "int");
      this.addRow(items, [this.indent, .1])
    }
  }
  addExtraProperties() { }

  get simple() {
    return false;
  }

  get faces() {
    return this.simple ? ["shape3d", "shape3d.top", "shape3d.bottom"] :
      ["shape3d", "shape3d.top", "shape3d.bottom", "shape3d.from", "shape3d.to"];
  }
}
