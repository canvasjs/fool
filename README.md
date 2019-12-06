# fool_svg

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run all tests
npm test
```

```vue
<SvgRect ref="mySvg"   />
```
```javascript

import SvgRect from './svg-rect'
import part1 from './part/u14.png'
import part2 from './part/u16.png'
import part3 from './part/u18.png'

export default {
  name: 'App',
  components: {SvgRect},
  mounted () {
    this.mySvg = this.$refs.mySvg
    let temp = {
      partList: [
        {
          name: '流程一',
          id: '001',
          url: part1
        },
        {
          name: '流程二',
          id: '002',
          url: part2,
          link: '001'
        },
        {
          name: '流程三',
          id: '003',
          url: part3,
          link: '001'
        }
      ],
      position: {
        // 先创建node
        node: [{x: 10, y: 10, w: 50, h: 50}, {x: 150, y: 110, w: 50, h: 50}, {x: 10, y: 220, w: 50, h: 50}],
        // 再连续
        lineLink: [
          {from: '001', fromIndex: 1, to: '002', toIndex: 0},
          {from: '001', fromIndex: 2, to: '003', toIndex: 0},
          {from: '003', fromIndex: 1, to: '002', toIndex: 2}
        ]
      }
    }
    // 初始化
    //  const {partList, position} = info;
    this.mySvg.$init(temp,true)
  }
}
```
