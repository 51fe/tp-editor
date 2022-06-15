import Explorer from "../view/Explorer.js";

export default class Assets3d extends Explorer {
  constructor(editor) {
    super(editor, 'assets');
  }

  initTreeMenu(e, item) {
    this.addLocateTreeFileItem(item);
    this.addNewFolderItem(item, this.tree);
    this.addRenameItem(item, this.tree);
    this.addDeleteItem(item, this.tree);
  }

  initListMenu(e, item) {
    this.addLocateListFileItem(item);
    this.addNewFolderItem(item, this.list);
    this.addCopyItem(item);
    this.addPasteItem(item);
    this.addRenameItem(item, this.list);
    this.addDeleteItem(item, this.list);
  }
}
