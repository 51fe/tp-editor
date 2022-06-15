import { getString } from "../util/index.js";
import EditGraphView from "./EditGraphView.js";

export default class DisplayGraphView extends EditGraphView {
  constructor(editView) {
    super(editView);
  }

  handleDataModelChange(e) {
    super.handleDataModelChange(e);
    if (this.editor) {
      this.editor.fireViewEvent(this.editView, "DataModelChanged", { event: e });
    }
  }

  handleDataModelPropertyChange(e) {
    super.handleDataModelPropertyChange(e);
    if (this.editor) {
      this.editor.fireViewEvent(this.editView, "DataModelPropertyChanged", { event: e })
    }
  }

  handleDataPropertyChange(e) {
    super.handleDataPropertyChange(e);
    if (this.editor) {
      this.editor.fireViewEvent(this.editView, "DataPropertyChanged", { event: e });
    }
  }

  initMenuItems(items) {
    this.setEditMenuItems(items);
    this.setMenuItems(items);
    this.addBlockItems(items);
    super.initMenuItems(items)
  }

  isDroppable(e, info) {
    if (this.editor.editable) return !!info.view.isDroppableToDisplayView;
  }

  isSelectable(e, info) {
    return !e._refGraph && super.isSelectable(e, info)
  }

  addBlockItems(items) {
    const getSize = () => {
      return this.sm().size() > 0;
    },
      hasBlock = () => {
        for (let i = 0; i < this.sm().size(); i++) {
          const data = this.sm().getSelection().get(i);
          if (data instanceof ht.Block && !(data instanceof ht.RefGraph)) return true;
        }
        return false;
      };
    items.push({
      separator: true,
      visible: () => {
        return this.editable && (getSize() || hasBlock());
      }
    });
    items.push({
      id: "block",
      label: getString("editor.block"),
      action: () => {
        this.editor.block();
      },
      visible: () => {
        return this.editable && getSize();
      }
    });
    items.push({
      id: "unblock",
      label: getString("editor.unblock"),
      action: () => {
        this.editor.unblock();
      },
      visible: () => {
        return this.editable && hasBlock();
      }
    })
  }
}
