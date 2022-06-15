import TreeView from "../view/TreeView.js";
import FormPane from "./FormPane.js";
import ListView from "../view/ListView.js";
import { isEsc } from "../util/index.js";

export default class ListPane extends ht.widget.BorderPane {
  constructor(editor) {
    super();
    this.editor = editor;
    this._emptyDataModel = new ht.DataModel;
    this.centerPane = new ht.widget.BorderPane;
    this.setCenterView(this.centerPane);
    this.controlPane = new FormPane;
    this.controlPane.addRow([{
      id: "filter",
      textField: {}
    }], [.1, ht.Default.isTouchable ? 32 : 18]),
      this.setBottomView(this.controlPane),
      this.setBottomHeight(ht.Default.widgetRowHeight + 8);

    const filter = this.controlPane.getViewById("filter"),
      handler = filter.setValue;

    filter.setValue = value => {
      handler.call(filter, value);
      this.updateCenterView(value)
    };
    let typing = false,
      input = this.input = filter.getElement();
    input.addEventListener("compositionstart", () => {
      return typing = true;
    });
    input.addEventListener("compositionend", () => {
      typing = false;
      this.updateCenterView(input.value);
    });
    input.addEventListener("keyup", e => {
      if (!typing && this.list) {
        isEsc(e) && (input.value = "");
        this.updateCenterView(input.value);
      }
    });
  }

  initTab(tab) {
    this.tab = tab;
    this.list = tab ? tab.getView().list : null;
    this.controlPane.v("filter", this.list ? this.list.getFilter() || "" : "")
  }

  initFilterList() {
    const view = this._filterListView = new ListView;
    view.setFilter = newValue => {
      const oldValue = this._filter;
      this._filter = newValue;
      this.fp("filter", oldValue, newValue);
      this.ivm();
    };
    view.getFilter = () => {
      return this._filter;
    };
    view.isVisible = node => {
      if ("__renderHTML__" === node.getTag()) return false;
      if (!this._filter) return true;
      const func = this.getVisibleFunc();
      if (func && !func(node)) return false;
      let str = this.getLabel(node);
      if (null == str) return false;
      const keyword = (this._filter + "").toLowerCase();
      str = (str + "").toLowerCase();
      return str.indexOf(keyword) >= 0;
    }
  }

  updateCenterView(value) {
    let list = this.list;
    if (list) {
      if (list instanceof TreeView && value) {
        list = this._filterListView;
      }
      if(this.centerPane.getCenterView() !== list) {
        this.centerPane.setCenterView(list);
      }
      this.list && this.list.setFilter(value);
      this._filterListView === list && this._filterListView.setFilter(value);
    }
  }

  get list() {
    return this._list;
  }

  set list(value) {
    this._list = value;
    this.centerPane.setCenterView(value);
    if (!(value && value instanceof TreeView)) {
      this._filterListView && this._filterListView.dm(this._emptyDataModel)
      return;
    }
    if (!this._filterListView) {
      this.initFilterList();
    }
    this._filterListView.getLabel = value.getLabel;
    this._filterListView.getIcon = value.getIcon;
    this._filterListView.dm(value.dm());
  }
}
