import { drawBorder, getString, getTargetElement, getTip, isEnter, isEsc, layout, removeHTML } from "../util/index.js";
import TreeView from "./TreeView.js";

import config from "../config.js";

export default class DNDTree extends TreeView {
  constructor(editor, dm, editable = true) {
    super(dm)
    this.editor = editor;
    this.editable = editable;
    this.dragToIndexEnabled = true;
    this.dragToChildEnabled = true;
    this.addTopPainter(this.drawDNDState.bind(this));
  }

  getLabelColor(data) {
    if (data !== this.draggingData || this.isSelected(data)) {
      if (data.s("2d.visible") && data.s("3d.visible")) {
        return super.getLabelColor(data);
      }
      return config.color_disabled;
    }
    return config.color_select;
  }

  handleDelete() {
    this.editable && this.removeSelection()
  }

  isDroppable() {
    return false
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
    } else {
      config.texureImage3D && (g.texureImage3D = true);
      g.texureImage2D = true;
    }
    let info = undefined;
    if (this._dragInfo && this._dragInfo.inView) {
      info = this._dragInfo;
    } else if (this._crossDragInfo) {
      info = this._crossDragInfo;
    }
    if (info) {
      const _w = this.getWidth(),
        _h = this.getRowHeight(),
        type = info.type,
        parent = info.parent,
        index = parent ? this.getRowDatas().indexOf(parent) : -1,
        color = config.color_select_dark;
      if (info.refData) {
        if (this.dragToChildEnabled) {
          drawBorder(g, color, 0, index * _h, _w, _h, 2);
        }
        if (["up", "down"].includes(type)) {
          const { x, y } = info;
          g.beginPath();
          g.arc(x - 3, y, 3, 0, 2 * Math.PI, true);
          g.moveTo(x, y);
          g.lineTo(_w, y);
          g.lineWidth = 2;
          g.strokeStyle = color;
          g.stroke();
        }
      } else {
        const rect = this.getViewRect();
        drawBorder(g, color, rect.x, rect.y, rect.width, rect.height, 2);
      }
    }
  }

  _dragging(e, info) {
    const rowHeight = this.getRowHeight(),
      point = this.lp(e),
      rowNumber = point.y / rowHeight,
      rowCount = Math.floor(rowNumber);
    if (rowCount > this.getRowSize() - 1 || rowCount < 0) {
      info.refData = null;
      info.type = "parent";
      info.parent = null;
    } else {
      const diff = point.y - rowCount * rowHeight,
        min = this.dragToChildEnabled ? .25 : .5,
        max = this.dragToChildEnabled ? .75 : .5;
      if (this.dragToIndexEnabled) {
        if (diff < rowHeight * min) {
          info.type = "up";
        } else if (diff > rowHeight * max) {
          info.type = "down";
        } else {
          info.type = "parent";
        }
      } else {
        info.type = "parent";
      }
      const refData = info.refData = this.getRowDatas().get(rowCount);
      if (info.type === "up") {
        info.parent = refData.getParent();
        info.x = (this.getLevel(refData) + 1) * this.getIndent();
        info.y = rowCount * rowHeight;
      } else if (info.type === "down") {
        if (this.getToggleIcon(refData) === this.getExpandIcon()) {
          info.parent = refData;
          info.x = (this.getLevel(refData) + 2) * this.getIndent()
        } else {
          info.parent = refData.getParent();
          info.x = (this.getLevel(refData) + 1) * this.getIndent()
        }
        info.y = (rowCount + 1) * rowHeight;

      } else {
        info.parent = refData;
      }
    }
    this.autoScroll(e);
    this.redraw();
  }

  handleDragAndDrop(event, state) {
    if (this.editable) {
      if (state === "prepare") {
        this._clearDragInfo();
        return;
      }
      if (state === "begin") {
        this._dragInfo = { tip: getTip(this), view: this };
      }
      const info = this._dragInfo;
      if (info) {
        const dnd = this.editor.dnd;
        if (["begin", "between"].includes(state)) {
          if (this.getView().contains(getTargetElement(event))) {
            info.inView = true;
            this._dragging(event, info);
            dnd.clearDropView(event, info);
          } else {
            info.inView && this.redraw();
            info.inView = false;
            dnd.crossDrag(event, info)
          }
          dnd.showTip(info.tip, event);
        }
        if (state === "end") {
          info.inView ? this._endDrag(event, info) : dnd.crossDrop(event, info);
          this._clearDragInfo();
        }
        if (state === "cancel") {
          info.inView || dnd.crossCancel(event, info);
          this._clearDragInfo();
        }
        return;
      }
    }
  }

  handleCrossDrag(event, state, info) {
    if ("exit", "cancel".includes(state)) {
      this._crossDragInfo = null;
      this.redraw();
      return;
    }
    if (["enter", "over"].includes(state)) {
      this._crossDragInfo || (this._crossDragInfo = {}),
      this._dragging(event, this._crossDragInfo);
      return;
    }
    if (state === "drop") {
      if (this.explorer) {
        let url = this.explorer.currentDir;
        if (this._crossDragInfo.parent) {
          url = this._crossDragInfo.parent.url;
        }
        const params = { url, event };
        this.editor.fireEvent("explorerCrossDrop", params);
        params.preventDefault || this._endCrossDrag(event, info);
      } else {
        this._endCrossDrag(event, info);
      }
      this._crossDragInfo = null;
      this.redraw();
      return;
    }
  }

  isEditable() {
    return this.editable;
  }

  rename(data, name) {
    data.setName(name);
  }

  handleDataDoubleSelect(e, data) {
    if (this.isEditable(data)) {
      let level = this.getLevel(data);
      level += this.getIcon(data) ? 2 : 1;
      this.lp(e).x > level * this.getIndent() && this.beginEditing(data)
    }
  }

  getEditingLabel(data) {
    return this.getLabel(data)
  }

  beginEditing(data) {
    this.cancelEditing();
    this.makeVisible(data);
    this.validate();
    let level = this.getLevel(data);
    level += this.getIcon(data) ? 2 : 1;
    const Indent = this.getIndent() * level,
      rowHeight = this.getRowHeight(),
      my = this.ty() + this.getRowIndex(data) * rowHeight,
      mx = Math.max(1, this.getWidth() - Indent);

    this._currentEditor = new ht.widget.TextField;
    this._currentEditor.data = data;
    const el = this._currentEditor.getElement(),
      label = this.getEditingLabel(data);
    el.value = label ?? "";
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
    layout(this._currentEditor, Indent, my, mx, rowHeight);
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

  addBlockItems(items) {
    const hasSelection = () => {
      return this.sm().size() > 0
    },
      hasBlock = () => {
        const sm = this.sm(),
          selection = sm.getSelection(),
          size = sm.size();
        for (let i = 0; i < size; i++) {
          const data = selection.get(i);
          return data instanceof ht.Block &&
            !(data instanceof ht.RefGraph)
        }
        return false;
      };
    items.push({
      separator: true,
      visible: () => {
        return this.editable && (hasSelection() || hasBlock())
      }
    });
    items.push({
      id: "block",
      label: getString("editor.block"),
      action: () => {
        this.editor.block()
      }, visible: function () {
        return this.editable && hasSelection()
      }
    });
    items.push({
      id: "unblock",
      label: getString("editor.unblock"),
      action: () => {
        this.editor.unblock()
      },
      visible: () => {
        return this.editable && hasBlock()
      }
    })
  }

  addSelectDescendantItems(items) {
    items.push({
      id: "selectDescendant",
      label: getString("editor.selectdescendant"),
      action: () => {
        const sm = this.sm(),
          sel = sm.getSelection().toArray(),
          items = [];
        sel.forEach(item => {
          this.dm().eachByDepthFirst(item => {
            sel.indexOf(item) >= 0 || items.push(item)
          }, item)
        });
        sm.as(items)
      },
      visible: () => {
        return !!this.sm().size()
      }
    })
  }
}
