require('./style.css')
const WIN = window
const DOC = document
const body = DOC.querySelector('body')

const Anyppt = function(options = {}) {
  Object.assign(this, {
    bodyClassName: 'anyppt-show',
    className: 'anyppt',
    id: 'J-anyppt',
    vdom: [],
    el: options.el || document.querySelector('article'),
    currentPage: 0,
    dom: {
      container: null,
      pages: null
    }
  })

  this.init()
}

Anyppt.prototype = {
  constructor: Anyppt,

  init() {
    if (!this.el) return
    this.getStructure()
    this.render()
    this.bindEvent()
  },

  getStructure() {
    const el = this.el

    const children = el.children

    this.walk(children)
    console.log(this.vdom)
  },

  walk(children) {
    const vdom = this.vdom
    ;[].forEach.call(children, el => {
      const tagname = el.tagName.toLowerCase()
      // end tag
      if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'i', 'em', 'strong', 'mark', 'pre'].indexOf(tagname) > -1) {
        vdom.push({
          tagname,
          html: el.outerHTML
        })
      } else {
        this.walk(el.children)
      }
    })
  },

  render() {
    if (!document.querySelector(`#${this.id}`)) {
      const container = document.createElement('div')
      let currentPage = location.hash.slice(1)
      currentPage = isNaN(currentPage) ? 0 : parseInt(currentPage)

      this.currentPage = currentPage

      container.setAttribute('id', this.id)
      container.setAttribute('class', this.className)
      container.innerHTML = [
        '<span class="anyppt-close"></span>',
        '<div class="anyppt-content">',
        ...this.vdom.map((el, idx) => `<section class="anyppt-page" ${idx === currentPage ? 'style="display:block;"' : ''}>${el.html}</section>`),
        '</div>',
        '<div class="anyppt-controller"><i class="anyppt-back" data-role="back"></i><i class="anyppt-forward" data-role="forward"></i></div>'
      ].join('')

      body.appendChild(container)
      this.dom.container = container
      this.dom.controller = container.querySelector('.anyppt-controller')
      this.dom.pages = container.querySelectorAll('.anyppt-page')
      this.pageNum = this.dom.pages.length
    }

    this.show()
  },

  go(dir) {
    const { container, pages } = this.dom
    let currentPage = this.currentPage

    pages[currentPage].style.display = 'none'

    if (dir === 'back') {
      currentPage = --currentPage < 0 ? 0 : currentPage
    } else {
      currentPage = ++currentPage >= this.pageNum ? this.pageNum - 1 : currentPage
    }

    this.currentPage = currentPage

    location.hash = currentPage

    pages[this.currentPage].style.display = 'block'

    console.log(this.currentPage)
  },

  show() {
    body.classList.add(this.bodyClassName)
  },

  hide() {
    body.classList.remove(this.bodyClassName)
  },

  bindEvent() {
    const me = this

    me.dom.controller.addEventListener('click', function(e) {
      const target = e.target
      if (target.tagName === 'I') {
        me.go(target.dataset.role)
      }
    })

    me.dom.container.addEventListener('click', function(e) {
      const target = e.target
      if (target.classList.contains('anyppt-close')) {
        me.hide()
      }
    })

    DOC.addEventListener('keydown', function(e) {
      const keyCode = e.keyCode
      if ([37, 39].indexOf(keyCode) > -1) {
        me.go({ 37: 'back', 39: 'forward' }[keyCode])
      }
    })
  }
}

WIN.Anyppt = Anyppt
