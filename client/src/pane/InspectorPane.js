import config from "../config.js";
import { parseValue } from "../util/index.js";
import Basic from "../type/Basic.js";
import Shape from "../type/Shape.js";
import Image from "../type/Image.js";
import Border from "../type/Border.js";
import Clip from "../type/Clip.js";
import Restore from "../type/Restore.js";
import Text from "../type/Text.js";
import CompType from "../type/CompType.js";
import FuncType from "../type/FuncType.js";
import LineChart from "../type/LineChart.js";
import ColumnChart from "../type/ColumnChart.js";
import PieChart from "../type/PieChart.js";

import BasicInspector from "../inspector/BasicInspector.js";
import BorderInspector from "../inspector/BorderInspector.js";
import ClipInspector from "../inspector/ClipInspector.js";
import ColumnChartInspector from "../inspector/ColumnChartInspector.js";
import CompTypeInspector from "../inspector/CompTypeInspector.js";
import DisplayInspector from "../inspector/DisplayInspector.js";
import FuncTypeInspector from "../inspector/FuncTypeInspector.js";
import HTBlockInspector from "../inspector/HTBlockInspector.js";
import HTDataInspector from "../inspector/HTDataInspector.js";
import HTGroupInspector from "../inspector/HTGroupInspector.js";
import HTNodeInspector from "../inspector/HTNodeInspector.js";
import HTShapeInspector from "../inspector/HTShapeInspector.js";
import HTTextInspector from "../inspector/HTTextInspector.js";
import HTEdgeInspector from "../inspector/HTEdgeInspector.js";
import HTRefGraphInspector from "../inspector/HTRefGraphInspector.js";
import ImageInspector from "../inspector/ImageInspector.js";
import LineChartInspector from "../inspector/LineChartInspector.js";
import OneDimensionalColumnChartInspector from "../inspector/OneDimensionalColumnChartInspector.js";
import PieChartInspector from "../inspector/PieChartInspector.js";
import RestoreInspector from "../inspector/RestoreInspector.js";
import ShapeInspector from "../inspector/ShapeInspector.js";
import SymbolInspector from "../inspector/SymbolInspector.js";
import TextInspector from "../inspector/TextInspector.js";
import SymbolView from "../view/SymbolView.js";
import DisplayView from "../view/DisplayView.js";


export default class InspectorPane extends ht.widget.BorderPane {
  constructor(editor) {
    super();
    this.editor = editor;
    this.getView().style.background = config.color_pane;
  }

  handleDataModelPropertyChange(e) {
    const inspector = this.inspector;
    if (inspector && inspector.global) {
      inspector.invalidateProperties(e);
    }
  }

  handleDataModelChange() {
    const inspector = this.inspector;
    if (inspector && inspector.global) {
      inspector.invalidateProperties();
    }
  }

  handleDataPropertyChange(e) {
    const inspector = this.inspector;
    if (inspector && !inspector.global && inspector.data === e.data) {
      inspector.invalidateProperties(e);
    }
  }

  handleSelectionChange() {
    this.updateInspector();
    this.inspector && this.inspector.updateProperties()
  }

  handleGraphViewInteractorChange(e) {
    const inspector = this.inspector;
    if (inspector) {
      if (e.property === "pointsEditingMode") {
        inspector.filterPropertiesLater();
      } else if (e.property === "shapePointStatus" && inspector.editingPointButtons) {
        inspector.editingPointButtons.forEach(function (btns) {
          btns.setSelected(btns.statusValue === e.newValue);
          btns.setBorderColor(btns.isSelected() ? config.color_line : null);
        })
      }
    }
  }

