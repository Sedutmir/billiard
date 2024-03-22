import { useCallback, useState } from 'react'
import './App.css'
import Field, { Ball } from './components/Field'
import Info from './components/Info'

function App() {
  const [pause, setPause] = useState(false);

  const onClick = useCallback((x: number, y: number, ball: Ball) => {
    console.log(x, y, ball);

    setPause(!pause);
  }, [pause])

  return (
    <div className='container'>
        <Info />
        <Field width={1000} height={1000} pause={pause} onClick={onClick}/>
    </div>
  )
}

export default App
