
import config from "../config.js";
import { createButton, createIconButton, getString, isEmptyObject, isEsc } from "../util/index.js";
import FormPane from "./FormPane.js";

export default class InspectorTool extends FormPane {
  constructor(editor) {
    super()
    this.editor = editor;
    this.setHPadding(8);
    this.buttons = {};
    const items = this._items = [];
    this.addAlignItems(items);
    this.addSearchItem(items);
    this.addLastItem(items);
    this.updateItems();
  }

  addAlignItems(items) {
    items.push(this.createAlignBtn('distributeHorizontal'));
    items.push(this.createAlignBtn('distributeVertical'));
    items.push(this.createAlignBtn('alignLeft'));
    items.push(this.createAlignBtn('alignHorizontal'));
    items.push(this.createAlignBtn('alignRight'));
    items.push(this.createAlignBtn('alignTop'));
    items.push(this.createAlignBtn('alignVertical'));
    items.push(this.createAlignBtn('alignBottom'));
  }

  addLastItem(item) {
    const w = 22,
      items = [w, w, w, w, w, w, w, w, .1];
    if (!isEmptyObject(config.compactFilter)) {
      this.addCompactItem(item);
      items.push(w);
    }
    this.addRow(item, items)
  }

  createAlignBtn(label) {
    const key = 'editor.align.' + label.toLocaleLowerCase();
    return this.buttons[label] = createButton(null, getString(key), key, () => {
      const prefix = 'align',
        direction = label.substring(5);
      if (label?.startsWith(prefix)) {
        this[prefix](direction);
      } else {
        this[label]();
      }
    })
  }

  updateItems() {
    const buttons = this.buttons;
    if (this.dataModel) {
      const selection = this.selection;
      if (selection.length > 2) {
        buttons.distributeHorizontal.setDisabled(false);
        buttons.distributeVertical.setDisabled(false);
        buttons.alignLeft.setDisabled(false);
        buttons.alignHorizontal.setDisabled(false);
        buttons.alignRight.setDisabled(false);
        buttons.alignTop.setDisabled(false);
        buttons.alignVertical.setDisabled(false);
        buttons.alignBottom.setDisabled(false);
      } else if (selection.length > 1) {
        buttons.distributeHorizontal.setDisabled(true);
        buttons.distributeVertical.setDisabled(true);
        buttons.alignLeft.setDisabled(false);
        buttons.alignHorizontal.setDisabled(false);
        buttons.alignRight.setDisabled(false);
        buttons.alignTop.setDisabled(false);
        buttons.alignVertical.setDisabled(false);
        buttons.alignBottom.setDisabled(false);
      } else {
        this.updateItemsTrue(buttons);
      }
    } else {
      this.updateItemsTrue(buttons);
    }
  }

  updateItemsTrue(buttons) {
    buttons.distributeHorizontal.setDisabled(true);
    buttons.distributeVertical.setDisabled(true);
    buttons.alignLeft.setDisabled(true);
    buttons.alignHorizontal.setDisabled(true);
    buttons.alignRight.setDisabled(true);
    buttons.alignTop.setDisabled(true);
    buttons.alignVertical.setDisabled(true);
    buttons.alignBottom.setDisabled(true);
  }

  initTab(tab) {
    this.dataModel && this.dataModel.sm().ums(this.updateItems, this);
    if (tab && !tab._isUI) {
      const view = tab.getView();
      this.dataModel = view.dm;
      this.dataModel.sm().ms(this.updateItems, this);
    } else {
      this.dataModel = null;
    }
    this.updateItems();
  }

  getUnionRect(selection) {
    return this.editor.gv ? this.editor.gv.getUnionNodeRect(selection) : null
  }

  isSelected(data) {
    return this.dataModel && this.dataModel.sm().contains(data)
  }

  hasSelectedGroupParent(data) {
    if (data instanceof ht.Group) {
      return !!this.isSelected(data) || this.hasSelectedGroupParent(data.getParent())
    }
    return false;
  }

  hasSelectedHost(node) {
    const handler = data => {
      if (data !== node && (data instanceof ht.Node)) {
        return !!this.isSelected(data) || handler(data.getHost())
      }
      return false;
    };
    return handler(node.getHost())
  }

