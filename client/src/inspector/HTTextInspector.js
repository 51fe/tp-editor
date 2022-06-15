import { getString } from "../util/index.js";
import HTNodeInspector from "./HTNodeInspector.js";


export default class HTTextInspector extends HTNodeInspector {
  constructor(editor, name) {
    super(editor, name);
  }

  initForm() {
    this.addCustomProperties();
    this.addControlProperties();
    this.addLayoutProperties();
    this.addBasicProperties();
    this.addTextProperties();
    this.addSelectProperties()
  }

  addTextProperties() {
    this.addTitle("TitleText");
    this.addDBInput("s", getString("editor.content"), "text");
    this.addDBAlign("s", getString("editor.align"), "text.align");
    this.addDBVAlign("s", getString("editor.valign"), "text.vAlign");
    this.addDBColor("s", getString("editor.color"), "text.color");
    this.addDBFont("s", getString("editor.font"), "text.font");
    this.addDBCheckBox("s", getString("editor.shadow"), "text.shadow");
    this.addDBColor("s", getString("editor.shadowcolor"), "text.shadow.color");
    this.addDBInput("s", getString("editor.shadowblur"), "text.shadow.blur", "number", 1);
    this.addDBInput("s", getString("editor.shadowoffsetx"), "text.shadow.offset.x", "number", 1);
    this.addDBInput("s", getString("editor.shadowoffsety"), "text.shadow.offset.y", "number", 1)
  }
}
