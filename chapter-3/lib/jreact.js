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
    this.props = props
    this.state = {}
  }

  setState(state) {
    this.state = Object.assign(this.state, state)
    jreactDom.renderComponent(this)
  }
}

export default {
  createElement,
  Component
}