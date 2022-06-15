import { isJSON, isString, parseValue } from "./index.js";
import Basic from "../type/Basic.js";
import Image from "../type/Image.js";
import Shape from "../type/Shape.js";
import Text from "../type/Text.js";
import Border from "../type/Border.js";
import Clip from "../type/Clip.js";
import Restore from "../type/Restore.js";
import CompType from "../type/CompType.js";
import FuncType from "../type/FuncType.js";
import PieChart from "../type/PieChart.js";
import ColumnChart from "../type/ColumnChart.js";
import LineChart from "../type/LineChart.js";

export const instances = {
  rect: Basic,
  circle: Basic,
  oval: Basic,
  roundRect: Basic,
  star: Basic,
  triangle: Basic,
  hexagon: Basic,
  pentagon: Basic,
  diamond: Basic,
  rightTriangle: Basic,
  parallelogram: Basic,
  trapezoid: Basic,
  polygon: Basic,
  arc: Basic,
  image: Image,
  shape: Shape,
  text: Text,
  border: Border,
  pieChart: PieChart,
  oneDimensionalColumnChart: ColumnChart,
  columnChart: ColumnChart,
  percentageColumnChart: ColumnChart,
  stackedColumnChart: ColumnChart,
  lineChart: LineChart,
  comp: CompType,
  clip: Clip,
  restore: Restore,
  endClip: Restore
};

export function getInstance(node, view) {
  const dm = view ? view.dm : null,
    w = dm ? dm.a("width") : 100,
    h = dm ? dm.a("height") : 100;
  let instance = parseValue(node.type);
  if (isString(instance)) {
    const Instance = instances[instance];
    if (Instance) {
      instance = new Instance(node, w, h)
    } else if (isJSON(instance)) {
      instance = new CompType(node, w, h)
    }
  } else {
    instance = new FuncType(node, w, h);
  }
  if (instance && view) {
    view.addData(instance, true);
  }
  return instance;
}
