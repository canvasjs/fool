let svgUid = 0
window.SVGLIST = [];

/**
 * 创建元素
 * @param {string} tag 元素名称
 * @param {Object} obj 元素属性配置
 * @param {Array} array 元素子节点
 */
export const createTag = (tag = '', obj = {}, array = []) => {
  let uuid = svgUid++
  let svgNs = 'http://www.w3.org/2000/svg'
  let oSvg = document.createElementNS(svgNs, tag)
  oSvg.setAttribute('uuid', uuid)
  for (let key in obj) {
    if (key === 'event') {
      // 事件
      let eventList = obj.event
      for (let my in eventList) {
        // 设置事件
        oSvg[my] = eventList[my].bind(this, oSvg)
      }
    } else {
      if (key === 'xlink:href' && obj['xlink:href'] && obj['xlink:href'] !== '') {
        // //设置图片
        oSvg.href.baseVal = obj['xlink:href'] // svg设置image的url图片，要用image.href.baseVal
      } else {
        oSvg.setAttribute(key, obj[key])
      }
    }
  }
  // 子元素
  if (array && array instanceof Array) {
    for (let i = 0; i < array.length; i++) {
      let item = array[i]
      if (item instanceof Node) {
        oSvg.appendChild(array[i])
      } else {
        oSvg.innerHTML = item
      }
    }
  }
  return oSvg
}

/**
 * 绘制网格
 * @param {Object} svgBackground 绘制网格对象
 * @param {Int} winWidth 区域宽度
 * @param {Int} winHeight 区域高度
 * @param {Int} gridLength 网格大小
 */
export const drawGrid = (svgBackground, winWidth, winHeight, gridLength) => {
  let gridSvg = createTag('g', {title: '网格'})
  let childs = gridSvg.childNodes
  // 删除之前的网格节点，便于重绘
  for (let i = childs.length - 1; i >= 0; i--) {
    svgBackground.removeChild(childs.item(i))
  }
  for (let i = 0, len = Math.ceil(winWidth / gridLength); i <= len; i++) {
    let attrs = {
      x1: i * gridLength,
      y1: 0,
      x2: i * gridLength,
      y2: winHeight,
      stroke: '#ddd'
    }
    let line = createTag('line', attrs)
    gridSvg.appendChild(line)
  }
  ;
  for (let i = 0, len = Math.ceil(winHeight / gridLength); i <= len; i++) {
    let attrs = {
      x1: 0,
      y1: i * gridLength,
      x2: winWidth,
      y2: i * gridLength,
      stroke: '#ddd'
    }
    let line = createTag('line', attrs)
    gridSvg.appendChild(line)
    svgBackground.append(gridSvg)
  }
  ;
}

/** 创建矩形 */
// 位置参数
let rectDefaultObj = {
  x: '', y: '', w: '', h: '', content: null
}
// 节点配置信息
let rectDefaultOpt = {
  text: '',
  url: '',
  id: '',
  item: null,
  callback: () => {
  }
}

// 创建元素
class CreateSvgElement {
    uuid = svgUid++;
    svgNs = 'http://www.w3.org/2000/svg';

    constructor (tag = '', obj = {}, array = []) {
      this.tag = tag
      this.attrs = obj
      this.childs = array
      this.mySvg = null
      this.createElement()// 创建元素
      //  this.initAttrs();//设置属性
      //  this.initAppendChild();//添加子元素
    }

    // 初始化就生成
    init () {
      this.initAttrs(this.attrs)
      this.initAppendChild(this.childs)
      return this.mySvg
    }

    // 获取当前元素
    getElement () {
      return this.mySvg
    }

    getUuid () {
      return this.uuid
    }

    createElement () {
      let oSvg = document.createElementNS(this.svgNs, this.tag)
      oSvg.setAttribute('uuid', this.uuid)
      this.mySvg = oSvg
    }

    // 修改id
    setId (id) {
      this.uuid = id
      this.mySvg.setAttribute('uuid', id)
    }

