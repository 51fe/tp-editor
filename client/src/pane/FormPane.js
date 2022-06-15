import config from "../config.js";

export default class FormPane extends ht.widget.FormPane {
  constructor(editor) {
    super(editor);
    this.getView().style.background = config.color_pane;
  }

  addLine() {
    this.addRow([], [.1], 1.01, { background: config.color_line });
  }
  addTitle(element) {
    const items = [{ element, font: config.boldFont }],
      params = { background: config.color_pane_dark };
    this.addRow(items, [.1], null, params)
  }
  getRowIndex(item) {
    return this.getRows().indexOf(item)
  }
}
