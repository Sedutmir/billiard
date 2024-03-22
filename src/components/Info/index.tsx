import { State } from '../Field/game';
import './index.css';

type Props = {
  state: State;
  pause: boolean;
  setPause: (_pause: boolean) => void;
  onRefresh: () => void;
};

function Info({ state, pause, setPause, onRefresh }: Props) {
  return (
    <div className="header">
      <h1>Billiard</h1>

      <div className="info">
        <span>
          Field: {state.width}x{state.height}
        </span>
        <span>Balls: {state.count}</span>
        <span>Impulse: {state.impulse}</span>
        <span>Randomization: {state.randomization}</span>
        <span>Stop speed: {state.stop_speed}</span>
        <button onClick={() => setPause(!pause)}>{pause ? 'Start' : 'Pause'}</button>
        <button onClick={onRefresh}>Refresh</button>
      </div>
    </div>
  );
}

export default Info;
