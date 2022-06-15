import { getString } from "../util/index.js";
import { renderUI, setProperty, updateBaseProperty, updateProperty } from "../util/type.js";

export default class PieChart extends ht.Node {
  constructor(prop, w, h) {
    super();
    this.setSize(100, 100);
    this.setImage("pieChart_image");
    this.s({
      "chart.label": false,
      "chart.label.color": ht.Default.labelColor,
      "chart.label.font": ht.Default.labelFont,
      "chart.hollw": false,
      "chart.start.angle": 0,
      "chart.values": [],
      "chart.colors": undefined
    })
    this.parse(prop, w, h);
  }

  getClass() {
    return PieChart;
  }

  toLabel() {
    return this.getDisplayName() || getString("editor.comptype.piechart")
  }

  parse(prop, w, h) {
    if (prop) {
      setProperty(this, "chart.type", prop.type, "pieChart");
      setProperty(this, "chart.label", prop.label, false);
      setProperty(this, "chart.label.color", prop.labelColor, ht.Default.labelColor);
      setProperty(this, "chart.label.font", prop.labelFont, ht.Default.labelFont);
      setProperty(this, "chart.hollow", prop.hollow, false);
      setProperty(this, "chart.start.angle", prop.startAngle, 0);
      setProperty(this, "chart.values", prop.values, []);
      setProperty(this, "chart.colors", prop.colors, undefined);
      renderUI(this, prop, w, h);
    }
  }

  toJSON() {
    const prop = {};
    updateProperty(this, prop, "chart.type", "type", undefined);
    updateProperty(this, prop, "chart.label", "label", false);
    updateProperty(this, prop, "chart.label.color", "labelColor", ht.Default.labelColor);
    updateProperty(this, prop, "chart.label.font", "labelFont", ht.Default.labelFont);
    updateProperty(this, prop, "chart.hollow", "hollow", false);
    updateProperty(this, prop, "chart.start.angle", "startAngle", 0);
    updateProperty(this, prop, "chart.values", "values", []);
    updateProperty(this, prop, "chart.colors", "colors", undefined)
    updateBaseProperty(this, prop);
    return prop;
  }

  get compType() {
    return this.s("type");
  }
}