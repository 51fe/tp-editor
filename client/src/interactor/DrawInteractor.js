export default class DrawInteractor extends ht.graph.Interactor {
  constructor(tab, clazz, type) {
    const editView = tab.getView();
    super(editView.graphView)
    this.tab = tab;
    this.editView = editView;
    this.editor = this.editView.editor;
    this.clazz = clazz;
    this.type = type;
    this._disabled = false;
  }

  beginTransaction() {
    if (!this._isBeginTransaction) {
      this._isBeginTransaction = true;
      this.dm.beginTransaction();
    }
  }

  endTransaction() {
    if (this._isBeginTransaction) {
      this._isBeginTransaction = false;
      this.dm.endTransaction()
    }
  }

  getDataAt(e, filter) {
    return this.gv.getDataAt(e, filter);
  }

  getNodeAt(e) {
    const data = this.getDataAt(e);
    return data instanceof ht.Node ? data : null;
  }

  setUp() {
    super.setUp();
    this.sm.cs();
  }

  drawShape() { }

  drawDiamond(g, point, strokeStyle, fillStyle, borderWidth = 4) {
    point = this.toPoint(point);
    fillStyle && (g.fillStyle = fillStyle);
    strokeStyle && (g.strokeStyle = strokeStyle);
    const p = point,
      x = p.x,
      y = p.y;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(x, y - borderWidth);
    g.lineTo(x + borderWidth, y);
    g.lineTo(x, y + borderWidth);
    g.lineTo(x - borderWidth, y);
    g.closePath();
    fillStyle && g.fill();
    strokeStyle && g.stroke();
  }

  drawRect(g, rect, strokeStyle, fillStyle) {
    rect = this.toRect(rect);
    fillStyle && (g.fillStyle = fillStyle);
    strokeStyle && (g.strokeStyle = strokeStyle);
    g.lineWidth = 1;
    g.beginPath();
    g.rect(rect.x, rect.y, rect.width, rect.height);
    g.stroke();
    fillStyle && g.fill();
    strokeStyle && g.stroke();
  }

  drawPoint(g, point, r, strokeStyle, fillStyle) {
    point = this.toPoint(point);
    fillStyle && (g.fillStyle = fillStyle);
    strokeStyle && (g.strokeStyle = strokeStyle);
    g.lineWidth = 1;
    g.beginPath();
    g.arc(point.x, point.y, r, 0, 2 * Math.PI, true);
    fillStyle && g.fill();
    strokeStyle && g.stroke()
  }

  drawPoints(g, points, r, strokeStyle, fillStyle) {
    for (let i = 0; i < points.length; i++) {
      this.drawPoint(g, points[i], r, strokeStyle, fillStyle);
    }
  }

  drawLine(g, p1, p2, strokeStyle) {
    p1 = this.toPoint(p1);
    p2 = this.toPoint(p2);
    g.lineWidth = 1;
    g.strokeStyle = strokeStyle;
    g.beginPath();
    g.moveTo(p1.x, p1.y);
    g.lineTo(p2.x, p2.y);
    g.stroke();
  }

  toRect(rect) {
    const ratio = this.zoom;
    return {
      x: rect.x * ratio + this.tx,
      y: rect.y * ratio + this.ty,
      width: rect.width * ratio,
      height: rect.height * ratio
    }
  }

  toPoint(point) {
    return {
      x: point.x * this.zoom + this.tx,
      y: point.y * this.zoom + this.ty
    }
  }

  add(data) {
    this.editView.addData(data);
  }

  remove(data) {
    this.dm.remove(data);
  }

  lp(e) {
    return this.gv.lp(e);
  }

  get dm() {
    return this.gv.dm();
  }

  get sm() {
    return this.gv.dm().sm();
  }

  get zoom() {
    return this.gv.getZoom();
  }

  get tx() {
    return this.gv.tx();
  }

  get ty() {
    return this.gv.ty();
  }

  get disabled() {
    return !this.editor.editable || this._disabled;
  }

  set disabled(value) {
    this._disabled = value;
  }
}
