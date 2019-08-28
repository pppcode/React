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