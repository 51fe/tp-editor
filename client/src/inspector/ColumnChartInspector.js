import { getString } from "../util/index.js";
import BaseChartInspector from "./BaseChartInspector.js";

export default class ColumnChartInspector extends BaseChartInspector {
  constructor(editor, name) {
    super(editor, name);
  }

  addBasicChartProperties() {
    super.addBasicChartProperties();
    this.addStyleComboBox(getString("editor.type"), "chart.type",
      tpeditor.consts.columnChartTypes, tpeditor.consts.columnChartTypeLabels, null, "type");
  }

  addStyleType() { }
}
