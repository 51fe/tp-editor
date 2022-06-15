import config from "../config.js";
import { isFunction, isLeftButton, preventDefault, unionPoint } from "../util/index.js";
import DrawInteractor from "./DrawInteractor.js";

export default class CreateNodeInteractor extends DrawInteractor {
  constructor(tab, clazz, type) {
    super(tab, clazz, type)
  }

  tearDown() {
    super.tearDown();
    this.node = this.p1 = this.p2 = null;
  }

  cancel() {
    this.node ? this.remove(this.node) : this.editView.setState("edit")
  }

  handle_mousedown(e) {
    this.handle_touchstart(e);
  }

  handle_touchstart(e) {
    preventDefault(e);
    if (isLeftButton(e)) {
      this.gv.setFocus(e);
      this.p1 = this.lp(e);
      this.startDragging(e);
    }
  }

  handleWindowMouseMove(e) {
    this.handleWindowTouchMove(e)
  }

  handleWindowMouseUp(e) {
    this.handleWindowTouchEnd(e)
  }

  handleWindowTouchMove(e) {
    preventDefault(e);
    if (this.p1) {
      this.p2 = this.lp(e);
      const rect = unionPoint(this.p1, this.p2);
      if (this.node) {
        this.node.setRect(rect);
      } else {
        if (!rect.width || !rect.height) return;
        this.beginTransaction();
        this.createNode(rect, false);
      }
    }
  }

  handleWindowTouchEnd(e) {
    preventDefault(e);
    this.endTransaction();
    if (!this.node && this.p1) {
      this.createNode({
        x: this.p1.x - 25,
        y: this.p1.y - 25,
        width: 50,
        height: 50
      }, true);
    }
    if (this.node) {
      let type = "dataCreated",
        params = { data: this.node };
      if (this.editView.type === "symbol") {
        type = "compCreated"
      }
      this.editor.fireViewEvent(this.editView, type, params, false);
    }
    if (config.continuousCreating) {
      this.node = this.p1 = this.p2 = null;
    } else {
      this.editView.setState("edit");
    }
  }

  createNode(rect, finished) {
    if (isFunction(this.type)) {
      this.node = this.type(rect, finished);
    } else {
      this.node = new this.clazz;
    }
    if (finished) {
      this.node.setPosition(rect.x + rect.width / 2, rect.y + rect.height / 2)
    } else {
      this.node.setRect(rect)
    }
    this.node.setParent(this.editView.graphView.getCurrentSubGraph());
    this.dm.add(this.node);
    this.dm.sm().ss(this.node);
    this.editView.graphView.setFocus();
  }

  drawShape(g) {
    if (this.node) {
      this.drawRect(g, this.node.getRect(), config.color_data_border)
    }
  }
}
