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