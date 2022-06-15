import BaseInspector from "./BaseInspector.js";

export default class RestoreInspector extends BaseInspector {
  constructor(editor, name) {
    super(editor, name);
  }

  initForm() {
    this.addTitle("TitleBasic");
    this.addStyleType();
    this.addStyleName();
  }
}