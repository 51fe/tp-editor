import config from "../config.js";
import { isFunction, isLeftButton, isString, preventDefault } from "../util/index.js";
import DrawInteractor from "./DrawInteractor.js";

export default class CreateEdgeInteractor extends DrawInteractor {
  constructor(tab, clazz, type) {
    super(tab, clazz, type)
  }

  tearDown() {
    super.tearDown();
    this.draggingPoint = this.n1 = this.n2 = null
  }

  cancel() {
    if (this.n1) {
      this.draggingPoint = this.n1 = this.n2 = null;
      this.editView.validateCanvas();
    } else {
      this.editView.setState('edit');
    }
  }

  drawAttachPoints(g, node, index) {
    const points = this.gv.getAttachPoints(node);
    Array.isArray(points) && points.forEach((item, i) => {
      const x = item.x,
        y = item.y,
        offsetX = item.offsetX,
        offsetY = item.offsetY;
      if (i === index) {
        this.drawDiamond(g, node.getAttachPosition(x, y, offsetX, offsetY),
          config.color_select, config.color_select, 6)
      } else {
        this.drawDiamond(g, node.getAttachPosition(x, y, offsetX, offsetY),
          config.color_select, config.color_light)
      }
    })
  }

  drawCurve(g, point, strokeStyle) {
    const interactor = this.gv.getEditInteractor();
    if (!interactor) return null;
    const module = interactor.getSubModule('Curve');
    if (!module) return null;
    module.drawEdgeHostHighlight(g, point, strokeStyle);
    this.editView.validateCanvasLater();
  }

  drawShape(g) {
    if (this.n1) {
      if (this.n1 instanceof ht.Edge) {
        this.drawCurve(g, this.n1, this.edgePosition1)
      } else {
        this.drawRect(g, this.gv.getNodeRect(this.n1), config.color_data_border);
        this.drawAttachPoints(g, this.n1, this.attachIndex1);
      }
      if (this.draggingPoint) {
        let p1 = undefined,
          p2 = undefined;
        if (this.n1 instanceof ht.Edge) {
          p1 = this.edgePosition1.point
        } else if (this.attachIndex1 || this.attachIndex1 === 0) {
          p1 = this.getAttachPosition(this.n1, this.attachIndex1)
        } else {
          p1 = this.n1.p();
        }
        if (this.n2 instanceof ht.Edge) {
          p2 = this.edgePosition2.point;
        } else if (this.n2 && (this.attachIndex2 || this.attachIndex2 === 0)) {
          p2 = this.getAttachPosition(this.n2, this.attachIndex2);
        }
        this.drawLine(g, p1, p2 || this.draggingPoint, config.color_data_border);
      }

    }
    if (this.n2) {
      if (this.n2 instanceof ht.Edge) {
        this.drawCurve(g, this.n2, this.edgePosition2);
      } else {
        const rect = this.gv.getNodeRect(this.n2);
        if (this.n1 !== this.n2) {
          this.drawRect(g, rect, config.color_data_border);
          this.drawAttachPoints(g, this.n2, this.attachIndex2);
        }
        const p = this.toPoint({ x: rect.x, y: rect.y });
        g.beginPath();
        g.moveTo(p.x, p.y - 15 - 3);
        g.lineTo(p.x + 10, p.y - 15 - 3);
        g.lineTo(p.x + 10, p.y - 3);
        g.lineTo(p.x + 5, p.y - 7 - 3);
        g.moveTo(p.x + 10, p.y - 3);
        g.lineTo(p.x + 15, p.y - 7 - 3);
        g.lineWidth = 1;
        g.strokeStyle = config.color_data_border;
        g.stroke();
      }
    }
  }

  handle_mousemove(e) {
    preventDefault(e);
    if (!this.draggingPoint) {
      const node = this.getDataAt(e, item => {
        return this.gv.isSourceTargetEditable(null, item);
      });
      if (node instanceof ht.Edge) {
        this.edgePosition1 = this.gv.calculateEdgePosition(node, this.lp(e));
      } else {
        const index = this.attachIndex1;
        if (node) {
          const point = this.gv.calculateAttachPoint(node, this.lp(e));
          this.attachIndex1 = point ? point.index : null;
        } else {
          this.attachIndex1 = null;
        }
        if (node === this.n1 && index === this.attachIndex1) return;
      }
      this.n1 = node;
      this.editView.validateCanvas();
    }
  }

