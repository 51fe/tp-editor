export default class CodeEditor {
  constructor(config) {
    this.config = config;
    this._editable = true;
    if (tpeditor.config.useCodeEditor) {
      (this._view = document.createElement("div")).style.position = "absolute"
    } else {
      this._monacoEditor = new ht.widget.TextArea;
      this._view = this._monacoEditor.getView();
      config && config.value && this._monacoEditor.setValue(config.value);
    }
  }

  getView() {
    return this._view;
  }

  setValue(value = '') {
    this.monacoEditor && this.monacoEditor.setValue(value);
  }

  getValue() {
    return this.monacoEditor && this.monacoEditor.getValue();
  }

  layout() {
    if (this.monacoEditor) {
      this.monacoEditor.layout();
      if (!(this.isEditable() || this._monacoEditor instanceof ht.widget.TextArea)) {
        this.getView().appendChild(this._editableLayer);
      }
    }
  }

  invalidate() {
    this.layoutLater();
  }

  iv() {
    this.invalidate();
  }

  layoutLater(time = 300) {
    setTimeout(() => {
      this.layout()
    }, time)
  }

  setEditable(editable) {
    if (this._monacoEditor instanceof ht.widget.TextArea) {
      return void this._monacoEditor.setEditable(editable);
    }
    if (this._editable !== editable) {
      if (this._timer) {
        clearTimeout(this._timer);
        delete this._timer;
      }
      const layer = this._editableLayer;
      if (editable) {
        layer.parentNode && layer.parentNode.removeChild(layer);
      } else {
        this._timer = setTimeout(() => {
          delete this._timer;
          this.getView().appendChild(layer);
        }, 10);
      }
      this._editable = editable;
      this._monacoEditor?.updateOptions?.({ readOnly: !editable });
    }
  }

  isEditable() {
    return this._monacoEditor instanceof ht.widget.TextArea ? this._monacoEditor.isEditable() : this._editable;
  }

  get monacoEditor() {
    if (!this._monacoEditor && window.monaco) {
      const convertCodeEditorOption = tpeditor.config.convertCodeEditorOption,
      config = this.config || {
        value: "",
        language: "javascript",
        theme: tpeditor.config.codeEditorTheme,
        readOnly: !this._editable,
        minimap: { enabled: false }
      };
      convertCodeEditorOption && convertCodeEditorOption(config);
      this._monacoEditor = window.monaco.editor.create(this._view, config);
    }
    return this._monacoEditor;
  }

  get _editableLayer() {
    if (this.__editableLayer) return this.__editableLayer;
    const layer = this.__editableLayer = document.createElement("div"),
      style = layer.style;
    style.backgroundColor = ht.Default.disabledBackground || "rgba( 255, 255, 255, 0.3)";
    style.position = "absolute";
    style.cursor = "not-allow";
    style.top = 0;
    style.right = 0;
    style.bottom = 0;
    style.left = 0;
    style.pointerEvents = "none";
    return layer;
  }
}

export function createCodeEditor(e) {
  return new (ht.Default.getClass(tpeditor.config.codeEditorClass) || CodeEditor)(e)
}
