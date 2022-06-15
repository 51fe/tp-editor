import config from "../config.js";
import { getString } from "../util/index.js";
import Dialog from "./index.js";
import Detector from "../util/Detector.js";
import FormPane from "../pane/FormPane.js";
import ListView from "../view/ListView.js";

export default class FontView extends Dialog {
  constructor(editor) {
    super()
    this.editor = editor;
  }

  init() {
    this._detector = new Detector;
    const borderPane = this.borderPane = new ht.widget.BorderPane,
      rightBorder = this.rightBorder = new ht.widget.BorderPane,
      previewGraph = this.previewGraph = new ht.graph.GraphView,
      listView = this.listView = new ListView,
      formPane = this.formPane = new FormPane;

    listView.getView().style.borderRight = "2px solid #f7f7f7";
    listView.getLabelFont = data => {
      return "14px " + data.getName();
    };
    borderPane.setLeftView(listView);
    borderPane.setCenterView(rightBorder);
    borderPane.setLeftWidth(180);
    rightBorder.setBottomView(previewGraph);
    rightBorder.setBottomHeight(120);
    rightBorder.setCenterView(formPane);
    previewGraph.adjustTranslateX = () => {
      return 0;
    };
    previewGraph.adjustTranslateY = () => {
      return 0;
    };
    previewGraph.handleScroll = () => {
      return false;
    };
    previewGraph.setScrollBarVisible(false);
    const node = this.textNode = new ht.Text;
    node.s({
      "2d.selectable": false,
      text: config.fontPreview
    });
    node.setAnchor(0, 0);
    node.setSize(2000, 120);
    node.p(4, 4);
    previewGraph.dm().add(node);
    formPane.setVPadding(32);
    formPane.setVGap(18);
    formPane.setHGap(0);
    formPane.addRow([{
      element: getString("editor.font.style"),
      align: "right"
    }, "", {
      id: "normal",
      button: this.createStyleButton(getString("editor.font.normal"))
    }, {
      id: "bold",
      button: this.createStyleButton(getString("editor.font.bold"))
    }, {
      id: "oblique",
      button: this.createStyleButton(getString("editor.font.oblique"))
    }, {
      id: "obliqueBold",
      button: this.createStyleButton(getString("editor.font.obliquebold"))
    }], [60, 8, .1, .1, .1, .1], 32);
    formPane.addRow([{
      element: getString("editor.font.size"),
      align: "right"
    }, "", {
      id: "fontSize",
      slider: {
        max: 72,
        min: 12,
        step: 1,
        onValueChanged: (oldValue, newValue) => {
          formPane.getItemById("fontSizeLabel").element = newValue + "";
          formPane.iv();
          this._handleFontChange();
        }
      }
    }, {
      id: "fontSizeLabel",
      element: "12"
    }], [60, 8, .1, 20], 32);
    formPane.addRow([{
      element: getString("editor.output"),
      align: "right"
    }, "", {
      id: "fontOutput",
      textField: {
        editable: false,
        value: this.getFontString()
      }
    }], [60, 8, .1], 32);
    const buttons = [];
    buttons.push({
      label: getString("editor.ok"),
      action: () => {
        this.ok();
      }
    });
    buttons.push({
      label: getString("editor.cancel"),
      action: () => {
        this.hide();
      }
    });
    this.initFontList();
    this.setConfig({
      closable: true,
      draggable: true,
      width: config.fontViewSize.width,
      height: config.fontViewSize.height,
      contentPadding: 6,
      resizeMode: "wh",
      maximizable: true,
      content: borderPane,
      buttons,
      buttonsAlign: "right"
    });
    this._init = true;
    this.setModal(false);
  }

  createStyleButton(label) {
    return {
      label,
      groupId: "fontStyle",
      labelSelectColor: config.color_select,
      labelColor: "#2c2c2c",
      borderSelectColor: "red",
      background: "rgb(247,247,247)",
      selectBackground: "rgb(247,247,247)",
      togglable: true,
      borderColor: null,
      onClicked: () => {
        this._handleFontChange();
      }
    }
  }

  initFontList() {
    const listView = this.listView,
      style = listView.getView().style,
      dm = listView.dm(),
      detector = this._detector,
      fontList = config.fontList,
      ignoreFontDetection = config.ignoreFontDetection;
    listView.sm().ms(e => {
      this._handleFontChange(e);
    });
    fontList.forEach(item => {
      if (ignoreFontDetection || detector.detect(item)) {
        const Node = new ht.Node;
        Node.setIcon(null);
        Node.setName(item);
        dm.add(Node);
      }
    });
    dm.sm().setSelectionMode("multiple");
    style.background = "white";
    return listView;
  }

  cancel() {
    this.hide();
  }

  save() {
    this.ok();
  }

  _handleFontChange() {
    this.textNode.s("text.font", this.getFontString());
    this.formPane.v("fontOutput", this.getFontString());
  }

  getFontString() {
    const listView = this.listView,
      formPane = this.formPane,
      selection = listView.sm().getSelection().toArray();
    let str = "",
      styles = selection.map(item => {
        return item.getName();
      });
    if (!styles.length) {
      styles = ["arial"];
    }
    ["bold", "oblique", "obliqueBold"].forEach((item, index) => {
      if (formPane.getItemById(item).element.isSelected()) {
        if (index === 0) {
          str = "bold ";
        } else if (index === 1) {
          str = "italic ";
        } else if (index === 2) {
          str = "italic bold ";
        }
      }
    });
    return "" + str + formPane.getValue("fontSize") + "px " + styles.join(", ");
  }

  ok() {
    if (this.setValue) {
      this.setValue(this.getFontString());
      this.hide();
    }
  }

  analysisFontString(labelFont = ht.Default.labelFont) {
    if (typeof labelFont !== "string") {
      labelFont = ht.Default.labelFont;
    }
    let arr = labelFont.split(/px\s+/);
    if (arr.length < 2) {
      arr = ht.Default.labelFont.split(/px\s+/)
    }
    const styles = arr[0].split(/\s+/),
      fonts = arr[1].split(",").map(item => {
        return item.trim();
      }),
      re = /\d+/;
    let bold = undefined,
      italic = undefined,
      fontSize = undefined;
    styles.forEach(item => {
      if (item === "bold") {
        bold = true;
      } else if (["oblique", "italic"].includes(item)) {
        italic = true;
      } else if (re.test(item)) {
        fontSize = parseInt(item)
      }
    });
    this.setFormValue(fontSize, fonts, bold, italic)
  }

  setFormValue(fontSize, fonts, bold, italic) {
    const listView = this.listView, formPane = this.formPane;
    listView.sm().cs();
    listView.dm().each(data => {
      fonts.forEach(font => {
        if (data.getName().toLowerCase() === font.toLowerCase()) {
          listView.sm().as(data);
        }
      })
    });
    let index = 0;
    if (bold && italic) {
      index = 3;
    } else if (bold) {
      index = 1;
    } else if (italic) {
      index = 2;
    }
    ["normal", "bold", "oblique", "obliqueBold"].forEach((item, i) => {
      formPane.getItemById(item).element.setSelected(index === i);
    });
    formPane.getItemById("fontSizeLabel").element = fontSize + "";
    formPane.setValue("fontSize", fontSize);
  }

  open(extraInfo, setValue, title) {
    if (!this._init) {
      this.init();
    }
    this.setValue = setValue;
    this.setTitle(title);
    this.analysisFontString(extraInfo);
    this.show(this.editor.root);
  }
}