  handle_mousedown(e) {
    this.handle_touchstart(e);
  }

  handle_touchstart(e) {
    preventDefault(e);
    if (isLeftButton(e)) {
      this.gv.setFocus(e);
      if (!this.draggingPoint) {
        this.n1 = this.getDataAt(e, item => {
          return this.gv.isSourceTargetEditable(null, item)
        });
        if (this.n1) {
          this.draggingPoint = this.lp(e);
          this.startDragging(e);
        }
      }
    }
  }

  handleWindowMouseMove(e) {
    this.handleWindowTouchMove(e);
  }

  handleWindowMouseUp(e) {
    this.handleWindowTouchEnd(e);
  }

  handleWindowTouchMove(e) {
    const data = this.getDataAt(e, item => {
      return this.gv.isSourceTargetEditable(null, item, true)
    });
    this.draggingPoint = this.lp(e);
    this.autoScroll(e);
    if (config.edgeLoop || this.n1 !== data) {
      if (this.n2 = data, data) {
        if (data instanceof ht.Edge) {
          this.edgePosition2 = this.gv.calculateEdgePosition(data, this.lp(e));
        } else {
          const point = this.gv.calculateAttachPoint(data, this.lp(e));
          this.attachIndex2 = point ? point.index : null;
        }
      }
    } else {
      this.attachIndex2 = null;
      this.edgePosition2 = null;
    }
    this.editView.validateCanvas();
  }

  handleWindowTouchEnd() {
    if (this.n1 && this.n2) {
      let instance = undefined;
      if (isString(this.type)) {
        instance = new this.clazz(this.n1, this.n2);
        instance.s('edge.type', this.type)
      } else if (isFunction(this.type)) {
        instance = this.type(this.n1, this.n2);
      } else {
        instance = new this.clazz(this.n1, this.n2);
      }
      const p1 = this.getAttachPoint(this.n1, this.attachIndex1),
        p2 = this.getAttachPoint(this.n2, this.attachIndex2);
      if (this.n1 instanceof ht.Edge) {
        if (this.edgePosition1.index !== undefined) {
          instance.setStyle('edge.source.index', this.edgePosition1.index);
        } else if (this.edgePosition1.percent !== undefined) {
          instance.setStyle('edge.source.percent', this.edgePosition1.percent);
        }
      } else if (p1) {
        const point = p1,
          x = point.x,
          y = point.y,
          offsetX = point.offsetX,
          offsetY = point.offsetY;
        instance.s({
          'edge.source.anchor.x': x,
          'edge.source.anchor.y': y,
          'edge.source.offset.x': offsetX,
          'edge.source.offset.y': offsetY
        });
      }
      if (this.n2 instanceof ht.Edge) {
        if (this.edgePosition2.index !== undefined) {
          instance.setStyle('edge.target.index', this.edgePosition2.index)
        } else if (this.edgePosition2.percent !== undefined) {
          instance.setStyle('edge.target.percent', this.edgePosition2.percent);
        }
      } else if (p2) {
        const point = p2,
          x = point.x,
          y = point.y,
          offsetX = point.offsetX,
          offsetY = point.offsetY;
        instance.s({
          'edge.target.anchor.x': x,
          'edge.target.anchor.y': y,
          'edge.target.offset.x': offsetX,
          'edge.target.offset.y': offsetY
        });
      }
      if (p1 || p2) {
        instance.s('edge.offset', 0)
      }
      this.add(instance);
      if (!config.continuousCreating) {
        this.editView.setState('edit');
      }
    }
    this.draggingPoint = this.n1 = this.n2 = null;
    this.editView.validateCanvas();
  }

  getAttachPoint(node, index) {
    if (index === null || index === undefined) return null;
    const points = this.gv.getAttachPoints(node);
    return points && points.length >= 0 ? points[index] : null
  }

  getAttachPosition(node, index) {
    const point = this.getAttachPoint(node, index),
      x = point.x,
      y = point.y,
      offsetX = point.offsetX,
      offsetY = point.offsetY;
    return node.getAttachPosition(x, y, offsetX, offsetY)
  }
}