  initTab(tab) {
    if (this.dataModel) {
      this.dataModel.removeDataModelChangeListener(this.handleDataModelChange, this);
      this.dataModel.removePropertyChangeListener(this.handleDataModelPropertyChange, this);
      this.dataModel.removeDataPropertyChangeListener(this.handleDataPropertyChange, this);
      this.dataModel.sm().ums(this.handleSelectionChange, this);
      this.currentView.graphView.getEditInteractor().ump(this.handleGraphViewInteractorChange, this);
    }
    if (tab) {
      if (tab._isUI) return;
      this.currentView = tab.getView();
      this.dataModel = this.currentView.dm;
      this.dataModel.addDataModelChangeListener(this.handleDataModelChange, this);
      this.dataModel.addPropertyChangeListener(this.handleDataModelPropertyChange, this);
      this.dataModel.addDataPropertyChangeListener(this.handleDataPropertyChange, this);
      this.dataModel.sm().ms(this.handleSelectionChange, this);
      this.currentView.graphView.getEditInteractor().mp(this.handleGraphViewInteractorChange, this);
      this.g3d = this.currentView.g3d;
    } else {
      this.dataModel = null;
      this.currentView = null;
      this.g3d = null;
    }
    this.updateInspector();
  }

  getDataInspector(data) {
    if (data instanceof ht.Shape) {
      return this.htShapeInspector;
    } else if (data instanceof ht.Edge) {
      return this.htEdgeInspector;
    } else if (data instanceof ht.Group) {
      return this.htGroupInspector;
    } else if (data instanceof ht.Text) {
      return this.htTextInspector;
    } else if (data instanceof ht.RefGraph) {
      return this.htRefGraphInspector;
    } else if (data instanceof ht.Block) {
      return this.htBlockInspector;
    } else if (data instanceof ht.Node) {
      return this.htNodeInspector;
    }
    return this.htDataInspector;
  }

  getCompInspector(comp) {
    if (comp instanceof Clip) return this.clipInspector;
    if (comp instanceof Restore) return this.restoreInspector;
    if (comp instanceof Basic) return this.basicInspector;
    if (comp instanceof Border) return this.borderInspector;
    if (comp instanceof Image) return this.imageInspector;
    if (comp instanceof PieChart) return this.pieChartInspector;
    if (comp instanceof ColumnChart) {
      const series = parseValue(comp.s("chart.series"));
      if (series && series.length <= 1 && series[0].colors) {
        return this.oneDimensionalColumnChartInspector;
      }
      return this.columnChartInspector;
    }
    if (comp instanceof LineChart) return this.lineChartInspector;
    if (comp instanceof Shape) return this.shapeInspector;
    if (comp instanceof Text) return this.textInspector;
    if (comp instanceof FuncType) return this.funcTypeInspector;
    if (comp instanceof CompType) return this.compTypeInspector;
    return null
  }

  updateInspector() {
    if (this.dataModel) {
      const ld = this.dataModel.sm().ld();
      if (ld) {
        if (this.currentView instanceof SymbolView) {
          this.inspector = this.getCompInspector(ld);
        } else if (this.currentView instanceof DisplayView) {
          this.inspector = this.getDataInspector(ld)
        } else if (this.currentView instanceof tpeditor.SceneView) {
          this.inspector = this.getData3dInspector(ld);
        }
      } else if (this.currentView instanceof SymbolView) {
        this.inspector = this.symbolInspector;
      } else if (this.currentView instanceof DisplayView) {
        this.inspector = this.displayInspector;
      } else if (this.currentView instanceof tpeditor.SceneView) {
        this.inspector = this.sceneInspector;
      }
      if (this.inspector) {
        this.inspector.currentView = this.currentView;
      }
    } else {
      this.inspector = null;
    }
  }

  get basicInspector() {
    if (!this._basicInspector) {
      this._basicInspector = new BasicInspector(this.editor, "basic");
    }
    return this._basicInspector;
  }

  get borderInspector() {
    if (!this._borderInspector) {
      this._borderInspector = new BorderInspector(this.editor, "border");
    }
    return this._borderInspector;
  }

  get clipInspector() {
    if (!this._clipInspector) {
      this._clipInspector = new ClipInspector(this.editor, "clip");
    }
    return this._clipInspector;
  }

  get restoreInspector() {
    if (!this._restoreInspector) {
      this._restoreInspector = new RestoreInspector(this.editor, "restore");
    }
    return this._restoreInspector;
  }

  get imageInspector() {
    if (!this._imageInspector) {
      this._imageInspector = new ImageInspector(this.editor, "image");
    }
    return this._imageInspector;
  }

