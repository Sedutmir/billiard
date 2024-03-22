import { MouseEvent, MutableRefObject, ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import Menu from '../Menu';
import { Ball, Game, State } from './game';
import './index.css';

export type { Ball } from './game';

const INTERVAL = 30;

type Props = {
  pause: boolean;
  setPause: (_pause: boolean) => void;
  state: State;
};

function Field({ pause, setPause, state }: Props) {
  const style = {
    aspectRatio: `${state.width} / ${state.height}`,
  };

  const canvas: MutableRefObject<HTMLCanvasElement | null> = useRef(null);
  const [ctx, setCtx] = useState(undefined as CanvasRenderingContext2D | null | undefined);

  const game = useRef(new Game(state));

  const current_ball = useRef(null as null | Ball);
  const last_pos = useRef({ x: 0, y: 0 });
  const last_speed = useRef({ x: 0, y: 0 });
  const stop_timer = useRef(undefined as undefined | number);

  const click_timer = useRef(undefined as undefined | number);
  const click = useRef(false);

  const [menu, setMenu] = useState(null as ReactNode | null);

  const [interval_id, setIntervalID] = useState(undefined as undefined | number);

  // Init context
  useEffect(() => {
    setCtx(canvas.current?.getContext('2d'));
  }, []);

  // Init field and loop
  useEffect(() => {
    if (!ctx) return;

    game.current.generateBalls();

    const interval = setInterval(loop_callback, INTERVAL);

    setIntervalID(interval);

    return () => clearInterval(interval);
  }, [ctx, state]);

  const loop_callback = useCallback(() => {
    if (!ctx) return;

    game.current.fillBackground(ctx);

    if (current_ball.current !== null) {
      current_ball.current.x = last_pos.current.x;
      current_ball.current.y = last_pos.current.y;
    }

    if (!pause) game.current.loopStep();

    game.current.drawBalls(ctx);
  }, [ctx, pause, state]);

  useEffect(() => {
    if (!pause) setMenu(null);

    clearInterval(interval_id);

    const interval = setInterval(loop_callback, INTERVAL);

    setIntervalID(interval);

    return () => clearInterval(interval);
  }, [pause]);

  const getCursorPosition = (ev: MouseEvent) => {
    const rect = canvas.current!.getBoundingClientRect();
    const raw_x = ev.clientX - rect.left;
    const raw_y = ev.clientY - rect.top;

    const x = (raw_x / rect.width) * state.width;
    const y = (raw_y / rect.height) * state.height;

    return { x, y };
  };

  const getRawCursorPosition = (ev: MouseEvent) => {
    const rect = canvas.current!.getBoundingClientRect();
    const raw_x = ev.clientX - rect.left;
    const raw_y = ev.clientY - rect.top;

    return { x: raw_x, y: raw_y };
  };

  const onMouseDown = (ev: MouseEvent) => {
    click.current = true;
    const { x, y } = getCursorPosition(ev);

    for (const ball of game.current.balls) {
      const dist = ((ball.x - x) ** 2 + (ball.y - y) ** 2) ** 0.5;

      if (Math.abs(dist) < ball.radius) {
        current_ball.current = ball;
        last_pos.current = { x, y };

        break;
      }
    }

    click_timer.current = setTimeout(() => {
      click.current = false;
      setMenu(null);
    }, 120);
  };

  const onMouseMove = (ev: MouseEvent) => {
    if (click.current || current_ball.current === null) return;

    const { x, y } = getCursorPosition(ev);

    current_ball.current.x = x;
    current_ball.current.y = y;
    current_ball.current.speed_x = ev.movementX;
    current_ball.current.speed_y = ev.movementY;

    last_pos.current = { x, y };
    last_speed.current = { x: ev.movementX, y: ev.movementY };

    clearTimeout(stop_timer.current);
    stop_timer.current = setTimeout(() => {
      last_speed.current = { x: 0, y: 0 };
    }, 200);
  };

  const onMouseUp = () => {
    if (click.current || current_ball.current === null) return;

    current_ball.current.speed_x = last_speed.current.x;
    current_ball.current.speed_y = last_speed.current.y;

    current_ball.current = null;
  };

  const innerOnClick = (ev: MouseEvent) => {
    if (!click.current) return;

    clearTimeout(click_timer.current);

    if (!current_ball.current) return;

    const { x, y } = getRawCursorPosition(ev);

    const onFinish = () => {
      setMenu(null);
      current_ball.current = null;
    };

    setMenu(<Menu onFinish={onFinish} ball={current_ball.current} x={x} y={y} setPause={setPause} pause={pause} />);
  };

  return (
    <div className="field">
      {menu}
      <canvas
        ref={canvas}
        width={state.width}
        height={state.width}
        style={style}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onClick={innerOnClick}
      >
        Oops!
      </canvas>
    </div>
  );
}

export default Field;