    removeElement () {
      let svg = this.mySvg
      let parentNode = svg.parentNode
      if (parentNode) {
        parentNode.removeChild(svg)
      }
    }

    // 设置初始化属性 和 事件
    initAttrs (myObj = null) {
      let oSvg = this.mySvg
      let obj = myObj || this.attrs
      for (let key in obj) {
        if (key === 'event') {
          // 事件
          let eventList = obj.event
          for (let my in eventList) {
            // 设置事件
            oSvg[my] = eventList[my].bind(this, oSvg)
          }
        } else {
          if (key === 'xlink:href' && obj['xlink:href'] && obj['xlink:href'] !== '') {
            // //设置图片
            oSvg.href.baseVal = obj['xlink:href'] // svg设置image的url图片，要用image.href.baseVal
          } else {
            oSvg.setAttribute(key, obj[key])
          }
        }
      }
    };

    // 添加子元素
    initAppendChild (myArray = null) {
      let array = myArray || this.childs
      let oSvg = this.mySvg
      if (array && array instanceof Array) {
        for (let i = 0; i < array.length; i++) {
          let item = array[i]
          if (item instanceof Node) {
            oSvg.appendChild(array[i])
          } else {
            oSvg.innerHTML = item
          }
        }
      }
    }

    // 设置而且属性 外部调用
    setElementAttrs (obj) {
      if (this.mySvg) {
        for (let key in obj) {
          this.mySvg.setAttribute(key, obj[key])
        }
      }
    };
}

export class RectV2 {
  constructor (obj = rectDefaultObj) {
    // 矩形位置信息
    this.x = obj.x // X坐标
    this.y = obj.y // y坐标
    this.h = obj.h // 矩形高度
    this.w = obj.w // 矩形宽度
    this.content = obj.content // 鼠标位置上下文
    this.w2 = this.w / 2 // 宽度的一半
    this.h2 = this.h / 2 // 高度的一半  鼠标移动时 鼠标指针在矩形中间
    let eventTarget = this.eventTarget = null
    // 鼠标松开 清空事件
    document.onmouseup = function () {
      if (eventTarget) {
        eventTarget.onmousemove = null
        eventTarget.onmousemove = null
      }
    }

    this.rect = null
    this.linkToId = []
    this.maxG = null
    this.uuid = null
  }

  setLinkToId (id, bool, line) {
    if (bool) {
      this.linkToId.push({
        id: id,
        line: line
      })
    } else {
      this.linkToId = this.linkToId.filter(it => it.id !== id)
    }
  }

