require('./style.scss')
require('./theme.scss')

const WIN = window
const DOC = document
const body = DOC.body

const reg_hash = /anyppt=(\d+)/
const bodyClassName = 'anyppt-show'
const className = 'anyppt'
const id = 'J-anyppt'
const wordsPerPage = 366

let vdom = []
let el = null
let current = 0
let pagesNum
let dom = {}

function create(options = {}) {
  el = options.el || document.querySelector('article')
  vdom = []
  getvdom()
  render()

  return this
}

function walk(nodes) {
  ;[].forEach.call(nodes, node => {
    try {
      const nodeType = node.nodeType

      const isText = nodeType === 3
      if ((isText && /^\s+$/g.test(node.nodeValue)) || nodeType === 8) return

      const tagname = isText ? 'span' : node.tagName.toLowerCase()
      if (['div', 'section'].indexOf(tagname) > -1) {
        walk(node.childNodes)
      } else {
        vdom.push({
          tagname,
          html: isText ? `<span>${node.nodeValue}</span>` : node.outerHTML,
          length: isText ? node.length : node.innerText.length,
          children: [],
          single: !!(node.querySelector && node.querySelector('img'))
        })
      }
    } catch (e) {
      console.error(e, node)
    }
  })
}

function getvdom() {
  const nodes = el.childNodes

  walk(nodes)
  console.log(vdom)

  let currentHead = null
  let currentHeadIdx = 0
  let currentIdx = -1
  let currentDetail = {
    content: [],
    words: 0,
    tovdom() {
      return this.content.length
        ? [
            {
              tagname: 'div',
              html: this.content.map(dom => dom.html).join(''),
              idx: ++currentIdx,
              parent: currentHeadIdx,
              length: this.words
            }
          ]
        : []
    },
    reset() {
      this.content = []
      this.words = 0
    }
  }
  const vdomLen = vdom.length

  vdom = vdom.reduce((results, dom, idx) => {
    // header
    if (/^h[1,2]$/.test(dom.tagname)) {
      currentHead && (currentHead.children = [...currentHead.children, ...currentDetail.tovdom()])

      currentHead = dom
      ++currentIdx
      currentHeadIdx = currentIdx
      results.push(currentHead)

      currentDetail.reset()
    } else {
      // single page
      if (['img', 'header', 'h3'].indexOf(dom.tagname) > -1 || dom.single) {
        currentHead.children = [
          ...currentHead.children,
          ...currentDetail.tovdom(),
          {
            ...dom,
            idx: ++currentIdx,
            parent: currentHeadIdx
          }
        ]
        currentDetail.reset()
      } else {
        currentDetail.words += dom.length
        if (currentDetail.words <= wordsPerPage) {
          currentDetail.content.push(dom)
        } else {
          currentHead.children = [...currentHead.children, ...currentDetail.tovdom()]
          currentDetail.reset()
          currentDetail.content.push(dom)
          currentDetail.words += dom.length
        }
      }
    }

    // from h1, lost prev msg?
    if (!currentHead) {
      // results.push(dom)
    }

    if (idx === vdomLen - 1) {
      currentHead.children = [...currentHead.children, ...currentDetail.tovdom()]
    }

    return results
  }, [])
}

// get current page idx from hash
function getPageIdxByHash() {
  const current = location.hash.match(reg_hash)
  let idx
  return !current || (idx = parseInt(current[1])) < 0 ? 0 : idx >= pagesNum ? pagesNum - 1 : idx
}

