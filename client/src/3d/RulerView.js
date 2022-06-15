import { initContext, msClass } from "../util";
import config from "./config3d";

class RulerView {
  constructor(editor, gv) {
    this.editor = editor;
    this.gv = this.graphView = gv;
    this._rulerEnabled = true;
    this._view = ht.Default.createView(true, this);
    this.graphView.addViewListener(e => {
      "validate" === e.kind && this.validateCanvas()
    });
    this._hRuler = ht.Default.createCanvas();
    this._vRuler = ht.Default.createCanvas();
    this._view.appendChild(this._hRuler);
    this._view.appendChild(this._vRuler);
    this._view.appendChild(this.graphView.getView());
    this.graphView.addPropertyChangeListener(() => {
      this.iv();
    });
    this.dm.sm().addSelectionChangeListener(() => {
      this.iv();
    });
    this.dm.addDataModelChangeListener(() => {
      this.iv();
    });
    this.dm.addDataPropertyChangeListener(e => {
      this.handleDataPropertyChanged(e);
    });
    this.dm.addPropertyChangeListener(e => {
      this.handleDataModelPropertyChanged(e);
    });
    this.dm.addHierarchyChangeListener(() => {
      this.iv();
    });
    this.dm.layout = type => {
      if (!this._autoLayout) {
        this._autoLayout = new ht.layout.AutoLayout(this.graphView);
      }
      this._autoLayout.layout(type, () => {
        this.graphView.fitContent(true);
      })
    };
    this.graphView.setEditable(true);
    this.graphView.getInteractors().each(function (item) {
      item.keep = true
    });
    gv.getEditInteractor().alignmentGuideEnabled = true;
    tpeditor.EditView.prototype.initRuler.call(this);
  }

  handleDataPropertyChanged(e) {
    const map = {
      width: true,
      height: true,
      position: true,
      rotation: true,
      anchor: true,
      scale: true,
      expanded: true
    };
    map[e.property] && this.iv();
  }

  handleDataModelPropertyChanged() {
    tpeditor.EditView.prototype.redraw.apply(this, arguments);
  }

  onPropertyChanged() {
    this.iv();
  }

  addData(data) {
    this.dm.add(data)
    this.dm.sm().ss(data);
    this.graphView.setFocus();
  }

  validateCanvas() {
    const topCanvas = this.graphView._topCanvas;
    if (topCanvas) {
      const g = initContext(topCanvas);
      g.clearRect(0, 0, topCanvas.clientWidth, topCanvas.clientHeight);
      this.graphView.getInteractors().each(function (interactor) {
        interactor?.drawShape?.(g);
      });
      g.restore();
    }
  }


  redraw() {
    tpeditor.EditView.prototype.redraw.apply(this, arguments);
  }

  validateImpl() {
    tpeditor.EditView.prototype.validateImpl.apply(this, arguments);
  }

  drawVerticalText() {
    tpeditor.EditView.prototype.drawVerticalText.apply(this, arguments);
  }

  drawRuler() {
    tpeditor.EditView.prototype.drawRuler.apply(this, arguments);
  }

  updateAlignGuide() {
    tpeditor.EditView.prototype.updateAlignGuide.apply(this, arguments);
  }

  getGridGuide() {
    return tpeditor.EditView.prototype.getGridGuide.apply(this, arguments);
  }

  setRulerEnabled(enabled) {
    this.dm.a("rulerEnabled", enabled);
  }

  isRulerEnabled() {
    return this.dm.a("rulerEnabled");
  }

  get dm() {
    return this.graphView.dm();
  }
}

msClass(RulerView, {
  ms_v: 1,
  ms_fire: 1,
  ms_ac: ["rulerBackground", "rulerFont", "rulerColor", "rulerSize", "guideColor"],
  _rulerFont: config.smallFont,
  _rulerBackground: config.color_pane,
  _rulerColor: config.color_dark,
  _rulerSize: config.rulerSize,
  _guideColor: config.color_transparent,
  _interactionState: undefined
});

export default RulerView;
