import { createItem, getString } from "../util";

export default class RightToolbar3d extends ht.widget.Toolbar {
  constructor(editor) {
    super();
    this.editor = editor;
    this.createItems();
    this.enableToolTip();
    this.setStickToRight(true);
    this.editor.gv.addPropertyChangeListener(this.handlePropertyChange, this);
    this.renderLabel();
  }

  handlePropertyChange(e) {
    e.property === "zoom" && this.renderLabel()
  }

  renderLabel() {
    this.label.innerHTML = parseInt(100 * this.editor.gv.getZoom()) + "%"
  }

  createItems() {
    const items = [];
    let item = undefined;
    item = createItem("save", getString("editor.save"), "editor.save");
    item.action = () => {
      this.editor.save();
    };
    items.push(item);
    item = createItem("reload", getString("editor.reload"), "editor.reload");
    item.action = () => {
      this.editor.reload();
    };
    items.push(item);
    items.push({ separator: true });
    item = createItem("rulers", getString("editor.showrulers"), "editor.rulers", () => {
      return this.editor.isRulerEnabled();
    });
    item.action = () => {
      this.editor.toggleRulerEnabled();
    };
    items.push(item);
    item = createItem("grid", getString("editor.showaxis"), "editor.axis", () => {
      return !this.editor.dm.a("sceneEditHelperDisabled");
    });
    item.action = () => {
      this.editor.dm.a("sceneEditHelperDisabled", !this.editor.dm.a("sceneEditHelperDisabled"));
    };
    items.push(item);
    item = createItem("grid", getString("editor.showgrid"), "editor.grid", () => {
      return this.editor.dm.a("sceneGridEnabled");
    });
    item.action = () => {
      this.editor.dm.a("sceneGridEnabled", !this.editor.dm.a("sceneGridEnabled"));
    };
    items.push(item);
    item = createItem("preview", getString("editor.preview"), "editor.preview");
    item.action = () => {
      this.editor.preview();
    };
    items.push(item);
    items.push({ separator: true });
    items.push(this.createZoomItem());
    item = createItem("zoomToFit", getString("editor.zoomtofit"), "editor.zoomtofit");
    item.action = () => {
      this.editor.zoomToFit();
    };
    items.push(item);
    items.push({ separator: true });
    item = createItem("toggleLeft", getString("editor.toggleleft"), "editor.toggleleft");
    item.action = () => {
      this.editor.toggleLeft();
    };
    items.push(item);
    item = createItem("toggleRight", getString("editor.toggleright"), "editor.toggleright");
    item.action = () => {
      this.editor.toggleRight();
    };
    items.push(item);
    this.setItems(items);
  }

  createZoomItem() {
    const element = this.label = ht.Default.createDiv(true);
    element.style.font = this.getLabelFont();
    element.style.color = this.getLabelColor();
    element.style.cursor = "ew-resize";
    element.style.width = "40px";
    element.style.height = ht.Default.widgetRowHeight + "px";
    element.style.lineHeight = ht.Default.widgetRowHeight + "px";
    element.style.whiteSpace = "nowrap", element.style.textAlign = "center";
    const onStart = event => {
      event.preventDefault();
      const gv = this.editor.gv;
      ht.Default.isDoubleClick(event) && gv.zoomReset();
      const zoom = gv.getZoom(),
        x = ht.Default.getClientPoint(event).x;
      const onMove = e => {
        e.preventDefault();
        const dx = ht.Default.getClientPoint(e).x - x;
        gv.setZoom(zoom * (1 + .005 * dx))
      };
      window.addEventListener("mousemove", onMove, false);
      window.addEventListener("touchmove", onMove, false);
      const onEnd = function (e) {
        e.preventDefault();
        window.removeEventListener("mousemove", onMove, false);
        window.removeEventListener("touchmove", onMove, false);
        window.removeEventListener("mouseup", onEnd, false);
        window.removeEventListener("touchend", onEnd, false)
      };
      window.addEventListener("mouseup", onEnd, false);
      window.addEventListener("touchend", onEnd, false);
    };
    element.addEventListener("mousedown", onStart, false);
    element.addEventListener("touchstart", onStart, false)
    return {
      id: "zoom",
      unfocusable: true,
      element
    }
  }
}
