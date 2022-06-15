import { getString } from "../util/index.js";
import { renderUI, setProperty, updateBaseProperty, updateProperty } from "../util/type.js";

export default class ColumnChart extends ht.Node {
  constructor(prop, w, h) {
    super();
    this.setSize(100, 100);
    this.setImage("columnChart_image");
    this.s({
      "chart.label": false,
      "chart.label.color": ht.Default.labelColor,
      "chart.label.font": ht.Default.labelFont,
      "chart.series": [],
      "chart.min.value": 0,
      "chart.max.value": undefined
    });
    this.parse(prop, w, h);
  }

  getClass() {
    return ColumnChart;
  }

  toLabel() {
    return this.getDisplayName() || getString("editor.comptype.columnchart");
  }

  parse(prop, w, h) {
    if (prop) {
      setProperty(this, "chart.type", prop.type, undefined);
      setProperty(this, "chart.label", prop.label, false);
      setProperty(this, "chart.label.color", prop.labelColor, ht.Default.labelColor);
      setProperty(this, "chart.label.font", prop.labelFont, ht.Default.labelFont);
      setProperty(this, "chart.series", prop.series, []);
      setProperty(this, "chart.min.value", prop.minValue, 0);
      setProperty(this, "chart.max.value", prop.maxValue, undefined);
      renderUI(this, prop, w, h);
    }
  }

  toJSON() {
    const prop = {};
    updateProperty(this, prop, "chart.type", "type", undefined);
    updateProperty(this, prop, "chart.label", "label", false);
    updateProperty(this, prop, "chart.label.color", "labelColor", ht.Default.labelColor);
    updateProperty(this, prop, "chart.label.font", "labelFont", ht.Default.labelFont);
    updateProperty(this, prop, "chart.series", "series", []);
    updateProperty(this, prop, "chart.min.value", "minValue", 0);
    updateProperty(this, prop, "chart.max.value", "maxValue", undefined);
    updateBaseProperty(this, prop);
    return prop;
  }

  get compType() {
    return this.s("type");
  }
}
