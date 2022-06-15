import config from "../config.js";
import { getDistance, isDoubleClick, isFunction, isLeftButton, preventDefault } from "../util/index.js";
import DrawInteractor from "./DrawInteractor.js";

export default class CreateShapeInteractor extends DrawInteractor {
  constructor(tab, clazz, type, fill) {
    super(tab, clazz, type)
    this.fill = fill;
  }

  setUp() {
    super.setUp();
    this.shapeHelper.reset();
  }

  tearDown() {
    super.tearDown()
  }

  cancel() {
    const helper = this.shapeHelper;
    if (!helper.isEditing3d()) {
      if (helper.isBreak) {
        this.createShape()
      } else {
        helper.preCtrl = null;
        helper.isBreak = true;
        this.editView.validateCanvas();
      }
    }
  }

  createShape() {
    const helper = this.shapeHelper,
      points = helper.points,
      segments = helper.segments,
      closePath = helper.closePath;
    if (points.length > 1) {
      let shape = undefined;
      if (isFunction(this.type)) {
        shape = this.type(points, segments);
      } else {
        shape = new this.clazz;
        shape.setPoints(points);
        shape.setSegments(segments);
      }
      if (closePath && shape.setClosePath) {
        shape.setClosePath(true);
      }
      this.add(shape);
    }
    this.editView.setState('edit');
    this.editor.pointsEditingMode = true;
  }

  handle_mousedown(e) {
    this.handle_touchstart(e)
  }

  isCloseStart(p) {
    const points = this.shapeHelper.points,
      point = points[0];
    return !!point && getDistance(point, this.lp(p)) < 5 / this.gv.getZoom();
  }

  handle_touchstart(e) {
    this.shapeHelper.setEditing3d(false);
    const shapeHelper = this.shapeHelper,
      { points, segments, isBreak, preCtrl } = shapeHelper;
    preventDefault(e);
    if (isLeftButton(e)) {
      this.gv.setFocus(e);
      if (isDoubleClick(e)) {
        this.createShape();
      } else {
        if (this.isCloseStart(e)) {
          this.shapeHelper.closePath = true;
          this.createShape();
          return;
        }
        const p1 = this.judgeNextPoint(e, true);
        if (points.length) {
          const p2 = points[points.length - 1];
          if (Math.abs(p2.x - p1.x) < .01 && Math.abs(p2.y - p1.y) < .01) return;
        }
        if (preCtrl) {
          points.push(preCtrl);
          points.push(p1);
          points.push(p1);
          segments.push(4);
          this.shapeHelper.preCtrl = null;
        } else if (isBreak) {
          segments.push(1);
          this.shapeHelper.isBreak = false;
        } else {
          segments.push(points.length > 0 ? 2 : 1);
          points.push(p1);
        }
        this.shapeHelper.nextPoint = this.lp(e);
        this.editView.validateCanvas();
      }
      this.shapeHelper.downPoint = this.lp(e);
      this.startDragging(e);
      this._dragging = true;
    }
  }

  judgeNextPoint(e, isClose) {
    const shapeHelper = this.shapeHelper,
      points = shapeHelper.points,
      isBreak = shapeHelper.isBreak,
      lp = this.lp(e);
    if (this._dragging || isBreak && !isClose) {
      return null;
    }
    if (ht.Default.isShiftDown() && points.length > 0) {
      const point = points[points.length - 1],
        x = lp.x - point.x,
        y = lp.y - point.y,
        distance = ht.Default.getDistance(point, lp),
        a = angle % (Math.PI / 4);
      let angle = Math.atan2(y, x);
      angle -= a;
      if (Math.abs(a) > Math.PI / 8) {
        if (a > 0) {
          angle += Math.PI / 4;
        } else {
          angle -= Math.PI / 4;
        }
      }
      return {
        x: point.x + Math.cos(angle) * distance,
        y: point.y + Math.sin(angle) * distance
      }
    }
    const interactor = this.gv.getEditInteractor(),
      grid = interactor.gridGuide.findClosest(lp);
    if (grid) {
      grid.x && (lp.x += grid.x);
      grid.y && (lp.y += grid.y);
    }
    return lp;
  }

  handle_mousemove(e) {
    this.shapeHelper.nextPoint = this.judgeNextPoint(e);
    this.editView.validateCanvas();
  }

  handle_touchend() {
  }

  handle_mouseup(e) {
    this.handle_touchend(e);
  }

  handleWindowTouchMove(e) {
    return this.handleWindowMouseMove(e);
  }

