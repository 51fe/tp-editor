import { getString } from "../util/index.js";
import HTNodeInspector from "./HTNodeInspector.js";

export default class HTBlockInspector extends HTNodeInspector {
  constructor(editor, name) {
    super(editor, name);
  }

  addControlProperties() {
    super.addControlProperties();
    this.addDBCheckBox("p", getString("editor.clickthroughenabled"), "clickThroughEnabled");
    const items = [];
    this.addLabelCheckBox(items, getString("editor.syncsize"),
      (block) => {
        return block.isSyncSize();
      },
      (node, enabled) => {
        if (node instanceof ht.Block) {
          node.setSyncSize(enabled);
          if (node instanceof ht.RefGraph) {
            node.p(0, 0);
            node.setRotation(0);
            node.setAnchor(.5, .5);
            node.setScale(1, 1);
            node.setSize(20, 20);
            node.setRef(node.getRef());
          }
        }
      })
    this.addDBRow(items, "p", "syncSize")
  }

  addDBGray() { }
  addDBBodyColorProperty() { }
  addDBOpacityProperty() { }
  addImageProperties() { }
  addShapeProperties() { }
  addDBClipProperty() { }
}
