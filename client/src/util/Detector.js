export default class Detector {
  init() {
    let baseFonts = this.baseFonts = ["monospace", "sans-serif", "serif"],
      testString = this.testString = "mmmmmmmmmmlli",
      testSize = this.testSize = "72px",
      body = this.h = document.getElementsByTagName("body")[0],
      s = this.s = document.createElement("span");

    s.style.fontSize = testSize
    s.innerHTML = testString;

    let w = this.defaultWidth = {},
      h = this.defaultHeight = {};
    for (const key in baseFonts) {
      s.style.fontFamily = baseFonts[key]
      body.appendChild(s);
      w[baseFonts[key]] = s.offsetWidth;
      h[baseFonts[key]] = s.offsetHeight;
      body.removeChild(s);
      this.initialized = true
    }
  }

  detect(font) {
    this.initialized || this.init();
    let used = false;
    const baseFonts = this.baseFonts,
      s = this.s,
      h = this.h,
      defaultWidth = this.defaultWidth,
      defaultHeight = this.defaultHeight;
    for (const key in baseFonts) {
      s.style.fontFamily = font + "," + baseFonts[key];
      h.appendChild(s);
      const changed = s.offsetWidth !== defaultWidth[baseFonts[key]] ||
        s.offsetHeight !== defaultHeight[baseFonts[key]];
      h.removeChild(s)
      used = used || changed
    }
    return used;
  }
}