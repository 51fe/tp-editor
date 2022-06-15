import { getString } from "../util/index.js";
import { renderUI, setProperty, updateBaseProperty, updateProperty } from "../util/type.js";

export default class LineChart extends ht.Node {
  constructor(prop, w, h) {
    super();
    this.setSize(100, 100);
    this.setImage("lineChart_image");
    this.s({
      "chart.label": false,
      "chart.label.color": ht.Default.labelColor,
      "chart.label.font": ht.Default.labelFont,
      "chart.series": [],
      "chart.min.value": 0,
      "chart.max.value": undefined,
      "chart.line.point": false,
      "chart.line.width": 2,
      "chart.line.3d": false
    });
    this.parse(prop, w, h);
  }

  getClass() {
    return LineChart;
  }

  toLabel() {
    return this.getDisplayName() || getString("editor.comptype.linechart");
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
      setProperty(this, "chart.line.point", prop.linePoint, false);
      setProperty(this, "chart.line.width", prop.lineWidth, 2);
      setProperty(this, "chart.line.3d", prop.line3d, false);
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
    updateProperty(this, prop, "chart.line.point", "linePoint", false);
    updateProperty(this, prop, "chart.line.width", "lineWidth", 2);
    updateProperty(this, prop, "chart.line.3d", "line3d", false);
    updateBaseProperty(this, prop);
    return prop;
  }

  get compType() {
    return this.s("type");
  }
}