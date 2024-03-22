import { ChangeEvent, useEffect, useMemo, useState } from 'react';

import { Ball } from '../Field';
import './index.css';

type Props = {
  ball: Ball;
  x: number;
  y: number;
  setPause: (_pause: boolean) => void;
  pause: boolean;
  onFinish: () => void;
};

function Menu({ ball, x, y, setPause, pause, onFinish }: Props) {
  const style = {
    left: x,
    top: y,
  };

  const [color, setColor] = useState(ball.color);
  const pause_value = useMemo(() => pause, []);
  const ball_value = useMemo(() => Object.assign({}, ball), []);

  useEffect(() => {
    setColor(ball.color);
  }, [ball, ball.color]);

  useEffect(() => {
    setPause(true);
  }, []);

  const onChange = (ev: ChangeEvent<HTMLInputElement>) => {
    ball.color = ev.target.value;

    const hsl = hex2hsl(ball.color);
    hsl.l -= 10;

    if (hsl.l < 0) hsl.l = 0;

    ball.stroke = `hsl(${hsl.h} , ${hsl.s}%, ${hsl.l}%)`;
    setColor(ball.color);
  };

  const onNo = () => {
    Object.assign(ball, ball_value);
    setPause(pause_value);
    onFinish();
  };

  const onOk = () => {
    setPause(pause_value);
    onFinish();
  };

  return (
    <div className="menu" style={style}>
      <input type="color" value={color} onChange={onChange} />
      <div className="row">
        <button onClick={onNo}>NO</button>
        <button onClick={onOk}>OK</button>
      </div>
    </div>
  );
}

export default Menu;

function hex2hsl(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  let r = parseInt(result![1], 16);
  let g = parseInt(result![2], 16);
  let b = parseInt(result![3], 16);

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);

  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        h = 0;
    }

    h /= 6;
  }

  s = s * 100;
  s = Math.round(s);
  l = l * 100;
  l = Math.round(l);
  h = Math.round(360 * h);

  return { h, s, l };
}
