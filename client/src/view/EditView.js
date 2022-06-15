import {
  createCanvas, drawText, fileNameToDisplayName, getString,
  initContext, isJSON, isNumber, layout, msClass, removeHTML,
  setCanvas, stringify, trimExtension, xhrLoad
} from "../util/index.js";
import config from "../config.js";
import Ruler from "./Ruler.js";
import { createAlert, getInput } from "../util/DialogHelper.js";

class EditView {
  constructor(editor, tab, Clazz, type, sceneView, parent_uuid, root_dir) {
    this.editor = editor;
    this.tab = tab;
    this.type = type;
    this.sceneView = sceneView;
    this.parent_uuid = parent_uuid;
    this.root_dir = root_dir;
    tab.setView(this);

    const view = this.gv = this.graphView = new Clazz(this);
    this._view = ht.Default.createView(true, this);
    view.addViewListener(e => {
      "validate" === e.kind && this.validateCanvas()
    });
    this._hRuler = createCanvas();
    this._vRuler = createCanvas();
    this._view.appendChild(view.getView());
    this.setState("edit");
    view.isInteractive = () => {
      return false;
    };
    view.addPropertyChangeListener(() => {
      this.iv()
    });
    view.addInteractorListener(e => {
      this.handleInteractorEvent(e)
    });
    this.dm.sm().addSelectionChangeListener(() => {
      this.iv();
    });
    this.dm.addDataModelChangeListener(e => {
      this.handleDataModelChanged(e);
    });
    this.dm.addDataPropertyChangeListener(e => {
      this.handleDataPropertyChanged(e);
    });
    this.dm.addPropertyChangeListener(e => {
      this.handleDataModelPropertyChanged(e);
    });
    this.dm.addHierarchyChangeListener(e => {
      this.handleHierarchyChanged(e);
    });
    this.dm.layout = (type, options) => {
      this._autoLayout || (this._autoLayout = new ht.layout.AutoLayout(view));
      this._autoLayout.options = options || {};
      let zoom = view.getZoom(),
        tx = view.tx(),
        ty = view.ty();
      this.dm.beginTransaction();
      this._autoLayout.setAnimate(config.animate);
      const finishFunc = () => {
        zoom = view.getZoom();
        tx = view.tx();
        ty = view.ty();
        const history = {
          undo: () => {
            view.setZoom(zoom);
            view.tx(tx);
            view.ty(ty)
          },
          redo: () => {
            view.setZoom(zoom);
            view.tx(tx);
            view.ty(ty)
          }
        };
        this.dm.addHistory(history);
        this.dm.endTransaction();
      };
      this._autoLayout.layout(type, () => {
        if (config.animate) {
          view.fitContent({ finishFunc });
        } else {
          view.fitContent(false, config.fitPadding);
          finishFunc();
        }
      })
    };
    view.setEditable(true);
    view.setEditStyle("moveDummyThreshold", config.moveDummyThreshold);
    view.setEditStyle("smartGuideThreshold", config.smartGuideThreshold);
    tpeditor.SceneView && view.setEditStyle("curveTipVisible", false);
    view.getInteractors().each(interactor => {
      interactor.keep = true;
    });
    this.clear();
    this.initRuler();
  }

  setRulerEnabled(value) {
    this.dm.a("rulerEnabled", value)
  }

  isRulerEnabled() {
    return this.dm.a("rulerEnabled")
  }

  reload() {
    if (this.url) {
      const params = { url: this.url };
      this.editor.fireViewEvent(this, "Reloading", params);
      if (params.preventDefault) return false;
      this.parse(this.url)
    }
  }

  save(callback, url) {
    if (!this.editable) {
      callback && callback();
      return false;
    }
    const setter = () => {
      callback && callback();
      this.editor.fireViewEvent(this, "Saved", { url: this.url });
      this.editor.makeFileNodeVisible(this.url);
    };
    if (url) {
      this._saveAs(setter, url);
    } else if (this.url) {
      this._saveImpl(setter);
    } else {
      const url = this.editor._rightClickURL || this.editor[this.type + "s"].currentDir,
        title = getString("editor.inputnew" + this.type + "name"),
        explorer = this.editor[this.type + "s"];
      if (explorer.isAccordionMode() && explorer.rootDir === url) {
        this.editor.showMessage(getString("editor.createfolderfirst"), "error", 2000);
        return false;
      }
      this._saveNew(callback, setter, title, url)
    }
  }