  get pieChartInspector() {
    if (!this._pieChartInspector) {
      this._pieChartInspector = new PieChartInspector(this.editor, "pieChart");
    }
    return this._pieChartInspector;
  }

  get oneDimensionalColumnChartInspector() {
    if (!this._oneDimensionalColumnChartInspector) {
      this._oneDimensionalColumnChartInspector = new OneDimensionalColumnChartInspector(this.editor, "oneDimensionalColumnChartInspector");
    }
    return this._oneDimensionalColumnChartInspector;
  }

  get columnChartInspector() {
    if (!this._columnChartInspector) {
      this._columnChartInspector = new ColumnChartInspector(this.editor, "columnChart");
    }
    return this._columnChartInspector;
  }

  get lineChartInspector() {
    if (!this._lineChartInspector) {
      this._lineChartInspector = new LineChartInspector(this.editor, "lineChart");
    }
    return this._lineChartInspector
  }

  get shapeInspector() {
    if (!this._shapeInspector) {
      this._shapeInspector = new ShapeInspector(this.editor, "shape");
    }
    return this._shapeInspector;
  }

  get textInspector() {
    if (!this._textInspector) {
      this._textInspector = new TextInspector(this.editor, "text");
    }
    return this._textInspector;
  }

  get funcTypeInspector() {
    if (!this._funcTypeInspector) {
      this._funcTypeInspector = new FuncTypeInspector(this.editor, "func");
    }
    return this._funcTypeInspector;
  }

  get compTypeInspector() {
    if (!this._compTypeInspector) {
      this._compTypeInspector = new CompTypeInspector(this.editor, "comp");
    }
    return this._compTypeInspector;
  }

  get htShapeInspector() {
    if (!this._htShapeInspector) {
      this._htShapeInspector = new HTShapeInspector(this.editor, "Shape");
    }
    return this._htShapeInspector;
  }

  get htBlockInspector() {
    if (!this._htBlockInspector) {
      this._htBlockInspector = new HTBlockInspector(this.editor, "Block");
    }
    return this._htBlockInspector;
  }

  get htRefGraphInspector() {
    if (!this._htRefGraphInspector) {
      this._htRefGraphInspector = new HTRefGraphInspector(this.editor, "RefGraph");
    }
    return this._htRefGraphInspector;
  }

  get htGroupInspector() {
    if (!this._htGroupInspector) {
      this._htGroupInspector = new HTGroupInspector(this.editor, "Group");
    }
    return this._htGroupInspector;
  }

  get htEdgeInspector() {
    if (!this._htEdgeInspector) {
      this._htEdgeInspector = new HTEdgeInspector(this.editor, "Edge");
    }
    return this._htEdgeInspector;
  }

  get htNodeInspector() {
    if (!this._htNodeInspector) {
      this._htNodeInspector = new HTNodeInspector(this.editor, "Node");
    }
    return this._htNodeInspector;
  }

  get htTextInspector() {
    if (!this._htTextInspector) {
      this._htTextInspector = new HTTextInspector(this.editor, "Text");
    }
    return this._htTextInspector;
  }

  get htDataInspector() {
    if (!this._htDataInspector) {
      this._htDataInspector = new HTDataInspector(this.editor, "Data");
    }
    return this._htDataInspector;
  }

  get displayInspector() {
    if (!this._displayInspector) {
      this._displayInspector = new DisplayInspector(this.editor, "display");
    }
    return this._displayInspector;
  }

  get symbolInspector() {
    if (!this._symbolInspector) {
      this._symbolInspector = new SymbolInspector(this.editor, "symbol");
    }
    return this._symbolInspector;
  }

  get inspector() {
    return this.getCenterView();
  }

  set inspector(pane) {
    const view = this.getCenterView();
    if (pane) {
      pane.dataModel = this.dataModel;
      if (this.dataModel) {
        pane.data = this.dataModel.sm().ld();
      }
      pane.g3d = this.g3d;
      if (this.getCenterView() !== pane) {
        this.setCenterView(pane);
      }
      pane.filterPropertiesLater();
    } else {
      this.setCenterView(null);
      pane === view || pane == null && view == null ||
        this.editor.fireEvent("inspectorUpdated", {
          inspector: pane,
          oldInspector: view
        })
    }
  }
}
