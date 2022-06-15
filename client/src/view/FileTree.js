import { getString } from "../util/index.js";
import { createAlert } from "../util/DialogHelper.js";
import { FILE_TYPE_ROOT, FILE_TYPE_DIR } from "../constants.js";
import config from "../config.js";
import DNDTree from "./DNDTree.js";

export default class FileTree extends DNDTree {
  constructor(explorer, editable = true) {
    super(explorer.editor, explorer.dataModel, editable)
    this.explorer = explorer;
    this.dragToIndexEnabled = false;
    this.setSortFunc(config.createFileTreeSortFunc(this));
  }

  isVisible(fileNode) {
    return fileNode.a("visible") !== false && this._visibleFunc?.(fileNode) !== false &&
      ([FILE_TYPE_DIR, FILE_TYPE_ROOT].includes(fileNode.fileType));
  }

  getLabel(fileNode) {
    return getString("url:" + fileNode.url, true) || this.getEditingLabel(fileNode)
  }

  getEditingLabel(fileNode) {
    return fileNode.getName();
  }

  handleBackgroundClick() {
  }

  handleDelete() {
    if(this.editable && config.removeFileByKeyboardEnabled) {
      this.explorer.deleteSelection(this);
    }
  }

  isDroppable(e, info) {
    return this.editable && info.view === this.explorer.list ||
      info.view === this.editor.dndFromOutside;
  }

  _endCrossDrag(e, info) {
    if (this._crossDragInfo) {
      const view = info.view;
      let parent = this._crossDragInfo.parent;
      if (!parent) {
        parent = this.explorer.rootNode;
      }
      if (view === this.explorer.list) {
        const draggingData = view.draggingData,
          setter = () => {
            if (view.isSelected(draggingData)) {
              view.sm().toSelection().each(data => {
                this.editor.moveFile(data, parent);
              })
            } else {
              this.editor.moveFile(draggingData, parent);
            }
          };
        if (config.promptForMovingFile) {
          createAlert(getString("editor.move"),
            getString("editor.confirmmovefile"), setter);
        } else {
          setter();
        }
      } else if (view === this.editor.dndFromOutside) {
        this.editor.dropLocalFileOnDir(e, parent);
      }
    }
  }

  _endDrag(e, info) {
    let parent = info.parent;
    if (!parent) {
      parent = this.explorer.rootNode;
    }
    const draggingData = this.draggingData,
      settet = () => {
        if (this.isSelected(draggingData)) {
          this.getTopRowOrderSelection().each(data => {
            this.editor.moveFile(data, parent);
          })
        } else {
          this.editor.moveFile(draggingData, parent);
          this.sm().ss(draggingData);
          parent && this.expand(parent);
        }
      };

    if (config.promptForMovingFile) {
      createAlert(getString("editor.move"),
        getString("editor.confirmmovefile"), settet);
    } else {
      settet();
    }
  }

  isEditable(fileNode) {
    return this.editable && fileNode.a("editable") !== false;
  }

  beginEditing(fileNode) {
    const params = { data: fileNode, url: fileNode.url };
    this.editor.fireEvent("fileRenaming", params);
    if(!params.preventDefault) {
      super.beginEditing(fileNode);
    }
  }

  rename(fileNode, fileName) {
    this.editor.renameFile(fileNode, fileName, function () {
      if (fileNode.s("label")) {
        fileNode.s("label", fileName);
      } else {
        fileNode.setName(fileName);
      }
    })
  }

  getIcon(fileNode) {
    if (fileNode.getIcon() !== undefined) {
      return fileNode.getIcon();
    } else if (fileNode.fileType === FILE_TYPE_DIR) {
      if (this.hasExpandedChild(fileNode)) {
        return "editor.direxpanded";
      }
      return "editor.dircollapsed";
    } else if (fileNode.fileType === FILE_TYPE_ROOT) {
      return "editor.root.state";
    }
    return null;
  }
}