  _saveNew(callback, setter, title, path) {
    const doAcion = (value, action) => {
      if (action === "ok") {
        const fileName = isJSON(value) ? trimExtension(value) : value,
          url = path + "/" + fileName + ".json";
        if (this.editor.getFileNode(url)) {
          createAlert(getString("editor.filenameconflict"), url, () => {
            callback && callback();
          })
        } else {
          this.tab.setName(fileName);
          this.url = url;
          this.tab.setTag(this.url);
          this.editor.dataView.updateUrl();
          this._saveImpl(setter, true)
        }
      } else {
        callback && callback();
      }
    },
      params = { name: undefined };
    this.editor.fireViewEvent(this, "NewNameInputing", params);
    if (params.preventDefault) return false;
    if (params.name) {
      doAcion(params.name, "ok");
    } else {
      getInput(title, this.tab.getName(), {
        nullable: false,
        trim: true,
        maxLength: config.maxFileNameLength,
        checkFunc: config.checkFileName,
        body: this.editor.body
      }, doAcion);
    }
  }

  _saveAs(setter, url) {
    this.tab.setName(fileNameToDisplayName(url));
    this.url = url;
    this.tab.setTag(this.url);
    this.editor.dataView.updateUrl();
    this._saveImpl(setter);
  }

  _saveImpl(setter, canceled) {
    const url = this.url;
    let params = { url };
    if (this.type === "display" && config.settingDefaultValueBeforeSaving) {
      this.dm.each(data => {
        if (data instanceof ht.Node) {
          const img = ht.Default.getImage(data.getImage());
          img?.dataBindings?.forEach?.(binding => {
            const attr = data.getAttrObject(),
              defaultValue = binding.defaultValue;
            if (defaultValue !== undefined) {
              const name = binding.attr;
              if (attr?.[name]) {
                data.a(name, defaultValue);
              }
            }
          })
        }
      })
    }
    this.editor.fireViewEvent(this, "Saving", params);
    if (params.preventDefault) {
      if (canceled) {
        this.tab.setName(getString("editor.untitled"));
        delete this.url;
        this.tab.setTag(undefined);
        this.editor.dataView.updateUrl();
      }
      return false;
    }
    const parent_uuid = this.parent_uuid,
      root_dir = this.root_dir;
    params = {
      path: params.url,
      content: stringify(this.content),
      parent_uuid,
      root_dir
    };
    this.editor.request("upload", params, res => {
      if (res) {
        canceled && this.tab.a("uuid", res.uuid);
        const name = this.dm.a("snapshotURL") || this.g3d || this.graphView;
        this.editor.saveImage(name, url.substr(0, url.length - 5) + ".png", () => {
          setter && setter();
          this.editor.showMessage(getString("editor.savedsuccessfully"), "normal", 1000);
          this.dirty = false;
        },
          res.uuid,
          res.parent_uuid,
          res.root_dir || res.asset_type)
      } else {
        this.tab && this.editor.mainTabView.removeTab(this.tab);
        delete this.tab;
        this.editor.showMessage(getString("editor.savedfailed"), "error", 1000);
      }
    })
  }

  parse(url, json) {
    if (url || json) {
      this.url = url;
      if (json) {
        this.update(json);
      } else {
        xhrLoad(url, this.update.bind(this));
      }
    }
  }

  update(json, dirty) {
    if (json) {
      if (dirty) {
        const content = stringify(this.content),
          history = {
            undo: function () {
              this.updateImpl(content, true)
            },
            redo: function () {
              this.updateImpl(json, true)
            }
          };
        this.dm.disableHistoryManager();
        this.updateImpl(json, dirty);
        this.dm.enableHistoryManager();
        this.dm.addHistory(history);
      } else {
        this.dm.disableHistoryManager();
        this.updateImpl(json, dirty);
        this.dm.enableHistoryManager();
        this.dm.clearHistoryManager();
      }
      let type = undefined;
      if (dirty) {
        type = "Committed";
      } else if (this.isOpened) {
        type = "Reloaded";
      } else {
        type = "Opened";
        this.isOpened = true;
      }
      const params = { url: this.url, json };
      this.editor.fireViewEvent(this, type, params);
    }
  }