  // 创建矩形
  createRect (option) {
    let self = this
    const {x, y, w, h, w2, h2, content} = self
    const {
      name, url, id = null, callback = () => {
      }, isDrag, editStatus = true
    } = option
    this.option = option

    // let text = option.text, url = option.url, id = option.id, callback = option.callback, isDrag = option.isDrag;

    // 文本
    let myText = this.myText = this.createText(x + w2, y + h2 + 4, name)
    // 图片
    let img = this.img = this.createImg(x, y, w, h, url)
    let arrayCircle = [
      [x + w2, y],
      [x + w, y + h2],
      [x + w2, y + h],
      [x, y + h2]
    ]
    let circle = this.createCircle(arrayCircle) // 初始化四个小点

    circle.show(isDrag)
    // 外层最大的 g
    let maxG = this.maxG = new CreateSvgElement('g', {style: 'cursor: pointer', className: 'zgl-g'}, [])
    // 设置id
    maxG.initAttrs()

    if (id && id !== '') {
      this.uuid = id
      maxG.setId(id) // 使用传入的id
      //  maxG.setElementAttrs({uuid: id})
    } else {
      this.uuid = maxG.uuid // 使用自有的id
    }

    // 存放 图片 和文本的 g
    let imgTextG = new CreateSvgElement('g', {}, [img.element, myText.element]).init()

    let _time = null
    this.option = option

    // 矩形基本属性
    let rectAttrs = {
      width: w,
      height: h,
      x: x,
      y: y,
      fill: 'rgba(255,255,255,0.3)',
      'stroke-width': '0.3',
      stroke: '#367cff',
      rx: 3,
      event: {
        onmousedown: function (rect, evt) {
          self.eventTarget = rect
          let parentNodeUuid = rect.parentNode.getAttribute('uuid')// g 标签
          let obj = judge(parentNodeUuid)
          clearTimeout(_time)
          _time = setTimeout(() => {
            callback(self, self.option)
          }, 300)

          rect.onmousemove = function (evt) {
            clearTimeout(_time)
            if (isDrag === false) { // 不允许拖动
              return false
            }

            let ev = evt || window.event
            let {top = 0, left = 0} = content.getBoundingClientRect()
            let mX = ev.clientX - left - w2
            let mY = ev.clientY - top - h2
            // 自己移动
            rect.setAttribute('x', mX)
            rect.setAttribute('y', mY)
            self.x = mX
            self.y = mY
            // 文字移动
            myText.setAttrs(mX + w2, mY + h2 + 4)
            // 图片移动
            img.setAttrs(mX, mY)
            // 小点移动
            let xyArray = [
              [mX + w2, mY], // 1
              [mX + w, mY + h2], // 2
              [mX + w2, mY + h], // 3
              [mX, mY + h2] // 4
            ]
            circle.setCircleAttr(xyArray)// 小圆点移动
            // 跟当前节点相关的线移动
            if (obj.linkFrom.length > 0 || obj.linkTo.length > 0) {
              nodeAssociationLine(obj, xyArray)
            }
          }
          rect.onmouseup = function (evt) {
            this.onmousemove = null
            return false
          }
        },
        onmouseup: function (react, evt) {
          react.onmousemove = null
        },
        // 鼠标移入移出 显示 小点点
        onmouseenter: function (dom, event) {
          //  circle.show(true);
        },
        onmouseleave: function (dom, event) {
          // circle.show(false);

        }
      }
    }

    let myRect = new CreateSvgElement('rect')
    myRect.initAttrs(rectAttrs)
    maxG.initAppendChild([imgTextG, myRect.mySvg, ...circle.elements])
    window.SVGLIST.push({
      uuid: maxG.getUuid(),
      svg: self
    })
    return maxG.mySvg
  }

  removeElement () {
    if (this.maxG) {
      // 删除
      let mySvg = this.maxG.mySvg
      let uuid = mySvg.getAttribute('uuid')
      // 想管理的线 都需要删除
      // 获取所有的线
      let lineAll = getElementLineAll()
      for (let i = 0; i < lineAll.length; i++) {
        let item = lineAll[i]
        let linkTo = item.getAttribute('linkTo')
        let linkFrom = item.getAttribute('linkFrom')
        if (linkTo === uuid || linkFrom === uuid) {
          item.parentNode.parentNode.removeChild(item.parentNode)
        }
      }
      this.maxG.removeElement()
    }
  }

  // 创建文本
  createText (x, y, text) {
    let self = this
    let t = new MinText(x, y, text)
    let t2 = t.init()
    return {
      element: t2,
      setAttrs (x2, y2) {
        t.setAttrs({x: x2, y: y2})
      },
      setText (te = text, obj = {}) {
        // console.log('修改',te,obj);
        //  console.log(te);
        t2.innerHTML = te
        self.option = obj
        t2.option = obj
      }
    }
  }

  // 创建图片
  createImg (x, y, w, h, url) {
    let img = new MinImg(w, h, x, y, url)
    let img2 = img.init()
    return {
      element: img2,
      setAttrs (x2, y2, w2 = w, h2 = h, url2 = url) {
        img.setAttrs({x: x2, y: y2, width: w2, height: h2})
        img2.href.baseVal = url2
      }
    }
  }

