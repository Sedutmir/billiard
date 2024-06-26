import { useState } from 'react';

import './App.css';
import Field from './components/Field';
import { State } from './components/Field/game';
import Info from './components/Info';

const defaultState: State = {
  count: 30,
  balls: [],
  impulse: 0.9,
  min_start_speed: -10,
  max_start_speed: 10,
  min_radius: 15,
  max_radius: 50,
  randomization: 0.1,
  stop_speed: 0.2,
  width: 1000,
  height: 1000,
};

function App() {
  const [pause, setPause] = useState(false);
  const [state, setState] = useState(Object.assign({}, defaultState));

  return (
    <div className="container">
      <Info
        state={state}
        pause={pause}
        setPause={setPause}
        onRefresh={() => setState(Object.assign({}, defaultState))}
      />
      <Field pause={pause} setPause={setPause} state={state} />
    </div>
  );
}

export default App;
