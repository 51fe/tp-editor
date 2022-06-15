import Explorer from "./Explorer.js";

export default class Symbols extends Explorer {
  constructor(editor, editable = true) {
    super(editor, 'symbols', editable)
    this.enableDroppableToDisplayView();
    this.enableDroppableToSymbolView();
    this.enableDroppableToSceneView();
    this.enableDroppableToUIImage();
  }

  initTreeMenu(e, item) {
    this.addLocateTreeFileItem(item)
    this.addNewFolderItem(item, this.tree);
    this.addNewItem(item, this.tree, "newSymbolView", true);
    this.addRenameItem(item, this.tree);
    this.addDeleteItem(item, this.tree);
  }

  initListMenu(e, item) {
    this.addLocateListFileItem(item);
    this.addNewFolderItem(item, this.list);
    this.addNewItem(item, this.list, "newSymbolView", true);
    this.addCopyItem(item), this.addPasteItem(item);
    this.addRenameItem(item, this.list);
    this.addDeleteItem(item, this.list);
    this.addExportItem(item);
  }

  initAccordionMenu(e, item) {
    this.addLocateListFileItem(item);
    this.addNewFolderItem(item, this.accordion);
    this.addNewItem(item, this.accordion, "newSymbolView", true);
    this.addCopyItem(item), this.addPasteItem(item);
    this.addRenameItem(item, this.accordion);
    this.addDeleteItem(item, this.accordion);
    this.addExportItem(item);
  }
}
