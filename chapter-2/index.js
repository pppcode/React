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