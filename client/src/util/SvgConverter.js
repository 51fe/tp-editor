import canvg from "canvg";

const INFO = { debug: () => { }, warn: () => { }, error: () => { } }

function showUnhandledError(error) {
  INFO.debug("unhandled group " + formatError(error))
}

function formatError(error) {
  return error.code + ":" + error.value
}

class Context2dProxy {
  constructor(ctx, writer, options) {
    var _this = this;
    this.ctx = ctx, this.writer = writer, _this._currentContext = {
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      tx: 0,
      ty: 0
    };
    this._emptyPath();
    this._forceSplitEllipse = true;
    this._splitToBezier = options.splitToBezier;
    this._ellipseSegments = options.segments;
    this._minimumFontSize = options.minimumFontSize;
    this._contextStack = [];
    for (const key in CanvasRenderingContext2D.prototype) {
      if (key !== "webkitImageSmoothingEnabled") {
        const m = ctx[key];
        if (typeof m === "function") {
          (ctx[key] = function (name, callback) {
            return function () {
              try {
                const O = callback.apply(ctx, arguments);
                _this.handleFunc(name, O, arguments)
                return O;
              } catch (p) {
              }
            }
          }(key, m))
        }
      }
    }
  }

  handleFunc(name, r, rest) {
    switch (name) {
      case "save":
        this._ctxSave();
        break;
      case "restore":
        this._ctxRestore();
        break;
      case "translate":
        this._ctxTranslate(...rest);
        break;
      case "rotate":
        this._ctxRotate(...rest);
        break;
      case "scale":
        this._ctxScale(...rest);
        break;
      case "setTransform":
        this._ctxSetTransform(...rest);
        break;
      case "transform":
        this._ctxTransform(...rest);
        break;
      case "fillText":
      case "strokeText":
        this._ctxText(...rest, "fillText" === name);
        break;
      case "rect":
        this._ctxRect(...rest);
        break;
      case "fill":
        this._ctxFill(...rest);
        break;
      case "fillRect":
        this._ctxRect(...rest);
        this._ctxDraw("fill");
        break;
      case "stroke":
        this._ctxDraw("stroke");
        break;
      case "moveTo":
        this._ctxMoveTo(...rest);
        break;
      case "lineTo":
        this._ctxLineTo(...rest);
        break;
      case "beginPath":
        this._ctxBeginPath();
        break;
      case "closePath":
        this._ctxClosePath();
        break;
      case "arc":
        this._ctxArc(...rest);
        break;
      case "ellipse":
        this._ctxEllipse(...rest);
        break;
      case "quadraticCurveTo":
        this._ctxBezier([{ x: rest[0], y: rest[1] }], rest[2], rest[3]);
        break;
      case "bezierCurveTo":
        this._ctxBezier([{ x: rest[0], y: rest[1] }, { x: rest[2], y: rest[3] }], rest[4], rest[5]);
        break;
      case "createLinearGradient":
        this._ctxCreateGradient(r, true, ...rest);
        break;
      case "createRadialGradient":
        this._ctxCreateGradient(r, false, ...rest);
        break;
      case "createPattern":
        this._ctxCreatePattern(r, rest[0], rest[1]);
        break;
      case "drawImage":
        this._ctxDrawImage(...rest);
        break;
      case "clip":
        this._ctxClip();
    }
  }
  handleSetter() { }
  _ctxSave() {
    var p = this, r = {}, l = p._currentContext;
    for (var a in l) r[a] = l[a], "clip" === a && l[a] && delete l[a];
    p._contextStack.push(r)
  }
  _ctxRestore() {
    var p = this;
    p._currentContext.clip && p.writer.addRestore(), p._currentContext = p._contextStack.pop(), p._transformUpdated()
  }
  _ctxTranslate(p, r) {
    if (p = p || 0, r = r || 0, 0 !== p || 0 !== r) {
      var l = this, a = l._currentContext, O = a.a, N = a.b, A = a.c, $ = a.d;
      a.tx = O * p + A * r + a.tx, a.ty = N * p + $ * r + a.ty, l._transformUpdated()
    }
  }
  _ctxScale(p, r) {
    if (p = p || 1, r = r || 1, 1 !== p || 1 !== r) {
      var l = this, a = l._currentContext;
      a.a *= p, a.b *= p, a.c *= r, a.d *= r, l._transformUpdated()
    }
  }
  _ctxRotate(p) {
    var r = Math.cos(p), l = Math.sin(p), a = this, O = a._currentContext, N = O.a, A = O.b, $ = O.c, T = O.d;
    O.a = N * r + $ * l, O.b = A * r + T * l, O.c = -N * l + $ * r, O.d = -A * l + T * r, a._transformUpdated()
  }
  _ctxSetTransform(p, r, l, a, O, N) {
    var A = this, $ = A._currentContext;
    $.a = p, $.b = r, $.c = l, $.d = a, $.tx = O, $.ty = N, A._transformUpdated()
  }
  _ctxTransform(p, r, l, a, O, N) {
    var A = this, $ = A._currentContext, T = $.a, i = $.b, m = $.c, h = $.d;
    $.a = T * p + m * r, $.b = i * p + h * r, $.c = T * l + m * a, $.d = i * l + h * a, $.tx = T * O + m * N + $.tx, $.ty = i * O + h * N + $.ty, A._transformUpdated()
  }
  _transformUpdated() {
  }
  _calcCurrentRotation() {
    var p = this._currentContext;
    return 0 === p.b && 0 === p.c ? 0 : Math.atan2(p.b, p.a)
  }
  _calcCurrentScale() {
    var p = this._currentContext;
    return { x: Math.sqrt(p.a * p.a + p.c * p.c), y: Math.sqrt(p.b * p.b + p.d * p.d) }
  }
  _transformPoint(p) {
    var r = this._currentContext, l = p.x, a = p.y;
    return { x: r.a * l + r.c * a + r.tx, y: r.b * l + r.d * a + r.ty }
  }
  _transformPoints(p) {
    for (var r = this, l = new Array(p.length), a = 0, O = p.length; a < O; a++) l[a] = r._transformPoint(p[a]);
    return l
  }
  _transformSize(p) {
    var r = this._currentContext;
    return p * Math.max(Math.sqrt(r.c * r.c + r.d * r.d), Math.sqrt(r.a * r.a + r.b * r.b))
  }
  _equal(p, r) {
    var l = p - r;
    return l > -1e-5 && l < 1e-5
  }
  _getTextFirstPixelLine(p, r) {
    var l, a = this._measureTextCanvas;
    a ? l = this._measureTextContext : (a = this._measureTextCanvas = document.createElement("canvas"), l = this._measureTextContext = a.getContext("2d")), l.font = p;
    var O = Math.ceil(l.measureText("H").width), N = 4 * O;
    if (a.width = O, a.height = N, l.fillStyle = "#f00", l.fillRect(0, 0, O, N), l.textBaseline = r, l.fillStyle = "#000", l.font = p, l.fillText("H", 0, N / 2), !l.getImageData(0, 0, O, N)) return 0;
    var A, $, T = l.getImageData(0, 0, O, N).data, i = 4 * O;
    for (A = 0; A < N; A++) for ($ = 0; $ < i; $ += 4) if (255 !== T[i * A + $]) return A;
    return 0
  }
  _calcShift(p, r, l) {
    var a = this._fontBaselineShiftCache;
    a || (a = this._fontBaselineShiftCache = {});
    var O = p + r + l, N = a[O];
    if (N) return N;
    var A = this._getTextFirstPixelLine(p, r), $ = this._getTextFirstPixelLine(p, l);
    return a[O] = A - $
  }
  _ctxText(p, r, l, a) {
    var O = this, N = O.ctx, A = N.font, $ = a ? N.fillStyle : N.strokeStyle, T = N.textAlign, i = N.textBaseline;
    "middle" !== i && "top" !== i && "bottom" !== i && (l -= O._calcShift(A, "middle", i), i = "middle");
    var m, h, Z = 1, V = O._minimumFontSize;
    if ("string" == typeof A && (h = A.match(/[\d.]+/))) {
      m = 1 * h[0];
      var R = O._transformSize(m);
      R < V && (Z = R / V, R = V), A = A.replace(h[0], R)
    }
    var L = O._calcCurrentRotation();
    "string" == typeof $ && "rgba(0,0,0,0)" === $.replace(/ /g, "") || p.trim().length && ($ = { color: $ }, O._tryConvertAndRecordGradient($), O.writer.addText(p, O._transformPoint({
      x: r,
      y: l
    }), A, L, T, i, $, Z))
  }
  _ctxDrawImage(p, r, a, O, N, A, $) {
    if (p.width && p.height) {
      O === undefined && N === undefined ? (A = r, $ = a, r = 0, a = 0, O = p.width, N = p.height) : A === undefined && $ === undefined && (A = r, $ = a, r = 0, a = 0, O = p.width, N = p.height);
    }
  }
  _ctxClip() {
    var p = this;
    p._currentContext.clip = true, p._ctxDraw("clip")
  }
  _ctxCreateGradient(p, r, l) {
    p.isLinear = r, p.points = r ? [l[0], l[1], l[2], l[3]] : [l[0], l[1], l[2], l[3], l[4], l[5]];
    var a = this._currentContext;
    p.trans = [a.a, a.b, a.c, a.d, a.tx, a.ty];
    var O = p.addColorStop;
    p.addColorStop = function (r, l) {
      O.apply(this, arguments), p.colorStops || (p.colorStops = []), p.colorStops.push(r, l)
    }
  }
  _ctxCreatePattern() { }
  _ctxRect(p, r, l, a) {
    var O = this, N = O._transformPoints([{ x: p, y: r }, { x: p + l, y: r }, { x: p + l, y: r + a }, { x: p, y: r + a }]);
    O._path.push({ type: "rect", points: N })
  }
  _ctxMoveTo(p, r) {
    var l = this, a = l._transformPoint({ x: p, y: r });
    l._headPoint = a, l._path.push({ type: "moveTo", x: a.x, y: a.y })
  }
  _ctxLineTo(p, r) {
    var l = this, a = l._transformPoint({ x: p, y: r });
    l._path.push({ type: "lineTo", x: a.x, y: a.y })
  }
  _ctxArc(p, r, l, a, O, N) {
    a = a || 0, O = O || 2 * Math.PI, l && this._ctxEllipse(p, r, l, l, 0, a, O, N)
  }
  _ctxEllipse(p, r, l, a, O, N, A, $) {
    var T, i, m, h, Z, V, R, L, f, y, Q, d, G, D, C = this, x = C._calcCurrentScale(),
      z = C._transformPoint({ x: p, y: r });
    Z = Math.sin(O), V = Math.cos(O);
    var k = function (p) {
      return X(Math.cos(-p), Math.sin(-p))
    }, X = function (O, N) {
      var A = l * O, $ = a * N;
      return { x: p + (V * A - Z * $), y: r + (Z * A + V * $) }
    }, E = [], Y = A;
    if ($) for (; Y >= N;) Y -= 2 * Math.PI; else for (; Y <= N;) Y += 2 * Math.PI;
    for (f = (Y - N) / C._ellipseSegments, Q = 0; Q <= C._ellipseSegments; Q++) y = N + f * Q, d = C._transformPoint(k(-y)), E.push(d);
    var c = N, w = Y;
    if (E[0], h = E[E.length - 1], T = C._calcaEllipseAngle(N, A, $), N = T.start, A = T.end, R = C._equal(x.x, x.y), L = C._equal(l, a), !C._forceSplitEllipse && R && L && C._equal(Math.abs(N - A), 2 * Math.PI)) C._path.push({
      type: "circle",
      x: z.x,
      y: z.y,
      end: h,
      keyPoints: E,
      radius: l * x.x
    }); else if (!C._forceSplitEllipse && R && L) i = C._calcCurrentRotation(), m = Math.cos(i), G = C._currentContext.a * m < 0, D = C._currentContext.d * m < 0, T = C._transformStartEndAngle(N, A, G, D), N = T.start - i, A = T.end - i, C._path.push({
      type: "arc",
      x: z.x,
      y: z.y,
      end: h,
      radius: l * x.x,
      startAngle: N,
      endAngle: A,
      keyPoints: E
    }); else {
      if (C._forceSplitEllipse || !R) {
        if (C._path.length || C._path.push({ type: "moveTo", x: E[0].x, y: E[0].y }), C._splitToBezier) {
          var s, _, e, g = w - c, S = Math.max(Math.ceil(Math.abs(g) / Math.PI * 2), 1), u = g / S,
            B = Math.tan(.5 * u), W = Math.sin(u) * (Math.sqrt(4 + 3 * B * B) - 1) / 3, M = Math.cos(c),
            b = Math.sin(c);
          for (Q = 0; Q < S; Q++) {
            e = c + (Q + 1) * u, s = Math.cos(e), _ = Math.sin(e);
            var H = X(s, _);
            C._ctxBezier([X(M - b * W, b + M * W), X(s + _ * W, _ - s * W)], H.x, H.y), M = s, b = _, e
          }
          return
        }
        for (Q = 1; Q <= C._ellipseSegments; Q++) d = E[Q], C._path.push({ type: "lineTo", x: d.x, y: d.y });
        return
      }
      var I, P, v = C._transformPoint(k(0)), t = C._transformPoint(k(Math.PI / 2)), n = function (p, r) {
        var l = p.x - r.x, a = p.y - r.y;
        return Math.sqrt(l * l + a * a)
      }, U = n(v, z), q = n(t, z);
      q > U ? (P = U, U = q, q = P, I = t) : I = v, i = C._calcCurrentRotation(), m = Math.cos(i), G = C._currentContext.a * m < 0, D = C._currentContext.d * m < 0, T = C._transformStartEndAngle(N - Math.PI / 2, A - Math.PI / 2, G, D), N = T.start, A = T.end, C._path.push({
        type: "ellipse",
        x: z.x,
        y: z.y,
        end: h,
        major: { x: I.x - z.x, y: I.y - z.y },
        ratio: q / U,
        startAngle: N,
        endAngle: A,
        keyPoints: E
      })
    }
  }
  _ctxBezier(p, r, l) {
    var a = this, O = a._transformPoint({ x: r, y: l });
    this._path.push({ type: "bezier", x: O.x, y: O.y, ctrl: a._transformPoints(p) })
  }
  _ctxBeginPath() {
    this._emptyPath()
  }
  _ctxClosePath() {
    var p = this, r = p._headPoint;
    r && (p._path.push({
      type: "lineTo",
      x: r.x,
      y: r.y,
      subType: "closePath"
    }), p._headPoint = null, p._lastPoint = null)
  }
  _calcaEllipseAngle(p, r, l) {
    p = -p, r = -r;
    var a, O = p % (2 * Math.PI), N = r % (2 * Math.PI);
    for (O < 0 && (O += 2 * Math.PI), N < 0 && (N += 2 * Math.PI), l || (a = O, O = N, N = a); N <= O;) N += 2 * Math.PI;
    return { start: O, end: N }
  }
  _transformStartEndAngle(p, r, l, a) {
    var O;
    return (a || l) && (l && a ? (p = Math.PI + p, r = Math.PI + r) : (O = Math.PI * (l ? 1 : 2) - r, r = Math.PI * (l ? 1 : 2) - p, p = O)), {
      start: p,
      end: r
    }
  }
  _ctxFill(p) {
    var r = this;
    return r._fillRule = p || "nonzero", r._ctxDraw("fill")
  }
  _tryConvertAndRecordGradient(p) {
    if ("string" != typeof p.color) {
      var r = this;
      if (p.color instanceof CanvasGradient) {
        const color = p.color,
          O = r._currentContext;
        let a = [color.isLinear ? "L" : "R"];
        a = a.concat(color.points);
        a = a.concat([O.a, O.b, O.c, O.d, O.tx, O.ty]);
        a = a.concat(color.colorStops);
        p.gradientPack = a;
      } else if (p.color instanceof CanvasPattern && p.color.gradient) {
        const N = p.color, gradient = N.gradient;
        let a = [gradient.isLinear ? "L" : "R"];
        a = a.concat(gradient.points);
        var A = N.trans, O = r._currentContext, $ = O.a, T = O.b, i = O.c, m = O.d, h = O.tx, Z = O.ty, V = A[0],
          R = A[1], L = A[2], f = A[3], y = A[4], Q = A[5];
        a = a.concat([$ * V + i * R, T * V + m * R, $ * L + i * f, T * L + m * f, $ * y + i * Q + h, T * y + m * Q + Z]), a = a.concat(gradient.colorStops), p.gradientPack = a
      } else p.trans = [r._currentContext.a, r._currentContext.b, r._currentContext.c, r._currentContext.d, r._currentContext.tx, r._currentContext.ty], p.color = p.color.image ? p.color.image : p.color, p.isPattern = true
    }
  }
  _ctxDraw(p) {
    var r = this, l = r._path;
    if (l.length) {
      var a, O, N, A, $, T = [], i = [];
      if ("clip" === p) $ = { clip: true }; else {
        if ("stroke" === p) {
          $ = { stroke: true, lineWidth: r._transformSize(r.ctx.lineWidth), color: r.ctx.strokeStyle };
          var m = r.ctx.lineCap;
          "butt" !== m && ($.lineCap = m);
          var h = r.ctx.getLineDash();
          if (h && h.length) {
            $.dash = true;
            for (var Z = 0, V = h.length; Z < V; Z++) h[Z] = r._transformSize(h[Z]);
            $.dashPattern = h, $.dashOffset = r._transformSize(r.ctx.lineDashOffset)
          }
        } else $ = { stroke: false, color: r.ctx.fillStyle }, "nonzero" !== r._fillRule && ($.fillRule = r._fillRule);
        if (r.ctx.globalAlpha < 1 && ($.opacity = r.ctx.globalAlpha), r._tryConvertAndRecordGradient($), "string" == typeof $.color && "rgba(0,0,0,0)" === $.color.replace(/ /g, "")) return
      }
      for (O = 0, a = l.length; O < a; O++) switch (N = l[O], N.type) {
        case "moveTo":
          r._lastPoint = { x: N.x, y: N.y }, T.push(r._lastPoint), i.push(1);
          break;
        case "lineTo":
          "closePath" === N.subType ? i.push(5) : (T.push({ x: N.x, y: N.y }), i.push(2)), r._lastPoint = {
            x: N.x,
            y: N.y
          };
          break;
        case "rect":
          A = N.points, T.push({ x: A[0].x, y: A[0].y }, { x: A[1].x, y: A[1].y }, { x: A[2].x, y: A[2].y }, {
            x: A[3].x,
            y: A[3].y
          }, { x: A[0].x, y: A[0].y }), i.push(2, 2, 2, 2, 2), r._lastPoint = N.points[0];
          break;
        case "circle":
        case "arc":
        case "ellipse":
          console.log("split to line", N.type);
          break;
        case "arcBegin":
          T.length && i.length && r.writer.addShape(T, i, $), T = [], i = [];
          break;
        case "arcClose":
          r.writer.addShape(T, i, $), T = [], i = [];
          break;
        case "bezier":
          if (!r._lastPoint) break;
          1 === N.ctrl.length ? (T.push({ x: N.ctrl[0].x, y: N.ctrl[0].y }, {
            x: N.x,
            y: N.y
          }), i.push(3)) : (T.push({ x: N.ctrl[0].x, y: N.ctrl[0].y }, { x: N.ctrl[1].x, y: N.ctrl[1].y }, {
            x: N.x,
            y: N.y
          }), i.push(4)), r._lastPoint = { x: N.x, y: N.y };
          break;
        default:
          T.push({ x: N.x, y: N.y }), i.push(2)
      }
      r.writer.addShape(T, i, $)
    }
  }
  _emptyPath() {
    var p = this;
    p._path = [], p._lastPoint = null, p._headPoint = null
  }
}

