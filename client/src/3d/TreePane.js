import DNDTree3d from "./DNDTree3d.js";

export default class TreePane extends ht.widget.BorderPane {
  constructor(editor) {
    super();
    this.editor = editor;
    this.tree = new DNDTree3d(editor);
    this.setCenterView(this.tree);
    this.controlPane = new ht.widget.FormPane;
    this.controlPane.addRow([{
      id: "filter",
      textField: {}
    }], [.1, ht.Default.isTouchable ? 32 : 18]);
    this.setBottomView(this.controlPane);
    this.setBottomHeight(ht.Default.widgetRowHeight + 8);
    let typing = false;
    const input = this.input = this.controlPane.getViewById("filter").getElement();
    input.addEventListener("compositionstart", () => {
      return typing = true;
    });
    input.addEventListener("compositionend", () => {
      return typing = false;
    });
    input.addEventListener("keyup", e => {
      if (!typing) {
        ht.Default.isEsc(e) && (input.value = "");
        this.tree.setFilter(input.value);
      }
    });
  }
}