  // 创建联动的四个小点 array 二维数组 四个小点的坐标
  createCircle (array) {
    let le1 = new MinCircle(array[0][0], array[0][1])// 1
    let le2 = new MinCircle(array[1][0], array[1][1]) // 2
    let le3 = new MinCircle(array[2][0], array[2][1])// 3
    let le4 = new MinCircle(array[3][0], array[3][1]) // 4
    return {
      elements: [le1.init(), le2.init(), le3.init(), le4.init()],
      setCircleAttr (xyArray) {
        // 1
        le1.setAttrs({cx: xyArray[0][0], cy: xyArray[0][1]})
        // 2
        le2.setAttrs({cx: xyArray[1][0], cy: xyArray[1][1]})
        // 3
        le3.setAttrs({cx: xyArray[2][0], cy: xyArray[2][1]})
        // 4
        le4.setAttrs({cx: xyArray[3][0], cy: xyArray[3][1]})
      },
      show (bool) {
        //   console.log('show',bool);
        le1.show(bool)
        le2.show(bool)
        le3.show(bool)
        le4.show(bool)
      }
    }
  }
}

export class CreateLine {
  constructor (svg, div) {
    this.svg = svg
    this.div = div
    let {top = 0, left = 0} = div.getBoundingClientRect()// 上下文距离浏览器 上 左的距离
    this.top = top
    this.left = left
    this.init()
  }

  init () {
    // 连线
    let top = this.top, left = this.left
    let mySvg = this.svg
    let oLine = null

    mySvg.onmousedown = function (evt) {
      // 开始点
      let target = evt.target
      if (target.getAttribute('class') === 'minCircle') {
        let x = target.getAttribute('cx')
        let y = target.getAttribute('cy')

        oLine = new MinLine(x, y, x, y, true) // minLine(x, y, x, y);
        mySvg.appendChild(oLine.mySvg)
      } else {
        return false
      }

      mySvg.onmousemove = function (event) {
        // 移动点
        let ev = event || window.event

        let x = ev.clientX - left
        let y = ev.clientY - top
        if (oLine) {
          oLine.setAttrs(x, y)
          /*  oLine.setAttribute('x2', x);
                      oLine.setAttribute('y2', y); */
        }
      }
      mySvg.onmouseup = function (evt) {
        if (oLine === null) {
          mySvg.onmousemove = null
          oLine = null
          return false
        }
        //   target.setAttribute('style', 'display:none');

        let parentNode = target.parentNode.getAttribute('uuid')
        let ev = evt || window.event
        let x = ev.clientX - left
        let y = ev.clientY - top
        let meetsThe = calculationPosition(x, y) // 返回最近的可连接点
        //  console.log('可以连接的点',meetsThe);
        if (meetsThe) {
          let nextNode = meetsThe.circle.parentNode.getAttribute('uuid')
          let bool = calculationLine(parentNode, nextNode) // 判断当前两个节点是否已经连接
          if (bool) {
            // 已经有连接了
            mySvg.removeChild(oLine.mySvg)
            oLine = null
          } else {
            // 没有连接
            /* oLine.setAttribute('linkFrom', parentNode); //开始点
                         oLine.setAttribute('linkFromIndex', childIndex(target)); //开始点
                         oLine.setAttribute('linkTo', nextNode);//结束点
                         oLine.setAttribute('linkToIndex', childIndex(meetsThe.circle));//
                         oLine.setAttribute('x2', meetsThe.x);
                         oLine.setAttribute('y2', meetsThe.y);
                         */
            oLine.setAttrs(meetsThe.x, meetsThe.y)

            oLine.setInfo({
              linkFrom: parentNode,
              linkFromIndex: childIndex(target),
              linkTo: nextNode,
              linkToIndex: childIndex(meetsThe.circle)
            })

            cirLin(parentNode, nextNode, true, oLine)
          }
        } else {
          mySvg.removeChild(oLine.mySvg)
          oLine = null
        }
        mySvg.onmousemove = null
        oLine = null
        return false
      }
    }
  }
}

