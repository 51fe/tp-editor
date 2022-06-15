export default class ShapeHelper{
  constructor(editor) {
    this.editor = editor;
    this.editing3d = false;
    this.reset();
  }

  reset() {
    this.points = [];
    this.segments = [];
    this.isBreak = false;
    this.nextPoint = null;
    this.closePath = false;
    this.preCtrl = null;
    this.drawPoint = null;
    this.downPoint = null;
    this.shape = null;
  }

  setShape(shape) {
    this.shape = shape;
  }

  setPoint(index, point) {
    this.points[index] = point;
  }

  setSegment(index, segment) {
    this.segments[index] = segment;
  }

  setEditing3d(editing3d) {
    this.editing3d = editing3d;
  }

  isEditing3d() {
    return this.editing3d;
  }
}