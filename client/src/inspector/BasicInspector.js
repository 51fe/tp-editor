import { getString } from "../util/index.js";
import BaseInspector from "./BaseInspector.js";

export default class BasicInspector extends BaseInspector {
  constructor(editor, name) {
    super(editor, name)
  }

  initForm() {
    super.initForm();
    this.addBackgroundProperties();
    this.addBorderProperties();
    this.addDashProperties();
    this.addArcProperties()
  }

  invalidateProperties(e) {
    if (e?.property === "s:shape") {
      this.filterPropertiesLater();
      return false;
    }
    super.invalidateProperties(e)
  }

  isTitleVisible(row) {
    if (this.data) {
      const type = this.data.s("shape");
      if (row.title === "TitleArc" && type !== "arc") return false;
    }
    return super.isTitleVisible(row);
  }

  isPropertyVisible(row) {
    if (this.data) {
      const tag = row.items.tag;
      if(tag) {
        const shape = this.data.s("shape");
        if (tag === "shapeDepth" && shape !== "rect") return false;
        if (tag === "shapeCornerRadius" && shape !== "roundRect") return false;
        if (tag === "shapePolygonSide" && shape !== "polygon") return false;
      }
    }
    return super.isPropertyVisible(row);
  }

  addStyleType() {
    this.addStyleComboBox(getString("editor.type"), "shape", tpeditor.consts.shapes.slice(1),
      tpeditor.consts.shapeLabels.slice(1), tpeditor.consts.shapeIcons.slice(1), "type")
  }

  addBackgroundProperties() {
    this.addTitle("TitleBackground");
    this.addStyleColor(getString("editor.background"), "shape.background", "background");
    this.addStyleImage(getString("editor.repeatimage"), "shape.repeat.image", "repeatImage");
    this.addStyleGradient(getString("editor.gradient"), "shape.gradient", "shape.background", "shape.gradient.color", "gradient");
    this.addStyleColor(getString("editor.gradientcolor"), "shape.gradient.color", "gradientColor");
    this.addStyleZeroToOne(getString("editor.clippercentage"), "shape.fill.clip.percentage", "fillClipPercentage");
    this.addStyleComboBox(getString("editor.clipdirection"), "shape.fill.clip.direction", tpeditor.consts.clipDirections,
      tpeditor.consts.clipDirectionLabels, null, "fillClipDirection");
    this.addStyleInput(getString("editor.depth"), "shape.depth", "int", 1, "depth").items.tag = "shapeDepth"
  }

  addBorderProperties() {
    this.addTitle("TitleBorder");
    this.addStyleInput(getString("editor.width"), "shape.border.width", "number", 1, "borderWidth");
    this.addStyleCheckBox(getString("editor.widthabsolute"), "shape.border.width.absolute", "borderWidthAbsolute");
    this.addStyleColor(getString("editor.color"), "shape.border.color", "borderColor");
    this.addStylePattern(getString("editor.pattern"), "shape.border.pattern", "borderPattern");
    this.addStyleCheckBox(getString("editor.threed"), "shape.border.3d", "border3d");
    this.addStyleColor(getString("editor.threedcolor"), "shape.border.3d.color", "border3dColor");
    this.addStyleComboBox(getString("editor.cap"), "shape.border.cap", tpeditor.consts.caps, tpeditor.consts.capLabels, null, "borderCap");
    this.addStyleComboBox(getString("editor.join"), "shape.border.join", tpeditor.consts.joins, tpeditor.consts.joinLabels, null, "borderJoin");
    this.addStyleInput(getString("editor.radius"), "shape.corner.radius", "number", 1, "cornerRadius").items.tag = "shapeCornerRadius";
    this.addStyleInput(getString("editor.sides"), "shape.polygon.side", "int", 1, "polygonSide").items.tag = "shapePolygonSide"
  }

  addDashProperties() {
    this.addTitle("TitleDash"), this.addStyleCheckBox(getString("editor.dash"), "shape.dash", "dash");
    this.addStylePattern(getString("editor.pattern"), "shape.dash.pattern", "dashPattern");
    this.addStyleColor(getString("editor.color"), "shape.dash.color", "dashColor");
    this.addStyleInput(getString("editor.offset"), "shape.dash.offset", "number", 1, "dashOffset");
    this.addStyleInput(getString("editor.width"), "shape.dash.width", "number", 1, "dashWidth");
    this.addStyleCheckBox(getString("editor.threed"), "shape.dash.3d", "dash3d");
    this.addStyleColor(getString("editor.threedcolor"), "shape.dash.3d.color", "dash3dColor")
  }

  addArcProperties() {
    this.addTitle("TitleArc");
    this.addStyleCheckBox(getString("editor.arcoval"), "shape.arc.oval", "arcOval");
    this.addStyleCheckBox(getString("editor.closed"), "shape.arc.close", "arcClose");
    this.addStyleRotation(getString("editor.arcfrom"), "shape.arc.from", "arcFrom");
    this.addStyleRotation(getString("editor.arcto"), "shape.arc.to", "arcTo")
  }
}