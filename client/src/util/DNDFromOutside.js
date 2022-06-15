export default class DNDFromOutside {
  constructor(editor, target) {
    this.editor = editor;
    this.dnd = editor.dnd;
    this._dragInfo = { view: this };
    if (target) {
      target.addEventListener("dragenter", this.handle_dragenter.bind(this), false);
      target.addEventListener("dragover", this.handle_dragover.bind(this), false);
      target.addEventListener("dragleave", this.handle_dragleave.bind(this), false);
      target.addEventListener("drop", this.handle_drop.bind(this), false);
      target.addEventListener("dragexit", this.handle_dragexit.bind(this), false);
      target.addEventListener("dragend", this.handle_dragend.bind(this), false);
    }

    this.isDroppableToDisplayView = true;
    this.isDroppableToSymbolView = true;
    this.isDroppableToSceneView = true;
  }


  handle_dragenter(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dnd.crossDrag(e, this._dragInfo);
  }

  handle_dragover(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dnd.crossDrag(e, this._dragInfo);
  }

  handle_dragleave(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dnd.crossCancel(e, this._dragInfo);
  }

  handle_dragexit(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dnd.crossCancel(e, this._dragInfo);
  }

  handle_dragend(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dnd.crossCancel(e, this._dragInfo);
  }

  handle_drop(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dnd.crossDrop(e, this._dragInfo);
  }
}