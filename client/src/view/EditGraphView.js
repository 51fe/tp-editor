import { createCanvas, createDiv, getString, positionImg, removeHTML, removeItem } from "../util/index.js";

import GraphView from "./GraphView.js";
import ContextMenu from "../menu/ContextMenu.js";
import config from "../config.js";

export default class EditGraphView extends GraphView {
  constructor(editView) {
    super();
    this.editView = editView;
    this.editor = editView.editor;
    this._topCanvas = createCanvas()
    this._topDiv = createDiv();
    this._view.insertBefore(this._topCanvas, this._scrollBarDiv || null);
    this._view.insertBefore(this._topDiv, this._scrollBarDiv || null);
    const items = [];
    this.menu = new ContextMenu(items);
    this.menu.beforeShow = e => {
      this._rightClickPosition = this.lp(e)
    };
    this.initMenuItems(items);
    this.menu.addTo(this.getView());
    this.editor.menus.push(this.menu),
      this.setResettable(true);
    this.addTopPainter(g => {
      if (config.drawDNDState) {
        g.drawDNDState = true;
      } else {
        config.texureImage3D && (g.texureImage3D = true);
        g.texureImage2D = true;
      }
      const { x, y, width, height } = this.getViewRect(),
        view = this.editView,
        hx = view.hoverGuideLineX,
        hy = view.hoverGuideLineY,
        color = ht.Default.brighter(this.dm().a("alignmentGuideColor"));
      if (!ht.Default.isDragging() && hx && hx) {
        g.beginPath(),
          g.strokeStyle = color,
          g.lineWidth = 1 / this.getZoom(),
          hx && (g.moveTo(hx.x, y),
            g.lineTo(hx.x, y + height)),
          hy && (g.moveTo(x, hy.y),
            g.lineTo(x + width, hy.y)),
          g.stroke()
      }
    })
  }

  reset() {
    this.fitContent(config.animate, config.fitPadding)
  }

  isEditable(data) {
    return !!this.editable && super.isEditable(data);
  }

  isMovable(data) {
    return !!this.editable && super.isMovable(data);
  }

  invalidateAll(e, kind) {
    if (["imageLoaded", "modelLoaded"].includes(kind)) {
      const inspector = this.editor.inspector;
      inspector?.invalidateProperties?.();
      inspector?.invalidateDataBindings?.();
    }
    super.invalidateAll(e, kind);
  }

  handleDelete() {
    this.editable && super.handleDelete();
  }

  onGroupDoubleClicked(group, e) {
    this.editable && super.onGroupDoubleClicked(group, e);
  }

  onEdgeDoubleClicked(edge, e) {
    this.editable && super.onEdgeDoubleClicked(edge, e);
  }

  checkDoubleClickOnNote(note, e) {
    return !!this.editable && super.checkDoubleClickOnNote(note, e);
  }

  getToolTip(e) {
    return config.getToolTip(e, this);
  }

  setEditMenuItems(items) {
    items.push({
      id: "copy",
      label: getString("editor.copy"),
      action: () => {
        this.editor.copy()
      },
      visible: () => {
        return !!this.editor.ld;
      }
    }), items.push({
      id: "paste",
      label: getString("editor.paste"),
      action: () => {
        this.editor.paste(false, this._rightClickPosition);
      },
      visible: () => {
        return this.editable && this.editor.hasCopyInfo();
      }
    });
  }

