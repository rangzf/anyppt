(function(WIN, DOC) {
  const body = DOC.querySelector("body");
  const head = DOC.querySelector("head");

  const Anyppt = function(options) {
    this.options = {
      el: null,
      ...options
    };

    Object.assign(this, {
      className: "anyppt-" + Math.random().toFixed(3) * 1000,
      id: "J-anyppt"
    });
    this.vdom = [];

    this.init();
  };

  Anyppt.prototype = {
    constructor: Anyppt,

    init() {
      this.getStructure();
      this.render();
      this.bindEvent();
    },

    getStructure() {
      const { el } = this.options;

      const children = el.children;

      this.walk(children);
      console.log(this.vdom);
    },

    walk(children) {
      const vdom = this.vdom;
      [].forEach.call(children, el => {
        const tagname = el.tagName.toLowerCase();
        // end tag
        if (
          [
            "p",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "span",
            "i",
            "em",
            "strong",
            "mark",
            "pre"
          ].indexOf(tagname) > -1
        ) {
          vdom.push({
            tagname,
            html: el.outerHTML
          });
        } else {
          this.walk(el.children);
        }
      });
    },

    render() {
      if (!document.querySelector("#J-anyppt")) {
        const vdom = this.vdom;
        const style = document.createElement("style");
        const container = document.createElement("div");
        const className = this.className;

        style.innerHTML = `
          .${className} {position:fixed;left:0;top:0;right:0;bottom:0;color:#fff;text-align:center;background:#222;overflow:hidden;}
          .${className} section {display:none;position:absolute;left:50%;top:50%;min-width:500px;transform:translate3d(-50%, -50%, 0);overflow:auto;}
          .${className} section p {text-align:left;text-indent:2em;}
        `;
        
        container.setAttribute("id", "J-anyppt");
        container.setAttribute("class", className);
        container.innerHTML = vdom
          .map(
            (el, idx) =>
              `<section ${idx === 0 ? 'style="display:block;"' : ""}>${
                el.html
              }</section>`
          )
          .join("");

        head.appendChild(style);
        body.appendChild(container);
      }
    },

    bindEvent() {}
  };

  WIN.Anyppt = Anyppt;
})(window, document);
