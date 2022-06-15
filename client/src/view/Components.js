import Explorer from "./Explorer.js";

export default class Components extends Explorer {
  constructor(editor, editable = false) {
    super(editor, 'components', editable);
    this.enableDroppableToSymbolView();
  }

  initTreeMenu(e, items) {
    this.addLocateTreeFileItem(items)
    this.addNewFolderItem(items, this.tree);
    this.addNewItem(items, this.tree, "components", true);
    this.addRenameItem(items, this.tree);
    this.addDeleteItem(items, this.tree);
  }

  initListMenu(e, items) {
    this.addLocateListFileItem(items);
    this.addNewFolderItem(items, this.list);
    this.addNewItem(items, this.list, "newSymbolView", true);
    this.addCopyItem(items);
    this.addPasteItem(items);
    this.addRenameItem(items, this.list);
    this.addDeleteItem(items, this.list);
    this.addExportItem(items);
  }

  initAccordionMenu(e, items) {
    this.addLocateListFileItem(items);
    this.addNewFolderItem(items, this.accordion);
    this.addNewItem(items, this.accordion, "newSymbolView", true);
    this.addCopyItem(items), this.addPasteItem(items);
    this.addRenameItem(items, this.accordion)
    this.addDeleteItem(items, this.accordion)
    this.addExportItem(items);
  }
}
