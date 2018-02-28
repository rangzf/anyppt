import './style.css'
import './theme.css'

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
      pages: null,
      controller: null
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
      if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'i', 'em', 'strong', 'mark', 'pre', 'img', 'header'].indexOf(tagname) > -1) {
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
    let container = document.querySelector(`#${this.id}`)
    if (container) {
      body.removeChild(container)
    }
    container = document.createElement('div')
    let currentPage = location.hash.slice(1)
    currentPage = isNaN(currentPage) ? 0 : parseInt(currentPage)

    this.currentPage = currentPage

    container.setAttribute('id', this.id)
    container.setAttribute('class', this.className)
    container.innerHTML = [
      // close
      '<span class="anyppt-close"></span>',
      // ppt pages
      '<div class="anyppt-content">',
      ...this.vdom.map((el, idx) => `<section class="anyppt-page ${idx === currentPage ? 'anyppt-page-show' : ''}">${el.html}</section>`),
      '</div>',
      // controller
      '<div class="anyppt-controller"><i class="anyppt-back" data-role="back"></i><i class="anyppt-forward" data-role="forward"></i></div>',
      // progress bar
      '<div class="anyppt-progress"><i class="anyppt-progress-inner"></i></div>'
    ].join('')

    body.appendChild(container)

    this.dom = {
      ...this.dom,
      container,
      controller: container.querySelector('.anyppt-controller'),
      pages: container.querySelectorAll('.anyppt-page'),
      progress: container.querySelector('.anyppt-progress-inner')
    }

    this.pageNum = this.dom.pages.length

    this.show()
  },

  go(dir) {
    const { container, pages, progress } = this.dom
    const pageNum = this.pageNum
    let currentPage = this.currentPage

    pages[currentPage].classList.remove('anyppt-page-show')

    if (dir === 'back') {
      currentPage = --currentPage < 0 ? 0 : currentPage
    } else {
      currentPage = ++currentPage >= pageNum ? pageNum - 1 : currentPage
    }

    this.currentPage = currentPage

    location.hash = currentPage

    pages[this.currentPage].classList.add('anyppt-page-show')

    this.update()
    console.log(this.currentPage)
  },

  // put some article relative things here
  update() {
    this.dom.progress.style.width = (this.currentPage + 1) / this.pageNum * 100 + '%'
  },

  show() {
    body.classList.add(this.bodyClassName)
    this.update()
  },

  bindEvent() {
    const me = this

    const { container, controller } = me.dom

    container.addEventListener('click', containerClickHandler)
    DOC.addEventListener('keydown', keydownHandler)

    function containerClickHandler(e) {
      const target = e.target
      if (target.classList.contains('anyppt-close')) {
        hide()
      }

      if (controller.contains(target) && target.tagName === 'I') {
        me.go(target.dataset.role)
      }
    }

    function keydownHandler(e) {
      const keyCode = e.keyCode
      if ([37, 39].indexOf(keyCode) > -1) {
        me.go({ 37: 'back', 39: 'forward' }[keyCode])
      }

      if (keyCode === 27) {
        hide()
      }
    }

    function hide() {
      body.classList.remove(me.bodyClassName)
      container.removeEventListener('click', containerClickHandler)
      DOC.removeEventListener('keydown', keydownHandler)
    }
  }
}

WIN.Anyppt = Anyppt