export class Rect {
  constructor (obj = rectDefaultObj) {
    // 矩形位置信息
    this.x = obj.x // X坐标
    this.y = obj.y // y坐标
    this.h = obj.h // 矩形高度
    this.w = obj.w // 矩形宽度
    this.content = obj.content // 鼠标位置上下文
    this.w2 = this.w / 2 // 宽度的一半
    this.h2 = this.h / 2 // 高度的一半  鼠标移动时 鼠标指针在矩形中间
    let eventTarget = this.eventTarget = null
    // 鼠标松开 清空事件
    document.onmouseup = function () {
      if (eventTarget) {
        eventTarget.onmousemove = null
        eventTarget.onmousemove = null
      }
    }

    this.rect = null
  }

  // 开始创建
  create (option = rectDefaultOpt) {
    let self = this
    const {x, y, w, h, w2, h2, content} = self
    // 四个小圆点
    let le1 = self.circle2 = new MinCircle(x + w2, y)// 1
    let le2 = self.circle3 = new MinCircle(x + w, y + h2) // 2
    let le3 = self.circle4 = new MinCircle(x + w2, y + h)// 3
    let le4 = self.circle1 = new MinCircle(x, y + h2) // 4
    // 节点配置信息
    let text = option.text, url = option.url, id = option.id, callback = option.callback, isDrag = option.isDrag
    // 创建文本
    let myText = new MinText(x + w2, y + h2 + 4, text)
    // 创建图片
    let img = new MinImg(w, h, x, y, url)

    // 主节点 矩形 G

    this.rect = createTag('g', {style: 'cursor: pointer', className: 'zgl-g', uuid: id}, [
      createTag('g', {}, [img.init(), myText.init()]),
      createTag('rect', {
        width: w,
        height: h,
        x: x,
        y: y,
        fill: 'rgba(255,255,255,0.3)',
        'stroke-width': '1',
        stroke: '#367cff',
        event: {
          onmousedown: function (rect, evt) {
            self.eventTarget = rect
            let parentNodeUuid = rect.parentNode.getAttribute('uuid')// g 标签
            let obj = judge(parentNodeUuid)
            // callback(option);
            if (isDrag === false) { // 不允许拖动
              return false
            }
            rect.onmousemove = function (evt) {
              let ev = evt || window.event
              let {top = 0, left = 0} = content.getBoundingClientRect()
              let mX = ev.clientX - left - w2
              let mY = ev.clientY - top - h2
              // 自己移动
              rect.setAttribute('x', mX)
              rect.setAttribute('y', mY)
              // 文字移动
              myText.setAttrs({x: mX + w2, y: mY + h2 + 4})
              // 图片移动
              img.setAttrs({x: mX, y: mY})
              // 小点移动
              let xyArray = [
                [mX + w2, mY], // 1
                [mX + w, mY + h2], // 2
                [mX + w2, mY + h], // 3
                [mX, mY + h2] // 4
              ]
              self.setCircleAttr(xyArray)
              // 跟当前节点相关的线移动
              if (obj.linkFrom.length > 0 || obj.linkTo.length > 0) {
                nodeAssociationLine(obj, xyArray)
              }
            }
            rect.onmouseup = function (evt) {
              this.onmousemove = null
              return false
            }
          },
          onmouseup: function (react, evt) {
            react.onmousemove = null
          },
          // 鼠标移入移出 显示 小点点
          onmouseenter: function (dom, event) {
            le1.show(true)
            le2.show(true)
            le3.show(true)
            le4.show(true)
          },
          onmouseleave: function (dom, event) {
            le1.show(false)
            le2.show(false)
            le3.show(false)
            le4.show(false)
          }
        }
      }),
      le1.init(),
      le2.init(),
      le3.init(),
      le4.init()

    ])

    return this.rect
  }

  // 小点移动
  setCircleAttr (xyArray) {
    // 1
    this.circle1.setAttrs({cx: xyArray[0][0], cy: xyArray[0][1]})
    // 2
    this.circle2.setAttrs({cx: xyArray[1][0], cy: xyArray[1][1]})
    // 3
    this.circle3.setAttrs({'cx': xyArray[2][0], cy: xyArray[2][1]})
    // 4
    this.circle4.setAttrs({'cx': xyArray[3][0], cy: xyArray[3][1]})
  }
}

