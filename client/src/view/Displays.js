import config from "../config.js";
import { getString } from "../util/index.js";
import { FILE_TYPE_DIR } from "../constants.js"
import Explorer from "./Explorer.js";

export default class Displays extends Explorer {
  constructor(editor, editable = true) {
    super(editor, 'displays', editable);
    this.enableDroppableToDisplayView();
    this.enableDroppableToUIView();
  }

  initTreeMenu(menu, item) {
    const tree = this.tree;
    this.addLocateTreeFileItem(item);
    this.addNewFolderItem(item, this.tree).visible = () => {
      if (tree.editable) {
        const ld = tree.sm().ld();
        return tree.isEditable(ld) || config.vision && ld.a("dir_type") === 2;
      }
    };
    this.addNewDisplayItem(item, this.tree);
    this.addRenameItem(item, this.tree);
    this.addDeleteItem(item, this.tree);
  }

  initListMenu(menu, item) {
    const tree = this.tree;
    this.addLocateListFileItem(item);
    let menuItem = this.addNewFolderItem(item, this.list);
    menuItem.visible = () => {
      return tree.editable && (tree.isEditable(tree.sm().ld()) || config.vision &&
        tree.sm()?.ld().a("dir_type") === 2);
    };
    menuItem = this.addNewDisplayItem(item, this.list);
    menuItem.visible = () => {
      let ld = tree.sm().ld();
      if (!tree.editable || config.vision && ld?.a("dir_type") !== 2 && !ld?.a("editable")) {
        return false;
      }
      if (this.isAccordionMode()) {
        ld = this.accordion.sm().ld();
        return ld?.fileType === FILE_TYPE_DIR;
      }
      return true;
    };
    this.addCopyItem(item);
    this.addPasteItem(item);
    this.addRenameItem(item, this.list);
    this.addDeleteItem(item, this.list);
    this.addExportItem(item)
  }

  initAccordionMenu(menu, item) {
    this.addLocateListFileItem(item);
    this.addNewFolderItem(item, this.accordion);
    this.addNewDisplayItem(item, this.list);
    this.addCopyItem(item);
    this.addPasteItem(item);
    this.addRenameItem(item, this.accordion);
    this.addDeleteItem(item, this.accordion);
    this.addExportItem(item);
  }

  addNewDisplayItem(items, item) {
    const menuItem = {
      id: "newDisplayView",
      label: getString("editor.newdisplayview"),
      action: () => {
        if (item instanceof FileList) {
          const ld = item.sm().ld();
          if (ld?.fileType === FILE_TYPE_DIR) {
            this.editor._rightClickURL = ld.url;
          }
        }
        this.editor.newDisplayView();
        this.editor.save();
        delete this.editor._rightClickURL;
      },
      visible: () => {
        let ld = item.sm().ld();
        if (!item.editable || config.vision &&
          ld?.a("dir_type") !== 2 && !ld?.a("editable")) {
          return false;
        }
        if (this.isAccordionMode()) {
          ld = this.accordion.sm().ld();
          return ld && ld.fileType === FILE_TYPE_DIR;
        }
        return true;
      }
    };
    items.push(menuItem);
    return menuItem;
  }
}
