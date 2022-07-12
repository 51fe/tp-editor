import config from "../config.js";
import { getString, getWindowInfo, removeHTML, stringify, toFunction } from "../util/index.js";
import { createCodeEditor } from "../util/CodeEditor.js";
import FormPane from "./FormPane.js";

const WIDTH = 300, HEIGHT = 230;

export default class IconsView extends FormPane {
  constructor(editor) {
    super()
    this.editor = editor;
    this.addRow([{
      id: "content",
      element: createCodeEditor()
    }], [.1], .1);
    this.addRow([null,
      {
        button: {
          label: getString("editor.ok"), onClicked: () => {
            this.hide(true)
          }
        }
      }, {
        button: {
          label: getString("editor.cancel"), onClicked: () => {
            this.hide()
          }
        }
      }
    ], [.1, 50, 50]);
    this.setWidth(WIDTH);
    this.setHeight(HEIGHT);
    this.getView().className = "tp-editor-styleicons";
    this.getView().style.background = config.color_pane;
    this.getView().style.border = config.color_pane_dark + " solid 1px";
    this.getView().style.boxShadow = "0px 0px 3px " + ht.Default.toolTipShadowColor;
    this.getView().style.overflow = "visible";
    const handler = e => {
      if (this.getView().parentNode &&
        !this.button.getView().contains(e.target) &&
        !this.getView().contains(e.target)) {
        this.hide();
      }
    };
    window.addEventListener("mousedown", handler, false);
    window.addEventListener("touchstart", handler, false);
  }

  toggle(btn, node) {
    if (this.getView().parentNode) {
      this.hide();
    } else {
      this.show(btn, node);
    }
  }

  show(btn, node) {
    if (!this.getView().parentNode) {
      const rect = btn.getView().getBoundingClientRect(),
        info = getWindowInfo();
      ht.Default.appendToScreen(this);
      this.getView().style.top = info.top + rect.top + "px";
      this.getView().style.left = info.left + rect.left - WIDTH - 4 + "px";
      this.iv();
      this.button = btn, this.data = node;
      const icons = node.s("icons");
      this.v("content", icons ? stringify(icons, undefined, false) : "")
    }
  }

  hide(saved = false) {
    if (this.getView().parentNode) {
      removeHTML(this.getView());
      saved && this.data.s("icons", toFunction(this.v("content")));
    }
  }
}
