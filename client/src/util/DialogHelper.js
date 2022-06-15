import { getString } from "./index.js";
import FormPane from "../pane/FormPane.js";
import Dialog from "../dialog/index.js";

export function getInput(title, text, config = {}, callback) {
  const nullable = config?.nullable ?? true,
    trim = config?.trim ?? true,
    cancellable = config?.cancellable ?? true,
    width = config?.width ?? 300,
    height = config?.height ?? 120,
    maxLength = config?.maxLength ?? -1,
    checkFunc = config?.getInput,
    body = config?.body,
    pane = new FormPane();
  pane.addRow([{ id: "input", textField: { text } }], [.1]);
  const dialog = new Dialog,
    buttons = [],
    save = () => {
      let input = pane.v("input");
      trim && input?.trim();
      if (nullable || input) {
        if (maxLength > 0 && input?.length > maxLength) {
          createAlert(null, getString("editor.inputmax"), () => { });
          return false;
        } else if (checkFunc && !(input = checkFunc(input))) {
          createAlert(null, getString("editor.invalidinput"), () => { });
          return false;
        } else {
          callback(input, "ok");
          dialog.hide();
          return false;
        }
      } else {
        createAlert(null, getString("editor.inputempty"), () => { });
        return false;
      }
    };
  let cancel = null;
  buttons.push({
    label: getString("editor.ok"),
    action: save
  });
  if (cancellable) {
    cancel = () => {
      callback(text, "cancel");
      dialog.hide();
    };
    buttons.push({
      label: getString("editor.cancel"),
      action: cancel
    });
  }
  dialog.setConfig({
    title,
    draggable: true,
    width,
    height: height,
    contentPadding: 10,
    content: pane,
    buttons,
    buttonsAlign: "right"
  });
  dialog.cancel = cancel;
  dialog.save = save;
  dialog.show(body);
  pane.getViewById("input").getElement()._ignore = true;
  pane.getViewById("input").setFocus();
}

export function createAlert(title, message, okHandler, cancelHandler = () => {}, width = 300) {
  const btns = [];
  let okAction = undefined,
    cancelAction = undefined;
  if (okHandler) {
    okAction = () => {
      dialog.hide();
      okHandler();
    };
    btns.push({ label: getString("editor.ok"), action: okAction })
  }

  if (cancelHandler) {
    cancelAction = function () {
      dialog.hide();
      cancelHandler();
    };
    btns.push({ label: getString("editor.cancel"), action: cancelAction })
  }

  const content = document.createElement("p");
  content.style.color = ht.Default.labelColor;
  content.innerText = message;
  const dialog = new Dialog({
    title: title || getString("editor.prompt"),
    contentPadding: 20,
    width,
    draggable: true,
    content,
    buttons: btns
  });
  dialog.cancel = cancelAction || okAction;
  dialog.save = okAction;
  dialog.setModal(true);
  dialog.show();
}
