import { getString } from "../util/index.js";
import HTNodeInspector from "./HTNodeInspector.js";


export default class HTGroupInspector extends HTNodeInspector {
  constructor(editor, name) {
    super(editor, name)
  }

  initForm() {
    this.addCustomProperties();
    this.addControlProperties();
    this.addLayoutProperties();
    this.addBasicProperties();
    this.addImageProperties();
    this.addGroupBasicProperties();
    this.addGroupProperties();
    this.addGroupBorderProperties();
    this.addShapeProperties();
    this.addLabelProperties();
    this.addNoteProperties();
    this.addSelectProperties()
  }

  invalidateProperties(e) {
    if (e?.property === "s:group.type" ){
      this.filterPropertiesLater();
      return false;
    }
    super.invalidateProperties(e);
  }

  isPropertyVisible(row) {
    if (this.data) {
      const tag = row?.items?.tag;
      if (tag === "groupDepth") {
        const type = this.data?.s("group.type");
        if (type !== "rect") return false
      }
    }
    return super.isPropertyVisible(row);
  }

  addGroupBasicProperties() {
    this.addTitle("TitleGroupBasic");
    this.addDBComboBox("s", getString("editor.type"), "group.type", [undefined, "rect", "oval", "circle", "roundRect"], ["", getString("editor.grouptype.rect"), getString("editor.grouptype.oval"), getString("editor.grouptype.circle"), getString("editor.grouptype.roundrect")]);
    this.addDBPosition("s", getString("editor.position"), "group.position");
    this.addDBColor("s", getString("editor.background"), "group.background");
    this.addDBGradient(getString("editor.gradient"), "group.gradient", "group.background", "group.gradient.color");
    this.addDBColor("s", getString("editor.gradientcolor"), "group.gradient.color");
    this.addDBImage("s", getString("editor.image"), "group.image");
    this.addDBStretch("s", getString("editor.stretch"), "group.image.stretch");
    this.addDBImage("s", getString("editor.repeatimage"), "group.repeat.image");
    this.addDBCheckBox("s", getString("editor.toggleable"), "group.toggleable");
    this.addDBCheckBox("p", getString("editor.expanded"), "expanded");
    this.addDBInput("s", getString("editor.depth"), "group.depth", "number", 1).items.tag = "groupDepth";
  }

  addGroupProperties() {
    this.addTitle("TitleGroupTitle");
    this.addDBLabel("s", getString("editor.content"), "label");
    this.addDBFont("s", getString("editor.font"), "group.title.font");
    this.addDBColor("s", getString("editor.color"), "group.title.color");
    this.addDBColor("s", getString("editor.background"), "group.title.background");
    this.addDBAlign("s", getString("editor.align"), "group.title.align");
    this.addDBOrientation("s", getString("editor.valuetype.orientation"), "group.title.orientation");
    this.addDBCheckBox("s", getString("editor.splitline"), "group.splitLine");
  }

  addGroupBorderProperties() {
    this.addTitle("TitleGroupBorder");
    this.addDBInput("s", getString("editor.width"), "group.border.width", "number", 1);
    this.addDBPattern("s", getString("editor.pattern"), "group.border.pattern");
    this.addDBColor("s", getString("editor.color"), "group.border.color");
    this.addDBComboBox("s", getString("editor.join"), "group.border.join", tpeditor.consts.joins, tpeditor.consts.joinLabels);
    this.addDBComboBox("s", getString("editor.cap"), "group.border.cap", tpeditor.consts.caps, tpeditor.consts.capLabels);
    this.addDBInput("s", getString("editor.radius"), "group.border.radius", "number", 1);
    this.addDBInput("s", getString("editor.padding"), "group.padding", "number", 1);
    this.addDBInput("s", getString("editor.paddingleft"), "group.padding.left", "number", 1);
    this.addDBInput("s", getString("editor.paddingright"), "group.padding.right", "number", 1);
    this.addDBInput("s", getString("editor.paddingtop"), "group.padding.top", "number", 1);
    this.addDBInput("s", getString("editor.paddingbottom"), "group.padding.bottom", "number", 1);
  }
}