  getState() {
    return this._interactionState;
  }

  setState(state, type, callback, fill) {
    const oldState = this._interactionState;
    if (oldState !== state) {
      this._interactionState = state;
      this.editor.pointsEditingMode = false;
      [this.graphView, this.g3d].forEach(item => {
        if (item) {
          const interactors = [];
          item.getInteractors().each(interactor => {
            if (interactor.keep) {
              interactor.disabled = state !== "edit";
            } else {
              interactors.push(interactor);
            }
          });
          interactors.forEach(interactor => {
            interactor.tearDown();
            item.getInteractors().remove(interactor);
          });
          if (state !== "edit") {
            let interactor = this.createInteractor(type, callback, fill);
            if (item === this.g3d) {
              interactor = this.create3dInteractor(type, callback, fill)
            }
            interactor.setUp();
            item.getInteractors().add(interactor);
          }
          item.invalidateSelection();
        }
      });
      this.editor.mainToolbar.iv();
      this.fp("interactionState", oldState, state);
      this.validateCanvas();
    }
  }

  addData(data, hasParent = false, created = false, selected = false) {
    const type = this.type === "symbol" ? "compCreated" : "dataCreated",
      params = { data };
    if (created) {
      this.editor.fireViewEvent(this, type, params, false);
      return;
    }
    this.dm.beginTransaction();
    if (!hasParent && !data.getParent()) {
      data.setParent(this.graphView.getCurrentSubGraph());
    }
    this.dm.add(data);
    if (!hasParent && !selected) {
      this.dm.sm().ss(data);
      this.graphView.setFocus();
    }
    this.editor.fireViewEvent(this, type, params, false);
    this.dm.endTransaction();
  }

  skewGrid() {
    this.dm.beginTransaction();
    this.dm.a("gridAngle", 2 * Math.PI / 3);
    this.dm.a("gridRotation", Math.PI / 6);
    this.dm.endTransaction();
  }

  preview() {
    this.handlePreview("previews/" + this.type + ".json",
      this.dm.a("previewURL") || config[this.type + "PreviewURL"])
  }

  handlePreview(dir, url) {
    const tag = this.tab.getTag();
    tag && (url += (url.indexOf("?") === -1 ? "?" : "&") + "tag=" + encodeURI(tag));
    let params = { url };
    this.editor.fireViewEvent(this, "Previewing", params);
    if (params.preventDefault) return false;
    url = params.url;
    const content = this.content,
      parent_uuid = this.parent_uuid, root_dir = this.root_dir;
    params = {
      path: config.vision && tag ? "previews/" + tag : dir,
      content: stringify(content),
      parent_uuid,
      root_dir
    };
    this.editor.request("upload", params, () => {
      window.open(url, url.replace(/[^\u4E00-\u9FA5A-Za-z0-9]+/g, "_"));
      this.editor.fireViewEvent(this, "Preview", { url });
    })
  }

  setGridEnabled(value) {
    this.dm.a("gridEnabled", value);
  }

  isGridEnabled() {
    return this.dm.a("gridEnabled");
  }

  initRuler() {
    const hRuler = this._hRuler,
      vRuler = this._vRuler,
      gv = this.gv,
      type = this.type;
    this.alignGuideMap = { x: [], y: [] };
    if (tpeditor.SceneView) {
      hRuler.style.pointerEvents = "auto";
      vRuler.style.pointerEvents = "auto";
      let color = this.dm.a("alignmentGuideColor");
      if (!color) {
        if (type === "symbol") {
          color = config.symbolGridAlignmentGuideColor
        } else {
          color = config.displayGridAlignmentGuideColor;
        }
      }
      gv.setEditStyle("gridAlignmentGuideColor", color);
      new Ruler(this._hRuler, this, "x");
      new Ruler(this._vRuler, this, "y")
    }
  }

  resetGrid() { }

