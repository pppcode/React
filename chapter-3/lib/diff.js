
function diffNode(dom, vnode) {
  let patchedDom = dom

  //如果是文本类型的虚拟DOM ，要么替换内容，要么替换元素
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    if (patchedDom && patchedDom.nodeType === 3) { 
      if (patchedDom.textContent !== vnode) { 
        patchedDom.textContent = vnode
      }
    } else { //若不是字符串，而是元素
      patchedDom = document.createTextNode(vnode)
    }
    return patchedDom
  }

  //如果是组件，就diff组件
  if (typeof vnode === 'object' && typeof vnode.tag === 'function') {
    patchedDom = diffComponent(dom, vnode) //交给他去处理
    return patchedDom
  }

  //否则就是普通的 vnode
  //看 dom 是不是存在，如果不存在就根据 vnode 创建
  if (!dom) {
    patchedDom = document.createElement(vnode.tag) 
  }

  //如果存在但标签变了，就修正标签（创建新标签的 dom ，但旧标签 dom 的孩子放到新标签 dom 里，旧标签替换成新标签）
  if (dom && dom.nodeName.toLowerCase() !== vnode.tag.toLowerCase()) { 
    patchedDom = document.createElement(vnode.tag)
    dom.childNodes.forEach((child) => patchedDom.appendChild(child))
    replaceDom(patchedDom, dom)
  }

  //diff 属性
  diffAttributes(patchedDom, vnode)

  //diff 子元素
  diffChildren(patchedDom, vnode.children)

  return patchedDom

}