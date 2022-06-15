import BaseInspector from "./BaseInspector.js";

export default class ClipInspector extends BaseInspector {
  constructor(editor, name) {
    super(editor, name)
  }

  initForm() {
    this.addEditingPointProperties();
    this.addTitle("TitleBasic");
    this.addStyleType();
    this.addStyleName();
  }

  isTitleVisible(row) {
    if(row.title !== "TitleEditingPoint" || this.editor.pointsEditingMode){
      return super.isTitleVisible(row);
    }
    return false;
  }
}