  clear() {
    this.dm.beginTransaction();
    this.dm.setName(undefined);
    this.dm.setBackground(undefined);
    this.dm.setHierarchicalRendering(false), this.dm.setLayers(undefined), this.dm.clear();
    this.dm.setAttrObject(undefined), this.resetGrid(), this.getGridGuide().removeAllAlignmentGuide(), this.dm.endTransaction()
  }

  handleInteractorEvent(e) {
    const kind = e.kind;
    if (["prepareMove", "prepareEdit"].includes(kind)) {
      if (!e.event.altKey) {
        if (kind === "selectPoint") {
          this.currentEditingPoint = null;
          if (e.x !== undefined) {
            this.currentEditingPoint = {
              x: e.x,
              y: e.y,
              e: isNumber(e.e) ? e.e : 0
            };
          }
          this.editor.updateInspectorPropertiesLater();
        }
      } else {
        this.editor.copy();
        this.editor.paste(true);
        this.editor.gv.validate();
      }
    }
  }

  handleDataModelChanged() {
    this.dirty = true;
  }

  handleDataPropertyChanged(e) {
    const params = {
      width: true, height: true, position: true, rotation: true,
      anchor: true, scale: true, expanded: true
    };
    if (!e.data.disableDirty) {
      if (e.property !== "*") {
        params[e.property] && this.iv();
        this.dirty = true;
      }
    }
  }

  handleHierarchyChanged() {
    this.dirty = true;
  }

  handleDataModelPropertyChanged(e) {
    const property = e.property,
      newValue = e.newValue;
    if (property === "a:rulerEnabled") {
      this.graphView.getEditInteractor().alignmentGuideEnabled = newValue, this.iv();
    } else if (property === "a:gridEnabled") {
      this.graphView.getEditInteractor().gridEnabled = newValue;
    } else if (property === "a:gridBlockSize") {
      this.graphView.setEditStyle("gridBlockSize", newValue);
    } else if (property === "a:gridThickLinesEvery") {
      this.graphView.setEditStyle("gridThickLinesEvery", newValue);
    } else if (property === "a:gridThickColor") {
      this.graphView.setEditStyle("gridThickColor", newValue);
    } else if (property === "a:gridLightColor") {
      this.graphView.setEditStyle("gridLightColor", newValue);
    } else if (property === "a:gridAngle") {
      this.graphView.setEditStyle("gridAngle", newValue);
    } else if (property === "a:gridRotation") {
      this.graphView.setEditStyle("gridRotation", newValue);
    } else if (property === "a:gridZoomThreshold") {
      this.graphView.setEditStyle("gridZoomThreshold", newValue);
    } else if (property === "a:anchorEnabled") {
      this.graphView.setEditStyle("anchorVisible", newValue);
    } else if (property === "a:guideLineEnabled") {
      this.graphView.setEditStyle("guideLineVisible", newValue);
    } else if (property === "a:highlightEnabled") {
      this.graphView.setEditStyle("hoverGuideVisible", newValue);
    } else if (property === "a:highlightColor") {
      this.graphView.setEditStyle("hoverGuideColor", newValue);
    } else if (property === "a:highlightBorderWidth") {
      this.graphView.setEditStyle("hoverGuideBorderWidth", newValue);
    } else if (property === "a:highlightBorderPattern") {
      this.graphView.setEditStyle("hoverGuideBorderPattern", newValue);
    } else if (property === "a:connectActionType") {
      this.graphView.setCurrentConnectActionType(newValue);
    } else if (property === "a:xAlignmentGuides") {
      const gridGuide = this.getGridGuide();
      gridGuide.removeAllAlignmentGuide("x");
      this.alignGuideMap.x = [];
      newValue && newValue.forEach(value => {
        const id = gridGuide.addAlignmentGuide("x", value);
        this.alignGuideMap.x.push({ id, value })
      });
      this.drawRuler();
    } else if (property === "a:yAlignmentGuides") {
      const gridGuide = this.getGridGuide();
      gridGuide.removeAllAlignmentGuide("y");
      this.alignGuideMap.y = [];
      newValue && newValue.forEach(value => {
        const id = gridGuide.addAlignmentGuide("y", value);
        this.alignGuideMap.y.push({ id, value })
      });
      this.drawRuler();
    } else if (property === "a:alignmentGuideColor") {
      this.graphView.setEditStyle("gridAlignmentGuideColor", newValue);
      this.drawRuler();
    } else if (property === "a:alignmentGuideEnabled") {
      this.graphView.getEditInteractor().alignmentGuideEnabled = newValue;
      this.drawRuler()
    }
    this.dirty = true;
    this.validateCanvas();
  }

