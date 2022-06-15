import { getString, isDXF, isOTF, isSVG, isTTF } from "../util/index.js";
import Explorer from "./Explorer.js";

export default class Assets extends Explorer {
  constructor(editor, editable = false) {
    super(editor, 'assets', editable)
    this.enableDroppableToDisplayView();
    this.enableDroppableToSymbolView();
    this.enableDroppableToSceneView();
    this.enableDroppableToUIImage();
  }

  initTreeMenu(e, items) {
    this.addLocateTreeFileItem(items);
    this.addNewFolderItem(items, this.tree);
    this.addRenameItem(items, this.tree);
    this.addDeleteItem(items, this.tree);
  }

  initListMenu(e, items) {
    this.addLocateListFileItem(items);
    this.addNewFolderItem(items, this.list);
    this.addCopyItem(items);
    this.addPasteItem(items);
    this.addRenameItem(items, this.list);
    this.addDeleteItem(items, this.list);
    this.addConvertItems(items);
  }

  initAccordionMenu(e, items) {
    this.addLocateListFileItem(items);
    this.addNewFolderItem(items, this.accordion);
    this.addCopyItem(items);
    this.addPasteItem(items);
    this.addRenameItem(items, this.accordion);
    this.addDeleteItem(items, this.accordion);
    this.addConvertItems(items)
  }

  addConvertItems(items) {
    items.push("separator");
    items.push({
      id: "convertToDisplay",
      label: getString("editor.converttodisplay"),
      action: () => {
        this.editor.open(this.getFileListView().sm().ld(), false);
      },
      visible: () => {
        const data = this.getFileListView().sm().ld();
        return !!data && (isSVG(data.url) || isDXF(data.url));
      }
    });
    items.push({
      id: "convertToSymbol",
      label: getString("editor.converttosymbol"),
      action: () => {
        this.editor.open(this.getFileListView().sm().ld(), true);
      },
      visible: () => {
        const data = this.getFileListView().sm().ld();
        return !!data && (isSVG(data.url) || isDXF(data.url) ||
          isTTF(data.url) || isOTF(data.url));
      }
    });
    items.push({
      id: "batchConvertSVG",
      label: getString("editor.batchconvertsvg"),
      action: () => {
        this.editor.batchConvertSVG(this.getFileListView().sm().getSelection().toArray());
      },
      visible: () => {
        const data = this.getFileListView().sm().ld();
        return !!data && isSVG(data.url);
      }
    })
  }
}