function render() {
  let container = document.querySelector(`#${id}`)
  if (container) {
    body.removeChild(container)
  }
  container = document.createElement('div')

  container.setAttribute('id', id)
  container.setAttribute('class', className)

  // template
  container.innerHTML = [
    // close
    '<span class="anyppt-close"></span>',
    // ppt pages
    '<div class="anyppt-content">',
    ...vdom.map((el, idx) =>
      [
        `<section class="anyppt-page ${el.children.length ? 'anyppt-page-hd' : ''}">${el.html}</section>`,
        ...el.children.map(
          child => `<section class="anyppt-page" data-anyppt-head="${child.parent}">${child.html}</section>`
        )
      ].join('')
    ),
    '</div>',
    // controller
    '<div class="anyppt-controller">',
    '  <i class="anyppt-back" data-role="37"></i>',
    '  <span class="anyppt-progress-num"></span>',
    '  <i class="anyppt-forward" data-role="39"></i>',
    '</div>',
    // progress bar
    '<div class="anyppt-progress"><i class="anyppt-progress-inner"></i></div>'
  ].join('')

  body.appendChild(container)

  const controller = container.querySelector('.anyppt-controller')
  const pages = container.querySelectorAll('.anyppt-page')
  dom = {
    container,
    controller,
    pages,
    progress: container.querySelector('.anyppt-progress-inner'),
    progressNum: controller.querySelector('.anyppt-progress-num')
  }

  pagesNum = pages.length
}

function refresh() {
  create()

  return this
}

function go(dir) {
  const { pages } = dom
  pages[current].classList.remove('anyppt-page-show')

  switch (dir) {
    // back
    case 37:
    case 38:
      current = --current < 0 ? 0 : current
      break
    // forward
    case 39:
    case 40:
      current = ++current >= pagesNum ? pagesNum - 1 : current
      break
  }
  update()
}

function update() {
  const { progress, pages, container, progressNum } = dom

  // update hash
  let hash = location.hash
  hash = reg_hash.test(hash) ? hash.replace(/anyppt=\d+/, 'anyppt=' + current) : hash + '?anyppt=' + current
  location.hash = hash

  const showone = container.querySelector('.anyppt-page-show')
  showone && showone.classList.remove('anyppt-page-show')

  const ndCurrent = pages[current]
  ndCurrent.classList.add('anyppt-page-show')

  // current head
  const ndCurrentHd = pages[ndCurrent.dataset.anypptHead]
  // no currenthead or current head has no 'current-head' classname
  if (!ndCurrentHd || !ndCurrentHd.classList.contains('current-head')) {
    const prevHd = container.querySelector('.current-head')
    prevHd && prevHd.classList.remove('current-head')
    ndCurrentHd && ndCurrentHd.classList.add('current-head')
  }

  progress.style.width = (current + 1) / pagesNum * 100 + '%'
  progressNum.innerHTML = `${current + 1} / ${pagesNum}`
}

function dispose() {}

function show() {
  dispose()

  current = getPageIdxByHash()
  body.classList.add(bodyClassName)
  update()
  bindEvent()

  if (process.env.NODE_ENV === 'development') {
    const originLen = el.innerText.replace(/\s+/g, '').length
    const nowLen = dom.container.innerText.replace(/\s+/g, '').length
    const diff = originLen - nowLen
    console[diff > 20 ? 'warn' : 'log'](
      'Words diff:',
      diff,
      '(Original content length - Anyppt transformed content length)'
    )
  }

  return this
}

let hide = function() {
  body.classList.remove(bodyClassName)
  dispose()

  return this
}

function bindEvent() {
  const { container, controller } = dom

  container.addEventListener('click', containerClickHandler)
  DOC.addEventListener('keydown', keydownHandler)
  WIN.addEventListener('hashchange', hashchange)

  dispose = function() {
    container.removeEventListener('click', containerClickHandler)
    DOC.removeEventListener('keydown', keydownHandler)
    WIN.removeEventListener('hashchange', hashchange)
  }

  function containerClickHandler(e) {
    const target = e.target
    if (target.classList.contains('anyppt-close')) {
      hide()
    }

    if (controller.contains(target) && target.tagName === 'I') {
      go(parseInt(target.dataset.role))
    }
  }

  function keydownHandler(e) {
    const keyCode = e.keyCode
    if ([37, 38, 39, 40].indexOf(keyCode) > -1) {
      go(keyCode)
    }

    if (keyCode === 27) {
      hide()
    }
  }

  function hashchange() {
    current = getPageIdxByHash()
    update()
  }
}

module.exports = {
  create,
  show,
  hide,
  refresh
}