  onClosed() {
    this.graphView.onClosed();
  }

  validateCanvasLater() {
    if (!this._validateCanvasLater) {
      this._validateCanvasLater = true;
      requestAnimationFrame(() => {
        this.validateCanvas();
      })
    }
  }

  validateCanvas() {
    this._validateCanvasLater = false;
    const canvas = this.graphView._topCanvas,
      g = initContext(canvas);
    g.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    this.graphView.getInteractors().each(function (interactor) {
      interactor.drawShape && interactor.drawShape(g);
    });
    this.drawShape(g);
    g.restore()
  }

  redraw() {
    this._lastWidth = this._lastHeight = null, this.iv()
  }

  validateImpl() {
    const rulerSize = this._rulerSize,
      enabled = this.isRulerEnabled(),
      w = this.getWidth(),
      h = this.getHeight();
    if (w !== this._lastWidth || h !== this._lastHeight ||
      rulerSize !== this._lastRulerSize || enabled !== this._lastRulerEnabled) {
      this._lastWidth = w;
      this._lastHeight = h;
      this._lastRulerSize = rulerSize;
      this._lastRulerEnabled = enabled;
      if (enabled) {
        if (!this._hRuler.parentNode) {
          this._view.appendChild(this._hRuler);
          this._view.appendChild(this._vRuler);
        }
        const width = Math.max(0, w - rulerSize),
          height = Math.max(0, h - rulerSize);
        layout(this._hRuler, rulerSize, 0, width, rulerSize);
        layout(this._vRuler, 0, rulerSize, rulerSize, height);
        layout(this.graphView, rulerSize, rulerSize, width, height);
        layout(this.graphView._topDiv, 0, 0, width, height);
        setCanvas(this.graphView._topCanvas, width, height);
        setCanvas(this._hRuler, width, rulerSize);
        setCanvas(this._vRuler, rulerSize, height);
      } else {
        if (this._hRuler.parentNode) {
          removeHTML(this._hRuler);
          removeHTML(this._vRuler);
        }
        layout(this.graphView, 0, 0, w, h);
        layout(this.graphView._topDiv, 0, 0, w, h);
        setCanvas(this.graphView._topCanvas, w, h);
      }
      this.validateCanvas();
    }
    this._hRuler.style.background = this._rulerBackground;
    this._vRuler.style.background = this._rulerBackground;
    this.drawRuler();
  }

  drawShape(g) {
    const zoom = this.graphView.getZoom(),
      tx = this.graphView.tx(),
      ty = this.graphView.ty(),
      zw = Math.round(this.dm.a("width") || 0) * zoom,
      zh = Math.round(this.dm.a("height") || 0) * zoom,
      w = this.graphView.getWidth(),
      h = this.graphView.getHeight();
    if (!config.mixMaskAndBackground &&
      this.dm.getBackground() || zw > 0 && zh > 0 && w > 0 && h > 0) {
      g.beginPath();
      tx && g.rect(0, 0, tx, h);
      ty && w - tx && g.rect(tx, 0, w - tx, ty);
      w - tx - zw && zh && g.rect(tx + zw, ty, w - tx - zw, zh);
      w - tx && h - ty - zh && g.rect(tx, ty + zh, w - tx, h - ty - zh);
      g.fillStyle = config.color_mask;
      g.fill();
    }
  }

  drawVerticalText(g, value, l) {
    g.save();
    g.translate(11, l + 11);
    g.rotate(-Math.PI / 2);
    drawText(g, value, this._rulerFont, this._rulerColor, 11, -11, 0, this._rulerSize, "right");
    g.restore();
  }

