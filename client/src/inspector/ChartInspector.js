import { getString } from "../util/index.js";
import BaseInspector from "./BaseInspector.js";

export default class ChartInspector extends BaseInspector {
  constructor(editor, name) {
    super(editor, name)
  }

  initForm() {
    super.initForm(),
    this.addBasicChartProperties();
  }

  addBasicChartProperties() {
    this.addTitle("TitleChart");
    this.addStyleCheckBox(getString("editor.text"), "chart.label", "label");
    this.addStyleColor(getString("editor.color"), "chart.label.color", "labelColor");
    this.addStyleFont(getString("editor.font"), "chart.label.font", "labelFont");
  }
}
