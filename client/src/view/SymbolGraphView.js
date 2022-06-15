import EditGraphView from "./EditGraphView.js";

export default class SymbolGraphView extends EditGraphView {
  constructor(editView) {
    super(editView);
  }

  handleDataModelChange(event) {
    super.handleDataModelChange(event);
    this.editor?.fireViewEvent(this.editView, "DataModelChanged", { event });
  }

  handleDataModelPropertyChange(event) {
    super.handleDataModelPropertyChange(event);
    this.editor?.fireViewEvent(this.editView, "DataModelPropertyChanged", { event });
  }

  handleDataPropertyChange(event) {
    super.handleDataPropertyChange(event);
    this.editor?.fireViewEvent(this.editView, "DataPropertyChanged", { event });
  }

  isDroppable(e, info) {
    if (this.editor.editable) {
      return !!info.view.isDroppableToSymbolView;
    }
    return false;
  }

  isPixelPerfect() {
    return true;
  }

  initMenuItems(items) {
    this.setEditMenuItems(items);
    this.setMenuItems(items);
    super.initMenuItems(items);
  }

  isVisible(node) {
    const currentState = this.editor.symbolStatePane.currentState;
    const state = node.s("state");
    if(state === undefined || state === currentState) {
      return super.isVisible(node);
    }
    return false;
  }
}
