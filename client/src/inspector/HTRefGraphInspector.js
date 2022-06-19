import { FILE_TYPE_DISPLAY } from "../constants.js";
import { getString } from "../util/index.js";
import HTBlockInspector from "./HTBlockInspector.js";

export default class HTRefGraphInspector extends HTBlockInspector {
  constructor(editor, name) {
    super(editor, name)
  }

  addBasicProperties() {
    super.addBasicProperties();
    this.addDBRef();
  }

  addDBRef() {
    const items = [],
        getter = (dm) => {
          return dm.getRef();
        },
        setter = (node, vlaue) => {
          if (node instanceof ht.RefGraph) {
            node.p(0, 0);
            node.setRotation(0);
            node.setAnchor(.5, .5);
            node.setScale(1, 1);
            node.setSize(20, 20);
            node.setRef(vlaue)
          }
        },
        getDroppable = (e, info) => {
          const data = info.view.draggingData;
          if (data) {
            return this.editor.url !== data.url &&
                data.fileType === FILE_TYPE_DISPLAY
          }
          return false;
        };
    this.addLabelURL(items, getString("editor.ref"),
        getter, setter, getDroppable);
    return this.addDBRow(items, "p", "ref")
  }

  addDBGray() { }

}
