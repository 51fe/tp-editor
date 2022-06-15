import { BINDING } from "../constants.js";
import config from "../config.js";
import FuncType from "../type/FuncType.js";
import { createButton, getFunc, getString, getWindowInfo, isFunction, isString, parseString, removeHTML } from "../util/index.js";
import { createCodeEditor } from "../util/CodeEditor.js";
import FormPane from "./FormPane.js";

const WIDTH = 460, HEIGHT = 230;

export default class FuncView extends FormPane {
  constructor(editor) {
    super();
    this.editor = editor;
    const btns = [];
    btns.push(getString("editor.binding"));
    btns.push({
      id: "compProperty",
      textField: { editable: false }
    });
    btns.push({ element: getString("editor.type"), align: "right" });
    btns.push({
      id: "type",
      comboBox: {
        values: ["attr", "func"],
        onValueChanged: (e, value) => {
          const editable = value === "func",
            color = editable ? ht.Default.labelColor : config.color_disabled;
          this.getViewById("func").setEditable(editable);
          this.getItemById("head").color = color;
          this.getItemById("end").color = color;
          this.getViewById("property").setDisabled(editable);
          editable && this.getViewById("property").setValue("");
          this.iv();
        }
      }
    });
    btns.push({ element: getString("editor.property"), align: "right" });
    const item = { id: "property" };
    if (config.dataBindingsForSymbol.getComboBoxValues) {
      item.comboBox = { editable: !!config.dataBindingsForSymbol.comboBoxEditable }
    } else {
      item.textField = {};
      btns.push(item);
    }
    const layout = [50, 90, 40, 60, 60, .1];
    if (config.dataBindingsForSymbol.onButtonClicked) {
      const btn = createButton("...", undefined, undefined, () => {
        this.smartClose = false, config.dataBindingsForSymbol.onButtonClicked(this, this.v("compProperty"), this.editor)
      });
      btns.push(btn), layout.push(20)
    }
    this.addRow(btns, layout);
    if (!config.dataBindingsForSymbol.getComboBoxValues) {
      this.getItemById("property").element.getElement().addEventListener("keydown", p => {
        ht.Default.isEnter(p) && this.hide(true)
      })
    }
    this.addLine();
    this.addRow([{ id: "head", element: "" }], [.1]);
    this.addRow([{
      id: "func",
      element: createCodeEditor()
    }], [.1], .1);
    this.addRow([{ id: "end", element: "}" }, {
      button: {
        label: getString("editor.ok"),
        onClicked: () => {
          this.hide(true);
        }
      }
    }, {
      button: {
        label: getString("editor.cancel"),
        onClicked: () => {
          this.hide();
        }
      }
    }], [.1, 50, 50]);
    this.setWidth(WIDTH), this.setHeight(HEIGHT);
    this.getView().className = "ht-editor-databinding";
    this.getView().style.background = config.color_pane;
    this.getView().style.border = config.color_pane_dark + " solid 1px";
    this.getView().style.boxShadow = "0px 0px 3px " + ht.Default.toolTipShadowColor;
    this.getView().style.overflow = "visible";
    const handler = this.handleWindowClick.bind(this);
    window.addEventListener("mousedown", handler, false);
    window.addEventListener("touchstart", handler, false);
  }

  handleWindowClick(e) {
    if (this.smartClose && this.getView().parentNode && !this.button.getView().contains(e.target)) {
      let view = this.getViewById("type");
      if (!view.getListView().getView().contains(e.target)) {
        if ((view = this.getViewById("property")) instanceof ht.widget.ComboBox) {
          if (view.getListView().getView().contains(e.target)) return;
          if (view.getInput() && view.getInput().contains(e.target)) return
        }
        this.getView().contains(e.target) || this.hide()
      }
    }
  }

  toggle(pane, name, key, inspector, getter, setter) {
    if (this.getView().parentNode) {
      this.hide();
    } else {
      this.show(pane, name, key, inspector, getter, setter);
    }
  }

  show(pane, name, key, inspector, getter, setter) {
    if (config.dataBindingsForSymbol.getComboBoxValues) {
      config.dataBindingsForSymbol.getComboBoxValues(values => {
        this.getViewById("property").setValues(values);
        this.showImpl(pane, name, key, inspector, getter, setter);
      });
    } else {
      this.showImpl(pane, name, key, inspector, getter, setter);
    }
  }

  showImpl(pane, name, key, inspector, getter, setter) {
    if (!this.getView().parentNode) {
      this.smartClose = true;
      const rect = pane.getView().getBoundingClientRect(),
        style = this.getView().style,
        win = getWindowInfo();
      ht.Default.appendToScreen(this);
      if (rect.bottom + HEIGHT + 1 > win.height) {
        style.top = win.top + rect.top - HEIGHT - 1 + "px";
      } else {
        style.top = win.top + rect.bottom + 1 + "px";
      }
      style.left = win.left + rect.right - WIDTH + "px";
      this.iv();
      this.button = pane;
      this.name = name;
      this.inspector = inspector;
      this.setter = setter;
      this.v("compProperty", key || name);
      let value = undefined,
        disabled = false;
      if (this.inspector.global) {
        if (name === "clip") {
          value = getter ? getter() : this.inspector.dataModel.a("clip");
          this.v("head", "function(g, width, height, data, view, image) {");
          disabled = true;
        } else {
          value = getter ? getter() : this.inspector.dataModel.a(name + "_func");
          this.v("head", "function(data, view) {");
        }
      } else {
        value = getter ? getter() : this.inspector.data.a(name);
        if (this.inspector.data instanceof FuncType && name === "type") {
          this.v("head", "function(g, rect, comp, data, view) {");
          disabled = true;
        } else {
          this.v("head", "function(data, view) {");
        }
      }
      if (isString(value)) {
        if (BINDING.test(value)) {
          this.v("type", "attr");
          this.v("property", value.slice(5));
        } else {
          this.v("type", "attr");
          this.v("property", value);
        }
        this.v("func", "");
      } else if (isFunction(value)) {
        this.v("type", "func");
        this.v("property", "");
        this.v("func", parseString(value))
      } else {
        this.v("type", "attr");
        this.v("property", "");
        this.v("func", "")
      }
      if (disabled) {
        this.v("type", "func");
        this.v("property", "");
        this.getViewById("type").setDisabled(true);
      } else {
        this.getViewById("type").setDisabled(false)
      }
    }
  }

  hide(saved = false) {
    const el = this.getView();
    if (el.parentNode) {
      removeHTML(el);
      if (saved) {
        const type = this.v("type"),
          prop = this.v("property");
        let result = undefined;
        if (type === "func") {
          let str = this.v("func").trim();
          if (str || this.inspector.data instanceof FuncType && "type" === this.name) {
            result = getFunc(this.v("head") + "\n" + str + "\n}")
          }
        } else if (prop && type === "attr") {
          result = "attr@" + prop;
        }
        if (this.setter) {
          this.setter(result)
        } else {
          if (this.inspector.global) {
            if (this.name === "clip") {
              this.inspector.dataModel.a("clip", result);
            } else {
              this.inspector.dataModel.a(this.name + "_func", result);
            }
          } else {
            this.inspector.setValue((node, value) => {
              node.a(this.name, value)
            })
          }
        }
        return result;
      }
    }
  }
}
