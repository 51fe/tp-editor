import { createItem, getClientPoint, getString, isDoubleClick } from "../util/index.js";
import Toolbar from "./index.js";

export default class RightToolbar extends Toolbar {
  constructor(editor) {
    super();
    this.editor = editor;
    this.createItems();
    this.enableToolTip();
    this.setStickToRight(true);
  }

  handleGraphViewPropertyChange(e) {
    e.property === "zoom" && this.renderLabel()
  }

  handleDataModelPropertyChange() {
    this.iv();
  }

  renderLabel() {
    if (this.graphView) {
      this.label.innerHTML = parseInt(100 * this.graphView.getZoom()) + "%";
    } else {
      this.label.innerHTML = "";
    }
  }

  initTab(tab) {
    if (this.dm) {
      this.dm.removePropertyChangeListener(this.handleDataModelPropertyChange, this);
    }
    if (this.graphView) {
      this.graphView.removePropertyChangeListener(this.handleGraphViewPropertyChange, this);
    }
    if (tab) {
      const view = tab.getView();
      this.dm = view.dm;
      this?.dm.addPropertyChangeListener(this.handleDataModelPropertyChange, this);
      this.graphView = view.graphView;
      this?.graphView.addPropertyChangeListener(this.handleGraphViewPropertyChange, this);
    } else {
      this.dm = null;
      this.graphView = null;
    }
    this.iv();
    this.renderLabel();
  }

  createItems() {
    let item = undefined;
    const visible = () => {
      return !!this.graphView
    },
      items = [];
    item = createItem("undo", getString("editor.undo"), "editor.undo");
    item.action = () => {
      this.editor.undo();
    };
    item.visible = visible;
    items.push(item);
    item = createItem("redo", getString("editor.redo"), "editor.redo");
    item.action = () => {
      this.editor.redo();
    };
    item.visible = visible;
    items.push(item);
    items.push({
      separator: true,
      visible
    });
    if (tpeditor.SceneView) {
      item = createItem("debug", getString("editor.debug"), "editor.debug", () => {
        return this.editor.isDebugTipShowing();
      });
      item.action = () => {
        this.editor.toggleDebugTip();
      };
      item.visible = visible;
      items.push(item);
    }
    item = createItem("rulers", getString("editor.showrulers"), "editor.rulers", () => {
      return this.editor.isRulerEnabled();
    });
    item.action = () => {
      this.editor.toggleRulerEnabled();
    };
    item.visible = visible;
    items.push(item);
    item = createItem("grid", getString("editor.showgrid"), "editor.grid", () => {
      return this.editor.isGridEnabled();
    });
    item.action = () => {
      this.editor.toggleGridEnabled();
    };
    item.visible = visible;
    items.push(item);
    items.push({
      separator: true,
      visible: visible
    });
    item = createItem("save", getString("editor.save"), "editor.save");
    item.action = () => {
      this.editor.save();
    };
    item.visible = visible;
    items.push(item);
    item = createItem("preview", getString("editor.preview"), "editor.preview");
    item.action = () => {
      this.editor.preview();
    };
    item.visible = visible;
    items.push(item);
    item = createItem("reload", getString("editor.reload"), "editor.reload");
    item.action = () => {
      this.editor.reload();
    };
    item.visible = visible;
    items.push(item);
    items.push({
      separator: true,
      visible: visible
    });
    items.push(this.createZoomItem(visible));
    item = createItem("zoomToFit", getString("editor.zoomtofit"), "editor.zoomtofit");
    item.action = () => {
      this.editor.zoomToFit();
    };
    item.visible = visible;
    items.push(item), items.push({
      separator: true,
      visible: visible
    });
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

  createZoomItem(visible) {
    const element = this.label = ht.Default.createDiv(true);
    element.style.font = this.getLabelFont();
    element.style.color = this.getLabelColor();
    element.style.cursor = "ew-resize";
    element.style.width = "40px";
    element.style.height = ht.Default.widgetRowHeight + "px";
    element.style.lineHeight = ht.Default.widgetRowHeight + "px";
    element.style.whiteSpace = "nowrap";
    element.style.textAlign = "center";
    const onStart = event => {
      event.preventDefault();
      const gv = this.editor.gv;
      if (gv) {
        isDoubleClick(event) && this.editor.zoomReset();
        const ratio = gv.getZoom(),
          x = getClientPoint(event).x,
          onMove = e => {
            e.preventDefault();
            const tx = getClientPoint(e).x - x;
            gv.setZoom(ratio * (1 + .005 * tx))
          };
        window.addEventListener("mousemove", onMove, false);
        window.addEventListener("touchmove", onMove, false);
        const onEnd = function (e) {
          e.preventDefault();
          window.removeEventListener("mousemove", onMove, false);
          window.removeEventListener("touchmove", onMove, false);
          window.removeEventListener("mouseup", onEnd, false);
          window.removeEventListener("touchend", onEnd, false);
        };
        window.addEventListener("mouseup", onEnd, false);
        window.addEventListener("touchend", onEnd, false);
      }
    };
    element.addEventListener("mousedown", onStart, false);
    element.addEventListener("touchstart", onStart, false);
    return {
      id: "zoom",
      unfocusable: true,
      element,
      visible
    }
  }
}
