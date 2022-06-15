import DataView from "../pane/DataView.js";

export default class DataView3d extends DataView {
  constructor(editor) {
    super(editor);
  }

  commit() {
    this.editor.reset(true);
    this.editor.dm.disableHistoryManager();
    this.editor.deserialize(this.content);
    this.editing = false;
    this.editor.dm.enableHistoryManager();
    this.editor.dm.clearHistoryManager();
  }

  updateContent() {
    if (this.visible && !this.editing) {
      this._updateContentLater = false;
      this.content = this.editor.serialize();
    }
  }

  updateUrl() {
    this.v("url", this.editor.url || "");
  }

  initTab() { }
}
