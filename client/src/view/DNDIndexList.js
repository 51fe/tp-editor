import { drawBorder, getTargetElement, getTip, isEnter, isEsc, layout, removeHTML } from "../util/index.js";
import config from "../config.js";
import FilterListView from "./FilterListView.js";

export default class DNDIndexList extends FilterListView {
  constructor(editor, dm, editable = true) {
    super(dm);
    this.editor = editor;
    this.editable = editable;
    this.addTopPainter(this.drawDNDState.bind(this));
  }

  getLabelColor(data) {
    if (data !== this.draggingData || this.isSelected(data)) {
      if (data.s("2d.visible") && data.s("3d.visible")) {
        return super.getLabelColor(data);
      }
      return config.color_disabled
    }
    return config.color_select
  }

  isEditable() {
    return this.editable;
  }

  handleDelete() {
    this.editable && this.removeSelection();
  }

  handleDataDoubleSelect(e, node) {
    if (this.isEditable(node)) {
      const indent = this.getIcon(node) ? this.getIndent() : 0;
      this.lp(e).x > indent && this.beginEditing(node);
    }
  }

  rename(data, name) {
    data.setName(name);
  }

  isDroppable() {
    return false;
  }

  _clearDragInfo() {
    this.editor.dnd.hideTip();
    if (this._dragInfo) {
      this._dragInfo = null;
      this.redraw();
    }
  }

  _endDrag() {
  }

  _endCrossDrag() {
  }

  drawDNDState(g) {
    if (config.drawDNDState) {
      g.drawDNDState = true;
    } else if (config.texureImage3D) {
      g.texureImage3D = true;
    } else {
      g.texureImage2D = true;
    }

    let info = undefined;
    if (this._dragInfo && this._dragInfo.inView) {
      info = this._dragInfo;
    } else if (this._crossDragInfo) {
      info = this._crossDragInfo;
    }
    if (info) {
      const w = this.getWidth(),
        color = config.color_select_dark;
      if (info.refData) {
        const y = info.y;
        g.beginPath();
        g.arc(4, y, 3, 0, 2 * Math.PI, true);
        g.moveTo(7, y);
        g.lineTo(w, y);
        g.lineWidth = 2;
        g.strokeStyle = color;
        g.stroke();
      } else {
        const { x, y, width, height } = this.getViewRect();
        drawBorder(g, color, x, y, width, height, 2);
      }
    }
  }

  _dragging(e, info) {
    const h = this.getRowHeight(),
      point = this.lp(e),
      scale = point.y / h,
      n = Math.floor(scale);
    if (n > this.getRowSize() - 1 || n < 0) {
      info.refData = null;
      info.type = null;
      info.parent = null;
    } else {
      info.refData = this.getRowDatas().get(n);
      if (point.y - n * h < .5 * h) {
        info.type = "up";
        info.y = n * h;
      } else {
        info.type = "down";
        info.y = (n + 1) * h;
      }
    }
    this.autoScroll(e);
    this.redraw();
  }

  handleDragAndDrop(e, state) {
    if (this.editable) {
      if (state === "prepare") {
        this._clearDragInfo();
      }
      if (state === "begin") {
        this._dragInfo = { tip: getTip(this), view: this };
      }
      const info = this._dragInfo;
      if (info) {
        const dnd = this.editor.dnd;
        if (["begin", "between"].includes(state)) {
          if (this.getView().contains(getTargetElement(e))) {
            info.inView = true;
            this._dragging(e, info);
            dnd.clearDropView(e, info);
          } else {
            info.inView && this.redraw();
            info.inView = false;
            dnd.crossDrag(e, info);
          }
          dnd.showTip(info.tip, e);
        }
        if (state === "end") {
          info.inView ? this._endDrag(e, info) : dnd.crossDrop(e, info);
          this._clearDragInfo();
        }
        if (state === "cancel") {
          info.inView || dnd.crossCancel(e, info);
          this._clearDragInfo();
        }
      }
    }
  }

  handleCrossDrag(e, state, info) {
    if (this.editable) {
      if (["exit", "cancel"].includes(state)) {
        this._crossDragInfo = null;
        this.redraw();
      }
      if (["enter", "over"].includes(state)) {
        this._crossDragInfo || (this._crossDragInfo = {});
        this._dragging(e, this._crossDragInfo);
      }
      if (state === "drop") {
        this._endCrossDrag(e, info);
        this._crossDragInfo = null;
        this.redraw();
      }
    }
  }

  beginEditing(e) {
    this.cancelEditing();
    this.makeVisible(e);
    this.validate();
    const left = this.getIcon(e) ? this.getIndent() : 0,
      top = this.ty() + this.getRowIndex(e) * this.getRowHeight(),
      w = Math.max(1, this.getWidth() - left),
      h = this.getRowHeight();
    this._currentEditor = new ht.widget.TextField;
    this._currentEditor.data = e;
    const el = this._currentEditor.getElement(),
      label = this.getLabel(e);
    el.value = null == label ? "" : label;
    el.onblur = () => {
      this.endEditing();
    };
    el.onkeydown = e => {
      if (isEnter(e)) {
        this.endEditing();
      } else if (isEsc(e)) {
        this.cancelEditing();
      }
    };
    this.getView().appendChild(this._currentEditor.getView());
    layout(this._currentEditor, left, top, w, h);
    this._currentEditor.setFocus();
    ht.Default.callLater(el.select, el);
  }

  endEditing() {
    const editor = this._currentEditor;
    if (editor) {
      this.rename(editor.data, editor.getValue());
      delete this._currentEditor;
      removeHTML(editor.getView());
      this.redraw();
    }
  }

  cancelEditing() {
    const editor = this._currentEditor;
    if (editor) {
      delete this._currentEditor;
      removeHTML(editor.getView());
      this.redraw();
    }
  }
}
