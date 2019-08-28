# 手写一个 React

## 项目介绍

原生 JS 实现一个简易的 React , 并且使用此框架实现一个计数器功能。

## 具体实现

### JSX 与虚拟DOM

全程 JavaScript XML ，是 JavaScript 的语法扩展,看起来像 html。

`let element = <h1>hello world</h1>`

浏览器不能直接运行，需要工具进行编译

经过工具 https://babeljs.io/repl 转换后

`var element = React.createElement("h1", null, "hello world");`

可以在浏览器环境下运行，但还需要有有其他代码配合

```
const React = {}
React.createElement = function() {
  
}
```

编译后

```
var React = {};

React.createElement = function () {};

var element = React.createElement("h1", null, "hello world");
```
这样就可以在浏览器环境下跑通了

以上只是在沙箱练习环境（直接拷贝）去运行的，如何在真正的工作环境下运行起来呢？

1. 初始化环境

- 当前目录下运行`yarn init -y`,生成 package.json
- 运行`yarn add parcel-bundler`,使用 parcel 进行打包
- 创建 index.html index.js 文件

index.js
```
const Jreact = {}
Jreact.createElement = function() {
  console.log(arguments)
}
let element = <h1>hello world</h1>

//var element = Jreact.createElement("h1",null,"hello world")
```

- 创建 .babelrc(babel的配置文件),因为要使用到 babel

2. 设置 .babelrc 

```
{
  "presets": ["env"], //覆盖范围（最新语法转换成浏览器支持的语法）
  "plugins": [
    ["transform-react-jsx",{
      ////处理 JSX 的函数名，对jsx 语法进行拆解，作为这个函数的参数，Jreact.createElement("h1", null, "hello world");
      "pragma": "Jreact.createElement" 
    }]
  ]
}
```

3. 在 index.html 中引入 index.js

```
<body>
  <script src="index.js"></script>
</body>
```

4. 执行`npx parcel index.html`,安装 json5 `yarn add json5`

5. 打开`http://localhost:xxxx`

控制台输出`Arguments(3) ["h1", null, "hello world", callee: ƒ, Symbol(Symbol.iterator): ƒ]`

**总结**

通过 babel ，里面使用了一些插件，当运行之后，代码自动编译，把 JSX 变成 浏览器可运行的 Javascriptdist 代码，dist 目录下为编译后的代码

测试

把 JSX 写的复杂些，

```
...
let element = (
  <div className="wrapper">
    <h1>hello {name}</h1>
    <button onClick = {clickBtn}>click</button>
  </div>
)
```
经过转码后

```
var element = React.createElement("div", {
  className: "wrapper"
}, React.createElement("h1", null, "hello ", name), React.createElement("button", {
  onClick: clickBtn
}));
```
React.createElement(标签，{所有的属性}，React.createElement(子元素标签，{所有的属性}，文本内容)，React.createElement(子元素标签，{所有属性})，文本内容)

解析过程中，遇到子元素，再次执行 React.createElement（递归操作）

React.createElement
1. 标签
2. 这个标签上的属性构成的对象
3. 子元素，React.createElement() 执行后，返回的结果

解析中遇到 {} 会当做变量处理，所以变量必须提前声明好，编译后才能运行

```
const Jreact = {}
Jreact.createElement = function(tag, attrs, ...children) { //es6语法中的数组，所有的子元素放数组里
  return {
    tag,
    attrs,
    children
  }
}

let name = 'zhangsan'
function clickBtn() {
  console.log('click me')
}

let element = (
  <div className="wrapper">
    <h1>hello {name}</h1>
    <button onClick = {clickBtn}></button>
  </div>
)

console.log(element)
```
输出

