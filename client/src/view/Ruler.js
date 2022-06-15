import { getClientPoint, msClass, startDragging } from "../util/index.js";

class Ruler {
  constructor(canvas, editView, type) {
    this.canvas = canvas;
    this.editView = editView;
    this.type = type;
    this.gv = editView.graphView;
    this.hoverLine = null, this.setUp();
    this.garbageImage = ht.Default.toCanvas("Icons.ConnectGuideDeletingImage", 24, 24);
    this.ms_listener = 1;
  }

  getView() {
    return this.canvas;
  }

  setUp() {
    this.addListeners();
  }

  tearDown() {
    this.removeListeners();
    this.clear();
  }

  clear() { }

  setCursor(cursor) {
    ht.Default.isTouchable || (this.canvas.style.cursor = cursor);
  }

  checkHit(e) {
    const editView = this.editView,
      gv = this.gv,
      existList = this.existList,
      type = this.type,
      lp = gv.lp(e),
      scale = gv.getZoom();
    if (existList.length) {
      const _value = lp[type];
      let max = Number.MAX_SAFE_INTEGER,
        _prop = undefined;
      existList.forEach(prop => {
        let current = Math.abs(prop.value - _value);
        if (current < max) {
          _prop = prop;
          max = current;
        }
      });
      if (_prop && max < 6 / scale) {
        const point = this.getRoundLogicalPoint(e);
        this.setCursor("x" === type ? "ew-resize" : "ns-resize");
        point[type] = _prop.value;
        editView[this.hoverKey] = point;
        this.hoverLine = _prop;
        editView.drawRuler();
        editView.gv.redraw();
        return _prop;
      }
    }
    return null;
  }

  handle_touchmove(e) {
    this.handle_mousemove(e);
  }

  handle_mousemove(e) {
    if (this.editable && !this.editing && !ht.Default.isDragging()) {
      const editView = this.editView;
      if(!this.checkHit(e)) {
        delete this.hoverLine;
        this.setCursor("default");
        editView[this.hoverKey] = this.getRoundLogicalPoint(e);
        editView.drawRuler();
        editView.gv.redraw();
      }
    }
  }

  handle_touchstart(e) {
    this.handle_mousedown(e);
  }

  handle_mousedown(e) {
    if (this.editable) {
      ht.Default.preventDefault(e);
      if (this.checkHit(e)) {
        startDragging(this, e);
        ht.Default.preventDefault(e);
        this.editing = true;
        delete this.editView[this.hoverKey];
        this.editView.gv.redraw();
      } else {
        this.addGuide(this.getRoundLogicalPoint(e));
      }
    }
  }

  handle_mouseleave() {
    const editView = this.editView,
      hoverKey = this.hoverKey;
      if(!this.editing && !ht.Default.isDragging()) {
        if(editView[hoverKey]) {
          delete editView[hoverKey];
          editView.iv();
          this.editView.gv.redraw();
        }
        this.setCursor("default");
      }
  }

  handleWindowTouchMove(e) {
    this.handleWindowMouseMove(e);
  }

  handleWindowMouseMove(e) {
    let hoverLine = this.hoverLine,
      gv = this.gv,
      type = this.type,
      editView = this.editView,
      grid = this.grid,
      lp = gv.lp(e);
    if (grid) {
      const id = hoverLine.id,
        scale = gv.getZoom()
      if (scale > 5) {
        parseFloat(lp[type].toFixed(1))
      } else {
        Math.round(lp[type])
      }
      this.showGarbageTip(e);
      if (this._garbageAppended || this.editView[this.hoverKey]) {
        grid.adjustAlignmentGuide(id, scale);
        hoverLine.value = scale;
        editView.iv();
      }
    }
  }

  handleWindowMouseUp(e) {
    this.editing = false;
    const hoverLine = this.hoverLine,
      img = this.garbageImage,
      grid = this.grid,
      existList = this.existList;
    if (!this.containedInGv(e)) {
      grid.removeAlignmentGuide(hoverLine.id);
      const index = existList.indexOf(hoverLine);
      existList.splice(index, 1)
    }
    img.parentNode && img.parentNode.removeChild(img);
    delete this.editView[this.hoverKey];
    this.editView.iv();
    this.update();
  }

  showGarbageTip(e) {
    const editView = this.editView,
      hoverKey = this.hoverKey,
      img = this.garbageImage,
      _point = ht.Default.getClientPoint(e);
    if (this.containedInGv(e)) {
      img.parentNode && img.parentNode.removeChild(img);
      editView[hoverKey] = this.getRoundLogicalPoint(e);
    } else if (img.parentNode) {
      delete this._garbageAppended;
    } else {
      ht.Default.appendToScreen(img);
      this._garbageAppended = true;
    }
    img.style.left = _point.x + 10 + "px";
    img.style.top = _point.y + 10 + "px";
    delete editView[hoverKey];
  }

  containedInGv(e) {
    const gv = this.gv,
      type = this.type,
      rect = gv.getView().getBoundingClientRect(),
      x = rect.x,
      y = rect.y,
      width = rect.width,
      height = rect.height,
      center = { x: x + width / 2, y: y + height / 2 },
      point = getClientPoint(e);
    if (type === "x") {
      point.y = center.y
    } else {
      point.x = center.x;
    }
    return ht.Default.containsPoint(rect, point);
  }

  addGuide(e) {
    const type = this.type,
      grid = this.grid,
      value = e[type];
    if (grid) {
      const id = grid.addAlignmentGuide(type, value);
      this.editView.alignGuideMap[type].push({ id, value });
      this.update();
    }
  }

  getRoundLogicalPoint(e) {
    const lp = this.gv.lp(e);
    if (this.gv.getZoom() > 5) {
      lp.x = parseFloat(lp.x.toFixed(1));
      lp.y = parseFloat(lp.y.toFixed(1));
    } else {
      lp.x = Math.round(lp.x);
      lp.y = Math.round(lp.y);
    }
    return lp;
  }

  update() {
    this.editView.updateAlignGuide();
  }

  get grid() {
    return this.gv?.getEditInteractor()?.gridGuide ?? null;
  }

  get hoverKey() {
    return "hoverGuideLine" + this.type.toUpperCase();
  }

  get existList() {
    return this.editView.alignGuideMap[this.type];
  }

  get editable() {
    return this.editView.editable &&
      this.editView.dm.a("alignmentGuideEnabled");
  }
}

msClass(Ruler, { ms_listener: 1 });

export default Ruler;
