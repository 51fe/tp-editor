import {
  isCtrlDown, isDoubleClick, isLeftButton, isShiftDown, isEsc,
  isInput, getClientPoint, startDragging, getDistance
} from "../util/index.js";

export default class Interactor extends ht.graph.Interactor {
  constructor(graphView) {
    super(graphView)
  }

  isVScrollable() {
    return this.gv.getViewRect().height < this.gv.getScrollRect().height;
  }

  isV(e) {
    const rect = this.gv.getViewRect();
    return this.isVScrollable() &&
      (rect.x + rect.width - this.gv.lp(e).x) * this.gv.getZoom() < ht.Default.scrollBarInteractiveSize
  }

  clear(e) {
    if (e && this._dragging && !this._dragCancel) {
      this.gv.handleDragAndDrop(e, "end");
    }
    if (this.gv.draggingData) {
      this.gv.draggingData.iv();
      this.gv.draggingData = null;
      this.gv.redraw();
    }
    this._dragging = this._dragCancel = this._clientPoint = null;
  }

  handle_mousedown(e) {
    this.handle_touchstart(e);
  }

  handle_touchstart(e) {
    if (!this.isV(e) && !isInput(e.target)) {
      e.preventDefault();
      this.clear(e);
      this._clientPoint = getClientPoint(e);
      const data = this.gv.getDataAt(e);
      if (isLeftButton(e)) {
        if (data) {
          this.gv.draggingData = data;
          data.iv();
          this.gv.redraw();
          this.gv.handleDragAndDrop(e, "prepare");
          startDragging(this, e);
        } else {
          this.gv.sm().cs();
        }
      } else {
        if (data) {
          this.handleSelection(e, data);
        } else {
          this._cancelDataDoubleSelect();
          this.clear(e);
        }
      }
    }
  }

  handle_mouseup(e) {
    this.handle_touchend(e);
  }

  handle_touchend(e) {
    if (this._clientPoint && !this._dragging) {
      const data = this.gv.getDataAt(e);
      data ? this.handleSelection(e, data) : this._cancelDataDoubleSelect();
    }
    this.gv._justDoubleClickData = false;
    this.gv._levelChanged = false;
    this.clear(e);
  }

  handleWindowMouseMove(e) {
    this.handleWindowTouchMove(e);
  }

  handleWindowMouseUp(e) {
    this.handleWindowTouchEnd(e);
  }

  handleWindowTouchMove(e) {
    e.preventDefault();
    if (this._dragging) {
      this._dragCancel || this.gv.handleDragAndDrop(e, "between");
    } else {
      if (this._clientPoint && this.gv.draggingData && getDistance(getClientPoint(e), this._clientPoint) > 2) {
        this._dragging = true;
        this.gv.handleDragAndDrop(e, "begin");
      }
    }
  }

  handleWindowTouchEnd(e) {
    e.preventDefault();
    this.clear(e);
  }

  handleSelection(e, data) {
    const sm = this.gv.sm();
    if (isCtrlDown(e)) {
      this.gv.isSelected(data) ? sm.removeSelection(data) : sm.appendSelection(data);
    } else if (isShiftDown(e)) {
      const ld = sm.ld();
      if (ld) {
        const nodes = this.gv.nodes;
        let index = nodes.indexOf(ld);
        for (const i = nodes.indexOf(data); index !== i;) {
          index += i > index ? 1 : -1;
          sm.as(nodes[index]);
        }
      } else {
        sm.ss(data)
      }
    } else if (isLeftButton(e)) {
      if (sm.contains(data)) {
        this._handleDataDoubleSelect(e, data);
        isDoubleClick(e) && this._cancelDataDoubleSelect();
      } else {
        this._cancelDataDoubleSelect();
        if (!this.gv._levelChanged) {
          sm.ss(data);
        }
      }
    } else {
      sm.contains(data) || sm.ss(data);
    }
  }

  handle_keydown(e) {
    function isLeft(event) {
      return event.keyCode === 37;
    }

    function isUp(event) {
      return event.keyCode === 38;
    }

    function isRight(event) {
      return event.keyCode === 39;
    }

    function isDown(event) {
      return event.keyCode === 40;
    }
    if (!isInput(e.target)) {
      if (isEsc(e)) {
        if (this._dragging && !this._dragCancel) {
          this.gv.handleDragAndDrop(e, "cancel");
          this._dragCancel = true;
        }
      } else if (isUp(e) || isDown(e) || isLeft(e) || isRight(e)) {
        const sm = this.gv.sm(),
          nodes = this.gv.nodes,
          ld = sm.ld();
        if (nodes.length) {
          let node = undefined;
          if (ld) {
            const index = nodes.indexOf(ld);
            if (isUp(e) || isLeft(e)) {
              if (index !== 0) {
                node = nodes[index - 1]
              } else if (index !== nodes.length - 1) {
                node = nodes[index + 1]
              }
            }
          } else {
            node = nodes[0];
          }
          node && (isShiftDown(e) ? sm.as(node) : sm.ss(node));
        }
      }
    }
  }

  _handleDataDoubleSelect(e, node) {
    this._cancelDataDoubleSelect();
    this._doubleSelectTimer = setTimeout(() => {
      this.gv.handleDataDoubleSelect(e, node);
      this._doubleSelectTimer = undefined
    }, ht.Default.doubleClickSpeed);
  }

  _cancelDataDoubleSelect() {
    this._doubleSelectTimer && clearTimeout(this._doubleSelectTimer);
  }
}