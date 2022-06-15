import config from "../config.js";
import { getString } from "../util/index.js";
import ContextMenu from "./ContextMenu.js";

export default class MainMenu extends ContextMenu {
  constructor(editor) {
    super();
    this.editor = editor;
    this.editor.menus.push(this);
    this.setItems(this.createItems());
  }

  createItems() {
    return [{
      id: "file",
      label: getString("editor.file"),
      items: [
        this.createItem("newDisplayView", getString("editor.newdisplayview"), "newDisplayView", config.displaysVisible),
        this.createItem("newSymbolView", getString("editor.newsymbolview"), "newSymbolView", config.symbolsVisible),
        this.createItem("newComponent", getString("editor.newcomponent"), "newComponent", config.componentsVisible)
      ]
    }]
  }

  createItem(id, label, handler, visible) {
    const item = {
      id,
      label,
      visible: (this.editor[handler] && visible)
    };
    handler && (item.action = () => {
      this.editor[handler]();
    });
    return item;
  }
}