  drawRuler() {
    if (this.isRulerEnabled()) {
      const rulerFont = this._rulerFont,
        rulerSize = this._rulerSize,
        rulerColor = this._rulerColor,
        gv = this.graphView,
        list = gv.getUnionNodeRect(gv.sm().getSelection()),
        zoom = gv.getZoom(),
        interval = Math.floor(Math.log(zoom) / Math.log(10)),
        tick = 100 / Math.pow(10, interval) * zoom,
        minorTick = tick / 10,
        w = interval > 1 ? 40 + 10 * (interval - 1) : 40,
        _x = Math.round(gv.tx()),
        _y = Math.round(gv.ty()),
        rect = {
          x: -_x,
          y: -_y,
          width: gv.getWidth(),
          height: gv.getHeight()
        },
        hStart = Math.floor(rect.x / tick),
        hCount = Math.ceil((rect.x + rect.width) / tick),
        vStart = Math.floor(rect.y / tick),
        vCount = Math.ceil((rect.y + rect.height) / tick);
      let guideColor = this.dm.a("alignmentGuideColor"),
        guideEnabled = this.dm.a("alignmentGuideEnabled"),
        textSize = ht.Default.getTextSize,
        g = undefined,
        startX = undefined,
        value = undefined;
      if (!guideColor) {
        if (this.type === "symbol") {
          guideColor = config.symbolGridAlignmentGuideColor;
        } else {
          guideColor = config.displayGridAlignmentGuideColor;
        }
      }
      initContext(this._hRuler, 0, 0, 1, {
        x: 0,
        y: 0,
        width: rect.width,
        height: rulerSize
      }).restore();
      g = initContext(this._hRuler, _x, 0, 1);
      g.lineWidth = 1;
      g.strokeStyle = rulerColor;
      if (list) {
        g.beginPath();
        g.rect(list.x * zoom, 0, list.width * zoom, rulerSize);
        g.fillStyle = config.color_line;
        g.fill();
      }
      g.beginPath();
      for (let i = hStart; i <= hCount; i++) {
        startX = i * tick;
        if (interval > 1) {
          value = (startX / zoom).toFixed(interval - 1);
        } else {
          value = Math.round(startX / zoom);
        }
        startX = Math.round(startX);
        g.moveTo(startX, rulerSize);
        g.lineTo(startX, 0);
        drawText(g, value, rulerFont, rulerColor, startX, 0, 1, rulerSize, "left");
      }
      g.stroke();
      g.beginPath();
      for (let i = hStart; i <= hCount; i++) {
        for (let j = 1; j < 10; j++) {
          startX = i * tick + j * minorTick;
          if (interval > 1) {
            value = (startX / zoom).toFixed(interval - 1);
          } else {
            value = Math.round(startX / zoom);
          }
          startX = Math.round(startX);
          g.moveTo(startX, rulerSize);
          if (j === 5) {
            g.lineTo(startX, rulerSize - 10);
            drawText(g, value, rulerFont, rulerColor, startX, 0, 1, rulerSize, "left");
          } else {
            g.lineTo(startX, rulerSize - 4);
            if (minorTick > w) {
              drawText(g, value, rulerFont, rulerColor, startX, 0, 1, rulerSize, "left")
            }
          }
        }
        g.stroke();
        if (guideEnabled && this.alignGuideMap?.x.length) {
          g.beginPath();
          g.strokeStyle = guideColor;
          this.alignGuideMap.x.forEach(function (item) {
            g.moveTo(zoom * item.value, 0);
            g.lineTo(zoom * item.value, rulerSize);
          });
          g.stroke();
        }
      }
      const guideLineX = this.hoverGuideLineX;
      if (guideEnabled && guideLineX) {
        const x = zoom * guideLineX.x;
        textSize = textSize(rulerFont, guideLineX.x);
        g.fillStyle = config.color_pane;
        g.fillRect(x, 0, textSize.width, rulerSize);
        drawText(g, guideLineX.x, rulerFont, guideColor, x, 0, textSize.width, rulerSize, "left", "middle");
        g.beginPath();
        g.lineWidth = 2;
        g.moveTo(x, 0);
        g.lineTo(x, rulerSize);
        g.strokeStyle = ht.Default.brighter(guideColor);
        g.stroke();
      }
      g.restore();
      initContext(this._vRuler, 0, 0, 1, {
        x: 0,
        y: 0,
        width: rulerSize,
        height: rect.height
      }).restore();
      g = initContext(this._vRuler, 0, _y, 1);
      g.lineWidth = 1;
      g.strokeStyle = rulerColor;
      if (list) {
        g.beginPath();
        g.rect(0, list.y * zoom, rulerSize, list.height * zoom);
        g.fillStyle = config.color_line;
        g.fill();
      }
      g.beginPath();
      for (let i = vStart; i <= vCount; i++) {
        startX = i * tick;
        if (interval > 1) {
          value = (startX / zoom).toFixed(interval - 1);
        } else {
          value = Math.round(startX / zoom);
        }
        startX = Math.round(startX);
        g.moveTo(rulerSize, startX);
        g.lineTo(0, startX);
        this.drawVerticalText(g, value, startX);
      }
      g.stroke();
      g.beginPath();
      for (let i = vStart; i <= vCount; i++) {
        for (let j = 1; j < 10; j++) {
          startX = i * tick + j * minorTick;
          if (interval > 1) {
            value = (startX / zoom).toFixed(interval - 1);
          } else {
            value = Math.round(startX / zoom);
          }
          startX = Math.round(startX); g.moveTo(rulerSize, startX);
          if (j === 5) {
            g.lineTo(rulerSize - 10, startX);
            this.drawVerticalText(g, value, startX)
          } else {
            g.lineTo(rulerSize - 4, startX);
            if (minorTick > w) {
              this.drawVerticalText(g, value, startX);
            }
          }
        }
        g.stroke();
        if (guideEnabled && this.alignGuideMap?.y.length) {
          g.strokeStyle = guideColor;
          this.alignGuideMap.y.forEach(function (item) {
            g.moveTo(0, zoom * item.value);
            g.lineTo(rulerSize, zoom * item.value);
          });
          g.stroke();
        }
      }
      const guideLineY = this.hoverGuideLineY;
      if (guideEnabled && guideLineY) {
        const y = zoom * guideLineY.y;
        textSize = textSize(rulerFont, guideLineY.y);
        g.fillStyle = config.color_pane;
        g.fillRect(0, y, rulerSize, textSize.width);
        g.save();
        g.translate(0, y);
        g.rotate(-Math.PI / 2);
        drawText(g, guideLineY.y, rulerFont, guideColor, -textSize.width, 0, textSize.width, rulerSize, "right");
        g.restore();
        g.beginPath();
        g.lineWidth = 2;
        g.moveTo(0, y);
        g.lineTo(rulerSize, y);
        g.strokeStyle = ht.Default.brighter(guideColor), g.stroke()
      }
      g.restore();
    }
  }

