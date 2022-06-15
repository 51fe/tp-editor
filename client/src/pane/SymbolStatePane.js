import config from "../config.js";
import { getString, useI18Param } from "../util/index.js";
import FormPane from "./FormPane.js";
import TablePane from "./TablePane.js";

export default class SymbolStatePane extends FormPane {
  constructor(editor) {
    super();
    this.editor = editor;
    this.symbolViewUpdating = false;
    const dm = this.tableModel = new ht.DataModel,
      pane = this.tablePane = new TablePane(dm),
      tv = this.tableView = pane.getTableView();
    dm.mm(this.handleUpdate, this);
    dm.md(this.handleTableDataPropertyChange, this);
    dm.sm().setSelectionMode("single");
    tv.isEditable = () => {
      return editor.editable
    };
    pane.addColumns([{
      name: "stateName",
      displayName: getString("editor.state"),
      accessType: "attr",
      editable: true,
      valueType: "string",
      tag: "stateName"
    }, {
      name: "stateDisplayName",
      displayName: getString("editor.name"),
      accessType: "attr",
      editable: true,
      valueType: "string",
      tag: "stateDisplayName"
    }, {
      name: "isDefault",
      displayName: getString("editor.default"),
      accessType: "attr",
      valueType: "boolean",
      editable: true,
      width: 48,
      setValue: node => {
        this.setDefaultState(node.a("stateName"))
      }
    }]);
    pane.addViewListener(e => {
      if (e.kind === "beginValidate") {
        const cm = pane.getColumnModel(),
          w = pane.getWidth(),
          _w = (w - 80) / 2;
        cm.getDataByTag("stateName").setWidth(_w);
        cm.getDataByTag("stateDisplayName").setWidth(_w)
      }
    });
    this.addRow([this.tablePane], [.1], .1);
    this.addRow([
      {
        button: {
          icon: "editor.add",
          toolTip: getString("editor.add"),
          onClicked: () => {
            if (this.editor.editable) {
              const p = this.addState(null, null, false, true);
              this.tableModel.sm().ss(p)
            }
          }
        }
      }, {
        button: {
          icon: "editor.delete",
          toolTip: getString("editor.delete"),
          onClicked: () => {
            this.editor.editable && this.removeState()
          }
        }
      }, null, {
        button: {
          icon: "editor.top",
          toolTip: getString("editor.bringtofront"),
          onClicked: () => {
            if (this.editor.editable && this.tableView.sm().size()) {
              this.tableModel.moveSelectionToTop();
            }
          }
        }
      }, {
        button: {
          icon: "editor.up",
          toolTip: getString("editor.bringforward"),
          onClicked: () => {
            if (this.editor.editable && this.tableView.sm().size()) {
              this.tableModel.moveSelectionUp();
            }
          }
        }
      }, {
        button: {
          icon: "editor.down",
          toolTip: getString("editor.sendbackward"),
          onClicked: () => {
            if (this.editor.editable && this.tableView.sm().size()) {
              this.tableModel.moveSelectionDown();
            }
          }
        }
      }, {
        button: {
          icon: "editor.bottom",
          toolTip: getString("editor.sendtoback"),
          onClicked: () => {
            if (this.editor.editable && this.tableView.sm().size()) {
              this.tableModel.moveSelectionToBottom();
            }
          }
        }
      }], [20, 20, .1, 20, 20, 20, 20]);
    dm.sm().ms(() => {
      this.editor.gv.iv();
      this.editor.rightBottomTabView.iv();
    });
    this._index = 0;
  }

  handleUpdate() {
    if (!this.updatingClear) {
      const stateEnum = [];
      let state = undefined;
      this.tableModel.each(data => {
        const stateValue = data.a("stateName"),
          name = data.a("stateDisplayName"),
          _enum = {};
        data.a("isDefault") && (state = stateValue);
        _enum.value = stateValue;
        name && (_enum.label = name);
        stateEnum.push(_enum);
      });
      this.isSettingState = true;
      this.editor.dm.a({
        stateEnum,
        state
      });
      this.editor.inspector.filterPropertiesLater();
      this.editor.inspector.updateProperties();
      this.isSettingState = false;
    }
  }

