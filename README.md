# 手写一个 React

## 项目介绍

原生 JS 实现一个简易的 React , 并且实现基本功能（React 的基本用法）: 模块化，组件及组件间通信，setState 等功能

## 具体实现

先看这张图，了解 React 的基本原理

![React基本原理](https://github.com/pppcode/React/blob/master/images/React基本原理.jpg)

根据这张图，实现其中的逻辑

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

![模块化后显示效果](https://github.com/pppcode/React/blob/master/images/模块化后显示效果.jpg)

以上完成了代码的拆分，实现了模块化。


### 实现 React 组件

实现以下这种书写方式

```
import Jreact from './lib/jreact' 
import JreactDOM from './lib/jreact-dom'

class App extends Jreact.Component { 
  render() {
    return (
      <h1>hello</h1>
    )
  }
}

JreactDOM.render(<App/>, document.querySelector('#app'))
```

用 babel 转换 

- `<App/> `得到`React.createElement(App, null);`
- `<app>hello</app>`得到`React.createElement("app", null, "hello");`

`<App/> `首字母大写，转义后，参数 App 是一个变量，并不是字符串（标签），所以自定义的组件必须首字符大写，JSX 语法规定的，这样才会当做变量去处理，这个 App 可以做一些事情了。

JSX 经过处理后得到的虚拟 DOM 的第一个参数是一个变量（render 是处理标签，字符串的），用这个变量去创建一个对象，创造自己的组件，这里稍微有些复杂，先实现其他部分。

所有的组件都继承了 Jreact.Component, 所以先定义 Component

jreact.js

```
...
class Component { 
  constructor(props) {
    this.props = props //构造组件时，需要一些属性
    this.state = {} //组件内部有些状态/变量

    renderComponent() //创建组件后，需要去渲染这个组件（变成真实的DOM放到页面上）
  }
}

function renderComponent() {
  console.log('renderComponent')
}

export default {
  createElement,
  Component
}
```

**变成虚拟 DOM 后，如何去渲染呢，遇到组件时，_render 如何处理呢？**

先构造一个复杂的组件

index.js
```
import Jreact from './lib/jreact'
import JreactDOM from './lib/jreact-dom'

//得到了 Component 中的 props,render方法
// new App 时，就会去渲染组件
class App extends Jreact.Component {
  render() {
    return (
      <div className="wrapper">
        <h1 className="title">hello <span>张三</span></h1>
        <Job></Job>
      </div>
    )
  }
}

class Job extends Jreact.Component {
  render() {
    return (
      <div className="job">我的工作是前端工程师</div>
    )
  }
}

JreactDOM.render(<App></App>, document.querySelector('#app'))
```

_render 处理 vnode,把 vnode 打印出来

![vnode](https://github.com/pppcode/React/blob/master/images/vnode.jpg)

发现 App 的 tag 是一个函数，所以渲染虚拟 DOM 时，就需要创建这个函数，最终返回一个真实的 DOM 节点，并挂载到页面上

jreact-dom.js

```
...
function _render(vnode, container) {
  //...
  if (typeof vnode === 'object') {
    if(typeof vnode.tag === 'function') { //当 vnode.tag 是个函数时，就去创造一个组件
      let dom = createComponent(vnode.tag, vnode.attrs) //第一个参数是构造函数名，第二个参数是组件的属性
      return container.appendChild(dom) //返回的是一个真实的 DOM 节点，挂载到容器上
    }
    //...
  }
}
...
```

**如何创造这个组件呢**

执行`JreactDOM.render(<App></App>, document.querySelector('#app'))`,调用 render 函数

把 _render 中的渲染 vnode 的逻辑抽离出来，因为在渲染组件的过程中，还会再次渲染组件中的 JSX,抽离出来后，方便进行再次处理，否则就会执行两次'挂载到页面上'这部分逻辑了

```
...
function _render(vnode, container) {
  let dom = createDomfromVnode(vnode)
  container.appendChild(dom)
}

function createDomfromVnode(vnode) {
  if (typeof vnode === 'string' || typeof vnode === 'number') { //如果是 string 或者 nubmer 都去创建文本节点
    return document.createTextNode(vnode)
  }

  if (typeof vnode === 'object') {
    if(typeof vnode.tag === 'function') { //当 vnode.tag 是个函数时，就去创建组件
      let dom = createComponent(vnode.tag, vnode.attrs) //第一个参数是构造函数名，第二个参数是组件的属性
      return dom
    }

    let dom = document.createElement(vnode.tag)
    setAttribute(dom, vnode.attrs)
    if (vnode.children && Array.isArray(vnode.children)) {
      vnode.children.forEach(vnodeChild => {
        _render(vnodeChild, dom) //记得这里是 _render , 这里的逻辑是不清空的
      })
    }
    return dom
  }
}

//创建组件
function createComponent(constructor, attrs) {
  let component = new constructor(attrs) //创造一个组件对象
  let vnode = component.render() //调用他的 render 方法，得到组件对应的虚拟节点(jsx)
  let dom = createDomfromVnode(vnode) //渲染成真实的 DOM
  component.$root = dom //方便后续拿到组件对应的真实的 DOM
  return dom
}
...
```

页面显示

![组件的显示效果](https://github.com/pppcode/React/blob/master/images/组件的显示效果.jpg)

查看创建的组件

```
window.c = []
function createComponent(constructor, attrs) {
  let component = new constructor(attrs) //创造一个组件对象
  c.push(component)
  ...
}
```
控制台输入`c`打印出

![查看创建的组件](https://github.com/pppcode/React/blob/master/images/查看创建的组件.jpg)

** state props 组件间通信，均正常显示**

```
import Jreact from './lib/jreact'
import JreactDOM from './lib/jreact-dom'

class App extends Jreact.Component {
  constructor(props) {
    super(props)
    this.state = {
      name: '张三',
      job: '后端工程师'
    }
  }
  render() {
    return (
      <div className="wrapper">
        <h1 className="title">hello <span>{ this.state.name }</span></h1>
        <Job job={ this.state.job }></Job>
      </div>
    )
  }
}

class Job extends Jreact.Component {
  render() {
    return (
      <div className="job">我的工作是{ this.props.job }</div>
    )
  }
}

JreactDOM.render(<App></App>, document.querySelector('#app'))

```
显示

![state和prop效果](https://github.com/pppcode/React/blob/master/images/state和prop效果.jpg)

**组件的其他写法:function**

```
class App extends Jreact.Component {
  constructor(props) {
    super(props)
    this.state = {
      name: '张三',
      job: '后端工程师',
      hobby: '看电影'
    }
  }
  render() {
    return (
      <div className="wrapper">
        //...
        <Hobby hobby={ this.state.hobby }></Hobby>
      </div>
    )
  }
}

function Hobby(props) {
  return (
    <p>我的兴趣是{ props.hobby }</p>
  )
}
```

以上代码会报错，`component.render is not a function`

new 构造函数时（tag对应的函数），返回的是函数 return 出来的东西，所以执行 createComponent 时，componet 就是虚拟dom，上面没有 render方法，而这里把虚拟 dom 当成组件处理了

**所以需要对两种组件的写法 Class , function，分别做处理**

对 createComponent 做处理，判断 constructor 是什么类型，但是 Class function 都是函数（Class 是语法糖），如何判断呢

思路：通过 Class 构造出来的组件是继承了 Component, function 构造出来的是没有继承的，通过这一点来做判断

`xxx.prototype instanceof Component` 是 true 还是 false 判断是不是 Class

jreact-dom.js

```
import Jreact from './jreact'
...
function createComponent(constructor, attrs) {
  let component
  if(constructor.prototype instanceof Jreact.Component) {
    component = new constructor(attrs) 
  } else {
    component = new Jreact.Component(attrs) //使组件具有 state， props
    component.constructor = constructor
    component.render = function() { //增加 render 方法
      return this.constructor(attrs)
    }
  }
  let vnode = component.render() 
  //c.push(component)

  let dom = createDomfromVnode(vnode) 
  component.$root = dom 
  return dom
}

```
显示

![function组件显示效果](https://github.com/pppcode/React/blob/master/images/function组件显示效果.jpg)

**继续完善，子组件绑定事件，去修改父组件数据**

在子组件里绑定事件，点击修改按钮，触发事件，执行回调（通过父组件传递过来的事件属性），在父组件中定义回调函数

```
class App extends Jreact.Component {
  constructor(props) {
    super(props)
    this.state = {
      name: '张三',
      job: '后端工程师',
      hobby: '看电影'
    }
  }
  render() {
    return (
      <div className="wrapper">
        <h1 className="title">hello <span>{ this.state.name }</span></h1>
        <p>hobby: { this.state.hobby }</p>
        <Job job={ this.state.job } onModifyJob = { this.onModifyJob.bind(this) }></Job>
        <Hobby hobby={ this.state.hobby }></Hobby>
      </div>
    )
  }
  onModifyJob(newJob) {
    this.setState({job: newJob})
  }
}

class Job extends Jreact.Component {
  render() {
    return (
      <div className="job">
        我的工作是{ this.props.job }
        <button onClick = { this.modifyJob.bind(this) }>修改工作</button>
      </div>
    )
  }
  modifyJob() {
    this.props.onModifyJob('React工程师')
  }
}
```

数据改变时，组件重新渲染（走之前的流程，逻辑写到 createComponent 里，而不是 jreact.js 中），做一个虚拟 dom 的替换，把以前的 dom 节点替换掉。

先拆分 createComponent，因为里面包含了'创建''渲染'两部分逻辑，抽离出'渲染'逻辑（renderComponent）

```
//创建组件
function createComponent(constructor, attrs) {
  let component
  if(constructor.prototype instanceof Jreact.Component) {
    component = new constructor(attrs) 
  } else {
    component = new Jreact.Component(attrs) //使组件具有 state， props
    component.constructor = constructor
    component.render = function() { //增加 render 方法
      return this.constructor(attrs)
    }
  }
  return component
}

//渲染组件
function renderComponent(component) {
  let vnode = component.render()
  let dom = createDomfromVnode(vnode)

  //修改后的 dom 做替换
}
```

修改后的 dom 替换的逻辑

```
//渲染组件
function renderComponent(component) {
  ...

  if(component.$root && component.$root.parentNode) {
    component.$root.parentNode.replaceChild(dom, component.$root)
  }
  component.$root = dom
}
```

完整代码

jreact-dom.js

```
import Jreact from './jreact'

function render(vnode, container) { //每次调用 render 时，先把之前的清空
  container.innerHTML = ''
  console.log(vnode)
  _render(vnode, container)
}

function _render(vnode, container) {
  let dom = createDomfromVnode(vnode)
  container.appendChild(dom)
}


//window.c = []
function createDomfromVnode(vnode) {
  if (typeof vnode === 'string' || typeof vnode === 'number') { //如果是 string 或者 nubmer 都去创建文本节点
    return document.createTextNode(vnode)
  }

  if (typeof vnode === 'object') {
    if(typeof vnode.tag === 'function') { //当 vnode.tag 是个函数时，就去创建组件
      let component = createComponent(vnode.tag, vnode.attrs) //第一个参数是构造函数名，第二个参数是组件的属性
      renderComponent(component)
      return component.$root
    }

    let dom = document.createElement(vnode.tag)
    setAttribute(dom, vnode.attrs)
    if (vnode.children && Array.isArray(vnode.children)) {
      vnode.children.forEach(vnodeChild => {
        _render(vnodeChild, dom) //记得这里是 _render , 这里的逻辑是不清空的
      })
    }
    return dom
  }
}

//创建组件
function createComponent(constructor, attrs) {
  let component
  if(constructor.prototype instanceof Jreact.Component) {
    component = new constructor(attrs) 
  } else {
    component = new Jreact.Component(attrs) //使组件具有 state， props
    component.constructor = constructor
    component.render = function() { //增加 render 方法
      return this.constructor(attrs)
    }
  }
  return component
}

//渲染组件
function renderComponent(component) {
  let vnode = component.render()
  let dom = createDomfromVnode(vnode)

  if(component.$root && component.$root.parentNode) {
    component.$root.parentNode.replaceChild(dom, component.$root)
  }
  component.$root = dom
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
  render,
  renderComponent
}
```

jreact.js

```
import jreactDom from "./jreact-dom";

function createElement(tag, attrs, ...children) { 
  return {
    tag,
    attrs,
    children
  }
}

class Component { 
  constructor(props) {
    this.props = props //构造组件时，需要一些属性
    this.state = {} //组件内部有些状态/变量
  }

  setState(state) {
    this.state = Object.assign(this.state, state) //额外的新增或修改，不是覆盖，所以用 Object.assign
    jreactDom.renderComponent(this)
  }
}

export default {
  createElement,
  Component
}
```
显示

![子组件修改父组件数据](https://github.com/pppcode/React/blob/master/images/子组件修改父组件数据.jpg)

以上实现了 React 的基本功能(用法)，但是 dom 的更新是全局更新的（以组件的方式去更新的）App里的数据发生改变，会去渲染所有的组件，DOM 的频繁操作开销是很大的，可以精细化操作，比如修改了 name 数据，对应的 DOM 只去修改对应的那一部分即可（h1 中的 span 即可）

虚拟 DOM 的 diff，修改对应的状态时，重新调用 renderComponent 重新执行 JSX,得到新的虚拟 DOM ,再去执行自己的 render 方法，渲染到页面上，渲染的过程中，新的和之前的虚拟 DOM 做个对比，发现只有微小的差异，只更新这部分，开销就变小了，性能就优化了

### diff 算法

实现的效果

index.js

```
import Jreact from './lib/jreact.js'
import JreactDOM from './lib/jreact-dom.js'

class App extends Jreact.Component {
  constructor(props) {
    super(props)
    this.state = {
      name: '小讲堂',
      courses: ['数学', '语文', '英语'],
      styleObj: {
        color: 'red',
        fontWeight: 'bold'
      }
    }
  }

  render() {
    return (
      <div className="container">
        <h1>欢迎到<span className="name" style={ this.state.styleObj }>{ this.state.name }</span>来学习</h1>
        <p>aaa</p>
        <p>bbb</p>
        <div className="action">
          <button onClick = { this.modifyName.bind(this) }>修改名字</button>
          <button onClick = { this.setStyle.bind(this) }>样式</button>
        </div>
      </div>
    )
  }

  modifyName() {
    let newName = window.prompt('输入标题','小讲堂')
    this.setState({name: newName})
  }

  setStyle() {
    this.setState({
      styleObj: {
        color: 'blue'
      }
    })
  }
}

window.JreactDOM = JreactDOM

JreactDOM.render(<App/>, document.querySelector('#app'))
```

**思路**

第一次挂载到页面上时

![第一次渲染时](https://github.com/pppcode/React/blob/master/images/第一次渲染时.jpg)

修改后，让虚拟dom 和真实的DOM 对应起来，只修改要修改的东西

![修改数据时](https://github.com/pppcode/React/blob/master/images/修改数据时.jpg)

让标签，属性，子元素去做对比，第一个标签都是`div`,没有变动，属性都是`class-box`,也没有变动，所以 `<div class="box">`是可以保留的

- 那么如何比较子元素呢？
- 假设第一个标签变了，由`div`变成了`p`，该如何去处理呢？
- 假设不是`div`，就是普通的文本做了修改，由`zhangsan`变为`lisi`,又该如何处理？

处理以上这些场景，需要虚拟 DOM 和页面上的 DOM 做一一映射

再捋一下思路

1. JreactDOM.render JSX 时，调用 render 方法（之前是清空容器，根据 vnode 创建真实的 DOM,并挂载），调用 diff()，传递三个参数
- 要对比的页面上的 DOM（第一次挂载时调用 render() 时，要对比的 DOM 并不存在，所以先传递一个 null，后续重新渲染页面时，调用 diff, 之前的 DOM 就有了）
- 虚拟 DOM
- 要挂载的容器

2. 定义 diff 函数：拿页面上真实的 DOM 和一开始渲染好的和他对应的虚拟 DOM 对比，操作...,把修改后的部分和真实的部分做替换，替换之后，页面上上的 DOM 为最新修改后的，再返回出去，供其他地方使用

```
function diffNode(dom, vnode) {

}
```
先看看 vnode 和 dom 有什么差别，先了解下虚拟 DOM 有哪几种类型：

```
{
  tga: "div",
  attrs: {className: "box"},
  children: [
    "hello",
    {
      tag: "span",
      attrs: null,
      children: [
        "zhangsan"
      ],
      {
        tag: Box //变量（函数），可以是组件
        attrs: null,
        children: []
      }
    }
  ]
}
```

有对象并且值为字符串的`{xx:'xxx'}` , 为字符串的`'hello'`，有对象并且值为变量的`{xx:Xxx}` ，3种类型

**如何对这三种类型做比较呢？**

虚拟 DOM 为字符串时

![虚拟dom为字符串时](https://github.com/pppcode/React/blob/master/images/虚拟dom为字符串时.jpg)

```
function diffNode(dom, vnode) {
  let patchedDom = dom

  //如果是文本类型的虚拟DOM ，要么替换内容，要么替换元素
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    if (patchedDom && patchedDom.nodeType === 3) { //真实DOM存在，并且是个字符串
      if (patchedDom.textContent !== vnode) { // hello 不等于 'hello' 时
        patchedDom.textContent = vnode //虚拟dom赋值给真实dom即可（修改）
      }
    } else { //若不是字符串，而是元素
      patchedDom = document.createTextNode(vnode) //直接创建一个文本节点，替换掉该元素
    }
    return patchedDom
  }
}

```

虚拟 DOM 为组件时

![虚拟dom为组件时](https://github.com/pppcode/React/blob/master/images/虚拟dom为组件时.jpg)

```
  //如果是组件，就diff组件
  if (typeof vnode === 'object' && typeof vnode.tag === 'function') {
    patchedDom = diffComponent(dom, vnode) //交给他去处理
    return patchedDom
  }
```

虚拟 DOM 新增时（真实 DOM 不存在）

![虚拟dom新增时](https://github.com/pppcode/React/blob/master/images/虚拟dom新增时.jpg)

```
  //否则就是普通的 vnode
  //看 dom 是不是存在，如果不存在就根据 vnode 创建
  if (!dom) {
    patchedDom = document.createElement(vnode.tag) //根据虚拟 dom 的标签去创造
  }
```

虚拟 DOM 和真实 DOM 都为 tag，但是不相同时

没有直接修改标签名的 api, 所以

![都为tag但是不相同时](https://github.com/pppcode/React/blob/master/images/都为tag但是不相同时.jpg)

```
  //如果存在但标签变了，就修正标签（创建新标签的 dom ，但旧标签 dom 的孩子放到新标签 dom 里，旧标签替换成新标签）
  if (dom && dom.nodeName.toLowerCase() !== vnode.tag.toLowerCase()) { 
    patchedDom = document.createElement(vnode.tag)
    dom.childNodes.forEach((child) => patchedDom.appendChild(child))
    replaceDom(patchedDom, dom)
  }
```

以上是对标签的比较。

**对属性的比较**

**对子元素的比较**






























测试

修改样式时，只有要修改的部分做了替换

截图












































