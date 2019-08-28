import Jreact from './lib/jreact'
import JreactDOM from './lib/jreact-dom'

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

//组件的其他写法
function Hobby(props) {
  return (
    <p>我的兴趣是{ props.hobby }</p>
  )
}


JreactDOM.render(<App></App>, document.querySelector('#app'))
