<template>
    <div ref="mySvg" style="height: 700px; border: 1px solid #F2F2F2">

    </div>
    <!--   <div>
           <button @click="save">保存</button>
       </div>-->

</template>

<script>
import {
  calculationLine,
  calculationPosition,
  childIndex,
  cirLin,
  CreateLine,
  createTag,
  getElementPosition,
  minLine,
  MinLine,
  RectV2,
  drawGrid
} from './my-svg'


const svgNs = 'http://www.w3.org/2000/svg'
const xlink = 'http://www.w3.org/1999/xlink'// 使用图片需要此属性
// 根据name 找id 找完一个 清除一个
const nameGetId = (name, list) => {
  let id = ''
  for (let i = 0; i < list.length; i++) {
    let item = list[i]
    if (item.name === name) {
      id = item.id
      //  list.splice(i,1);
      break
    }
  }
  return id
}

export default {
  name: 'svg-rect',
  data () {
    return {
      oDiv: null,
      mySvg: null
    }
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },
  mounted () {
    this.oDiv = this.$refs.mySvg

    this.mySvg = createTag('svg', {xmlns: svgNs, width: '100%', height: '100%', 'xmlns:xlink': xlink})
    this.oDiv.appendChild(this.mySvg)
    // 绘制网格
               drawGrid(this.mySvg, 800, 500, 10);

    new CreateLine(this.mySvg, this.oDiv)
  },
  methods: {

    svgRender () {
      let oDiv = this.oDiv
      let {top = 0, left = 0} = oDiv.getBoundingClientRect()// 上下文距离浏览器 上 左的距离
      let mySvg = this.mySvg

      let rect1 = new RectV2({x: 100, y: 100, w: 50, h: 50, content: oDiv})

      let rectDefaultOpt = {
        text: '前片', url: 'https://www.baidu.com/img/bd_logo1.png', id: '339595', item: null, isDrag: true
      }

      let svg = rect1.createRect(rectDefaultOpt)
      mySvg.appendChild(svg)

      let rect2 = new RectV2({x: 100, y: 200, w: 50, h: 50, content: oDiv})

      let rectDefaultOpt2 = {
        text: '后片', url: 'https://www.baidu.com/img/bd_logo1.png', id: '339596', item: null, isDrag: true
      }
      mySvg.appendChild(rect2.createRect(rectDefaultOpt2))
    },
    lineRender () {
      // 连线
      let oDiv = this.oDiv
      let {top = 0, left = 0} = oDiv.getBoundingClientRect()// 上下文距离浏览器 上 左的距离
      let mySvg = this.mySvg
      let oLine = null

      mySvg.onmousedown = function (evt) {
        // 开始点
        let target = evt.target
        if (target.getAttribute('class') === 'minCircle') {
          let x = target.getAttribute('cx')
          let y = target.getAttribute('cy')
          //    target.setAttribute('style', 'display:block');
          oLine = minLine(x, y, x, y)
          mySvg.appendChild(oLine)
        } else {
          return false
        }

        mySvg.onmousemove = function (event) {
          // 移动点
          let ev = event || window.event

          let x = ev.clientX - left
          let y = ev.clientY - top
          if (oLine) {
            oLine.setAttribute('x2', x)
            oLine.setAttribute('y2', y)
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
              //  console.log('该节点已经连接上去了');
              // 已经有连接了
              mySvg.removeChild(oLine)
            } else {
              // 没有连接
              oLine.setAttribute('linkFrom', parentNode) // 开始点
              oLine.setAttribute('linkFromIndex', childIndex(target)) // 开始点

              oLine.setAttribute('linkTo', nextNode)// 结束点
              oLine.setAttribute('linkToIndex', childIndex(meetsThe.circle))//

              oLine.setAttribute('x2', meetsThe.x)
              oLine.setAttribute('y2', meetsThe.y)
            }
          } else {
            mySvg.removeChild(oLine)
          }
          mySvg.onmousemove = null
          oLine = null
          return false
        }
      }
    },

    // 以下方法 仅给外部调用
    // 添加节点
    $appendSvg (obj) {
      let self = this
      let oDiv = this.oDiv
      let {top = 0, left = 0} = oDiv.getBoundingClientRect()// 上下文距离浏览器 上 左的距离
      let mySvg = this.mySvg

      let rect1 = new RectV2({x: 100, y: 100, w: 80, h: 80, content: oDiv})

      let rectDefaultOpt = {
        ...obj,
        isDrag: true,
        editStatus: true,
        callback (item, option) {
          self.$emit('itemClick', {svg: item, ...option})
        }
      }
      //  console.log(rect1, rectDefaultOpt);
      mySvg.appendChild(rect1.createRect(rectDefaultOpt))

      // console.log(obj);
    },

    // 初始化 节点 bool 是否可以编辑
    $init (info, bool = false) {
      let self = this
      const {partList, position} = info
      let nameList = []
      for (let i = 0; i < partList.length; i++) {
        // 渲染节点
        let pos = position.node[i]
        let item = partList[i]
        let rect1 = new RectV2({x: pos.x, y: pos.y, w: pos.w, h: pos.h, content: this.oDiv})
        let rectDefaultOpt = {
          ...item,
          name: item.name,
          url: item.url,
          id: item.id,
          isDrag: bool,
          callback (callbackItem, option) {
            self.$emit('itemClick', {svg: callbackItem, ...option})
          }
        }
        let itemRect = rect1.createRect(rectDefaultOpt)
        //    console.log('rect1',rect1)
        nameList.push({name: item.name, id: rect1.uuid}) // 名称
        this.mySvg.appendChild(itemRect)
      }

      let lineLink = position.lineLink
      //  console.log('lineLink',lineLink,nameList);
      for (let i = 0; i < lineLink.length; i++) {
        let lineItem = lineLink[i]
        // 根据name 找 id

        // from: line.linkFrom, 开始Id
        // fromName:name,  开始名称
        // fromId:_fromId, //开始id2
        // fromIndex: line.linkFromIndex,// 有效
        // to: line.linkTo, 结束id
        // toName:toName, 结束名称
        // toId:_toId, 结束id2
        // toIndex: line.linkToIndex, //有效

        // console.log('item',lineItem);
        let fromId = nameGetId(lineItem.fromName, nameList)
        let toId = nameGetId(lineItem.toName, nameList)
        let form = getElementPosition(fromId, lineItem.fromIndex)// 开始节点
        let to = getElementPosition(toId, lineItem.toIndex) // 结束节点
        if (to && form) {
          let myl = new MinLine(form.x, form.y, to.x, to.y, bool)
          cirLin(fromId, toId, true, myl)// 建立连接
          myl.setInfo({
            linkFrom: fromId,
            linkFromIndex: lineItem.fromIndex,
            linkTo: toId,
            linkToIndex: lineItem.toIndex
          })
          this.mySvg.appendChild(myl.mySvg)
        }
      }
    },

    $save () {
      // 保存
      let list = document.querySelectorAll('g')
      let data = window.SVGLIST
      let temp = []
      for (let i = 0; i < list.length; i++) {
        let item = list[i]
        let name = item.getAttribute('className')
        if (name === 'zgl-g') {
          let uuid = item.getAttribute('uuid')
          let index = data.findIndex(it => it.uuid.toString() === uuid)
          if (index >= 0) {
            temp.push(data[index])
          }
        }
      }

      return temp
    }
  },
  beforeDestroy () {
    window.SVGLIST = []
  }

}
</script>

<style scoped>

</style>
