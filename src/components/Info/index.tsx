import { State } from '../Field/game'
import './index.css'

type Props = {
  state: State,
  pause: boolean,
  setPause: (pause: boolean) => void,
  onRefresh: () => void, 
}

function Info({state, pause, setPause, onRefresh} : Props) {
  return (
    <div className='header'>
      <h1>Billiard</h1>

      <div className="info">
          <div>Balls: {state.count}</div>
          <button onClick={() => setPause(!pause)}>{pause ? "Start" : "Pause"}</button>
          <button onClick={onRefresh}>Refresh</button>
      </div>
    </div>
  )
}

export default Info