  distributeHorizontal() {
    if (this.editor.editable) {
      this.editor.beginTransaction();
      const gv = this.editor.gv,
        selection = this.selection,
        rect1 = this.getUnionRect(selection);
      if (gv && rect1) {
        selection.sort((prev, next) => {
          return gv.getNodeRect(prev).x - gv.getNodeRect(next).x
        });
        const rects = {};
        let w = 0;
        selection.forEach(item => {
          const rect = gv.getNodeRect(item);
          rects[item._id] = rect;
          w += rect.width;
        });
        const gap = (rect1.width - w) / (selection.length - 1);
        let x = rect1.x;
        selection.forEach(item => {
          const rect = gv.getNodeRect(item);
          item.translate(x - rect.x, 0);
          x += rect.width + gap;
        })
      }
      this.editor.endTransaction();
    }
  }

  distributeVertical() {
    if (this.editor.editable) {
      this.editor.beginTransaction();
      const gv = this.editor.gv,
        selection = this.selection,
        rect1 = this.getUnionRect(selection);
      if (gv && rect1) {
        selection.sort((prev, next) => {
          return gv.getNodeRect(prev).y - gv.getNodeRect(next).y
        });
        const rects = {};
        let h = 0;
        selection.forEach(item => {
          const rect = gv.getNodeRect(item);
          rects[item._id] = rect;
          h += rect.height;
        });
        const gap = (rect1.height - h) / (selection.length - 1);
        let y = rect1.y;
        selection.forEach(item => {
          const rect = gv.getNodeRect(item);
          item.translate(0, y - rect.y);
          y += rect.height + gap;
        })
      }
      this.editor.endTransaction();
    }
  }

  align(direction) {
    if (this.editor.editable) {
      this.editor.beginTransaction();
      const gv = this.editor.gv,
        selection = this.selection,
        rect1 = this.getUnionRect(selection);
      gv && rect1 && selection.forEach(item => {
        const rect2 = gv.getNodeRect(item);
        if (direction === 'Left') {
          item.translate(rect1.x - rect2.x, 0);
        } else if (direction === 'Horizontal') {
          item.translate(rect1.x + rect1.width / 2 - rect2.x - rect2.width / 2, 0);
        } else if (direction === 'Right') {
          item.translate(rect1.x + rect1.width - rect2.x - rect2.width, 0);
        } else if (direction === 'Top') {
          item.translate(0, rect1.y - rect2.y);
        } else if (direction === 'Vertical') {
          item.translate(0, rect1.y + rect1.height / 2 - rect2.y - rect2.height / 2);
        } else if (direction === 'Bottom') {
          item.translate(0, rect1.y + rect1.height - rect2.y - rect2.height);
        }
      });
      this.editor.endTransaction();
    }
  }

  addSearchItem(items) {
    this.searchField = new ht.widget.TextField;
    const el = this.searchField.getElement();
    el.onkeyup = e => {
      isEsc(e) && (el.value = '');
      this.editor.filterProperties()
    };
    items.push(this.searchField);
  }

  addCompactItem(items) {
    let key = 'editor.compactdetail';
    if (config.commonAndAdvancedFilterMode) {
      key = 'editor.commonadvanced';
    }
    const icon = createIconButton('editor.filter', () => {
      if (config.commonAndAdvancedFilterMode) {
        return !this.editor.inspectorCompact;
      }
      return this.editor.inspectorCompact;
    }),
      onClick = () => {
        this.editor.inspectorCompact = !this.editor.inspectorCompact;
      },

      toolTip = getString(key);
    items.push(createButton(null, toolTip, icon, onClick));
  }

  get selection() {
    const items = [];
    this.dataModel && this.dataModel.sm().each(item => {
      if (item instanceof ht.Node) {
        if (!(this.hasSelectedGroupParent(item.getParent()) && this.hasSelectedHost(item))) {
          items.push(item)
        }
      }
    });
    return items;
  }

  get filter() {
    return this.searchField.getElement().value
  }
}
