import { DIALOGS } from "../constants.js";
import { removeItem } from "../util/index.js";

export default class Dialog extends ht.widget.Dialog {
  constructor(option) {
    super(option);
  }

  save() {
    if(DIALOGS.indexOf(this) === -1) {
      DIALOGS.push(this);
    }
  }

  cancel() {
    removeItem(DIALOGS, this);
  }
}