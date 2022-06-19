import { getString } from "../util";
import FormPane from "../pane/FormPane.js";
import BatchInfoDialog from "./BatchInfoDialog.js";
import { getColumn } from "../util/column.js";

export default class BatchView extends FormPane {
  constructor(editor) {
    super();
    this.editor = editor;
    this._updateHandles = [];
    this.batchInfoDialog = new BatchInfoDialog(editor);
    this.batchInfoDialog.handleComplete = value => {
      const ld = this.sm.ld();
      ld?.a("batchInfo", value);
    };
    const pane = this._tablePane = new ht.widget.TablePane;
    this.initTable();
    this.addRow([getString("editor.batchbrightness"),
    this.addChickBox(() => {
      return !this.editor.dm.a("sceneBatchBrightnessDisabled")
    }, value => {
      return this.editor.dm.a("sceneBatchBrightnessDisabled", !value)
    }), getString("editor.batchblend"),
    this.addChickBox(() => {
      return !this.editor.dm.a("sceneBatchBlendDisabled")
    }, value => {
      return this.editor.dm.a("sceneBatchBlendDisabled", !value)
    })], [80, .1, 80, .1]);
    this.addRow([pane], [.1], .1);
    this.addRow([{
      button: {
        icon: "editor.add",
        toolTip: getString("editor.add"),
        onClicked: () => {
          this.addData();
        }
      }
    }, {
      button: {
        icon: "editor.delete",
        toolTip: getString("editor.delete"),
        onClicked: () => {
          this.sm.size() && this.sm.removeSelection();
        }
      }
    }], [20, 20]);
  }

  isNameExist(name, file) {
    let existed = false;
    const datas = this.dm.getDatas(),
      count = datas.size();
    for (let i = 0; i < count; i++) {
      const data = datas.get(i);
      existed = data.a("name") === name
      if (data !== file && existed) break
    }
    return existed;
  }

  onDataPropertyChanged(e) {
    if (!this._parsing) {
      const property = e.property,
        data = e.data,
        newValue = e.newValue,
        oldValue = e.oldValue;
      if (property === "a:name") {
        if (this.isNameExist(newValue, data)) {
          data.a("name", oldValue);
          return;
        }
        if (oldValue) {
          delete ht.Default.getBatchInfoMap()[oldValue]
        }
        const batchInfo = data.a("batchInfo");
        if (batchInfo && ht.Default.getBatchInfo(newValue) === batchInfo) return;
        ht.Default.setBatchInfo(newValue, batchInfo);
        this.editor.scene.invalidateBatch(newValue);
      } else if (property === "a:batchInfo") {
        const name = data.a("name");
        if (!name) return;
        ht.Default.setBatchInfo(name, newValue);
        this.editor.scene.invalidateBatch(name);
      }
    }
  }

  onDataModelChanged() {
    this._parsing || ht.Default.setBatchInfoMap(this.toBatchInfoMap());
  }

  initTable() {
    const pane = this._tablePane;
    pane.getTableView().setEditable(true);
    pane.addColumns([
      getColumn("name", getString("editor.name"), 80),
      getColumn("batchInfo", getString("editor.batchInfo"), 200)
    ]);

    pane.getColumnModel().getDataByTag("batchInfo").isCellEditable = data => {
      this.batchInfoDialog.parseBatchInfo(data.a("batchInfo"));
      this.batchInfoDialog.show();
      return false;
    };
    this.dm.md(this.onDataPropertyChanged, this);
    this.dm.mm(this.onDataModelChanged, this);
    return pane;
  }

  toBatchInfoMap() {
    const map = {};
    this.dm.each(function (node) {
      const name = node.a("name");
      name && (map[name] = node.a("batchInfo"));
    });
    return map;
  }

  addData(name, batchInfo = null) {
    const data = new ht.Data;
    data.a({ name, batchInfo });
    this.dm.add(data);
  }

  parseBatchInfoMap(map) {
    this._parsing = true;
    for (const key in map) {
      this.addData(key, map[key]);
    }
    this._parsing = false;
  }

  clearBatchInfo() {
    this.dm.clear();
    this.updateProperties();
  }

  addChickBox(getter, setter) {
    const cb = new ht.widget.CheckBox;
    cb.getValue = getter;
    cb.setValue(getter());
    cb.onValueChanged = (oldValue, newValue) => {
      this._updatting || setter(newValue);
    };
    this._updateHandles.push(() => {
      cb.setValue(getter())
    });
    return cb;
  }

  updateProperties() {
    this._updatting = true;
    this._updateHandles.forEach(handler => {
      return handler();
    });
    this._updatting = false;
  }

  get dm() {
    return this._tablePane.getDataModel();
  }

  get sm() {
    return this.dm.sm();
  }

  get keys() {
    const arr = [];
    this.dm.each(item => {
      return arr.push(item.a("name"));
    })
    return arr;
  }
}
