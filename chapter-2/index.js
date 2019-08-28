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