// 小圆点
class MinCircle {
  constructor (x, y, r) {
    this.x = x
    this.y = y
    this.r = r || 5
    this.circle = null
  }

  init () {
    let circle = createTag('circle', {
      cx: this.x,
      cy: this.y,
      r: this.r,
      stroke: '#367cff',
      class: 'minCircle',
      fill: '#fff',
      'stroke-width': 1,
      style: 'display:block'
    })
    circle.onmouseenter = function () {
      // startMove(this, 3, 5);
      // this.setAttribute('style', 'display:block');
    }
    circle.onmouseleave = function () {
      // startMove(this, 5, 3);
      // this.setAttribute('style', 'display:none');

    }
    this.circle = circle
    return circle
  }

  setAttrs (obj) {
    if (this.circle) {
      for (let key in obj) {
        this.circle.setAttribute(key, obj[key])
      }
    }
  };

  show (bool) {
    if (this.circle) {
      this.circle.setAttribute('style', `display:${bool ? 'block' : 'none'}`)
    }
  }
}

// 创建文字
class MinText {
  constructor (x, y, text) {
    this.x = x
    this.y = y
    this.text = text
    this.myText = null
  }

  init () {
    this.myText = createTag('text', {
      x: this.x,
      y: this.y,
      stroke: '#000',
      'font-size': '14px',
      'text-anchor': 'middle',
      style: 'user-select:none'
    }, [this.text])

    return this.myText
  }

  setAttrs (obj) {
    if (this.myText) {
      for (let key in obj) {
        this.myText.setAttribute(key, obj[key])
      }
    }
  };
}

// 创建图片
class MinImg {
  constructor (w, h, x, y, url) {
    this.w = w
    this.h = h
    this.x = x
    this.y = y
    this.url = url
    this.img = null
  }

  init () {
    this.img = createTag('image', {
      'xlink:href': this.url,
      width: this.w,
      height: this.h,
      x: this.x,
      y: this.y
    })
    return this.img
  }

  setAttrs (obj) {
    if (this.img) {
      for (let key in obj) {
        this.img.setAttribute(key, obj[key])
      }
    }
  };
}

// 两个节点相连 from 开始点 to 结束点 bool 删除(false) 还是 添加(true)
export const cirLin = function (from, to, bool = true, line = null) {
  // console.log(from, to);
  let list = window.SVGLIST
  let fromSvg = null
  for (let i = 0; i < list.length; i++) {
    let item = list[i]
    // console.log(item);
    if (item.uuid.toString() === from.toString()) {
      fromSvg = item.svg
      break
    }
    ;
  }
  if (fromSvg === null) {
    return
  }
  if (bool) {
    // 添加链接节点
    fromSvg.setLinkToId(to, true, line)
  } else {
    // 删除链接节点
    fromSvg.setLinkToId(to, false, line)
  }
}

function minCircle (x, y, r) {
  r = r || 5
  let circle = createTag('circle', {
    cx: x,
    cy: y,
    r: r,
    stroke: '#367cff',
    class: 'minCircle',
    fill: '#fff',
    'stroke-width': 1,
    style: 'display:none'
  })

  circle.onmouseenter = function () {
    // startMove(this, 3, 5);
    this.setAttribute('style', 'display:block')
  }
  circle.onmouseleave = function () {
    // startMove(this, 5, 3);
    this.setAttribute('style', 'display:none')
  }

  return circle
}

function startMove (obj, r1, r2, type) {
  type = type || 'r'
  let newR = r1, overR = r2
  obj.speed = 0
  clearInterval(obj.timer)
  obj.timer = setInterval(function () {
    obj.speed += (overR - newR) / 6
    obj.speed *= 0.75
    if (Math.abs(overR - newR) <= 1 && Math.abs(obj.speed) <= 1) {
      clearInterval(obj.timer)
      obj.setAttribute(type, overR)
    } else {
      newR += obj.speed
      obj.setAttribute(type, newR)
    }
  }, 30)
}

