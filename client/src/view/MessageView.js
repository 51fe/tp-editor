export default class MessageView {
  constructor(editor) {
    this.editor = editor;
    const container = this.container = ht.Default.createDiv(),
      wrap = this.wrap = ht.Default.createDiv();
    let style = container.style;
    style.pointerEvents = "none";
    style.position = "absolute";
    style.left = 0;
    style.right = 0;
    style.top = 0;
    style.bottom = 0;
    container.appendChild(wrap);
    style = wrap.style;
    style.width = "500px";
    style.position = "absolute";
    style.left = "50%";
    style.bottom = "20px";
    style.marginLeft = "-300px";
    style.pointerEvents = "none";
    this._cache = [];
    this._visibleCount = 0;
    this.layoutContainer();
    window.addEventListener("resize", () => {
      this.layoutContainer();
    })
  }

  layoutContainer() {
    const container = this.container,
      info = ht.Default.getWindowInfo(),
      style = container.style;
    style.width = info.width + "px";
    style.height = info.height + "px";
  }

  createMessage(content) {
    let view = this._cache.pop();
    if (!view) {
      view = document.createElement("div");
      const style = view.style;
      style.boxSizing = "border-box";
      style.padding = 0, style.color = "rgb(247,247,247)";
      style.margin = "5px auto";
      style.textAlign = "center";
      style.fontSize = "14px";
      style.borderRadius = "3px";
      style.height = 0;
      style.overflow = "hidden";
      style.pointerEvents = "none";
      style.boxShadow = "rgba(0,0,0,0.1) 1px 1px 2px";
      style.webkitTransition = "0.3s all";
      style.mozTransition = "0.3s all";
      style.msTransition = "0.3s all";
      style.oTransition = "0.3s all";
      style.transition = "0.3s all";
    }
    view.innerHTML = content;
    return view;
  }

  show(content, state = "normal", ms = 2000) {
    const view = this.createMessage(content);
    this.wrap.appendChild(view);
    if (!this._visibleCount) {
      ht.Default.appendToScreen(this.container);
    }
    this._visibleCount++;
    if (state === "normal") {
      view.style.backgroundImage = "linear-gradient(rgba(95, 156, 210, 0.8),rgba(112, 193, 244, 0.3))"
    } else {
      view.style.backgroundImage = "linear-gradient(rgba(242,83,75,0.8),rgba(242,83,75,0.3))";
    }
    setTimeout(() => {
      view.style.height = "";
      view.style.padding = "6px 12px";
      this.hideLater(view, ms);
    }, 10);
  }

  hideLater(view, ms) {
    setTimeout(() => {
      view.style.height = 0;
      view.style.padding = 0;
      setTimeout(() => {
        this.wrap.removeChild(view);
        this._cache.push(view);
        if (!(--this._visibleCount)) {
          this.container.parentNode.removeChild(this.container);
        }
      }, 500)
    }, ms)
  }
}
