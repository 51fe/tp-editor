import { getString } from "../util";

export default class ContextMenu3d extends ht.widget.ContextMenu {
  constructor(editor) {
    super();
    this.editor = editor;
    this.editor.menus.push(this);

    const items = [{
      label: getString("editor.newsceneview"),
      action: () => {
        this.editor.newScene();
      }
    }, {
      label: getString("editor.newmodel"),
      items: [{
        label: getString("editor.obj"),
        action: () => {
          this.editor.newOBJModel();
        }
      }]
    }];
    this.setItems(items);
  }
}