  handleTableDataPropertyChange(e) {
    if ("a:stateName" !== e.property || this.renameRollback) {
      this.handleUpdate();
    } else {
      const oldValue = e.oldValue,
        newValue = e.newValue;
      if (this.isStateExist(newValue, e.data)) {
        this.editor.showMessage(getString("editor.statenameexist"), "error");
        this.renameRollback = true;
        e.data.a("stateName", oldValue);
        this.renameRollback = false
      } else if (newValue) {
        this.editor.dm.each(data => {
          oldValue === data.s("state") && data.s("state", newValue)
        });
        this.handleUpdate();
        this.editor.rightBottomTabView.iv();
      } else {
        this.editor.showMessage(getString("editor.statenameempty"), "error");
        this.renameRollback = true, e.data.a("stateName", oldValue);
        this.renameRollback = false;
      }
    }
  }

  addState(stateName, stateDisplayName, isDefault = false) {
    const currentState = this.currentState,
      dm = this.tableView.dm(),
      data = new ht.Data;
    if (!stateName) {
      while (this.isStateExist("state" + this._index)) {
        this._index++;
      }
      stateName = "state" + this._index
    } data.a({
      stateName,
      isDefault,
      stateDisplayName: stateDisplayName
    });
    dm.add(data);
    isDefault && dm.sm().ss(data);
    if (isDefault && config.isCopyCompsWhenNewState && currentState) {
      const list = this.dataModel.toDatas(data => {
        return data.s("state") === currentState
      });
      if (list.size()) {
        const sm = this.dataModel.sm();
        sm.cs();
        list.each(item => {
          sm.as(item)
        });
        this.editor.copy();
        this.editor.paste(true);
        sm.each(r => {
          r.s("state", stateName)
        })
      }
    }
    return data;
  }

  removeState() {
    const ld = this.tableModel.sm().ld();
    if (ld) {
      const stateName = ld.a("stateName"),
        dm = this.editor.dm,
        list = dm.toDatas(data => {
          return stateName === data.s("state")
        }),
        size = list.size();
      if (size) {
        this.editor.showConfirm(undefined,
          useI18Param(getString("editor.retaincompafterdelete"), stateName),
          () => {
            list.each(function (p) {
              p.s("state", undefined)
            });
            this.tableModel.remove(ld)
          },
          () => {
            for (let i = size - 1; i >= 0; i--) {
              dm.remove(list.get(i));
            }
            this.tableModel.remove(ld)
          })
      } else {
        this.tableModel.remove(ld)
      }
    }
  }

  handleDataModelPropertyChange(e) {
    if (["a:stateEnum", "a:state"].includes(e.property)) {
      this.updateTable();
    }
  }

  handleDataModelChange(e) {
    const currentState = this.currentState;
    if (!this.symbolViewUpdating && e.kind === "add") {
      const state = e.data.s("state");
      if (currentState) {
        e.data.s("state", currentState);
      } else if (state && !this.isStateExist(state)) {
        e.data.s("state", undefined);
      }
    }
  }

  updateTable() {
    if (!this.isSettingState && this.dataModel) {
      this.updatingClear = true;
      this.tableModel.clear();
      const state = this.dataModel.a("state"),
        _enum = this.dataModel.a("stateEnum");
      _enum?.forEach(({ value, label }) => {
        this.addState(value, label, value === state)
      });
      this.updatingClear = false;
    }
  }

  isStateExist(state, data) {
    const list = this.tableModel.toDatas(item => {
      return item !== data
    }),
      size = list.size();
    for (let i = 0; i < size; i++) {
      if (state === list.get(i).a("stateName")) return true
    }
  }

  setDefaultState(state) {
    this.tableModel.each(data => {
      data.a("isDefault", data.a("stateName") === state)
    })
  }

  initTab() {
    this.dataModel?.ump(this.handleDataModelPropertyChange, this);
    this.dataModel.umm(this.handleDataModelChange, this);
    this.dataModel._lastState = this.currentState;
    const view = this.editor.symbolView;
    if (view) {
      this.dataModel = view.dm;
      this.dataModel.mp(this.handleDataModelPropertyChange, this);
      this.dataModel.mm(this.handleDataModelChange, this);
      const lastState = this.dataModel._lastState;
      if (lastState !== undefined) {
        this.tableModel.each(data => {
          if (data.a("stateName") === lastState) {
            this.tableModel.sm().ss(data);
          }
        })
      } else {
        this.tableModel.sm().cs();
      }
    }
  }

  get currentState() {
    const data = this.tableModel.sm().ld();
    return data?.a("stateName")
  }
}
