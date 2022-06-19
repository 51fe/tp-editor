import config from "./config3d.js";
import DrawInteractor3d from "./DrawInteractor3d.js";

export default class CreateNodeInteractor3d extends DrawInteractor3d {
  constructor(editor, createFunc) {
    super(editor);
    this.createFunc = createFunc;
  }
  tearDown() {
    super.tearDown();
    this.node = this.p1 = this.p2 = null;
  }

  handle_mousedown(e) {
    this.handle_touchstart(e);
  }

  handle_touchstart(e) {
    ht.Default.preventDefault(e);
    if (ht.Default.isLeftButton(e)) {
      this.gv.setFocus(e);
      this.p1 = this.lp(e);
      this.startDragging(e);
    }
  }

  handleWindowMouseMove(e) {
    this.handleWindowTouchMove(e);
  }

  handleWindowMouseUp(e) {
    this.handleWindowTouchEnd(e);
  }

  handleWindowTouchMove(e) {
    ht.Default.preventDefault(e);
    if (this.p1) {
      this.p2 = this.lp(e);
      const rect = ht.Default.unionPoint(this.p1, this.p2);
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
    ht.Default.preventDefault(e);
    this.endTransaction();
    !this.node && this.p1 && this.createNode({
      x: this.p1.x - 25,
      y: this.p1.y - 25,
      width: 50,
      height: 50
    }, true);
    if (config.continuousCreating) {
      this.node = this.p1 = this.p2 = null;
    } else {
      this.editor.resetInteractionState();
    }
  }

  createNode(rect, center) {
    this.node = this.createFunc(rect, center);
    this.node.s3(50, 50, 50);
    if (center) {
      this.node.setPosition(rect.x + rect.width / 2, rect.y + rect.height / 2);
    } else {
      this.node.setRect(rect);
    }
    this.addData(this.node);
  }

  drawShape(g) {
    if (this.node) {
      this.drawRect(g, this.node.getRect(), config.color_data_border);
    }
  }
}