  updateCtrl(e) {
    const shapeHelper = this.shapeHelper,
      points = shapeHelper.points,
      segments = shapeHelper.segments,
      downPoint = shapeHelper.downPoint,
      len = points.length,
      point = points[len - 1],
      lp = this.lp(e),
      ratio = this.gv.getZoom(),
      distance = ht.Default.getDistance(downPoint, lp),
      segment = segments[segments.length - 1];
    if (distance * ratio > 5) {
      if (ht.Default.isShiftDown()) {
        const abs = Math.abs;
        if (abs(point.x - lp.x) >= abs(point.y - lp.y)) {
          lp.y = point.y;
        } else {
          lp.x = point.x;
        }
      } else {
        const interactor = this.gv.getEditInteractor(),
          grid = interactor.gridGuide.findClosest(lp);
        if (grid) {
          grid.x && (lp.x += grid.x);
          grid.y && (lp.y += grid.y);
        }
      }
      const p = {
        x: 2 * point.x - lp.x,
        y: 2 * point.y - lp.y
      };
      if (segment === 4) {
        points[len - 2] = p;
      } else if (segment !== 1) {
        segments.pop();
        segments.push(4);
        points.splice(len - 1, 0, p);
        points.push(points[len - 1]);
      }
      this.shapeHelper.preCtrl = lp;
    } else if (segment === 4) {
      points[len - 2] = points[len - 1];
      this.shapeHelper.preCtrl = null;
    }
  }

  handleWindowMouseMove(e) {
    if (this.shapeHelper.points.length !== 0) {
      this.updateCtrl(e);
      this.editView.validateCanvas();
    }
  }

  handleWindowTouchEnd(e) {
    return this.handleWindowMouseUp(e)
  }

  handleWindowMouseUp(e) {
    if (this.shapeHelper.points.length !== 0) {
      this._dragging = false;
      this.updateCtrl(e);
      this.shapeHelper.nextPoint = this.judgeNextPoint(e, true);
    }
  }

  drawShape(g) {
    const shapeHelper = this.shapeHelper,
      points = shapeHelper.points,
      segments = shapeHelper.segments,
      downPoint = (shapeHelper.isBreak, shapeHelper.preCtrl),
      nextPoint = (shapeHelper.downPoint, shapeHelper.nextPoint),
      items = [];
    g.beginPath();
    let index = 0,
      p1 = undefined,
      p2 = undefined,
      p3 = undefined;
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (segment === 1) {
        p1 = this.toPoint(points[index++]);
        g.moveTo(p1.x, p1.y);
      } else if (segment === 2) {
        p1 = this.toPoint(points[index++]);
        g.lineTo(p1.x, p1.y)
      } else if (segment === 3) {
        p1 = this.toPoint(points[index++]);
        p2 = this.toPoint(points[index++]);
        g.quadraticCurveTo(p1.x, p1.y, p2.x, p2.y)
      } else if (segment === 4) {
        p1 = this.toPoint(points[index++]);
        p2 = this.toPoint(points[index++]);
        p3 = this.toPoint(points[index++]);
        g.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
      } else if (segment === 5) {
        g.closePath();
      }
      items.push(points[index - 1]);
    }
    if (nextPoint) {
      if (downPoint) {
        p1 = this.toPoint(downPoint);
        p2 = this.toPoint(nextPoint);
        p3 = this.toPoint(nextPoint);
        g.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
      } else {
        const point = this.toPoint(nextPoint);
        g.lineTo(point.x, point.y)
      }
      g.strokeStyle = config.color_data_border;
      g.lineWidth = 1;
      g.stroke();
      if (this.fill) {
        g.fillStyle = config.color_transparent;
        g.fill();
      }
      this.drawPoints(g, items, 4, config.color_data_border, config.color_data_background);
      if (downPoint) {
        const lp = points[points.length - 1],
          ratio = this.gv.getZoom(),
          width = 3 / ratio,
          height = 6 / ratio,
          point = {
            x: 2 * lp.x - downPoint.x,
            y: 2 * lp.y - downPoint.y
          };
        this.drawLine(g, downPoint, point, config.color_data_border);
        this.drawRect(g, {
          x: point.x - width,
          y: point.y - width,
          width: height,
          height
        }, config.color_data_border, config.color_data_background);
        this.drawRect(g, {
          x: downPoint.x - width,
          y: downPoint.y - width,
          width: height,
          height
        }, config.color_data_border, config.color_data_background);
      }
    }
  }

  get shapeHelper() {
    return this.editor.shapeHelper;
  }
}



