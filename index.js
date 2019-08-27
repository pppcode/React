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
  if (typeof vnode === 'string') { //创建文本节点，挂载到容器中
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


let name = 'zhangsan'
function clickBtn() {
  console.log('click me')
}
let styleObj = {
  color: 'red',
  fontSize: '20px'
}

JreactDOM.render((
  <div className="wrapper">
    <h1 style={styleObj}>hello {name}</h1>
    <button onClick={clickBtn}>click me</button>
  </div>
), document.querySelector('#app')) //虚拟 dom 变成 真实的dom 节点后，挂载到容器上




