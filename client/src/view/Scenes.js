import Explorer from "./Explorer.js";

export default class Scenes extends Explorer {
  constructor(editor, editable = false) {
    super(editor, 'scenes', editable);
    this.enableDroppableToDisplayView();
    this.enableDroppableToSceneView();
    this.enableDroppableToUIView();
  }
}