export default class SvgConverter {
  constructor(option = {}) {
    this.initRightBottom(option);
    this.initCanvas();
  }

  initRightBottom(options) {
    const config = this.options = {};
    config.size = options.size ?? 512;
    config.segments = options.segments ?? 16;
    config.splitToBezier = options.splitToBezier ?? 1;
    config.minimumFontSize = options.minimumFontSize ?? 12;
  }

  initCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = this.options.size;
    canvas.style.width = canvas.style.height = this.options.size;
    if (!canvas.getContext) return;
    const ctx = canvas.getContext("2d");
    this.wrapContext2d(ctx)
    this._canvas = canvas;
    this._segments = [];
  }

  toShape(svg) {
    this._segments = [];
    canvg(this._canvas, svg, { ignoreMouse: true, ignoreAnimation: true });
    return this.write();
  }

  wrapContext2d(ctx) {
    return new Context2dProxy(ctx, this, this.options)
  }
  write() {
    return {
      width: this._canvas.width,
      height: this._canvas.height,
      comps: this._segments
    }
  }
  addComponent(p) {
    this._segments.push(p)
  }
  addText(p, r, l, a, O, N, A, $) {
    O = O || "left", "start" === O ? O = "left" : "end" === O && (O = "right");
    var T = this, i = { type: "text", text: p, rotation: a, rect: [r.x, r.y, .01, .01], align: O, vAlign: N, font: l };
    A.gradientPack ? i.gradientPack = T._fixGraidentPack(A.gradientPack) : i.color = A.color, $ && 1 !== $ && (i.scaleX = $, i.scaleY = $), T.addComponent(i)
  }
  _fixGraidentPack(p) {
    var r = "L" === p[0] ? [p[5], p[6], p[7], p[8], p[9], p[10]] : [p[7], p[8], p[9], p[10], p[11], p[12]];
    if (Math.abs(r[4]) > 1e8 || Math.abs(r[5]) > 1e8) {
      var l = r[0], a = r[1], O = r[2], N = r[3], A = r[4], $ = r[5],
        T = Math.floor((A * N - $ * O) / (l * N - a * O)), i = Math.floor((A * a - $ * l) / (O * a - l * N));
      A = -(l * T + O * i), $ = -(a * T + N * i), "L" === p[0] ? (p[9] += A, p[10] += $, p[1] += T, p[2] += i, p[3] += T, p[4] += i) : (p[11] += A, p[12] += $, p[1] += T, p[2] += i, p[4] += T, p[5] += i)
    }
    return p
  }
  addShape(p, r, a) {
    for (var O = this, N = [], A = 0, $ = p.length; A < $; A++) {
      var T = p[A];
      N.push(T.x, T.y)
    }
    if (a.clip) return void O.addComponent({ type: "clip", points: N, segments: r });
    var i = { type: "shape", points: N, segments: r };
    a.opacity != undefined && (i.opacity = a.opacity), a.stroke ? (a.dash ? (i.dash = a.dash, i.dashPattern = a.dashPattern, i.dashOffset = a.dashOffset, i.dashColor = a.color, i.dashWidth = a.lineWidth, i.borderColor = null, i.borderWidth = 0, i.background = null) : (i.borderColor = a.color, i.borderWidth = a.lineWidth, i.background = null), a.lineCap && (i.borderCap = a.lineCap)) : (i.borderColor = null, i.borderWidth = 0, a.isPattern ? (i.repeatImage = a.color, i.trans = a.trans, i.background = null) : a.gradientPack ? (i.gradientPack = O._fixGraidentPack(a.gradientPack), i.background = null) : i.background = a.color, a.gradient && (i.gradient = a.gradient, i.gradientColor = a.gradientColor), a.fillRule && (i.fillRule = a.fillRule)), O.addComponent(i)
  }
  addRestore() {
    this.addComponent({ type: "restore" })
  }
}

class DxfReader {
  constructor(data) {
    this._pointer = 0;
    this._data = data;
    this._eof = false;
  }

  next() {
    function toBoolean(str) {
      if (str === "0") return false;
      if (str === "1") return true;
      throw TypeError("String '" + str + "' cannot be cast to Boolean type")
    }
    function parseCode(code, value) {
      return code <= 9 ? value : code >= 10 && code <= 59 ? parseFloat(value) : code >= 60 && code <= 99 ? parseInt(value) : code >= 100 && code <= 109 ? value : code >= 110 && code <= 149 ? parseFloat(value) : code >= 160 && code <= 179 ? parseInt(value) : code >= 210 && code <= 239 ? parseFloat(value) : code >= 270 && code <= 289 ? parseInt(value) : code >= 290 && code <= 299 ? toBoolean(value) : code >= 300 && code <= 369 ? value : code >= 370 && code <= 389 ? parseInt(value) : code >= 390 && code <= 399 ? value : code >= 400 && code <= 409 ? parseInt(value) : code >= 410 && code <= 419 ? value : code >= 420 && code <= 429 ? parseInt(value) : code >= 430 && code <= 439 ? value : code >= 440 && code <= 459 ? parseInt(value) : code >= 460 && code <= 469 ? parseFloat(value) : code >= 470 && code <= 481 ? value : 999 === code ? value : code >= 1e3 && code <= 1009 ? value : code >= 1010 && code <= 1059 ? parseFloat(value) : code >= 1060 && code <= 1071 ? parseInt(value) : (console.log("WARNING: Group code does not have a defined type: %j", {
        code: code,
        value: value
      }), value)
    }
    if (!this.hasNext()) {
      if (this._eof) {
        throw new Error("Cannot call 'next' after EOF group has been read")
      } else {
        throw new Error("Unexpected end of input: EOF group not read before end of file. Ended on code " + this._data[this._pointer]);
      }
    }
    const prop = {
      code: parseInt(this._data[this._pointer])
    };
    this._pointer++;
    prop.value = parseCode(prop.code, this._data[this._pointer].trim());
    this._pointer++;
    prop.code === 0 && "EOF" === prop.value && (this._eof = true);
    return prop;
  }

  hasNext() {
    return !this._eof && !(this._pointer > this._data.length - 2)
  }

  isEOF() {
    return this._eof
  }
}