![虚拟dom](https://github.com/pppcode/React/blob/master/images/虚拟dom.jpg)

编译过程：

执行 Jreact.createElement 这个函数，JSX 作为参数传递进去， 执行结果得到一个对象，这个对象有 JSX 的层次结构（JSON 对象），这个 element 就叫做虚拟 DOM

有了虚拟 DOM 后，如何放到页面上，变成实体 DOM 呢？

### 虚拟 DOM 渲染

利用函数去处理，如何写呢

思路：根据 vnode 的结构，需要用到递归，而且子节点可能为对象，可能为字符串，所以需要做两种处理，

```
function render(vnode, container) { 
  if(typeof vnode === 'string') { //创建文本节点，挂载到容器中
    return container.appendChild(document.createTextNode(vnode))
  }

  if(typeof vnode === 'object') {
    let dom = document.createElement(vnode.tag) 
    setAttribute(dom, vnode.attrs)

    container.appendChild(dom)
  }
}

function setAttribute(dom, attrs) {
  //...
}
```

设置好标签和属性后，里面还有子元素怎么办呢？

对子元素做遍历，处理每一个子元素：利用 render 函数渲染每一个 vnodeChild, 放入到当前的 dom 中，这样就把所有子节点都放入当前 dom 中了，再把这个 dom 挂载到页面上，

```
function render(vnode, container) { 
  if(typeof vnode === 'string') { //创建文本节点，挂载到容器中
    return container.appendChild(document.createTextNode(vnode))
  }

  if(typeof vnode === 'object') {
    let dom = document.createElement(vnode.tag) 
    setAttribute(dom, vnode.attrs)
    if(vnode.children && Array.isArray(vnode.children)) {
      vnode.children.forEach(vnodeChild => {
        render(vnodeChild, dom)
      })
    }

    container.appendChild(dom)
  }
}
```

测试

![页面显示效果](https://github.com/pppcode/React/blob/master/images/页面显示效果.jpg)
![真实dom结构](https://github.com/pppcode/React/blob/master/images/真实dom结构.jpg)

但是 dom 节点上并没有属性，如何定义设置属性的函数呢

**处理事件绑定**

真实 dom 节点上可以直接设置 id class noclick 但是这里是 className, onClick 大写的，该如何设置呢

```
function setAttribute(dom, attrs) {
  for(let key in attrs) {
    if(/^on/.test(key)) { //对事件绑定的处理，以 on 开头的，dom[onclick] = attrs[onClick]
      dom[key.toLocaleLowerCase()] = attrs[key]
    }
  }
}
```

**把 style 设置成 dom 上的属性**

```
...
let styleObj = {
  color: 'red',
  fontSize: '20px'
}

let vnode = (
  <div className="wrapper">
    <h1 style={ styleObj }>hello {name}</h1>
    <button onClick = {clickBtn}>click me</button>
  </div>
)
...
```

```
function setAttribute(dom, attrs) {
  for(let key in attrs) {
    ...
    if(key === 'style') { //对 style 的处理
      dom.style = attrs[key]
    }
  }
}

```

![设置 style 未生效](https://github.com/pppcode/React/blob/master/images/设置 style 未生效.jpg)

但是并未生效, dom 对象不能直接修改他的 style （直接覆盖，重置是不行的），正确的做法`.style.color = 'red'`

所以需要修改

```
function setAttribute(dom, attrs) {
  for(let key in attrs) {
    ...
    if(key === 'style') { //对 style 的处理
      Object.assign(dom.style, attrs[key]) //新增的会赋值到 dom.style 上，同名的属性会覆盖
    }
  }
}
```
测试

![属性解析](https://github.com/pppcode/React/blob/master/images/属性解析.jpg)

点击click 执行了这个函数，打印出 click me

以上实现了把虚拟 DOM 变成真实 DOM ,挂载到页面上

完整代码

```
const Jreact = {}
Jreact.createElement = function(tag, attrs, ...children) { //es6语法中的数组，所有的子元素放数组里
  return {
    tag,
    attrs,
    children
  }
}

function render(vnode, container) { 
  if(typeof vnode === 'string') { //创建文本节点，挂载到容器中
    return container.appendChild(document.createTextNode(vnode))
  }

  if(typeof vnode === 'object') {
    let dom = document.createElement(vnode.tag) 
    setAttribute(dom, vnode.attrs)
    if(vnode.children && Array.isArray(vnode.children)) {
      vnode.children.forEach(vnodeChild => {
        render(vnodeChild, dom)
      })
    }

    container.appendChild(dom)
  }
}

function setAttribute(dom, attrs) {
  for(let key in attrs) {
    if(/^on/.test(key)) { //对事件绑定的处理，以 on 开头的，dom[onclick] = attrs[onClick]
      dom[key.toLocaleLowerCase()] = attrs[key]
    } else if(key === 'style') { //对 style 的处理
      Object.assign(dom.style, attrs[key]) //新增的会赋值到 dom.style 上，同名的属性会覆盖
    } else { //其他的直接作为 dom 的属性
      dom[key] = attrs[key]
    }
  }
}


let name = 'zhangsan'
function clickBtn() {
  console.log('click me')
}
let styleObj = {
  color: 'red',
  fontSize: '20px'
}

let vnode = (
  <div className="wrapper">
    <h1 style={ styleObj }>hello {name}</h1>
    <button onClick = {clickBtn}>click me</button>
  </div>
)

console.log(vnode)

render(vnode, document.querySelector('#app')) //虚拟 dom 变成 真实的dom 节点后，挂载到容器上
```

### 打造 React 雏形

模拟 React

```
const Jreact = { //创建元素，组件
  createElement
}

const JreactDOM = { //用于去渲染，做一些其他的事情
  render
}

function createElement(tag, attrs, ...children) { //es6语法中的数组，所有的子元素放数组里
  return {
    tag,
    attrs,
    children
  }
}

function render() { //... }
...
JreactDOM.render((
  <div className="wrapper">
    <h1 style={styleObj}>hello {name}</h1>
    <button onClick={clickBtn}>click me</button>
  </div>
), document.querySelector('#app')) 
```
一样的效果，写法上更像 React 


### 实现计数器功能

做一个计时器，点开始时，开始计时，点停止时，停止计时。

```
...
let num = 0
let timer = null
let styleObj = {
  color: 'red',
  fontSize: '20px'
}

onStart() //一开始时执行

function onStart() {
  console.log('click me')
  timer = setInterval(() => { //启动时，每秒钟计时一次，做一次渲染
    JreactDOM.render((
      <div className="wrapper">
        <h1 style = { styleObj }>Number: { num }</h1>
        <button onClick = { onStart }>start</button>
        <button onClick = { onPause }>pause</button>
      </div>
    ), document.querySelector('#app'))
  }, 1000)
}

function onPause() {
  clearInterval(timer) //点击停止时，清除定时器
}
```
**问题1：变量 num 没有显示出来**

bug 排查

用编译工具编译 JSX 代码，解析 num 时，执行 render 函数，执行 render 时，做了判断，如果 typeof 为 string, 传递的num 不是字符串而是数字，所以需要修改判断逻辑

```
function render(vnode, container) {
  if (typeof vnode === 'string' || typeof vnode === 'number') {  //如果是 string 或者 nubmer 都去创建文本节点
    return container.appendChild(document.createTextNode(vnode))
  }
  ...
}
```

**问题2：计时时，页面上会渲染出很多dom**

```
const Jreact = { //创建元素，组件
  createElement
}

const JreactDOM = { //用于去渲染，做一些其他的事情
  render
}

function createElement(tag, attrs, ...children) { //es6语法中的数组，所有的子元素放数组里
  return {
    tag,
    attrs,
    children
  }
}

function render(vnode, container) {
  if (typeof vnode === 'string' || typeof vnode === 'number') { //如果是 string 或者 nubmer 都去创建文本节点
    return container.appendChild(document.createTextNode(vnode))
  }

  if (typeof vnode === 'object') {
    let dom = document.createElement(vnode.tag)
    setAttribute(dom, vnode.attrs)
    if (vnode.children && Array.isArray(vnode.children)) {
      vnode.children.forEach(vnodeChild => {
        render(vnodeChild, dom)
      })
    }

    container.appendChild(dom)
  }
}

function setAttribute(dom, attrs) {
  for (let key in attrs) {
    if (/^on/.test(key)) { //对事件绑定的处理，以 on 开头的，dom[onclick] = attrs[onClick]
      dom[key.toLocaleLowerCase()] = attrs[key]
    } else if (key === 'style') { //对 style 的处理
      Object.assign(dom.style, attrs[key]) //新增的会赋值到 dom.style 上，同名的属性会覆盖
    } else { //其他的直接作为 dom 的属性
      dom[key] = attrs[key]
    }
  }
}

let num = 0
let timer = null
let styleObj = {
  color: 'red',
  fontSize: '20px'
}

onStart() //一开始时执行

function onStart() {
  console.log('click me')
  timer = setInterval(() => { //启动时，每秒钟计时一次，做一次渲染
    JreactDOM.render((
      <div className="wrapper">
        <h1 style = { styleObj }>Number: { num }</h1>
        <button onClick = { onStart }>start</button>
        <button onClick = { onPause }>pause</button>
      </div>
    ), document.querySelector('#app'))
  }, 1000)
}

function onPause() {
  clearInterval(timer) //点击停止时，清除定时器
}
```

![渲染出很多dom](https://github.com/pppcode/React/blob/master/images/渲染出很多dom.jpg)

把之前的给清除掉

```
function render(vnode, container) { //每次调用 render 时，先把之前的清空
  container.innerHTML = ''
  _render(vnode, container)
}
function _render(vnode, container) {
  //...
}
```

完整代码

```
const Jreact = { //创建元素，组件
  createElement
}

const JreactDOM = { //用于去渲染，做一些其他的事情
  render
}

function createElement(tag, attrs, ...children) { //es6语法中的数组，所有的子元素放数组里
  return {
    tag,
    attrs,
    children
  }
}

function render(vnode, container) { //每次调用 render 时，先把之前的清空
  container.innerHTML = ''
  _render(vnode, container)
}

function _render(vnode, container) {
  if (typeof vnode === 'string' || typeof vnode === 'number') { //如果是 string 或者 nubmer 都去创建文本节点
    return container.appendChild(document.createTextNode(vnode))
  }

  if (typeof vnode === 'object') {
    let dom = document.createElement(vnode.tag)
    setAttribute(dom, vnode.attrs)
    if (vnode.children && Array.isArray(vnode.children)) {
      vnode.children.forEach(vnodeChild => {
        _render(vnodeChild, dom) //记得这里是 _render , 这里的逻辑是不清空的
      })
    }

    container.appendChild(dom)
  }
}

function setAttribute(dom, attrs) {
  for (let key in attrs) {
    if (/^on/.test(key)) { //对事件绑定的处理，以 on 开头的，dom[onclick] = attrs[onClick]
      dom[key.toLocaleLowerCase()] = attrs[key]
    } else if (key === 'style') { //对 style 的处理
      Object.assign(dom.style, attrs[key]) //新增的会赋值到 dom.style 上，同名的属性会覆盖
    } else { //其他的直接作为 dom 的属性
      dom[key] = attrs[key]
    }
  }
}

let num = 0
let timer = null
let styleObj = {
  color: 'red',
  fontSize: '20px'
}

onStart() //一开始时执行

function onStart() {
  console.log('click me')
  timer = setInterval(() => { //启动时，每秒钟计时一次，做一次渲染
    num++
    JreactDOM.render((
      <div className="wrapper">
        <h1 style = { styleObj }>Number: { num }</h1>
        <button onClick = { onStart }>start</button>
        <button onClick = { onPause }>pause</button>
      </div>
    ), document.querySelector('#app'))
  }, 1000)
}

function onPause() {
  clearInterval(timer) //点击停止时，清除定时器
}
```

![计时器功能](https://github.com/pppcode/React/blob/master/images/计时器功能.jpg)

完美实现。

### 模块化

拆分 index.js 文件

目录

![模块化目录](https://github.com/pppcode/React/blob/master/images/模块化目录.jpg)

jreact.js JSX 变成虚拟 DOM

```
function createElement(tag, attrs, ...children) { 
  return {
    tag,
    attrs,
    children
  }
}

export default {
  createElement
}
```

jreact-dom.js 虚拟 DOM 渲染

```
function render(vnode, container) { //每次调用 render 时，先把之前的清空
  container.innerHTML = ''
  _render(vnode, container)
}

function _render(vnode, container) {
  if (typeof vnode === 'string' || typeof vnode === 'number') { //如果是 string 或者 nubmer 都去创建文本节点
    return container.appendChild(document.createTextNode(vnode))
  }

  if (typeof vnode === 'object') {
    let dom = document.createElement(vnode.tag)
    setAttribute(dom, vnode.attrs)
    if (vnode.children && Array.isArray(vnode.children)) {
      vnode.children.forEach(vnodeChild => {
        _render(vnodeChild, dom) //记得这里是 _render , 这里的逻辑是不清空的
      })
    }

    container.appendChild(dom)
  }
}

function setAttribute(dom, attrs) {
  for (let key in attrs) {
    if (/^on/.test(key)) { //对事件绑定的处理，以 on 开头的，dom[onclick] = attrs[onClick]
      dom[key.toLocaleLowerCase()] = attrs[key]
    } else if (key === 'style') { //对 style 的处理
      Object.assign(dom.style, attrs[key]) //新增的会赋值到 dom.style 上，同名的属性会覆盖
    } else { //其他的直接作为 dom 的属性
      dom[key] = attrs[key]
    }
  }
}

export default {
  render
}
```

index.js 业务代码

```
import Jreact from './lib/jreact' 
import JreactDOM from './lib/jreact-dom'

let num = 0
let timer = null
let styleObj = {
  color: 'red',
  fontSize: '20px'
}

onStart() //一开始时执行

function onStart() {
  console.log('click me')
  timer = setInterval(() => { //启动时，每秒钟计时一次，做一次渲染
    num++
    JreactDOM.render((
      <div className="wrapper">
        <h1 style = { styleObj }>Number: { num }</h1>
        <button onClick = { onStart }>start</button>
        <button onClick = { onPause }>pause</button>
      </div>
    ), document.querySelector('#app'))
  }, 1000)
}

function onPause() {
  clearInterval(timer) //点击停止时，清除定时器
}
```

进入到 chapter-2 目录下，运行`npx parcel index.html`,正常运行。

以上完成了代码的拆分，实现了模块化。


### 实现 React 组件