export const calculationPosition = (x, y) => {
  let deviation = 10// 偏移量
  let minCircleList = [];

  (function () {
    let _temp = document.getElementsByClassName('minCircle')
    for (let i = 0; i < _temp.length; i++) {
      let item = _temp[i]
      minCircleList.push({
        x: item.getAttribute('cx'),
        y: item.getAttribute('cy'),
        circle: item
      })
    }
  })()
  let meetsThe = null
  // x 坐标的 正负值 偏移量
  let positiveX = x + deviation, negativeX = x - deviation
  // y 坐标的 正负值
  let positiveY = y + deviation, negativeY = y - deviation
  for (let i = 0; i < minCircleList.length; i++) {
    let item = minCircleList[i]
    let xBool = item.x <= positiveX && item.x >= negativeX
    let yBool = item.y <= positiveY && item.y >= negativeY
    if (xBool && yBool) {
      meetsThe = item.circle
      break
    }
  }
  if (meetsThe) {
    let x = meetsThe.getAttribute('cx')
    let y = meetsThe.getAttribute('cy')
    return {
      circle: meetsThe,
      x: x,
      y: y
    }
  } else {
    return null
  }
}

export class MinLine {
    uuid = svgUid++;

    constructor (x1, y1, x2, y2, bool) {
      this.x1 = x1
      this.y1 = y1
      this.x2 = x2
      this.y2 = y2
      this.mySvg = null
      this.line = null
      this.line2 = null
      this.path = null
      this.bool = bool // 是否可以删除
      this.createLine()
    }

    createMarker () {
      let path = new CreateSvgElement('path', {d: 'M0,0 L0,6 L9,3 z', fill: '#367cff'}).init()
      return new CreateSvgElement('marker', {
        id: this.uuid,
        markerWidth: 10,
        markerHeight: 10,
        refX: 5,
        refY: 3,
        orient: 'auto',
        markerUnits: 'strokeWidth'
      }, [path]).init()
    }

    createLine () {
      let {x1, y1, x2, y2} = this
      let mark = this.createMarker()
      let g = new CreateSvgElement('g', {})
      this.lineAttrs = {
        fill: 'none',
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2,
        stroke: '#367cff',
        className: 'zgl-line',
        'stroke-width': 3,
        'marker-end': `url(#${this.uuid})`
      }
      let line = this.line = new CreateSvgElement('line', this.lineAttrs)

      line.initAttrs()// 初始化 属性

      if (this.bool) {
        line.mySvg.onclick = function () {
          let linkFrom = this.getAttribute('linkFrom')
          let linkTo = this.getAttribute('linkTo')
          cirLin(linkFrom, linkTo, false, null)
          g.removeElement()
        }
      }

      g.initAppendChild([line.mySvg, mark])

      this.mySvg = g.mySvg
    }

    // 位置
    setAttrs (x2, y2) {
      if (this.line) {
        this.line.setElementAttrs({x2: x2, y2: y2})
        this.x2 = x2
        this.y2 = y2
      }
    }

    setInfo (obj) {
      if (this.line) {
        this.lineAttrs = {...this.lineAttrs, ...obj}
        this.line.setElementAttrs(obj)
      }
    }
}

// 线
export const minLine = (x1, y1, x2, y2) => {
  let line = createTag('line', {
    fill: 'none',
    x1: x1,
    y1: y1,
    x2: x2,
    y2: y2,
    stroke: '#367cff',
    className: 'zgl-line',
    'stroke-width': 2
  })

  /*  line.onmouseenter = function () {
          startMove(this, 2, 6, 'stroke-width');

      };
      line.onmouseleave = function () {
          startMove(this, 6, 2, 'stroke-width');

      }; */

  line.onclick = function () {
    let node = this.parentNode
    let linkFrom = this.getAttribute('linkFrom')
    let linkTo = this.getAttribute('linkTo')
    cirLin(linkFrom, linkTo, false, null)
    node.removeChild(this)
  }

  return line
}

