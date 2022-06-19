export default class DrawInteractor3d extends ht.graph.Interactor {
  constructor(editor) {
    super(editor.gv);
    this.editor = editor;
  }

  beginTransaction() {
    if(!this._isBeginTransaction) {
      this._isBeginTransaction = true;
      this.dm.beginTransaction();
    }
  }

  endTransaction() {
    if(this._isBeginTransaction) {
      this._isBeginTransaction = false;
      this.dm.endTransaction();
    }
  }

  getDataAt(e) {
    return this.gv.getDataAt(e);
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

  drawRect(g, rect, strokeStyle, fillStyle) {
    rect = this.toRect(rect);
    fillStyle && (g.fillStyle = fillStyle);
    strokeStyle && (g.strokeStyle = strokeStyle);
    g.lineWidth = 1;
    g.beginPath();
    g.rect(rect.x, rect.y, rect.width, rect.height);
    g.stroke(), fillStyle && g.fill();
    strokeStyle && g.stroke();
  }

  drawPoint(g, point, radius, strokeStyle, fillStyle) {
    const { x, y } = this.toPoint(point);
    fillStyle && (g.fillStyle = fillStyle);
    strokeStyle && (g.strokeStyle = strokeStyle);
    g.lineWidth = 1;
    g.beginPath();
    g.arc(x, y, radius, 0, 2 * Math.PI, true);
    fillStyle && g.fill();
    strokeStyle && g.stroke();
  }

  drawPoints(g, points, ...rest) {
    for (let i = 0; i < points.length; i++) {
      this.drawPoint(g, points[i], rest);
    }
  }

  drawLine(g, start, end, strokeStyle) {
    start = this.toPoint(start);
    end = this.toPoint(end);
    g.lineWidth = 1;
    g.strokeStyle = strokeStyle;
    g.beginPath();
    g.moveTo(start.x, start.y);
    g.lineTo(end.x, end.y);
    g.stroke()
  }

  toRect({ x, y, width, height }) {
    const zoom = this.zoom;
    return {
      x: x * zoom + this.tx,
      y: y * zoom + this.ty,
      width: width * zoom,
      height: height * zoom
    }
  }

  toPoint(point) {
    return { x: point.x * this.zoom + this.tx, y: point.y * this.zoom + this.ty }
  }

  addData(data) {
    this.editor.dm.add(data);
    this.editor.sm.ss(data);
    this.editor.gv.setFocus();
  }

  remove(data) {
    this.dm.remove(data);
  }

  lp(data) {
    return this.gv.lp(data);
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
}
