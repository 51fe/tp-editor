import Explorer from "./Explorer.js";

export default class Models extends Explorer {
  constructor(editor, editable = true) {
    super(editor, 'models', editable)
    this.enableDroppableToDisplayView();
    this.enableDroppableToSceneView();
  }
}