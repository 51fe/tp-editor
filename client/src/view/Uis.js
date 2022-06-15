import Explorer from "./Explorer.js";

export default class Uis extends Explorer {
  constructor(editor, editable = true) {
    super(editor, 'uis', editable);
    this.enableDroppableToUIView();
  }

  initTreeMenu(e, items) {
    this.addLocateTreeFileItem(items)
    this.addNewFolderItem(items, this.tree);
    this.addNewItem(items, this.tree, "newUIView", true);
    this.addRenameItem(items, this.tree);
    this.addDeleteItem(items, this.tree);
  }

  initListMenu(e, items) {
    this.addLocateListFileItem(items);
    this.addNewFolderItem(items, this.list);
    this.addNewItem(items, this.list, "newUIView", true);
    this.addCopyItem(items), this.addPasteItem(items);
    this.addRenameItem(items, this.list);
    this.addDeleteItem(items, this.list), this.addExportItem(items);
  }

  initAccordionMenu(e, items) {
    this.addLocateListFileItem(items);
    this.addNewFolderItem(items, this.accordion);
    this.addNewItem(items, this.accordion, "newUIView", true);
    this.addCopyItem(items), this.addPasteItem(items);
    this.addRenameItem(items, this.accordion);
    this.addDeleteItem(items, this.accordion);
    this.addExportItem(items);
  }
}
