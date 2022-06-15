import config from "../config.js";
import { getString, drawStretchImage, parseValue, clone, getFunc } from "../util/index.js";
import ChartInspector from "./ChartInspector.js";
import TablePane from "../pane/TablePane.js";
import { nullToZero, raceColor } from "../util/inspector.js";

export default class OneDimensionalColumnChartInspector extends ChartInspector {
  constructor(editor, name) {
    super(editor, name)
  }

  initForm() {
    super.initForm();
    this.addOneDimensionalProperties();
  }

  createChartIndexColumn(index) {
    return {
      name: index,
      width: 50,
      align: "center",
      editable: true,
      sortable: false,
      clickable: false,
      getValueType: (data) => {
        return data.getTag() === "values" ? "number" : "color"
      },
      getValue: data => {
        if (this.data) {
          const series = parseValue(this.data.s("chart.series"));
          if (series && series[0]) {
            const serie = parseValue(series[0][data.getTag()]);
            return serie ? serie[index] : undefined
          }
        }
      },
      setValue: (data, column, value) => {
        const tag = data.getTag(),
          setter = (node, value) => {
            const series = node.s("chart.series");
            if (series) {
              const cloned = clone(series),
                _series = parseValue(cloned),
                serie = _series[0];
              if (serie) {
                const values = parseValue(serie[tag]);
                if (values?.[index] !== value) {
                  values[index] = value;
                  if (tag === "values") {
                    nullToZero(values);
                  } else {
                    raceColor(values);
                  }
                  node.s("chart.series", cloned);
                }
              }
            }
          };
        this.setValue(setter, value);
      }
    }
  }

  addOneDimensionalProperties() {
    function getSerie(data, tag) {
      if (!data.s("chart.series")) {
        data.s("chart.series", []);
      }
      const series = data.s("chart.series"),
        serie = series[0];
      setSerie(serie);
      return serie[tag];
    }

    function setSerie(serie = {}) {
      if (!serie.values) {
        serie.values = [];
      }
      if (!serie.colors) {
        serie.colors = [];
      }
    }

    const dm = this.tableModel = new ht.DataModel,
      pane = this.tablePane = new TablePane(dm),
      tv = this.tableView = pane.getTableView();
    pane.getTableHeader().setMovable(false);
    tv.setEditable(true);
    tv.isEditable = () => {
      return this.editor.editable
    };
    pane.getView().style.border = config.color_line + " solid 1px";
    const panes = [pane];
    this.addRow(panes, [.1], ht.Default.widgetRowHeight + 4 * tv.getRowHeight()).keys = { name: "chartTable" };
    const values = new ht.Data,
      colors = new ht.Data;
    values.setTag("values");
    colors.setTag("colors");
    dm.add(values);
    dm.add(colors);
    this.updateHandlers.push(() => {
      if (!panes.hidden && this.data) {
        tv.getColumnModel().clear();
        pane.addColumns([{
          name: getString("editor.length"),
          width: 50,
          align: "center",
          editable: true,
          sortable: false,
          clickable: false,
          valueType: "int",
          getValue: () => {
            if (!this.data) return 0;
            const series = parseValue(this.data.s("chart.series"));
            if (!series) return 0;
            if (!series[0]) return 0;
            const values = parseValue(series[0].values);
            return values ? values.length : 0;
          },
          setValue: (data, column, value) => {
            const setter = (node, length) => {
              if (length >= 0) {
                const series = node.s("chart.series"),
                  cloned = series ? clone(series) : [],
                  _series = parseValue(cloned),
                  serie = _series[0];
                setSerie(serie);
                const values = parseValue(serie.values),
                  colors = parseValue(serie.colors);
                if (!(values.length === length && colors.length === length)) {
                  values.length = length;
                  colors.length = length;
                  nullToZero(values);
                  raceColor(colors);
                  node.s("chart.series", cloned);
                }
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
            const tag = data.getTag(),
              getter = () => {
                return getFunc(getSerie(this.data, tag));
              },
              setter = func => {
                this.setValue(node => {
                  const series = node.s("chart.series");
                  if (series) {
                    const cloned = clone(series),
                      _series = parseValue(cloned),
                      serie = _series[0];
                    if (serie) {
                      const value = parseValue(serie[tag]);
                      if (func) {
                        serie[tag] = { value, func };
                      } else {
                        serie[tag] = value;
                      }
                      node.s("chart.series", cloned);
                    }
                  }
                }, func);
              };
            this.editor.funcView.toggle(pane, tag, tag, this, getter, setter);
            return false;
          },
          drawCell: (g, data, selected, column, x, y, w, h, view) => {
            const _color = !!getFunc(getSerie(this.data, data.getTag()));
            drawStretchImage(g,
              ht.Default.getImage(_color ? "editor.bind" : "editor.unbind"),
              "centerUniform", x, y, w, h, data, view,
              _color && !selected ? config.color_select : config.color_dark);
          }
        }]);
        const values = parseValue(getSerie(this.data, "values")),
          length = values?.length ?? 0;
        for (let i = 0; i < length; i++) {
          pane.addColumns([this.createChartIndexColumn(i)]);
        }
      }
    })
  }
}
