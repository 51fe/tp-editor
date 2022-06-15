import config from "./config3d.js";
import DrawInteractor3d from "./DrawInteractor3d.js";

export default class CreateEdgeInteractor3d extends DrawInteractor3d {
  constructor(editor, createFunc, fill) {
    super(editor);
    this.createFunc = createFunc;
    this.points = [];
    this.segments = [];
    this.nextPoint = null;
    this.fill = fill;
  }

  tearDown() {
    super.tearDown.call(this);
    this.points = [];
    this.segments = [];
    this.nextPoint = null;
  }

  createShape() {
    if (this.points.length > 1) {
      const shape = this.createFunc(this.points, this.segments);
      this.addData(shape)
    }
    this.editor.resetInteractionState();
    this.editor.pointsEditingMode = true
  }

  handle_mousedown(e) {
    this.handle_touchstart(e);
  }

  handle_touchstart(e) {
    ht.Default.preventDefault(e);
    if (ht.Default.isLeftButton(e)) {
      this.gv.setFocus(e);
      if (ht.Default.isDoubleClick(e)) {
        this.createShape();
      } else {
        const point = this.lp(e);
        if (this.points.length) {
          var t = this.points[this.points.length - 1];
          if (Math.abs(t.x - point.x) < .01 && Math.abs(t.y - point.y) < .01) return;
        }
        this.points.push(point);
        this.segments.push(this.nextPoint ? 2 : 1);
        this.nextPoint = this.lp(e);
        this.editor.rulerView.validateCanvas();
      }
    }
  }

  handle_mousemove(e) {
    if (this.nextPoint) {
      this.nextPoint = this.lp(e);
      this.editor.rulerView.validateCanvas();
    }
  }

  drawShape(g) {
    g.beginPath();
    let count = 0,
      start = undefined,
      control = undefined,
      end = undefined;
    for (let i = 0; i < this.segments.length; i++) {
      const segment = this.segments[i];
      if (segment === 1) {
        start = this.toPoint(this.points[count++]);
        g.moveTo(start.x, start.y);
      } else if (segment === 2) {
        start = this.toPoint(this.points[count++]);
        g.lineTo(start.x, start.y);
      } else if (segment === 3) {
        start = this.toPoint(this.points[count++]);
        control = this.toPoint(this.points[count++]);
        g.quadraticCurveTo(start.x, start.y, control.x, control.y)
      } else if (segment === 4) {
        start = this.toPoint(this.points[count++]);
        control = this.toPoint(this.points[count++]);
        end = this.toPoint(this.points[count++]);
        g.bezierCurveTo(start.x, 0, 0, control.x, control.y, end.x, end.y);
      } else if (segment === 5) {
        g.closePath();
      }
    }
    if (this.nextPoint) {
      const point = this.toPoint(this.nextPoint);
      g.lineTo(point.x, point.y)
    }
    g.strokeStyle = config.color_data_border;
    g.lineWidth = 1;
    g.stroke();
    if (this.fill) {
      g.fillStyle = config.color_transparent;
      g.fill();
    }
    this.drawPoints(g, this.points, 4, config.color_data_border, config.color_data_background);
  }
}
