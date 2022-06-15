import config from "../config.js";
import TablePane from "../pane/TablePane.js";
import { clone, drawStretchImage, getFunc, getString, parseValue } from "../util/index.js";
import { nullToZero } from "../util/inspector.js";
import ChartInspector from "./ChartInspector.js";

export default class BaseChartInspector extends ChartInspector {
  constructor(editor, name) {
    super(editor, name)
  }

  initForm() {
    super.initForm();
    this.addSeriesChartProperties()
  }

  addSeriesChartProperties() {
    const items = [];
    let getLength = node => {
      const series = node.s("chart.series");
      return series ? series.length : 0
    };
    let setter = (node, len) => {
      if (len >= 0) {
        const series = node.s("chart.series"),
          cloned = series ? clone(series) : [],
          _series = parseValue(cloned);
        if (_series.length !== len) {
          _series.length = len;
          let count = undefined;
          for (let i = 0; i < len; i++) {
            if (!_series[i]) {
              _series[i] = {}
            }
            const serie = _series[i];
            if (!serie.values) {
              serie.values = [];
            }
            if (!serie.color) {
              serie.color = ht.Color.chart[i % ht.Color.chart.length]
            }
            const values = parseValue(serie.values);
            parseValue(serie.colors);
            i === 0 ? count = values.length : values.length = count;
            nullToZero(values);
          }
          node.s("chart.series", cloned)
        }
      }
    };
    this.addLabelInput(items, getString("editor.series"), getLength, setter, "int", 1);
    getLength = node => {
      const series = node.s("chart.series");
      if (series) {
        const serie = series[0];
        if (serie) {
          const values = parseValue(serie.values);
          return values?.length ?? 0;
        }
      }
      return 0;
    };
    setter = (node, length) => {
      if (length >= 0) {
        const series = node.s("chart.series"),
          cloned = series ? clone(series) : [],
          _series = parseValue(cloned);
        if (_series.length) {
          for (let i = 0; i < _series.length; i++) {
            if (!_series[i]) {
              _series[i] = {};
            }
            const serie = _series[i];
            if (!serie.values) {
              serie.values = [];
            }
            const values = parseValue(serie.values);
            if (values.length === length) return;
            if (!serie.color) {
              serie.color = ht.Color.chart[i % ht.Color.chart.length]
            }
            parseValue(serie.colors);
            values.length = length;
            nullToZero(values);
          }
          node.s("chart.series", cloned);
        }
      }
    };
    this.addLabelInput(items, getString("editor.length"), getLength, setter, "int", 1);
    this.addRow(items, this.w1w1).keys = { name: "chartSeries" };
    const sm = this.tableModel = new ht.DataModel,
      pane = this.tablePane = new TablePane(sm),
      tv = this.tableView = pane.getTableView();

    pane.getTableHeader().setMovable(false);
    tv.setEditable(true);
    tv.isEditable = () => {
      return this.editor.editable;
    };
    pane.getView().style.border = config.color_line + " solid 1px";
    const panes = [pane];
    this.addRow(panes, [.1], 160).keys = { name: "chartTable" };
    this.updateHandlers.push(() => {
      if (!panes.hidden && this.data) {
        sm.clear();
        tv.getColumnModel().clear();
        const series = this.data.s("chart.series");
        if (series) {
          for (let index = 0; index < series.length; index++) {
            const data = new ht.Data;
            data.serie = series[index];
            data.index = index;
            sm.add(data);
          }
        }
        pane.addColumns([{
          name: getString("editor.index"),
          width: 50,
          align: "center",
          sortable: false,
          clickable: false,
          valueType: "int",
          getValue(data) {
            return data.index;
          }
        }, {
          tag: "binding",
          name: getString("editor.colorbinding"),
          width: 50,
          align: "center",
          editable: true,
          sortable: false,
          clickable: false,
          isCellEditable: data => {
            const index = data.index,
              getter = () => {
                return getFunc(data.serie.color);
              },
              setter = func => {
                this.setValtue(node => {
                  const series = node.s("chart.series");
                  if (series) {
                    const cloned = clone(series),
                      _series = parseValue(cloned),
                      serie = _series[index];
                    if (serie) {
                      const color = parseValue(serie.color);
                      if (func) {
                        serie.color = { value: color, func };
                      } else {
                        serie.color = color;
                      }
                      node.s("chart.series", cloned);
                    }
                  }
                }, func);
              };
            this.editor.funcView.toggle(pane, "values", "values", this, getter, setter);
            return false;
          },
          drawCell: (g, data, selected, column, x, y, w, h, view) => {
            const _color = !!getFunc(data.serie.color);
            drawStretchImage(g,
              ht.Default.getImage(_color ? "editor.bind" : "editor.unbind"),
              "centerUniform", x, y, w, h, data, view,
              _color && !selected ? config.color_select : config.color_dark);
          }
        }, {
          name: getString("editor.color"),
          width: 50,
          align: "center",
          editable: true,
          sortable: false,
          clickable: false,
          valueType: "color",
          getValue: data => {
            return parseValue(data.serie.color);
          },
          setValue: (data, column, value) => {
            const index = data.index,
              color = parseValue(data.serie.color);
            if (value && color !== value) {
              const setter = (node, value) => {
                const series = node.s("chart.series");
                if (series) {
                  const cloned = clone(series),
                    _series = parseValue(cloned),
                    serie = _series[index];
                  if (serie) {
                    const func = getFunc(serie.color);
                    if (func) {
                      serie.color = { value, func };
                    } else {
                      serie.color = value;
                    }
                    node.s("chart.series", cloned)
                  }
                }
              };
              this.setValue(setter, value);
            }
          }
        }, {
          tag: "binding",
          name: getString("editor.valuebinding"),
          width: 50,
          align: "center",
          editable: true,
          sortable: false,
          clickable: false,
          isCellEditable: data => {
            const index = data.index,
              getter = () => {
                return getFunc(data.serie.values)
              },
              setter = func => {
                this.setValue(node => {
                  const series = node.s("chart.series");
                  if (series) {
                    const cloned = clone(series),
                      _series = parseValue(cloned),
                      serie = _series[index];
                    if (serie) {
                      const values = parseValue(serie.values);
                      if (func) {
                        serie.values = { value: values, func };
                      } else {
                        serie.values = values;
                      }
                      node.s("chart.series", cloned);
                    }
                  }
                }, func);
              };
            this.editor.funcView.toggle(pane, "values", "values", this, getter, setter);
            return false;
          },
          drawCell: (g, data, selected, column, x, y, w, h, view) => {
            const values = !!getFunc(data.serie.values);
            drawStretchImage(g,
              ht.Default.getImage(values ? "editor.bind" : "editor.unbind"),
              "centerUniform", x, y, w, h, data, view,
              values && !selected ? config.color_select : config.color_dark);
          }
        }]);
        if (series) {
          const serie = series[0];
          if (serie) {
            const values = parseValue(serie.values);
            if (values) {
              for (let i = 0; i < values.length; i++) {
                pane.addColumns([this.createChartIndexColumn(i)]);
              }
            }
          }
        }
      }
    })
  }

  createChartIndexColumn(index) {
    return {
      name: index,
      width: 50,
      align: "center",
      editable: true,
      sortable: false,
      clickable: false,
      valueType: "number",
      getValue: data => {
        const values = parseValue(data.serie.values);
        return values?.[index];
      },
      setValue: (data, column, value) => {
        const index = data.index,
          setter = (node, value) => {
            const series = node.s("chart.series");
            if (series) {
              const cloned = clone(series),
                _series = parseValue(cloned),
                serie = _series[index];
              if (serie) {
                const values = parseValue(serie.values);
                if (values?.[index] !== value) {
                  values[index] = value;
                  node.s("chart.series", cloned);
                }
              }
            }
          };
        this.setValue(setter, value);
      }
    }
  }
}