// 判断两个连接点 是否已经存在连接
export const calculationLine = (uuid1, uuid2) => {
  let bool = false// 是否有连接 默认无
  let tempList = document.getElementsByTagName('line') // 所有的线
  for (let i = 0; i < tempList.length; i++) {
    let item = tempList[i] // 单条线
    let to = item.getAttribute('linkTo'), from = item.getAttribute('linkFrom')
    // 两边都要比较
    if ((uuid1 === to && uuid2 === from) || (uuid1 === from && uuid2 === to)) {
      bool = true // 存在连接
      break
    }
  }
  return bool
}

// 获取所有的线 并且判断是否跟G点有连接
export const judge = (gUuid) => {
  let obj = {
    linkTo: [], // 结束点 x2 y2
    linkFrom: []// 开始点 x1 y1
  }
  let tempList = document.getElementsByTagName('line') // 所有的线
  for (let i = 0; i < tempList.length; i++) {
    let item = tempList[i]
    let linkTo = item.getAttribute('linkTo')
    let linkFrom = item.getAttribute('linkFrom')
    if (linkFrom === gUuid) {
      obj.linkFrom.push(item)
    }
    if (linkTo === gUuid) {
      obj.linkTo.push(item)
    }
  }
  return obj
}

// 判断当前节点 是父节点的第一个节点
export const childIndex = (node) => {
  let parentNode = node.parentNode.getElementsByTagName('circle')
  let index = null
  for (let i = 0; i < parentNode.length; i++) {
    if (parentNode[i] === node) {
      index = i
      break
    }
  }
  return index
}

// 节点 关联的线移动
function nodeAssociationLine (obj, xyArray) {
  // 跟我相关的线移动

  let linkToList = obj.linkTo // 结束点 x2 y2
  let linkFromList = obj.linkFrom// 开始点 x1 y1;
  //  console.log(linkToList, linkFromList)

  try {
    // 属于结束点
    for (let i = 0; i < linkToList.length; i++) {
      let line = linkToList[i]
      let linToIndex = Number.parseInt(line.getAttribute('linkToIndex'))
      if (linToIndex >= 0) {
        line.setAttribute('x2', xyArray[linToIndex][0])
        line.setAttribute('y2', xyArray[linToIndex][1])
      }
    }

    // 属于开始点
    for (let i = 0; i < linkFromList.length; i++) {
      let line = linkFromList[i]
      let linkFromIndex = Number.parseInt(line.getAttribute('linkFromIndex'))
      if (linkFromIndex >= 0) {
        line.setAttribute('x1', xyArray[linkFromIndex][0])
        line.setAttribute('y1', xyArray[linkFromIndex][1])
      }
    }
  } catch (e) {
    console.error(e)
  }
}

// 查询元素
export const getElementPosition = (uuid, index) => {
  let tempList = document.getElementsByTagName('g')
  let item = null
  for (let i = 0; i < tempList.length; i++) {
    if (tempList[i].getAttribute('uuid') === uuid) {
      item = tempList[i]
      break
    }
  }
  if (item) {
    let cle = item.getElementsByTagName('circle')[index]
    let x = cle.getAttribute('cx')
    let y = cle.getAttribute('cy')
    return {x, y}
  } else {
    return null
  }
}

// 查询所有的 node
export const getElementGAll = () => {
  let tempList = document.getElementsByTagName('g')
  //    console.log(tempList);//所有的G标签
  let temp = []
  for (let i = 1; i < tempList.length; i++) {
    let item = tempList[i]
    console.log('className', item.getAttribute('className'))
    if (item.getAttribute('className') === 'zgl-g') {
      temp.push(item)
    }
  }
  return temp
}
export const getElementLineAll = () => {
  // zgl-line
  let tempList = document.getElementsByTagName('line')
  let temp = []
  for (let i = 0; i < tempList.length; i++) {
    let item = tempList[i]
    if (item.getAttribute('className') === 'zgl-line') {
      temp.push(item)
    }
  }
  return temp
}
