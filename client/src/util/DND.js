import { getTargetElement, getPagePoint, removeHTML, createDiv } from "./index.js";

export default class DND {
  constructor(editor) {
    this.editor = editor;
  }

  showTip(text, e) {
    this.tip.innerHTML = text
    if (this.tip.parentNode !== document.body) {
      ht.Default.appendToScreen(this.tip);
    }
    const point = getPagePoint(e);
    this.tip.style.left = point.x + 15 + "px";
    this.tip.style.top = point.y + "px";
  }

  hideTip() {
    removeHTML(this.tip);
  }

  clearDropView(e, info) {
    if (this._dropView) {
      this._dropView.handleCrossDrag(e, "exit", info);
      this._dropView = null;
    }
  }

  crossDrag(e, info) {
    const dropView = this._dropView,
    target = this.getTargetView(e, info);
    if(dropView !== target) {
      dropView?.handleCrossDrag(e, "exit", info);
      target?.handleCrossDrag(e, "enter", info);
    } else if(target) {
      target.handleCrossDrag(e, "over", info);
    }
    this._dropView = target;
  }

  crossDrop(e, info) {
    if (this._dropView) {
      this._dropView.handleCrossDrag(e, "drop", info);
      this._dropView = null;
    }
  }

  crossCancel(e, info) {
    if (this._dropView) {
      this._dropView.handleCrossDrag(e, "cancel", info)
      this._dropView = null;
    }
  }

  getTargetView(e, info) {
    let data = getTargetElement(e);
    while (data && (!data._ht || !data._ht.isDroppable || info && !data._ht.isDroppable(e, info))){
      data = data.parentNode;
    }
    return data ? data._ht : null;
  }

  get tip() {
    if (!this._tip) {
      this._tip = createDiv();
      this._tip.className = "ht-editor-dnd-tip";
      let style = this._tip.style;
      style.whiteSpace = "nowrap";
      style.color = tpeditor.config.color_light;
      style.background = tpeditor.config.color_transparent;
      style.font = ht.Default.labelFont;
      style.padding = "4px";
      style.borderRadius = "4px";
      style.position = "absolute";
      style.zIndex = 10000;
    }
    return this._tip;
  }
}
