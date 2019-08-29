import Jreact from './jreact'

function render(vnode, container) {
  container.innerHTML = ''
  console.log(vnode)
  _render(vnode, container)
}

function _render(vnode, container) {
  let dom = createDomfromVnode(vnode)
  container.appendChild(dom)
}


function createDomfromVnode(vnode) {
  if (typeof vnode === 'string' || typeof vnode === 'number') { 
    return document.createTextNode(vnode)
  }

  if (typeof vnode === 'object') {
    if(typeof vnode.tag === 'function') { 
      let component = createComponent(vnode.tag, vnode.attrs) 
      return component.$root
    }

    let dom = document.createElement(vnode.tag)
    setAttribute(dom, vnode.attrs)
    if (vnode.children && Array.isArray(vnode.children)) {
      vnode.children.forEach(vnodeChild => {
        _render(vnodeChild, dom) 
      })
    }
    return dom
  }
}


function createComponent(constructor, attrs) {
  let component
  if(constructor.prototype instanceof Jreact.Component) {
    component = new constructor(attrs) 
  } else {
    component = new Jreact.Component(attrs) 
    component.constructor = constructor
    component.render = function() { 
      return this.constructor(attrs)
    }
  }
  return component
}


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
    if (/^on/.test(key)) { 
      dom[key.toLocaleLowerCase()] = attrs[key]
    } else if (key === 'style') { 
      Object.assign(dom.style, attrs[key]) 
    } else { 
      dom[key] = attrs[key]
    }
  }
}

export default {
  render,
  renderComponent
}