  setMenuItems(items) {
    items.push({
      separator: true, visible: () => {
        return this.editable && !!this.editor.ld;
      }
    });
    items.push({
      id: "bringToFront",
      label: getString("editor.bringtofront"),
      action: () => {
        this.editor.bringToFront();
      },
      visible: () => {
        return this.editable && !!this.editor.ld;
      }
    });
    items.push({
      id: "bringForward",
      label: getString("editor.bringforward"),
      action: () => {
        this.editor.bringForward();
      },
      visible: () => {
        return this.editable && !!this.editor.ld;
      }
    });
    items.push({
      id: "sendBackward",
      label: getString("editor.sendbackward"),
      action: () => {
        this.editor.sendBackward();
      },
      visible: () => {
        return this.editable && !!this.editor.ld;
      }
    });
    items.push({
      id: "sendToBack",
      label: getString("editor.sendtoback"),
      action: () => {
        this.editor.sendToBack();
      },
      visible: () => {
        return this.editable && !!this.editor.ld;
      }
    })
  }

  initMenuItems() { }

  onClosed() {
    removeItem(this.editor.menus, this.menu);
  }

  copyData(data) {
    if (data && this.copyMap[data._id]) {
      return data._id;
    }
    return data;
  }

  parse(data, info) {
    if (data instanceof ht.Data) {
      if (this.dm().contains(data)) {
        return data;
      }
      return undefined;
    }
    return info[data]
  }

  getSelectWidth(data) {
    if (!this.isEditable(data) || data instanceof ht.Edge) {
      return data.s("select.width");
    }
    return 0;
  }

  onSelectionChanged(e) {
    const size = this.sm().size()
    if (size && (["set", "append"].includes(e.kind))) {
      const ld = this.sm().ld();
      if (ld && document.activeElement === this.getView()) {
        this._dataModel.isAutoAdjustIndex() && this.adjustIndex(ld);
      }
    }
  }

  getContentRect() {
    let rect = super.getContentRect();
    if (!rect.width || !rect.height) {
      const width = this.dm()?.a("width") ?? 200,
        height = this.dm()?.a("height") ?? 200;
      rect = { x: -width / 2, y: -height / 2, width, height, empty: true };
    }
    return rect;
  }

  isDroppable() {
    return false;
  }

  removeDragImage() {
    if (this.dragImage) {
      removeHTML(this.dragImage);
      this.dragImage = null;
    }
  }

  handleCrossDrag(e, state, info) {
    const view = info.view,
      fileNode = view.draggingData;
    if (state === "enter") {
      this._topDiv.style.border = "solid " + config.color_select_dark + " 2px";
      if (!this.dragImage && fileNode) {
        let dragImage = fileNode.getImage();
        if (fileNode.a("dragImage") !== undefined) {
          dragImage = fileNode.a("dragImage")
        }
        if (ht.Default.getImage() !== ht.Default.getImage("editor.unknown")) {
          const size = tpeditor.config.dragImageSize;
          this.dragImage = ht.Default.toCanvas(dragImage, size, size, "centerUniform", fileNode, info.view, null, ht.Default.devicePixelRatio);
          positionImg(e, this.dragImage);
          this.dragImage.style.opacity = tpeditor.config.dragImageOpacity;
          this.dragImage.className = "tp-editor-dnd-image";
          ht.Default.appendToScreen(this.dragImage);
        }
      }
    } else if (["exit", "cancel"].includes(state)) {
      this._topDiv.style.border = "";
      this.removeDragImage();
    } else if (state === "over") {
      positionImg(e, this.dragImage);
    } else if (state === "drop") {
      this._topDiv.style.border = "";
      if (fileNode) {
        this.removeDragImage();
        const lp = this.lp(e);
        if (view.isSelected(fileNode)) {
          view.sm().toSelection().each(fileNode => {
            if (view.handleDropToEditView) {
              view.handleDropToEditView(this.editView, fileNode, lp, e);
            } else {
              this.editor.addViewData(fileNode, lp);
            }
          })
        } else if (view.handleDropToEditView) {
          view.handleDropToEditView(this.editView, fileNode, lp, e);
        } else {
          this.editor.addViewData(fileNode, lp);
        }
      }
    } else if (view === this.editor.dndFromOutside) {
      this.editor.dropLocalFileOnView(e)
    }
  }

  get editable() {
    return this.editor.editable
  }
  set editable(value) { }
}
