export default class TreeView extends ht.widget.TreeView {
  constructor(dm) {
    super(dm);
    this.setDoubleClickToToggle(false);
  }

  getToggleIcon(fileNode) {
    if (this._loader && !this._loader.isLoaded(fileNode)) {
      return this._collapseIcon;
    }
    const children = fileNode.getChildren().toArray();
    if (children?.some(node => this.isVisible(node))) {
      if (this.isExpanded(fileNode)) {
        return this._expandIcon;
      }
      return this._collapseIcon;
    }
  }

  hasExpandedChild(fileNode) {
    if (!this.isExpanded(fileNode)) return false;
    const children = fileNode.getChildren().toArray();
    return children?.some(node => this.isVisible(node));
  }

  get expandIds() {
    return Object.keys(this._expandMap);
  }

  set expandIds(prop) {
    prop.forEach(id => {
      const data = this.dm().getDataById(id);
      data && this.expand(data);
    });
  }

  get selectionIds() {
    const ids = [];
    this.sm().each(function (item) {
      ids.push(item._tag || item._id);
    })
    return ids;
  }

  set selectionIds(selection) {
    const ids = [];
    selection.forEach(id => {
      const data = this.dm().getDataById(id);
      data && ids.push(data);
    });
    this.sm().ss(ids);
  }
}
