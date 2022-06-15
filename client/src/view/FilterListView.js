import ListView from "./ListView.js";

export default class FilterListView extends ListView {
  constructor(dm) {
    super(dm);
  }

  setDataModel(newValue) {
    const oldValue = this._dataModel,
      sm = this._selectionModel;
    if (oldValue !== newValue) {
      if (oldValue) {
        oldValue.umm(this.handleDataModelChange, this);
        oldValue.umd(this.handleDataPropertyChange, this);
        oldValue.removeIndexChangeListener(this.handleIndexChange, this);
        sm || oldValue.sm().ums(this.handleSelectionChange, this)
      }
      this._dataModel = newValue;
      newValue.mm(this.handleDataModelChange, this);
      newValue.md(this.handleDataPropertyChange, this);
      newValue.addIndexChangeListener(this.handleIndexChange, this);
      sm ? sm._setDataModel(newValue) : newValue.sm().ms(this.handleSelectionChange, this);
      this.fp("dataModel", oldValue, newValue)
    }
  }

  handleIndexChange() {
    this.ivm();
  }

  handleDataPropertyChange(e) {
    this.invalidateData(e.data)
  }

  validateModel() {
    this._rows.clear();
    this._rowMap = {};
    const list = this._rows = this._dataModel.toDatas(this.isVisible, this),
      func = this.getCurrentSortFunc(),
      size = list.size();
    func && list.sort(func);
    for (let i = 0; i < size; i++) {
      this._rowMap[list.get(i)._id] = i
    }
  }
}