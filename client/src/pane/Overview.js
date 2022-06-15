import BaseOverview from "./BaseOverview.js";

export default class Overview extends BaseOverview {
  constructor(editor) {
    super();
    this.editor = editor;
  }
  
  initTab() {
    this.setGraphView(this.editor.gv)
  }
}