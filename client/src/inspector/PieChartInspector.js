import config from "../config.js";
import { drawStretchImage, getString } from "../util/index.js";
import { normalizeArray, nullToZero, raceColor } from "../util/inspector.js";
import TablePane from "../pane/TablePane.js";
import ChartInspector from "./ChartInspector.js";

export default class PieChartInspector extends ChartInspector {
  constructor(editor, name) {
    super(editor, name);
  }

  initForm() {
    super.initForm();
    this.addPieChartProperties();
  }

  addBasicChartProperties() {
    super.addBasicChartProperties();
    this.addStyleRotation(getString("editor.rotation"), "chart.start.angle", "startAngle");
    this.addStyleCheckBox(getString("editor.hollow"), "chart.hollow", "hollow")
  }

  createChartIndexColumn(index) {
    return {
      name: index,
      width: 50,
      align: "center",
      editable: true,
      sortable: false,
      clickable: false,
      getValueType: data => {
        return "chart.values" === data.getTag() ? "number" : "color"
      },
      getValue: data => {
        if (this.data) {
          const values = this.data.s(data.getTag());
          return values ? values[index] : undefined
        }
      },
      setValue: (data, column, value) => {
        const tag = data.getTag(),
          setter = (node, value) => {
            const values = normalizeArray(node.s(tag));
            values[index] = value;
            if (tag === "chart.values") {
              nullToZero(values);
            } else {
              raceColor(values);
            }
            node.s(tag, values);
          };
        this.setValue(setter, value)
      }
    }
  }

  addPieChartProperties() {
    const dm = this.tableModel = new ht.DataModel,
      pane = this.tablePane = new TablePane(dm),
      tv = this.tableView = pane.getTableView();
    pane.getTableHeader().setMovable(false);
    tv.setEditable(true);
    tv.isEditable = () => {
      return this.editor.editable
    };
    pane.getView().style.border = config.color_line + " solid 1px";
    const items = [pane];
    this.addRow(items, [.1], ht.Default.widgetRowHeight + 4 * tv.getRowHeight()).keys = { name: "chartTable" };
    const values = new ht.Data,
      colors = new ht.Data;
    values.setTag("chart.values");
    colors.setTag("chart.colors");
    dm.add(values);
    dm.add(colors);
    this.updateHandlers.push(() => {
      if (!items.hidden && this.data) {
        tv.getColumnModel().clear(), pane.addColumns([{
          name: getString("editor.length"),
          width: 50,
          align: "center",
          editable: true,
          sortable: false,
          clickable: false,
          valueType: "int",
          getValue: () => {
            if (!this.data) return 0;
            const values = this.data.s("chart.values");
            return values ? values.length : 0
          },
          setValue: (data, column, value) => {
            const setter = (data, index) => {
              if (index >= 0) {
                const values = normalizeArray(data.s("chart.values"), index);
                nullToZero(values);
                data.s("chart.values", values);
                const colors = normalizeArray(data.s("chart.colors"), index);
                raceColor(colors);
                data.s("chart.colors", colors);
              }
            };
            this.setValue(setter, value);
          }
        }, {
          tag: "binding",
          name: getString("editor.binding"),
          width: 50,
          align: "center",
          editable: true,
          sortable: false,
          clickable: false,
          isCellEditable: data => {
            let key = "colors";
            if (data.getTag() === "chart.values") {
              key = "values";
            }
            this.editor.funcView.toggle(pane, data.getTag(), key, this);
            return false;
          },
          drawCell: (g, data, selected, column, x, y, w, h, view) => {
            const bindable = !!this.data.a(data.getTag());
            drawStretchImage(g,
              ht.Default.getImage(bindable ? "editor.bind" : "editor.unbind"),
              "centerUniform", x, y, w, h, data, view,
              bindable && !selected ? config.color_select : config.color_dark);
          }
        }]);
        const values = this.data.s("chart.values"),
          length = values?.length ?? 0;
        for (let i = 0; i < length; i++) {
          pane.addColumns([this.createChartIndexColumn(i)]);
        }
      }
    })
  }
}
