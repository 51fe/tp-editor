import { getString, setter } from "../util/index.js";
import { addTab, setU, getU, setV, getV, setNull } from "./util.js";
import DataInspector from "./DataInspector.js";

export default class CubeInspector extends DataInspector {
  constructor(editor) {
    super(editor, "Cube");
  }

  initForm() {
    super.initForm();
    this.addCubeProperties();
  }

  addCubeProperties() {
    this.addTitle("TitleFace");
    let pane = new ht.widget.FormPane,
      items = undefined,
      h = 0;
    const view = new ht.widget.TabView,
      POSITIONS = ["all", "front", "back", "left", "right", "top", "bottom"],
      _getter = (position, name, selectedAll) => {
        return function (node) {
          const value = node.s(position + "." + name);
          if (selectedAll && value === undefined) {
            return node.s("all." + name)
          } else {
            return value;
          }
        }
      };
    for (let i = 0; i < POSITIONS.length; i++) {
      const image = POSITIONS[i] + ".image";
      items = [];
      this.addLabelImage(items, getString("editor.face." + POSITIONS[i]),
        node => {
          const url = _getter(POSITIONS[i], "image")(node),
            fileNode = this.editor.getFileNode(url);
          return fileNode ? fileNode.url : url
        }, setter("s", image));
      pane.addRow(items, [this.indent, .1, 20]);
    }
    addTab(view, getString("editor.image"), pane, true);
    pane.validateImpl();
    h = Math.max(h, pane.getScrollHeight());
    pane = new ht.widget.FormPane;
    for (let i = 0; i < POSITIONS.length; i++) {
      const scale = POSITIONS[i] + ".uv.scale",
        items = [];
      this.addLabel(items, getString("editor.face." + POSITIONS[i]));
      this.addButton(items, null, getString("editor.reset"),
        "editor.resetsize.state", setNull(scale));
      this.addLabelInput(items, "U", getU(scale), setU(scale), "number", 1);
      this.addLabelInput(items, "V", getV(scale), setV(scale), "number", 1);
      pane.addRow(items, [this.indent - 20 - 8, 20, 20, .1, 20, .1]);
    }
    addTab(view, getString("editor.repeat"), pane, true);
    pane.validateImpl();
    h = Math.max(h, pane.getScrollHeight());
    pane = new ht.widget.FormPane;
    for (let i = 0; i < POSITIONS.length; i++) {
      const color = POSITIONS[i] + ".color";
      items = [];
      this.addLabelColor(items, getString("editor.face." + POSITIONS[i]),
        _getter(POSITIONS[i], "color"), setter("s", color));
      pane.addRow(items, [this.indent, .1]);
    }
    addTab(view, getString("editor.color"), pane);
    pane.validateImpl();
    h = Math.max(h, pane.getScrollHeight());
    pane = new ht.widget.FormPane;
    for (let i = 0; i < POSITIONS.length; i++) {
      const transparent = POSITIONS[i] + ".transparent";
      items = [];
      this.addLabelCheckBox(items, getString("editor.face." + POSITIONS[i]),
        _getter(POSITIONS[i], "transparent"), setter("s", transparent));
      pane.addRow(items, [this.indent, .1])
    }
    addTab(view, getString("editor.transparent"), pane);
    pane.validateImpl();
    h = Math.max(h, pane.getScrollHeight());
    pane = new ht.widget.FormPane;
    for (let i = 0; i < POSITIONS.length; i++) {
      const visible = POSITIONS[i] + ".visible";
      items = [];
      this.addLabelCheckBox(items, getString("editor.face." + POSITIONS[i]),
        _getter(POSITIONS[i], "visible", true), setter("s", visible));
      pane.addRow(items, [this.indent, .1])
    }
    addTab(view, getString("editor.visible"), pane);
    pane.validateImpl();
    h = Math.max(h, pane.getScrollHeight());
    pane = new ht.widget.FormPane;
    for (let i = 0; i < POSITIONS.length; i++) {
      const color = POSITIONS[i] + ".reverse.color";
      items = [];
      this.addLabelColor(items, getString("editor.face." + POSITIONS[i]),
        _getter(POSITIONS[i], "reverse.color"), setter("s", color));
      pane.addRow(items, [this.indent, .1])
    }
    addTab(view, getString("editor.reversecolor"), pane), pane.validateImpl();
    h = Math.max(h, pane.getScrollHeight());
    pane = new ht.widget.FormPane;
    for (let i = 0; i < POSITIONS.length; i++) {
      const flip = POSITIONS[i] + ".reverse.flip";
      items = [];
      this.addLabelCheckBox(items, getString("editor.face." + POSITIONS[i]),
        _getter(POSITIONS[i], "reverse.flip", true), setter("s", flip));
      pane.addRow(items, [this.indent, .1]);
    }
    addTab(view, getString("editor.reverseflip"), pane);
    pane.validateImpl();
    h = Math.max(h, pane.getScrollHeight());
    pane = new ht.widget.FormPane;
    for (let i = 0; i < POSITIONS.length; i++) {
      const cull = POSITIONS[i] + ".reverse.cull";
      items = [];
      this.addLabelCheckBox(items, getString("editor.face." + POSITIONS[i]),
        _getter(POSITIONS[i], "reverse.cull", true), setter("s", cull));
      pane.addRow(items, [this.indent, .1])
    }
    addTab(view, getString("editor.reversecull"), pane);
    pane.validateImpl();
    h = Math.max(h, pane.getScrollHeight());
    const height = view.getTabHeight() + h;
    items = [];
    items.push(view);
    this.addRow(items, [.1], height);
  }
}