(function (window, Object, undefined) {

  function DxfIO(options) {
    options && options.sanitize !== undefined && (this.sanitize = options.sanitize)
  }

  DxfIO.prototype.parse = function (p, r) {
    throw new Error("read() not implemented. Use readSync()")
  }

  DxfIO.prototype.parseSync = function (p) {
    return "string" == typeof p ? this._parse(p) : (console.error("Cannot read dxf source of type `" + typeof p), null)
  }

  DxfIO.prototype.parseStream = function (p, callback) {
    function onData(value) {
      str += value
    }
    const onEnd = () => {
      try {
        var p = this._parse(str)
      } catch (error) {
        return callback(error)
      }
      callback(null, p);
    }

    function onError(p) {
      callback(p);
    }
    let str = ""
    p.on("data", onData);
    p.on("end", onEnd);
    p.on("error", onError);
  }

  DxfIO.prototype.sanitizeFileName = function () {
    var p = /[\/\?<>\\:\*\|":]/g, r = /[\x00-\x1f\x80-\x9f]/g, l = /^\.+$/,
      a = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i, O = /[\. ]+$/;
    return function (N) {
      var A = this.sanitize;
      return null == A ? N : N.replace(p, A).replace(r, A).replace(l, A).replace(a, A).replace(O, A)
    }
  }()

  DxfIO.prototype._parse = function (file) {
    const getColor = function (index) {
      return [0, 16711680, 16776960, 65280, 65535, 255, 16711935, 16777215, 8421504,
        12632256, 16711680, 16744319, 13369344, 13395558, 10027008, 10046540, 8323072,
        8339263, 4980736, 4990502, 16727808, 16752511, 13382400, 13401958, 10036736, 10051404,
        8331008, 8343359, 4985600, 4992806, 16744192, 16760703, 13395456, 13408614, 10046464,
        10056268, 8339200, 8347455, 4990464, 4995366, 16760576, 16768895, 13408512, 13415014,
        10056192, 10061132, 8347392, 8351551, 4995328, 4997670, 16776960, 16777087, 13421568,
        13421670, 10000384, 10000460, 8355584, 8355647, 5000192, 5000230, 12582656, 14679935,
        10079232, 11717734, 7510016, 8755276, 6258432, 7307071, 3755008, 4344870, 8388352, 12582783,
        6736896, 10079334, 5019648, 7510092, 4161280, 6258495, 2509824, 3755046, 4194048, 10485631,
        3394560, 8375398, 2529280, 6264908, 2064128, 5209919, 1264640, 3099686, 65280, 8388479, 52224,
        6736998, 38912, 5019724, 32512, 4161343, 19456, 2509862, 65343, 8388511, 52275, 6737023, 38950,
        5019743, 32543, 4161359, 19475, 2509871, 65407, 8388543, 52326, 6737049, 38988, 5019762, 32575,
        4161375, 19494, 2509881, 65471, 8388575, 52377, 6737074, 39026, 5019781, 32607, 4161391, 19513,
        2509890, 65535, 8388607, 52428, 6737100, 39064, 5019800, 32639, 4161407, 19532, 2509900, 49151,
        8380415, 39372, 6730444, 29336, 5014936, 24447, 4157311, 14668, 2507340, 32767, 8372223, 26316,
        6724044, 19608, 5010072, 16255, 4153215, 9804, 2505036, 16383, 8364031, 13260, 6717388, 9880, 5005208,
        8063, 4149119, 4940, 2502476, 255, 8355839, 204, 6710988, 152, 5000344, 127, 4145023, 76, 2500172,
        4129023, 10452991, 3342540, 8349388, 2490520, 6245528, 2031743, 5193599, 1245260, 3089996, 8323327,
        12550143, 6684876, 10053324, 4980888, 7490712, 4128895, 6242175, 2490444, 3745356, 12517631, 14647295,
        10027212, 11691724, 7471256, 8735896, 6226047, 7290751, 3735628, 4335180, 16711935, 16744447, 13369548,
        13395660, 9961624, 9981080, 8323199, 8339327, 4980812, 4990540, 16711871, 16744415, 13369497, 13395634,
        9961586, 9981061, 8323167, 8339311, 4980793, 4990530, 16711807, 16744383, 13369446, 13395609, 9961548,
        9981042, 8323135, 8339295, 4980774, 4990521, 16711743, 16744351, 13369395, 13395583, 9961510, 9981023,
        8323103, 8339279, 4980755, 4990511, 3355443, 5987163, 8684676, 11382189, 14079702, 16777215][index]
    }
    const _this = this,
      m = {},
      lines = file.split(/\r\n|\r|\n/g),
      reader = new DxfReader(lines);
    let error = {},
      i = 0;
    if (!reader.hasNext()) throw Error("Empty file");
    var getError = function (code, value) {
      return error.code === code && error.value === value
    }, L = function () {
      var p = null, r = null, l = {};
      for (error = reader.next(); ;) {
        if (getError(0, "ENDSEC")) {
          p && (l[p] = r);
          break
        }
        9 === error.code ? (p && (l[p] = r), p = error.value) : 10 === error.code ? r = { x: error.value } : 20 === error.code ? r.y = error.value : 30 === error.code ? r.z = error.value : r = error.value, error = reader.next()
      }
      return error = reader.next(), l
    }, f = function () {
      var p, r = {};
      for (error = reader.next(); "EOF" !== error.value && !getError(0, "ENDSEC");) getError(0, "BLOCK") ? (INFO.debug("block {"), p = y(), INFO.debug("}"), U(p), p.name ? r[p.name] = p : INFO.error('block with handle "' + p.handle + '" is missing a name.')) : (showUnhandledError(error), error = reader.next());
      return r
    }, y = function () {
      var p = {};
      for (error = reader.next(); "EOF" !== error.value;) {
        switch (error.code) {
          case 1:
            p.xrefPath = error.value, error = reader.next();
            break;
          case 2:
            p.name = _this.sanitizeFileName(error.value), error = reader.next();
            break;
          case 3:
            p.name2 = _this.sanitizeFileName(error.value), error = reader.next();
            break;
          case 5:
            p.handle = error.value, error = reader.next();
            break;
          case 8:
            p.layer = error.value, error = reader.next();
            break;
          case 10:
            p.position = Y();
            break;
          case 67:
            p.paperSpace = !(!error.value || 1 != error.value), error = reader.next();
            break;
          case 70:
            0 != error.value && (p.type = error.value), error = reader.next();
            break;
          case 100:
            error = reader.next();
            break;
          case 330:
            p.ownerHandle = error.value, error = reader.next();
            break;
          case 0:
            if ("ENDBLK" == error.value) break;
            reader._pointer -= 2, p.entities = z(true);
            break;
          default:
            showUnhandledError(error), error = reader.next()
        }
        if (getError(0, "ENDBLK")) {
          error = reader.next();
          break
        }
      }
      return p
    }, Q = function () {
      var p = {};
      for (error = reader.next(); "EOF" !== error.value && !getError(0, "ENDSEC");) if (getError(0, "TABLE")) {
        error = reader.next();
        var r = x[error.value];
        r ? (INFO.debug(error.value + " Table {"), p[x[error.value].tableName] = d(), INFO.debug("}")) : INFO.debug("Unhandled Table " + error.value)
      } else error = reader.next();
      return error = reader.next(), p
    }, d = function () {
      var p, l = x[error.value], a = {}, A = 0;
      for (error = reader.next(); !getError(0, "ENDTAB");) switch (error.code) {
        case 5:
          a.handle = error.value, error = reader.next();
          break;
        case 330:
          a.ownerHandle = error.value, error = reader.next();
          break;
        case 100:
          "AcDbSymbolTable" === error.value ? error = reader.next() : (showUnhandledError(error), error = reader.next());
          break;
        case 70:
          A = error.value, error = reader.next();
          break;
        case 0:
          error.value === l.dxfSymbolName ? a[l.tableRecordsProperty] = l.parseTableRecords() : (showUnhandledError(error), error = reader.next());
          break;
        default:
          showUnhandledError(error), error = reader.next()
      }
      var T = a[l.tableRecordsProperty];
      return T && (T.constructor === Array ? p = T.length : "object" == typeof T && (p = Object.keys(T).length), A !== p && INFO.warn("Parsed " + p + " " + l.dxfSymbolName + "'s but expected " + A)), error = reader.next(), a
    }, G = function () {
      var p = [], r = {};
      for (INFO.debug("ViewPort {"), error = reader.next(); !getError(0, "ENDTAB");) switch (error.code) {
        case 2:
          r.name = error.value, error = reader.next();
          break;
        case 10:
          r.lowerLeftCorner = Y();
          break;
        case 11:
          r.upperRightCorner = Y();
          break;
        case 12:
          r.center = Y();
          break;
        case 13:
          r.snapBasePoint = Y();
          break;
        case 14:
          r.snapSpacing = Y();
          break;
        case 15:
          r.gridSpacing = Y();
          break;
        case 16:
          r.viewDirectionFromTarget = Y();
          break;
        case 17:
          r.viewTarget = Y();
          break;
        case 40:
          r.viewHeight = error.value, r.aspectRatio !== undefined && (r.viewWidth = error.value * r.aspectRatio), error = reader.next();
          break;
        case 41:
          r.aspectRatio = error.value, r.viewHeight !== undefined && (r.viewWidth = error.value * r.viewHeight), error = reader.next();
          break;
        case 42:
          r.lensLength = error.value, error = reader.next();
          break;
        case 43:
          r.frontClippingPlane = error.value, error = reader.next();
          break;
        case 44:
          r.backClippingPlane = error.value, error = reader.next();
          break;
        case 45:
          r.viewHeight = error.value, error = reader.next();
          break;
        case 50:
          r.snapRotationAngle = error.value, error = reader.next();
          break;
        case 51:
          r.viewTwistAngle = error.value, error = reader.next();
          break;
        case 79:
          r.orthographicType = error.value, error = reader.next();
          break;
        case 110:
          r.ucsOrigin = Y();
          break;
        case 111:
          r.ucsXAxis = Y();
          break;
        case 112:
          r.ucsYAxis = Y();
          break;
        case 110:
          r.ucsOrigin = Y();
          break;
        case 281:
          r.renderMode = error.value, error = reader.next();
          break;
        case 281:
          r.defaultLightingType = error.value, error = reader.next();
          break;
        case 292:
          r.defaultLightingOn = error.value, error = reader.next();
          break;
        case 330:
          r.ownerHandle = error.value, error = reader.next();
          break;
        case 63:
        case 421:
        case 431:
          r.ambientColor = error.value, error = reader.next();
          break;
        case 0:
          "VPORT" === error.value && (INFO.debug("}"), p.push(r), INFO.debug("ViewPort {"), r = {}, error = reader.next());
          break;
        default:
          showUnhandledError(error), error = reader.next()
      }
      return INFO.debug("}"), p.push(r), p
    }, D = function () {
      var p, r, l = {}, a = {};
      for (INFO.debug("LType {"), error = reader.next(); !getError(0, "ENDTAB");) switch (error.code) {
        case 2:
          a.name = error.value, p = error.value, error = reader.next();
          break;
        case 3:
          a.description = error.value, error = reader.next();
          break;
        case 73:
          r = error.value, r > 0 && (a.pattern = []), error = reader.next();
          break;
        case 40:
          a.patternLength = error.value, error = reader.next();
          break;
        case 49:
          a.pattern.push(error.value), error = reader.next();
          break;
        case 0:
          INFO.debug("}"), r > 0 && r !== a.pattern.length && INFO.warn("lengths do not match on LTYPE pattern"), l[p] = a, a = {}, INFO.debug("LType {"), error = reader.next();
          break;
        default:
          error = reader.next()
      }
      return INFO.debug("}"), l[p] = a, l
    }, C = function () {
      var p, r = {}, a = {};
      for (INFO.debug("Layer {"), error = reader.next(); !getError(0, "ENDTAB");) switch (error.code) {
        case 2:
          a.name = error.value, p = error.value, error = reader.next();
          break;
        case 62:
          a.visible = error.value >= 0, a.color = getColor(Math.abs(error.value)), error = reader.next();
          break;
        case 6:
          a.lineType = error.value, error = reader.next();
          break;
        case 0:
          "LAYER" === error.value && (INFO.debug("}"), r[p] = a, INFO.debug("Layer {"), a = {}, p = undefined, error = reader.next());
          break;
        default:
          showUnhandledError(error), error = reader.next()
      }
      return INFO.debug("}"), r[p] = a, r
    }, x = {
      VPORT: {
        tableRecordsProperty: "viewPorts",
        tableName: "viewPort",
        dxfSymbolName: "VPORT",
        parseTableRecords: G
      },
      LTYPE: { tableRecordsProperty: "lineTypes", tableName: "lineType", dxfSymbolName: "LTYPE", parseTableRecords: D },
      LAYER: { tableRecordsProperty: "layers", tableName: "layer", dxfSymbolName: "LAYER", parseTableRecords: C }
    }, z = function (p) {
      var r = [], l = p ? "ENDBLK" : "ENDSEC";
      for (error = reader.next(); ;) if (0 === error.code) {
        if (error.value === l) break;
        var a;
        if ("LWPOLYLINE" === error.value) INFO.debug("LWPOLYLINE {"), a = g(), INFO.debug("}"); else if ("POLYLINE" === error.value) INFO.debug("POLYLINE {"), a = S(), INFO.debug("}"); else if ("LINE" === error.value) INFO.debug("LINE {"), a = u(), INFO.debug("}"); else if ("CIRCLE" === error.value) INFO.debug("CIRCLE {"), a = B(), INFO.debug("}"); else if ("ARC" === error.value) INFO.debug("ARC {"), a = B(), INFO.debug("}"); else if ("ELLIPSE" === error.value) INFO.debug("ELLIPSE {"), a = W(), INFO.debug("}"); else if ("SPLINE" === error.value) INFO.debug("SPLINE {"), a = H(), INFO.debug("}"); else if ("TEXT" === error.value) INFO.debug("TEXT {"), a = I(), INFO.debug("}"); else if ("ATTRIB" === error.value) INFO.debug("ATTRIB {"), a = P(), INFO.debug("}"); else if ("DIMENSION" === error.value) INFO.debug("DIMENSION {"), a = v(), INFO.debug("}"); else if ("INSERT" === error.value) INFO.debug("INSERT {"), a = M(), INFO.debug("}"); else if ("HATCH" === error.value) INFO.debug("HATCH {"), a = b(), INFO.debug("}"); else if ("SOLID" === error.value) INFO.debug("SOLID {"), a = t(), INFO.debug("}"); else if ("POINT" === error.value) INFO.debug("POINT {"), a = n(), INFO.debug("}"); else if ("MTEXT" === error.value) INFO.debug("MTEXT {"), a = _(), INFO.debug("}"); else {
          if ("ATTDEF" !== error.value) {
            INFO.warn("Unhandled entity " + error.value), error = reader.next();
            continue
          }
          INFO.debug("ATTDEF {"), a = e(), INFO.debug("}")
        }
        U(a), r.push(a)
      } else error = reader.next();
      return "ENDSEC" == l && (error = reader.next()), r
    }, k = function (p) {
      switch (error.code) {
        case 0:
          p.type = error.value, error = reader.next();
          break;
        case 5:
          p.handle = error.value, error = reader.next();
          break;
        case 6:
          p.lineType = error.value, error = reader.next();
          break;
        case 8:
          p.layer = error.value, error = reader.next();
          break;
        case 48:
          p.lineTypeScale = error.value, error = reader.next();
          break;
        case 60:
          p.visible = 0 === error.value, error = reader.next();
          break;
        case 62:
          p.colorIndex = error.value, p.color = getColor(Math.abs(error.value)), error = reader.next();
          break;
        case 67:
          p.inPaperSpace = 0 !== error.value, error = reader.next();
          break;
        case 210:
          p.extrusionDirection = Y();
          break;
        case 230:
          p.extrusionDirection = { x: 0, y: 0, z: error.value }, error = reader.next();
          break;
        case 330:
          p.ownerHandle = error.value, error = reader.next();
          break;
        case 347:
          p.materialObjectHandle = error.value, error = reader.next();
          break;
        case 370:
          p.lineweight = error.value, error = reader.next();
          break;
        case 420:
          p.color = error.value, error = reader.next();
          break;
        case 100:
          if ("AcDbEntity" == error.value) {
            error = reader.next();
            break
          }
        default:
          showUnhandledError(error), error = reader.next()
      }
    }, X = function () {
      var p = { type: error.value };
      for (error = reader.next(); "EOF" !== error && 0 !== error.code;) switch (error.code) {
        case 10:
          p.x = error.value, error = reader.next();
          break;
        case 20:
          p.y = error.value, error = reader.next();
          break;
        case 30:
          p.z = error.value, error = reader.next();
          break;
        case 40:
        case 41:
        case 42:
          error = reader.next();
          break;
        case 70:
          p.curveFittingVertex = 0 != (1 | error.value), p.curveFitTangent = 0 != (2 | error.value), p.splineVertex = 0 != (8 | error.value), p.splineControlPoint = 0 != (16 | error.value), p.ThreeDPolylineVertex = 0 != (32 | error.value), p.ThreeDPolylineMesh = 0 != (64 | error.value), p.polyfaceMeshVertex = 0 != (128 | error.value), error = reader.next();
          break;
        case 50:
        case 71:
        case 72:
        case 73:
        case 74:
          error = reader.next();
          break;
        default:
          k(p)
      }
      return p
    }, E = function () {
      var p = { type: error.value };
      for (error = reader.next(); "EOF" != error && 0 != error.code;) k(p);
      return p
    }, Y = function () {
      var p = {}, r = error.code;
      if (p.x = error.value, r += 10, error = reader.next(), error.code != r) throw new Error("Expected code for point value to be " + r + " but got " + error.code + ".");
      return p.y = error.value, r += 10, error = reader.next(), error.code != r ? p : (p.z = error.value, error = reader.next(), p)
    }, c = function () {
      var p = {}, r = error.code;
      return p.x = error.value, r += 1, error = reader.next(), error.code != r ? (reader._pointer -= 2, p.y = 1) : p.y = error.value, r += 1, error = reader.next(), error.code != r ? (reader._pointer -= 2, p.z = 1) : p.z = error.value, error = reader.next(), p
    }, w = function (p) {
      if (!p || p <= 0) throw Error("n must be greater than 0 verticies");
      var r, l = [], a = false, A = false;
      for (r = 0; r < p; r++) {
        for (var $ = {}; "EOF" !== error && 0 !== error.code && !A;) {
          switch (error.code) {
            case 10:
              if (a) {
                A = true;
                continue
              }
              $.x = error.value, a = true;
              break;
            case 20:
              $.y = error.value;
              break;
            case 30:
              $.z = error.value;
              break;
            case 40:
              $.startWidth = error.value;
              break;
            case 41:
              $.endWidth = error.value;
              break;
            case 42:
              0 != error.value && ($.bulge = error.value);
              break;
            default:
              if (a) {
                A = true;
                continue
              }
          }
          error = reader.next()
        }
        l.push($), a = false, A = false
      }
      return l
    }, s = function () {
      for (var p = []; "EOF" !== error;) if (0 === error.code) if ("VERTEX" === error.value) p.push(X()); else if ("SEQEND" === error.value) {
        E();
        break
      }
      return p
    }, _ = function () {
      var p = { type: error.value };
      for (error = reader.next(); "EOF" !== error && 0 !== error.code;) switch (error.code) {
        case 1:
          p.text = error.value, error = reader.next();
          break;
        case 3:
          p.text += error.value, error = reader.next();
          break;
        case 10:
          p.position = Y();
          break;
        case 40:
          p.height = error.value, error = reader.next();
          break;
        case 41:
          p.width = error.value, error = reader.next();
          break;
        case 71:
          p.attachmentPoint = error.value, error = reader.next();
          break;
        case 72:
          p.drawingDirection = error.value, error = reader.next();
          break;
        case 50:
          p.angle = 2 * error.value * Math.PI / 360, error = reader.next();
          break;
        case 11:
          p.directionX = error.value, error = reader.next();
          break;
        case 21:
          p.directionY = error.value, error = reader.next();
          break;
        case 60:
          p.hidden = 1 === error.value, error = reader.next();
          break;
        default:
          k(p)
      }
      return p
    }, e = function () {
      var p = { type: error.value, scale: 1, textStyle: "STANDARD" };
      for (error = reader.next(); "EOF" !== error && 0 !== error.code;) switch (error.code) {
        case 1:
          p.text = error.value, error = reader.next();
          break;
        case 2:
          p.tag = error.value, error = reader.next();
          break;
        case 3:
          p.prompt = error.value, error = reader.next();
          break;
        case 7:
          p.textStyle = error.value, error = reader.next();
          break;
        case 10:
          p.x = error.value, error = reader.next();
          break;
        case 20:
          p.y = error.value, error = reader.next();
          break;
        case 30:
          p.z = error.value, error = reader.next();
          break;
        case 39:
          p.thickness = error.value, error = reader.next();
          break;
        case 40:
          p.textHeight = error.value, error = reader.next();
          break;
        case 41:
          p.scale = error.value, error = reader.next();
          break;
        case 50:
          p.rotation = error.value, error = reader.next();
          break;
        case 51:
          p.obliqueAngle = error.value, error = reader.next();
          break;
        case 70:
          p.invisible = !!(1 & error.value), p.constant = !!(2 & error.value), p.verificationRequired = !!(4 & error.value), p.preset = !!(8 & error.value), error = reader.next();
          break;
        case 71:
          p.backwards = !!(2 & error.value), p.mirrored = !!(4 & error.value), error = reader.next();
          break;
        case 72:
          p.horizontalJustification = error.value, error = reader.next();
          break;
        case 73:
          p.fieldLength = error.value, error = reader.next();
          break;
        case 74:
          p.verticalJustification = error.value, error = reader.next();
          break;
        case 100:
          error = reader.next();
          break;
        case 210:
          p.extrusionDirectionX = error.value, error = reader.next();
          break;
        case 220:
          p.extrusionDirectionY = error.value, error = reader.next();
          break;
        case 230:
          p.extrusionDirectionZ = error.value, error = reader.next();
          break;
        default:
          k(p)
      }
      return p
    }, g = function () {
      var p = { type: error.value, vertices: [] }, r = 0;
      for (error = reader.next(); "EOF" !== error && 0 !== error.code;) switch (error.code) {
        case 38:
          p.elevation = error.value, error = reader.next();
          break;
        case 39:
          p.depth = error.value, error = reader.next();
          break;
        case 70:
          p.shape = 1 === error.value, error = reader.next();
          break;
        case 90:
          r = error.value, error = reader.next();
          break;
        case 10:
          p.vertices = w(r);
          break;
        case 40:
          0 !== error.value && (p.startWidth = error.value), error = reader.next();
          break;
        case 41:
          0 !== error.value && (p.endWidth = error.value), error = reader.next();
          break;
        case 43:
          0 !== error.value && (p.width = error.value), error = reader.next();
          break;
        default:
          k(p)
      }
      return p
    }, S = function () {
      var p = { type: error.value, vertices: [] };
      for (error = reader.next(); "EOF" !== error && 0 !== error.code;) switch (error.code) {
        case 10:
        case 20:
        case 30:
        case 39:
          error = reader.next();
          break;
        case 40:
          0 !== error.value && (p.startWidth = error.value), error = reader.next();
          break;
        case 41:
          0 !== error.value && (p.endWidth = error.value), error = reader.next();
          break;
        case 70:
          p.shape = 1 === error.value, error = reader.next();
          break;
        case 71:
        case 72:
        case 73:
        case 74:
        case 75:
        case 100:
          error = reader.next();
          break;
        default:
          k(p)
      }
      return p.vertices = s(), p
    }, u = function () {
      var p = { type: error.value, vertices: [] };
      for (error = reader.next(); "EOF" !== error && 0 !== error.code;) switch (error.code) {
        case 10:
          p.vertices.unshift(Y());
          break;
        case 11:
          p.vertices.push(Y());
          break;
        case 100:
          if ("AcDbLine" == error.value) {
            error = reader.next();
            break
          }
        default:
          k(p)
      }
      return p
    }, B = function () {
      var p, r;
      for (p = { type: error.value }, error = reader.next(); "EOF" !== error && 0 !== error.code;) switch (error.code) {
        case 10:
          p.center = Y();
          break;
        case 40:
          p.radius = error.value, error = reader.next();
          break;
        case 50:
          p.startAngle = Math.PI / 180 * error.value, error = reader.next();
          break;
        case 51:
          r = Math.PI / 180 * error.value, r < p.startAngle ? p.angleLength = r + 2 * Math.PI - p.startAngle : p.angleLength = r - p.startAngle, p.endAngle = r, error = reader.next();
          break;
        default:
          k(p)
      }
      return p
    }, W = function () {
      var p, r;
      for (p = { type: error.value }, error = reader.next(); "EOF" !== error && 0 !== error.code;) switch (error.code) {
        case 10:
          p.center = Y();
          break;
        case 11:
          p.major = Y();
          break;
        case 40:
          p.ratio = error.value, error = reader.next();
          break;
        case 41:
          p.startAngle = error.value, error = reader.next();
          break;
        case 42:
          r = error.value, r < p.startAngle ? p.angleLength = r + 2 * Math.PI - p.startAngle : p.angleLength = r - p.startAngle, p.endAngle = r, error = reader.next();
          break;
        default:
          k(p)
      }
      return p
    }, M = function () {
      var p;
      for (p = { type: error.value }, error = reader.next(); "EOF" !== error && 0 !== error.code;) switch (error.code) {
        case 2:
          p.block = _this.sanitizeFileName(error.value), error = reader.next();
          break;
        case 10:
          p.center = Y();
          break;
        case 41:
          p.scale = c();
          break;
        case 50:
          p.deg = error.value, error = reader.next();
          break;
        default:
          k(p)
      }
      return p
    }, b = function () {
      var p;
      for (p = { type: error.value }, error = reader.next(); "EOF" !== error && 0 !== error.code;) switch (error.code) {
        case 2:
          p.block = _this.sanitizeFileName(error.value), error = reader.next();
          break;
        case 10:
          p.center = Y();
          break;
        case 41:
          p.scale = c();
          break;
        case 50:
          p.deg = error.value, error = reader.next();
          break;
        default:
          k(p)
      }
      return p
    }, H = function () {
      var p, r;
      for (p = { type: error.value }, error = reader.next(); "EOF" !== error && 0 !== error.code;) switch (error.code) {
        case 10:
          p.center = Y();
          break;
        case 11:
          p.major = Y();
          break;
        case 40:
          p.ratio = error.value, error = reader.next();
          break;
        case 41:
          p.startAngle = error.value, error = reader.next();
          break;
        case 42:
          r = error.value, r < p.startAngle ? p.angleLength = r + 2 * Math.PI - p.startAngle : p.angleLength = r - p.startAngle, p.endAngle = r, error = reader.next();
          break;
        default:
          k(p)
      }
      return p
    }, I = function () {
      var p;
      for (p = { type: error.value }, error = reader.next(); "EOF" !== error && 0 !== error.code;) switch (error.code) {
        case 10:
          p.startPoint = Y();
          break;
        case 11:
          p.endPoint = Y();
          break;
        case 40:
          p.textHeight = error.value, error = reader.next();
          break;
        case 41:
          p.xScale = error.value, error = reader.next();
          break;
        case 1:
          p.text = error.value, error = reader.next();
          break;
        case 7:
          p.font = error.value, error = reader.next();
          break;
        case 71:
          p.generationFlags = error.value, error = reader.next();
          break;
        case 72:
          p.halign = error.value, error = reader.next();
          break;
        case 73:
          p.valign = error.value, error = reader.next();
          break;
        case 50:
          p.rotation = 2 * error.value * Math.PI / 360, error = reader.next();
          break;
        case 60:
          p.hidden = 1 === error.value, error = reader.next();
          break;
        default:
          k(p)
      }
      return p
    }, P = function () {
      var p;
      for (p = { type: error.value }, error = reader.next(); "EOF" !== error && 0 !== error.code;) switch (error.code) {
        case 10:
          p.startPoint = Y();
          break;
        case 11:
          p.endPoint = Y();
          break;
        case 40:
          p.textHeight = error.value, error = reader.next();
          break;
        case 41:
          p.xScale = error.value, error = reader.next();
          break;
        case 1:
          p.text = error.value, error = reader.next();
          break;
        case 7:
          p.font = error.value, error = reader.next();
          break;
        case 71:
          p.generationFlags = error.value, error = reader.next();
          break;
        case 72:
          p.halign = error.value, error = reader.next();
          break;
        case 74:
          p.valign = error.value, error = reader.next();
          break;
        case 50:
          p.rotation = 2 * error.value * Math.PI / 360, error = reader.next();
          break;
        case 70:
          p.hidden = 1 === error.value, error = reader.next();
          break;
        default:
          k(p)
      }
      return p
    }, v = function () {
      var p;
      for (p = { type: error.value }, error = reader.next(); "EOF" !== error && 0 !== error.code;) switch (error.code) {
        case 2:
          p.block = _this.sanitizeFileName(error.value), error = reader.next();
          break;
        case 10:
          p.anchorPoint = Y();
          break;
        case 11:
          p.middleOfText = Y();
          break;
        case 71:
          p.attachmentPoint = error.value, error = reader.next();
          break;
        case 42:
          p.actualMeasurement = error.value, error = reader.next();
          break;
        case 1:
          p.text = error.value, error = reader.next();
          break;
        case 50:
          p.angle = error.value, error = reader.next();
          break;
        default:
          k(p)
      }
      return p
    }, t = function () {
      var p;
      for (p = { type: error.value }, p.points = [], error = reader.next(); "EOF" !== error && 0 !== error.code;) switch (error.code) {
        case 10:
          p.points[0] = Y();
          break;
        case 11:
          p.points[1] = Y();
          break;
        case 12:
          p.points[2] = Y();
          break;
        case 13:
          p.points[3] = Y();
          break;
        default:
          k(p)
      }
      return p
    }, n = function () {
      var p;
      for (p = { type: error.value }, error = reader.next(); "EOF" !== error && 0 !== error.code;) switch (error.code) {
        case 10:
          p.position = Y();
          break;
        case 39:
          p.thickness = error.value, error = reader.next();
          break;
        case 100:
          if ("AcDbPoint" == error.value) {
            error = reader.next();
            break
          }
        default:
          k(p)
      }
      return p
    }, U = function (p) {
      if (!p) throw new TypeError("entity cannot be undefined or null");
      p.handle || (p.handle = i++)
    };
    return function () {
      for (error = reader.next(); !reader.isEOF();) if (0 === error.code && "SECTION" === error.value) {
        if (error = reader.next(), 2 !== error.code) {
          console.error("Unexpected code %s after 0:SECTION", formatError(error)), error = reader.next();
          continue
        }
        "HEADER" === error.value ? (INFO.debug("> HEADER"), m.header = L(), INFO.debug("<")) : "BLOCKS" === error.value ? (INFO.debug("> BLOCKS"), m.blocks = f(), INFO.debug("<")) : "ENTITIES" === error.value ? (INFO.debug("> ENTITIES"), m.entities = z(false), INFO.debug("<")) : "TABLES" === error.value ? (INFO.debug("> TABLES"), m.tables = Q(), INFO.debug("<")) : "EOF" === error.value ? INFO.debug("EOF") : INFO.warn("Skipping section '%s'", error.value)
      } else error = reader.next()
    }(), m
  };

  const ht = window.ht, Default = ht.Default;
  Default.getInternal().addMethod(Default, {
    cadToShape: function (p, r) {
      return new ht.DxfViewer(r).toShape(p)
    },
    shapeToCad: function (p, r, l) {
      return new ht.DxfWriter(l).toDxf(p, r)
    }
  });

  var DxfViewer = ht.DxfViewer = function (p) {
    this.init(p)
  };
  DxfViewer.prototype = {}, DxfViewer.prototype.constructor = DxfViewer;
  const KEYS = {
    LINE: ["LINE", "POLYLINE", "LWPOLYLINE"],
    CIRCLE: ["CIRCLE", "ARC"],
    ELLIPSE: ["ELLIPSE"],
    TEXT: ["TEXT", "MTEXT", "ATTRIB"],
    SOLID: ["SOLID"],
    POINT: ["POINT"]
  };
  Object.defineProperties(DxfViewer.prototype, {
    dxf: {
      get: function () {
        return this._dxf
      }
    }
  })

  DxfViewer.prototype.init = function (p) {
    var a = this.options = {};
    p = p || {}, a.font = p.font || "Standard", a.textScaleRatio = p.textScaleRatio || 1, a.size = p.size, a.scale = p.scale, a.blockSize = p.blockSize || 256, a.filter = p.filter, a.defaultColor = p.defaultColor || 0, a.edgeLayer = p.edgeLayer, p.showText === undefined && (p.showText = true), a.showText = p.showText, a.mapColor = p.mapColor, a.circleSegments = p.circleSegments || 72, a.browserMinFontSize = p.browserMinFontSize || 12, a.useTextCompScale = p.useTextCompScale === undefined || p.useTextCompScale, a.boundingType = p.boundingType || "Reset", a.convertArcToBezier = p.convertArcToBezier, false !== p.sanitize && (a.sanitize = p.sanitize || "_")
  }

  DxfViewer.prototype.toShape = function (p) {
    this.parseFile(p);
    var l, a, O, N = this._dxf.blocks, A = this.sortBlocks(N);
    this._blockDef = {};
    for (let i = A.length - 1; i >= 0; i--) {
      a = A[i];
      O = N[a];
      if (O.entities && !this._blockDef[a]) {
        l = this.entitiesToShape(O.entities, O.position, null, false)
        if (l) {
          l.flag = O.type;
          this._blockDef[a] = l;
        }
      }
    }
    return l = this.entitiesToShape(this._dxf.entities, null, this.options.size, true, this.options.scale), l.sortedBlockName = A, l.blockDef = this._blockDef, l.layers = this._dxf.tables.layer.layers, l
  }

  DxfViewer.prototype.entitiesToShape = function (p, r, l, a, O) {
    this._minFontSize = 12;
    this._bound = { xMin: 1 / 0, yMin: 1 / 0, xMax: -1 / 0, yMax: -1 / 0 };
    r = r || {
      x: 0,
      y: 0,
      z: 0
    };
    var A, $, T, i = this._models = {}, m = this._dxf;
    for (A = 0, $ = p.length; A < $; A++) T = p[A], this._groupEntity(i, T, m);
    if (a)
      switch (this.options.boundingType) {
        case "Viewport":
          const vp = this._dxfViewport;
          !vp || isNaN(vp.x) || isNaN(vp.y) || isNaN(vp.width) || isNaN(vp.height) || (this._bound = {
            xMin: vp.x - vp.width / 2,
            xMax: vp.x + vp.width / 2,
            yMin: vp.y - vp.height / 2,
            yMax: vp.y + vp.height / 2
          });
          break;
        case "Standard":
          this._bound = { xMin: 0, xMax: 1, yMin: 0, yMax: 1 }
      }
    this._shiftX = this._bound.xMin;
    this._shiftY = this._bound.yMax;
    var Z = this._bound.xMax - this._bound.xMin,
      V = this._bound.yMax - this._bound.yMin;
    if (!(Z < 0 || V < 0)) {
      Z = Z || 1;
      V = V || 1;
      this._bound.pos = r;
      if (O) {
        this._scale = O;
      } else {
        if (l) {
          var R = l / Z, L = l / V;
          this._scale = Math.min(R, L)
        } else {
          this._scale = 1;
        }
        if (!this.options.useTextCompScale) {
          this.scale *= Math.max(1, Math.ceil(this.options.browserMinFontSize / this._minFontSize));
        }
      }
      this.shapeComps = [];
      this.drawLine();
      this.drawSolid();
      this.drawCircle();
      this.drawEllipse();
      this.options.showText && this.drawText();
      this.drawBlock();
      const bound = {
        width: Z * this._scale,
        height: V * this._scale,
        comps: this.shapeComps,
        scale: this._scale,
        anchorX: -(this._bound.xMin - r.x) / Z,
        anchorY: (this._bound.yMax - r.y) / V,
        bound: this._bound
      };
      this._calcBoundExtend(bound);
      return bound;
    }
  }

  DxfViewer.prototype._calcBoundExtend = function (p) {
    var r = 1, l = false;
    p.comps.forEach(function (p) {
      r = Math.max(r, p.borderWidth || 0), p.borderWidthAbsolute && (l = true)
    }), p.boundExtend = r, l && (p.boundExtendAbsolute = true)
  }

  DxfViewer.prototype._bulgesAt = function (p, r) {
    return p[r].bulge
  }

  DxfViewer.prototype._isStraightLine = function (p) {
    return !p || Math.abs(p) < 1e-6
  }

  DxfViewer.prototype._getDistance = function (p, r) {
    var l = p.x - r.x, a = p.y - r.y;
    return Math.sqrt(l * l + a * a)
  }

  DxfViewer.prototype._getBulgeSegment = function (p, r, l) {
    var a = this, O = l < 0, N = 4 * Math.atan(l);
    if (Math.abs(N) > 2 * Math.PI - 1e-6) return [r];
    var A = { x: (p.x + r.x) / 2, y: (p.y + r.y) / 2 }, $ = a._getDistance(p, r) / 2,
      T = Math.atan2(r.y - p.y, r.x - p.x), i = Math.abs($ / Math.sin(N / 2)), m = Math.abs(i * i - $ * $),
      h = Math.sqrt(m);
    l > 0 ? T += Math.PI / 2 : T -= Math.PI / 2, Math.abs(N) > Math.PI && (h *= -1);
    var Z, T, V = h * Math.cos(T) + A.x, R = h * Math.sin(T) + A.y, L = Math.atan2(p.y - R, p.x - V),
      f = Math.atan2(r.y - R, r.x - V), y = [];
    if (Z = 2 * Math.PI / a.options.circleSegments, T = L, O) {
      for (; f > L;) f -= 2 * Math.PI;
      for (; T > f;) T -= Z, T < f && (T = f), y.push({ x: V + i * Math.cos(T), y: R + i * Math.sin(T) })
    } else {
      for (; f < L;) f += 2 * Math.PI;
      for (; T < f;) T += Z, T > f && (T = f), y.push({ x: V + i * Math.cos(T), y: R + i * Math.sin(T) })
    }
    return y
  }

  DxfViewer.prototype.drawLine = function () {
    var p, r, a, O, N, A, $, T, i, m, h, Z, V, R, L, y, Q, d, G, D, C = this, x = C._models;
    for (p = KEYS.LINE, O = 0, N = p.length; O < N; O++) {
      r = p[O], a = x[r];
      for (T in a) for (i = a[T], A = 0, $ = i.length; A < $; A++) if (m = i[A], (h = m.vertices) && h.length) {
        for (L = C.toLocal(h[0].x, 1), y = C.toLocal(h[0].y, 2), d = {
          type: "shape",
          cadType: r,
          cadLayer: m.layer,
          maybeEdge: m.layer === C.options.edgeLayer,
          borderColor: T,
          points: [L, y],
          segments: [1]
        }, D = undefined, m.startWidth ? D = (m.startWidth + (m.endWidth ? m.endWidth : m.startWidth)) / 2 : m.width && (D = m.width), D ? d.borderWidth = C.toLocal(D) : (d.borderWidthAbsolute = true, d.borderWidth = 1), V = 1, R = h.length; V < R; V++) Z = h[V], Q = C._bulgesAt(h, V - 1), C._isStraightLine(Q) ? (d.points.push(C.toLocal(Z.x, 1), C.toLocal(Z.y, 2)), d.segments.push(2)) : (G = C._getBulgeSegment(h[V - 1], Z, Q), G.forEach(function (p) {
          d.points.push(C.toLocal(p.x, 1), C.toLocal(p.y, 2)), d.segments.push(2)
        }));
        m.shape && (Q = C._bulgesAt(h, h.length - 1), C._isStraightLine(Q) ? d.segments.push(5) : (G = C._getBulgeSegment(h[h.length - 1], h[0], Q), G.forEach(function (p) {
          d.points.push(C.toLocal(p.x, 1), C.toLocal(p.y, 2)), d.segments.push(2)
        }))), d.handle = m.handle, C.shapeComps.push(d)
      }
    }
  }
  DxfViewer.prototype.drawBlock = function () {
    var p, r, l, a, O, N, A, $, T, i, m, h, Z = this, V = Z._models.BLOCK;
    if (V) for (p = 0, r = V.length; p < r; p++) l = V[p], a = l.block, O = Z._blockDef[a], m = l.transform, N = Math.atan2(m.b, m.a), Math.abs(N - Math.PI) < 1e-5 || Math.abs(N) < 1e-5 || Math.abs(N + Math.PI) < 1e-5 ? (T = Math.cos(N), A = m.a / T, $ = m.d / T) : (i = Math.sin(N), A = m.b / i, $ = -m.c / i), h = {
      type: "image",
      cadType: "block",
      cadLayer: l.layer,
      handle: l.handle,
      name: a,
      rect: [[Z.toLocal(m.tx, 1), Z.toLocal(m.ty, 2)], Z.toLocal(O.width / O.scale), Z.toLocal(O.height / O.scale)],
      rotation: N
    }, 1 === A && 1 === $ || (h.scaleX = A, h.scaleY = $), Z.shapeComps.push(h)
  }

  DxfViewer.prototype.drawSolid = function () {
    var p, r, l, a, O, N, A, $, T, i, m, h = this, Z = h._models;
    for (p = KEYS.SOLID, a = 0, O = p.length; a < O; a++) {
      r = p[a], l = Z[r];
      for ($ in l) for (T = l[$], N = 0, A = T.length; N < A; N++) i = T[N], m = i.points, h.shapeComps.push({
        type: "shape",
        cadType: r,
        cadLayer: i.layer,
        handle: i.handle,
        background: $,
        points: [h.toLocal(m[0].x, 1), h.toLocal(m[0].y, 2), h.toLocal(m[1].x, 1), h.toLocal(m[1].y, 2), h.toLocal(m[3].x, 1), h.toLocal(m[3].y, 2), h.toLocal(m[2].x, 1), h.toLocal(m[2].y, 2)],
        segments: [1, 2, 2, 2, 5]
      })
    }
  }

  DxfViewer.prototype.extrusionZNagative = function (p) {
    var r = p.extrusionDirection;
    return !!r && Math.abs(r.z + 1) < 1e-5
  }, DxfViewer.prototype.drawCircle = function () {
    var p, r, l, a, O, N, A, $, T, i, m, h, Z, V, R, L, y, Q, d, G, D = this, C = D._models;
    for (p = KEYS.CIRCLE, a = 0, O = p.length; a < O; a++) {
      r = p[a], l = C[r];
      for ($ in l) for (T = l[$], N = 0, A = T.length; N < A; N++) {
        if (i = T[N], m = i.startAngle || 0, h = i.angleLength || 2 * Math.PI, Z = m + h, V = D.toLocal(i.radius), R = i.addonAngle || 0, L = D.toLocal(i.center.x, 1), y = D.toLocal(i.center.y, 2), G = i.xInvert ^ D.extrusionZNagative(i), d = i.yInvert, d || G ? G && d ? (m = Math.PI + m, Z = Math.PI + Z, Q = false) : (m = Math.PI * (G ? 1 : 2) - m, Z = Math.PI * (G ? 1 : 2) - Z, Q = true) : Q = false, Q = !Q, m = 2 * Math.PI - m - R, Z = 2 * Math.PI - Z - R, Q) {
          var x = m;
          m = Z, Z = x
        }
        var z = {
          type: "arc",
          cadType: r,
          cadLayer: i.layer,
          handle: i.handle,
          borderColor: $,
          borderWidth: 1,
          borderWidthAbsolute: true,
          rect: [L - V, y - V, 2 * V, 2 * V],
          arcFrom: m,
          arcTo: Z,
          arcClose: false
        };
        D.options.convertArcToBezier ? D.shapeComps.push(D._convertArcToBezier(z)) : D.shapeComps.push(z)
      }
    }
  }

  DxfViewer.prototype.drawText = function () {
    var p, r, l, a, O, N, A, $, T, i, m, h, Z, V, R, L, y, Q, d, G, D, C, x, z, k, X = this, E = X._models;
    p = KEYS.TEXT, k = X.options.textScaleRatio;
    var Y = X.options.useTextCompScale ? X.options.browserMinFontSize : 0;
    for (a = 0, O = p.length; a < O; a++) {
      r = p[a], l = E[r];
      for ($ in l) for (T = l[$], N = 0, A = T.length; N < A; N++) if (i = T[N], (m = i.text) && m.length) {
        if ("MTEXT" === r) h = X.toLocal(i.height || 12), Z = X.toLocal(i.position.x, 1), V = X.toLocal(i.position.y, 2), D = i.angle ? i.angle : i.directionX ? Math.atan2(i.directionY, i.directionX) : 0, D += i.addonAngle || 0, z = 1, G = i.attachmentPoint || 1, Q = G % 3, d = Math.floor(G / 3), d = 1 === d ? "middle" : 0 === d ? "top" : "bottom", L = 0 === Q ? "right" : 2 === Q ? "center" : "left"; else {
          h = X.toLocal(i.textHeight || 12);
          var c = i.endPoint;
          c || (c = i.startPoint), Z = c.x, V = c.y, D = i.rotation || 0, z = i.xScale || 1, 2 === i.generationFlags ? D = 2 * Math.PI - D : 4 === i.generationFlags ? D = Math.PI - D : 6 === i.generationFlags && (D = Math.PI + D), Z = X.toLocal(Z, 1), V = X.toLocal(V, 2), Q = i.halign, d = i.valign, 4 === Q && (Q = 1, d = 2), L = 2 === Q || 5 === Q ? "right" : 1 === Q || 4 === Q ? "center" : "left", d = 3 === d ? "top" : 2 === d ? "middle" : "bottom"
        }
        V += h / 4, D = 2 * Math.PI - D;
        var w = h * k, s = 1;
        if (w < Y && (s = w / Y, w = Y), R = w + "px " + (i.font || X.options.font), "MTEXT" === r) for (m = m.replace(/\\{/g, "#@#"), m = m.replace(/\\}/g, "#@@"), m = m.replace(/({|})/g, ""), m = m.replace(/#@#/g, "{"), m = m.replace(/#@@/g, "}"), m = m.replace(/\\[FfLIOoKkNXQHWSACT~][^;]*;/g, ""), V -= h / 6, C = m.split("\\P"), x = 0; x < C.length; x++) y = {
          type: "text",
          cadType: r,
          cadLayer: i.layer,
          handle: i.handle,
          color: $,
          text: C[x],
          rotation: D,
          rect: [Z, V + x * h * 1.5, 0, 0],
          align: L,
          vAlign: d,
          font: R,
          visible: !i.hidden
        }, 1 !== s && (y.scaleX = y.scaleY = s), X.shapeComps.push(y); else y = {
          type: "text",
          cadType: r,
          cadLayer: i.layer,
          handle: i.handle,
          color: $,
          text: m,
          scaleX: z,
          rotation: D,
          rect: [Z, V, 1e-5, 1e-5],
          align: L,
          vAlign: d,
          font: R,
          visible: !i.hidden
        }, 1 !== s && (y.scaleX *= s, y.scaleY = s), X.shapeComps.push(y)
      }
    }
  }

  DxfViewer.prototype.drawEllipse = function () {
    var p, r, l, a, O, N, A, $, T, i, m, h, Z, V, R, L, y, Q, d, G, D, C, _this = this, z = _this._models;
    for (p = KEYS.ELLIPSE, a = 0, O = p.length; a < O; a++) {
      r = p[a], l = z[r];
      for ($ in l) for (T = l[$], N = 0, A = T.length; N < A; N++) {
        if (i = T[N], m = i.major, h = Math.atan2(m.y, m.x), Z = _this.toLocal(Math.sqrt(m.x * m.x + m.y * m.y)), V = Z * i.ratio, R = i.startAngle || 0, L = i.angleLength || 2 * Math.PI, y = R + L, Q = _this.toLocal(i.center.x, 1), d = _this.toLocal(i.center.y, 2), G = i.xInvert, D = i.yInvert ^ _this.extrusionZNagative(i), D ^= 1, D || G ? G && D ? (R = Math.PI + R, y = Math.PI + y, C = false) : (R = Math.PI * (G ? 1 : 2) - R, y = Math.PI * (G ? 1 : 2) - y, C = true) : C = false, C) {
          var k = R;
          R = y, y = k
        }
        h = 2 * Math.PI - h;
        var X = {
          type: "arc",
          cadType: r,
          cadLayer: i.layer,
          handle: i.handle,
          borderColor: $,
          borderWidth: 1,
          borderWidthAbsolute: true,
          rotation: h,
          rect: [Q - Z, d - V, 2 * Z, 2 * V],
          arcFrom: R,
          arcTo: y,
          arcClose: false,
          arcOval: true
        };
        _this.options.convertArcToBezier ? _this.shapeComps.push(_this._convertArcToBezier(X)) : _this.shapeComps.push(X)
      }
    }
  }

  DxfViewer.prototype._convertArcToBezier = function (p) {
    var r = p.arcFrom, l = p.arcTo;
    if (r === l) return p;
    r > l && (l += 2 * Math.PI);
    var a = { type: "shape" }, O = p.rect, N = "type,rect,arcFrom,arcTo,arcClose,arcOval,rotation".split(",");
    for (var A in p) N.indexOf(A) >= 0 || (a[A] = p[A]);
    var $, T, i, m, h, Z = a.points = [], V = a.segments = [1], R = l - r,
      L = Math.max(Math.ceil(Math.abs(R) / Math.PI * 2), 1), f = R / L, y = Math.tan(.5 * f),
      Q = Math.sin(f) * (Math.sqrt(4 + 3 * y * y) - 1) / 3, d = Math.cos(r), G = Math.sin(r), D = O[2] / 2,
      C = O[3] / 2, x = O[0] + D, z = O[1] + C, k = Math.sin(p.rotation || 0), X = Math.cos(p.rotation || 0),
      E = function (p, r) {
        var l = D * p, a = C * r;
        return { x: x + (X * l - k * a), y: z + (k * l + X * a) }
      }, Y = E(d, G);
    Z.push(Y.x, Y.y);
    for (var c = 0; c < L; c++) i = r + (c + 1) * f, $ = Math.cos(i), T = Math.sin(i), Y = E(d - G * Q, G + d * Q), m = E($ + T * Q, T - $ * Q), h = E($, T), d = $, G = T, Z.push(Y.x, Y.y, m.x, m.y, h.x, h.y), V.push(4);
    return a
  }

  DxfViewer.prototype._transformPoint = function (p, r, l) {
    if (p) {
      var a = p.x, O = p.y;
      return l = l || 1, { x: a * l * r.a + O * r.c + r.tx, y: a * l * r.b + O * r.d + r.ty }
    }
  }

  DxfViewer.prototype._groupEntity = function (p, r, l, a, O) {
    var _this = this, A = _this.getColor(r, l);
    if (A && (!_this.options.filter || !_this.options.filter(r, O))) {
      var $, T, i, m = _this._transformPoint, h = r.type;
      if ("DIMENSION" === h || "INSERT" === h) {
        if (!r.block) return;
        var Z = l.blocks[r.block];
        if (!Z || !Z.entities) return;
        if (!(i = _this._blockDef[r.block])) return void console.log("no entity ", r.block);
        var V = a || { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
        if ("INSERT" === h) {
          var R = r.scale ? r.scale.x : 1, L = r.scale ? r.scale.y : 1, f = 0, y = 1, Q = 0;
          if (r.deg && (f = r.deg * Math.PI / 180, f = 2 * Math.PI - f, y = Math.cos(f), Q = Math.sin(f)), a) {
            var d = R * y, G = R * Q, D = -L * Q, C = L * y, x = r.center.x, z = r.center.y;
            V = {
              a: a.a * d + a.c * G,
              b: a.b * d + a.d * G,
              c: a.a * D + a.c * C,
              d: a.b * D + a.d * C,
              tx: a.a * x + a.c * z + a.tx,
              ty: a.b * x + a.d * z + a.ty
            }
          } else V = { a: R * y, b: R * Q, c: -L * Q, d: L * y, tx: r.center.x, ty: r.center.y }
        }
        _this.extrusionZNagative(r) && (V.a *= -1, V.c *= -1, V.tx *= -1);
        var k = i.bound, X = (k.pos.x, k.pos.y, m({ x: k.xMin, y: k.yMin }, V)), E = m({ x: k.xMax, y: k.yMax }, V),
          Y = m({ x: k.xMin, y: k.yMax }, V), c = m({ x: k.xMax, y: k.yMin }, V), w = _this._bound;
        w.xMin = Math.min(w.xMin, X.x, E.x, Y.x, c.x), w.yMin = Math.min(w.yMin, X.y, E.y, Y.y, c.y), w.xMax = Math.max(w.xMax, X.x, E.x, Y.x, c.x), w.yMax = Math.max(w.yMax, X.y, E.y, Y.y, c.y);
        var s;
        return (s = _this._models.BLOCK) || (_this._models.BLOCK = s = []), void s.push({
          handle: r.handle,
          block: r.block,
          transform: V
        })
      }
      ($ = p[h]) || ($ = p[h] = {}), (T = $[A]) || (T = $[A] = []);
      var _ = _this.extrusionZNagative(r) && ["POINT", "LINE", "ELLIPSE"].indexOf(h) < 0;
      if (a || _) {
        a || (a = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
        var e = {};
        for (var g in r) e[g] = r[g];
        e.radius && (e.radius *= Math.sqrt(a.a * a.a + a.b * a.b)), e.textHeight && (e.textHeight *= Math.sqrt(a.a * a.a + a.b * a.b));
        var S = _ ? -1 : 1;
        if (e.position = m(e.position, a, S), e.startPoint = m(e.startPoint, a, S), e.center = m(e.center, a, S), "ELLIPSE" === h) {
          var u;
          u = m({ x: r.major.x + r.center.x, y: r.major.y + r.center.y }, a, S), e.major = {
            x: u.x - e.center.x,
            y: u.y - e.center.y
          }, _this.extrusionZNagative(r) && (e.major.x *= -1)
        }
        var B;
        e.vertices && (B = [], e.vertices.forEach(function (p) {
          var r = m(p, a, S);
          p.bulge && (r.bulge = p.bulge), B.push(r)
        }), e.vertices = B), e.points && (B = [], e.points.forEach(function (p) {
          var r = m(p, a, S);
          p.bulge && (r.bulge = p.bulge), B.push(r)
        }), e.points = B);
        var W = Math.atan2(a.b, a.a), M = Math.cos(W);
        e.yInvert = a.d * M < 0, e.xInvert = a.a * M < 0, 0 !== W && (e.addonAngle = W), r = e
      }
      _this.mergeBound(r), T.push(r)
    }
  }

  DxfViewer.prototype.getPointsBound = function (p) {
    for (var r = 1 / 0, l = 1 / 0, a = -1 / 0, O = -1 / 0, N = 0, A = p.length; N < A; N++) {
      var $ = p[N];
      r = Math.min(r, $.x), l = Math.min(l, $.y), a = Math.max(a, $.x), O = Math.max(O, $.y)
    }
    return { xMin: r, yMin: l, xMax: a, yMax: O }
  }

  DxfViewer.prototype.mergeBound = function (p) {
    var r, l, a = this;
    l = p.type;
    for (r in KEYS) if (KEYS[r].indexOf(l) >= 0) break;
    var O, N, A, $, T, i, m, h, Z, V, R, L, y, Q, d, G, D, C, x, z, k, X = a.getPointsBound;
    switch (r) {
      case "LINE":
        for (O = X(p.vertices), z = p.vertices.length, C = 0; C < z; C++) x = p.vertices[C], a._isStraightLine(x.bulge) || (C !== z - 1 || p.shape) && (k = X(a._getBulgeSegment(x, p.vertices[(C + 1) % z], x.bulge)), O.xMin = Math.min(O.xMin, k.xMin), O.yMin = Math.min(O.yMin, k.yMin), O.xMax = Math.max(O.xMax, k.xMax), O.yMax = Math.max(O.yMax, k.yMax));
        break;
      case "SOLID":
        O = X(p.points);
        break;
      case "POINT":
        if (!p.position) return;
        N = p.position.x, A = p.position.y, O = { xMin: N, yMin: A, xMax: N, yMax: A };
        break;
      case "TEXT":
        if (!p.text || !p.text.length) return;
        N = p.position ? p.position.x : p.startPoint.x, A = p.position ? p.position.y : p.startPoint.y, D = p.height || p.textHeight || 12, a._minFontSize = Math.min(a._minFontSize, D), O = {
          xMin: N,
          yMin: A,
          xMax: N + D * p.text.length,
          yMax: A + D
        };
        break;
      case "CIRCLE":
        for (N = p.center.x, A = p.center.y, $ = p.radius, T = [], i = p.startAngle || 0, m = i + (p.angleLength || 2 * Math.PI), h = p.xInvert ^ a.extrusionZNagative(p), Z = p.yInvert, V = h ? -1 : 1, R = Z ? -1 : 1, L = i; L < m + Math.PI / 30; L += Math.PI / 30) L = Math.min(L, m), T.push({
          x: N + V * $ * Math.cos(L),
          y: A + R * $ * Math.sin(L)
        });
        O = X(T);
        break;
      case "ELLIPSE":
        for (N = p.center.x, A = p.center.y, T = [], y = Math.sqrt(p.major.x * p.major.x + p.major.y * p.major.y), Q = y * p.ratio, $ = Math.atan2(p.major.y, p.major.x), d = Math.sin($), G = Math.cos($), i = p.startAngle || 0, m = i + (p.angleLength || 2 * Math.PI), h = p.xInvert, Z = p.yInvert ^ a.extrusionZNagative(p), V = h ? -1 : 1, R = Z ? -1 : 1, L = i; L < m + Math.PI / 30; L += Math.PI / 30) {
          L = Math.min(L, m);
          var E = V * y * Math.cos(L), Y = R * Q * Math.sin(L);
          T.push({ x: N + (G * E - d * Y), y: A + (d * E + G * Y) })
        }
        O = X(T);
        break;
      default:
        return
    }
    var c = a._bound;
    c.xMin = Math.min(c.xMin, O.xMin), c.yMin = Math.min(c.yMin, O.yMin), c.xMax = Math.max(c.xMax, O.xMax), c.yMax = Math.max(c.yMax, O.yMax)
  }

  DxfViewer.prototype.parseFile = function (p) {
    var r = this, l = "string" == typeof r.options.sanitize ? { sanitize: r.options.sanitize } : null, a = new DxfIO(l),
      O = a.parseSync(p);
    r._dxf = O, r._isAc2015 = "AC1015" === O.header.$ACADVER, r._dxfViewport = r.getCameraParametersFromDxf(O)
  }

  DxfViewer.prototype.toLocal = function (p, r) {
    var _this = this;
    return (2 === r ? -(p - _this._shiftY) : 1 === r ? p - _this._shiftX : p) * _this._scale
  }

  DxfViewer.prototype.getCameraParametersFromDxf = function (p) {
    var r, l, a, O, N, A, $, T, i, m, h, Z;
    if (!r && p.tables && p.tables.viewPort) {
      m = p.tables.viewPort.viewPorts;
      for (i in m) if (h = m[i], Z = h.viewDirectionFromTarget, h.center && (0 === h.renderMode || Z && 0 === Z.x && 0 === Z.y && 1 === Z.z)) {
        a = h.center, O = h.upperRightCorner, N = h.lowerLeftCorner, r = { x: O.x, y: O.y }, l = {
          x: N.x,
          y: N.y
        }, A = h.viewWidth || 0, $ = h.viewHeight || 0, h.viewTarget && (a = {
          x: a.x + h.viewTarget.x,
          y: a.y + h.viewTarget.y
        });
        break
      }
    }
    return !r && p.header && (T = p.header, T.$EXTMIN && T.$EXTMAX && (r = T.$EXTMAX, l = T.$EXTMIN)), A = Math.max(A, r.x - l.x), $ = Math.max($, r.y - l.y), a = a || {
      x: A / 2 + l.x,
      y: $ / 2 + l.y
    }, { width: A, height: $, x: a.x, y: a.y }
  }

  DxfViewer.prototype.getColor = function (p, r) {
    var a, O = this;
    if (p || console.log("no entity", p), r.tables && r.tables.layer && (a = r.tables.layer.layers[p.layer]), !a || a.visible) {
      var N;
      p.color !== undefined ? 0 === (N = p.color) && (N = O.options.defaultColor) : a && (N = a.color), N && 16777215 !== N || (N = O.options.defaultColor);
      var N = "#" + ((1 << 24) + N).toString(16).slice(1);
      return O.options.mapColor && (N = O.options.mapColor(N)), N
    }
  }

  DxfViewer.prototype.sortBlocks = function (p) {
    var l, a, O, N, A = Object.keys(p), $ = {};
    for (l in p) if (a = p[l], a.entities) for (var T = 0, i = a.entities.length; T < i; T++) O = a.entities[T], "DIMENSION" !== (N = O.type) && "INSERT" !== N || O.block && ($[l] || ($[l] = []), $[l].push(O.block));
    for (var m = A.length, h = m, Z = {}, V = new Array(m), R = false, L = function (p, r, l) {
      if (l.indexOf(p) >= 0) return void (R = true);
      if (!Z[r]) {
        Z[r] = true;
        var a = $[p], O = a ? a.length : 0;
        if (O) {
          var N = l.concat(p);
          do {
            var T = a[--O];
            if (L(T, A.indexOf(T), N), R) break
          } while (O)
        }
        V[--m] = p
      }
    }; h--;) Z[h] || L(A[h], h, []);
    return R ? [] : V
  }

  var y = ht.DxfWriter = function (p) {
    this.init(p)
  };
  y.prototype = {}, y.prototype.constructor = y, Object.defineProperties(y.prototype, {}), y.prototype.init = function (p) {
    var l = this, a = ht.DxfWriter.template;
    a.converted || (Object.keys(a).forEach(function (p) {
      a[p] = a[p].join("\n")
    }), a.converted = true), l._transformFunc = p.transformFunc || function (p) {
      return p
    }, l._drawingScale = p.scale || 1, l._matchFunc = p.matchFunc || function () {
      return true
    }, l._maxHandleId = 262128
  }, y.prototype.toDxf = function (p, r) {
    var l = this;
    return l.dxfContent = p, l.gv = r, l.outputEntityLines = ["ENTITIES", "  0", "ENDSEC"], l._fetchEntityContent(), l._collectGvEntity(), l._insertEntities(), l._write()
  }, y.prototype._collectGvEntity = function () {
    var p = this;
    p.gv.dm().toDatas(p._matchFunc).each(function (r) {
      var l = r.a("handle");
      l && p._recordMaxHandleId(l)
    })
  }, y.prototype._fetchEntityContent = function () {
    var p = this, r = p.dxfContent, l = p.entitiesStartIndex = r.indexOf("ENTITIES"),
      a = p.entitiesEndIndex = r.indexOf("ENDSEC", l) + "ENDSEC".length;
    p.entitiesContent = r.slice(l, a), p.dxfEntityLines = p.entitiesContent.split(/\r\n|\n/)
  }, y.prototype._updateEntities = function () {
    var p = this, r = p.outputEntityLines, a = p.dxfEntityLines, O = p.gvEntities;
    r.push(a[0]);
    for (var N, A, $, T, i, m, h, Z, V, R, L, f, y, Q, d = 1, G = 1e5, D = p._findCode, C = p._toFloat; G--;) {
      if ("ENDSEC" === (T = a[d + 1].trim())) {
        r.push(a[d]), r.push(a[d + 1]);
        break
      }
      for (N = d + 2; G-- && "0" !== a[N].trim();) N += 2;
      if (i = a[D("5", a, d, N)], p._recordMaxHandleId(i), m = O[i]) {
        for (A = r.length, L = d; L < N; L++) r.push(a[L]);
        if ($ = r.length, d = N, "edge" !== m.a("shapeType")) {
          if ("image" === m.a("shapeType")) {
            for (h = p._getNodeRealScale(m), V = 2 * Math.PI - m.getRotation(); V >= 2 * Math.PI;) V -= 2 * Math.PI;
            for (; V < 0;) V += 2 * Math.PI;
            Z = p._transformFunc(m.getPosition()), Math.abs(h.x - 1) < 1e-5 && Math.abs(h.y + 1) < 1e-5 && (h.x = -1, h.y = 1, V = 2 * Math.PI - V);
            var x = {};
            [{ key: "10", value: Z.x }, { key: "20", value: Z.y }, {
              key: "42",
              value: h.y,
              default: 1,
              before: ["50"]
            }, { key: "41", value: h.x, default: 1, dependOn: "42", before: ["42", "50"] }, {
              key: "50",
              value: 180 * V / Math.PI,
              default: 0
            }].forEach(function (p) {
              if (f = p.key, y = p.value, Q = p.default !== undefined && Math.abs(y - p.default) < 1e-5, y = C(y, "10" === f || "20" === f || "50" === f), R = D(f, r, A, $)) y !== r[R].trim() && (r[R] = y); else {
                if (Q && (!p.dependOn || x[p.dependOn])) return void (x[f] = true);
                var a = false;
                do {
                  if (!p.before) break;
                  if (R = undefined, p.before.forEach(function (p) {
                    var l = D(p, r, A, $);
                    l && (!R || l < R) && (R = l)
                  }), !R) break;
                  r.splice(R - 1, 0, " " + f, y), a = true
                } while (false);
                a || (r.push(" " + f), r.push(y)), $ += 2
              }
            })
          }
        } else p._tryUpdateEdge(r, A, $, T, m)
      } else console.log("have no entity with handle " + i + " " + T), d = N
    }
  }, y.prototype._recordMaxHandleId = function (p) {
    var r = parseInt("0x" + p), l = this;
    l._maxHandleId = Math.max(l._maxHandleId, r)
  }, y.prototype._nextHandleId = function () {
    return (++this._maxHandleId).toString(16).toUpperCase()
  }, y.prototype._getNodeRealScale = function (p) {
    var r = this, l = p.getScale(), a = p.getSize(), O = ht.Default.getImage(p.getImage());
    return {
      x: l.x * a.width * O.scale / (O.width * r._drawingScale),
      y: l.y * a.height * O.scale / (O.height * r._drawingScale)
    }
  }, y.template = { INSERT: ["  0", "INSERT", "  5", "$HANDLE", "330", "1F", "100", "AcDbEntity", "  8", "0", "100", "AcDbBlockReference", "  2", "$BLOCK", " 10", "$POSITION.X", " 20", "$POSITION.Y", " 30", "0.0", " 41", "$SCALE.X", " 42", "$SCALE.Y", " 50", "$ROTATION"] }, y.prototype._insertEntities = function () {
    var p, r = this;
    r.gv.dm().toDatas(r._matchFunc).each(function (l) {
      if (p = null, l.a("addonBlock")) p = r._addonBlock(l); else if (l.a("addonText")) p = r._addonText(l); else if (l.a("addonARC") && !l.s("shape.arc.oval")) {
        var a = l.s("shape.arc.to"), O = l.s("shape.arc.from") || 0;
        p = !a || Math.abs(a - O) >= 2 * Math.PI ? r._addonCircle(l) : r._addonARC(l)
      } else l.a("addonARC") && l.s("shape.arc.oval") ? p = r._addonEllipse(l) : l.a("addonLine") ? p = r._addonLine(l) : l.a("addonRect") && (p = r._addonRect(l));
      if (p) {
        var N = p.length, A = r.outputEntityLines.length, $ = A + N;
        r.outputEntityLines.length = $, r.outputEntityLines[$ - 1] = r.outputEntityLines[A - 1], r.outputEntityLines[$ - 2] = r.outputEntityLines[A - 2];
        for (var T = 0, i = A - 2; T < N; ++T, ++i) r.outputEntityLines[i] = p[T]
      }
    })
  };
  var Q = function (p) {
    if (p instanceof ht.Shape) {
      var r = new ht.Matrix, l = p.getPosition();
      return r.translate(-l.x, -l.y).scale(p.getScaleX(), p.getScaleY()).rotate(p.getRotation()).translate(l.x, l.y), r
    }
    return p.getMatrix ? p.getMatrix() : new ht.Matrix
  };
  y.prototype._addonRect = function (p) {
    var r = this, l = p.getPoints(), a = p.getSegments(), O = true;
    a && (O = 5 === a.get(a.size() - 1));
    var N,
      A = ["  0", "LWPOLYLINE", "  5", p.a("handle") || r._nextHandleId(), "330", "1F", "100", "AcDbEntity", "  8", "0", "100", "AcDbPolyline", " 90", "        " + l.size(), " 70", "     " + (O ? 1 : 0), " 43", "0.0"],
      $ = r._toFloat, T = Q(p);
    return l.each(function (p) {
      N = r._transformFunc(T.tf(p)), A.push.apply(A, [" 10", $(N.x, true), " 20", $(N.y, true)])
    }), A
  }, y.prototype._addonCircle = function (p) {
    var r = this,
      l = ["  0", "CIRCLE", "  5", p.a("handle") || r._nextHandleId(), "330", "1F", "100", "AcDbEntity", "  8", "0", "100", "AcDbCircle"],
      a = r._toFloat, O = r._transformFunc(p.getPosition());
    l.push.apply(l, [" 10", a(O.x, true), " 20", a(O.y, true), " 30", "0.0"]);
    var N = p.getScale(), A = p.getWidth() * N.x, $ = p.getHeight() * N.y;
    return l.push.apply(l, [" 40", .5 * Math.min(A, $) / r._drawingScale]), l
  }, y.prototype._addonLine = function (p) {
    var r, l = this, a = [], O = l._toFloat, N = p.getPoints(), A = Q(p), $ = l._transformFunc(A.tf(N.get(0))),
      T = p.a("handle") || l._nextHandleId();
    return N.each(function (p, N) {
      0 !== N && (a.push.apply(a, ["  0", "LINE", "  5", T, "330", "1F", "100", "AcDbEntity", "  8", "0", "100", "AcDbLine"]), a.push.apply(a, [" 10", O($.x, true), " 20", O($.y, true), " 30", "0.0"]), r = l._transformFunc(A.tf(p)), a.push.apply(a, [" 11", O(r.x, true), " 21", O(r.y, true), " 31", "0.0"]), $ = r, T = l._nextHandleId())
    }), a
  }, y.prototype._addonEllipse = function (p) {
    var r = this, l = ["  0", "ELLIPSE", "  5", p.a("handle") || r._nextHandleId()];
    l.push.apply(l, ["330", "1F", "100", "AcDbEntity", "  8", "0", "100", "AcDbEllipse"]);
    var a = r._toFloat, O = r._transformFunc(p.getPosition());
    l.push(" 10");
    l.push(a(O.x, true));
    l.push(" 20");
    l.push(a(O.y, true)), l.push.apply(l, [" 30", "0.0"]);
    var N, A = p.getScale(), $ = p.getWidth() * A.x / r._drawingScale, T = p.getHeight() * A.y / r._drawingScale,
      i = .5 * Math.max($, T), m = 0;
    $ > T ? N = { x: i, y: 0 } : (N = { x: 0, y: i }, m = .5 * -Math.PI);
    var h = -p.getRotation(), Z = Math.sin(h), V = Math.cos(h), R = V * N.x - Z * N.y, L = Z * N.x + V * N.y;
    l.push.apply(l, [" 11", a(R, true), " 21", a(L, true), " 31", "0.0"]), l.push.apply(l, ["210", "0.0", "220", "0.0", "230", "1.0"]);
    var f = $ / T;
    f > 1 && (f = 1 / f), l.push.apply(l, [" 40", a(f, true)]);
    var y = p.s("shape.arc.from"), Q = p.s("shape.arc.to"), d = 2 * Math.PI - Q + m, G = (d + Q - y) % (2 * Math.PI);
    return l.push.apply(l, [" 41", d, " 42", G || 2 * Math.PI]), l
  }, y.prototype._addonARC = function (p) {
    var r = this, l = ["  0", "ARC", "  5", p.a("handle") || r._nextHandleId()];
    l.push.apply(l, ["330", "1F", "100", "AcDbEntity", "  8", "0", "100", "AcDbCircle"]);
    var a = r._toFloat, O = r._transformFunc(p.getPosition());
    l.push(" 10");
    l.push(a(O.x, true));
    l.push(" 20");
    l.push(a(O.y, true)), l.push.apply(l, [" 30", "0.0"]);
    var N = p.getScale(), A = p.getWidth() * N.x, $ = p.getHeight() * N.y, T = .5 * Math.min(A, $);
    l.push.apply(l, [" 40", a(T / r._drawingScale, true)]), l.push.apply(l, ["100", "AcDbArc"]);
    var i = p.getRotation(), m = p.s("shape.arc.from"), h = p.s("shape.arc.to"), Z = 2 * Math.PI, V = (Z - h - i) % Z,
      R = (V + h - m) % Z;
    return R = R || 2 * Math.PI, l.push.apply(l, [" 50", a(180 * V / Math.PI, true), " 51", a(180 * R / Math.PI, true)]), l
  };
  var d = { left: 0, center: 1, right: 2 }, G = { top: 3, middle: 2, bottom: 1 };
  y.prototype._addonText = function (p) {
    var r = this, l = ["  0", "TEXT", "  5", p.a("handle") || r._nextHandleId()];
    l.push.apply(l, ["330", "1F", "100", "AcDbEntity", "  8", "0", "100", "AcDbText"]);
    var a = p.s("text.font") || "16px Standard", O = p.s("text"), N = ht.Default.getTextSize(a, O), A = p.getScale(),
      $ = parseFloat(a) / r._drawingScale * A.y, T = $ / N.height * N.width, i = r._toFloat,
      h = r._transformFunc(p.getPosition());
    h.y += $ / 4;
    var Z = l.push(" 10");
    l.push(i(h.x, true));
    var V = l.push(" 20");
    l.push(i(h.y, true)), l.push.apply(l, [" 30", "0.0"]), l.push(" 40"), l.push($), l.push("  1"), l.push(O);
    var R = 2 * Math.PI - p.getRotation();
    l.push(" 50"), l.push(i(180 * R / Math.PI % 360, true)), l.push(" 41"), l.push(A.x / A.y), a = a.substr(a.indexOf("px") + 3).split(","), l.push("  7"), l.push(a[0]);
    var L = p.s("text.align") || "left", f = p.s("text.vAlign") || "bottom";
    if ("left" !== L && (l.push(" 72"), l.push("     " + d[L])), "bottom" !== f || "left" !== L) {
      l.push(" 11"), l.push(i(h.x, true)), l.push(" 21"), l.push(i(h.y, true)), l.push.apply(l, [" 31", "0.0"]);
      var y = 0, Q = 0;
      "center" === L ? y = .5 * T : "right" === L && (y = T), y *= A.x, "top" === f ? Q = $ : "middle" === f && (Q = .5 * $), Q *= A.y;
      var D = Math.cos(R + Math.PI), C = Math.sin(R + Math.PI);
      l[Z] = D * y - C * Q + h.x, l[V] = C * y + D * Q + h.y
    }
    return l.push.apply(l, ["100", "AcDbText"]), "bottom" !== f && (l.push(" 73"), l.push("     " + G[f])), l
  }, y.prototype._addonBlock = function (p) {
    var r = this, l = ht.DxfWriter.template.INSERT;
    l = l.replace("$HANDLE", p.a("handle") || r._nextHandleId()), l = l.replace("$BLOCK", p.getImage());
    for (var a = r._getNodeRealScale(p), O = 2 * Math.PI - p.getRotation(); O >= 2 * Math.PI;) O -= 2 * Math.PI;
    for (; O < 0;) O += 2 * Math.PI;
    var N = r._transformFunc(p.getPosition());
    Math.abs(a.x - 1) < 1e-5 && Math.abs(a.y + 1) < 1e-5 && (a.x = -1, a.y = 1, O = 2 * Math.PI - O);
    var A = r._toFloat;
    return l = l.replace("$POSITION.X", A(N.x, true)), l = l.replace("$POSITION.Y", A(N.y, true)), l = l.replace("$SCALE.X", A(a.x)), l = l.replace("$SCALE.Y", A(a.y)), l = l.replace("$ROTATION", A(180 * O / Math.PI, true)), l.split(/\r\n|\n/)
  }, y.prototype._tryUpdateEdge = function (p, r, l, a, O) {
    var N = this, A = ht.Default.getInternal(),
      $ = A.getEdgeAgentPosition(N.gv, O.getSourceAgent(), O.s("edge.source.position"), O.s("edge.source.offset.x"), O.s("edge.source.offset.y"), O.s("edge.source.anchor.x"), O.s("edge.source.anchor.y")),
      T = A.getEdgeAgentPosition(N.gv, O.getTargetAgent(), O.s("edge.target.position"), O.s("edge.target.offset.x"), O.s("edge.target.offset.y"), O.s("edge.target.anchor.x"), O.s("edge.target.anchor.y"));
    $ = N._transformFunc($), T = N._transformFunc(T);
    var i = N._findCode;
    if ("LINE" === a) p[i("10", p, r, l)] = $.x, p[i("20", p, r, l)] = $.y, p[i("11", p, r, l)] = T.x, p[i("21", p, r, l)] = T.y; else if ("LWPOLYLINE" === a) {
      for (var h, Z = i("10", p, r, l), V = Z; h = i("10", p, V + 1, l);) V = h;
      V = (h = i("30", p, V + 1, l)) ? h : i("20", p, V + 1, l), p.splice(Z - 1, V - Z + 2);
      var R = [$];
      O.s("edge.points").each(function (p) {
        R.push(N._transformFunc(p))
      }), R.push(T);
      var L = Z - 1;
      R.forEach(function (r) {
        p.splice(L, 0, "10", r.x, "20", r.y), L += 4
      })
    }
  }, y.prototype._findCode = function (p, r, l, a) {
    for (var O = l, N = false; O < a;) {
      if (p === r[O].trim()) {
        N = true;
        break
      }
      O += 2
    }
    if (N) return O + 1
  }, y.prototype._toFloat = function (p, r) {
    return r || (p = Math.round(1e8 * p) / 1e8), p = "" + p, p.indexOf(".") < 0 && (p += ".0"), p
  }, y.prototype._write = function () {
    var p = this, r = p.dxfContent, l = p.outputEntityLines.join("\n"), a = p.entitiesStartIndex,
      O = p.entitiesEndIndex;
    return r.slice(0, a) + l + r.slice(O)
  }
}("undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : (0, eval)("this"), Object));