  updateAlignGuide() {
    if (this.getGridGuide()) {
      const dm = this.dm,
        map = this.alignGuideMap,
        x = map.x,
        y = map.y;
      dm.beginTransaction();
      dm.a({
        xAlignmentGuides: x?.map?.(function (prop) {
          return prop.value;
        }) ?? undefined,
        yAlignmentGuides: y?.map?.(function (prop) {
          return prop.value;
        }) ?? undefined
      });
      dm.endTransaction();
    }
  }

  getGridGuide() {
    return this.gv.getEditInteractor() ? this.gv.getEditInteractor().gridGuide : null;
  }

  get dirty() {
    return this.tab.a("dirty")
  }

  set dirty(value) {
    if (!ht.Default.loadingRefGraph) {
      this.tab.a("dirty", value);
    }
  }

  get editable() {
    return this.sceneView ? this.sceneView.editable : this._editable;
  }

  set editable(p) {
    if (this.sceneView || p !== this._editable) {
      this._editable = p;
      this.gv.invalidateSelection();
      this.editor.mainToolbar.iv();
    }
  }

  get dm() {
    return this.graphView.dm();
  }
}

msClass(EditView, {
  ms_v: 1,
  ms_fire: 1,
  ms_ac: ["rulerBackground", "rulerFont", "rulerColor", "rulerSize", "guideColor"],
  tpeditor_editview: 1,
  _rulerFont: config.smallFont,
  _rulerBackground: config.color_pane,
  _rulerColor: config.color_dark,
  _rulerSize: config.rulerSize,
  _guideColor: config.color_transparent,
  _interactionState: undefined
});

export default EditView;
