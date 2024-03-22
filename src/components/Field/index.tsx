import { MouseEvent, MutableRefObject, useCallback, useEffect, useRef, useState } from 'react'
import './index.css'

import { Ball, drawBall, fillBackground, generateBalls, loopStep } from './game';

export type { Ball } from './game';

const GENERATED_BALLS = 30;

type Props = {
  width: number,
  height: number,
  pause: boolean,
  onClick: (x: number, y: number, ball: Ball) => void,
}


function Field({ width, height, pause, onClick } : Props) {
  const style = {
    aspectRatio: `${width} / ${height}`
  };
  
  const canvas: MutableRefObject<HTMLCanvasElement | null> = useRef(null)
  const [ctx, setCtx] = useState(undefined as CanvasRenderingContext2D | null | undefined)

  const balls = useRef([] as Ball[])

  const current_ball = useRef(null as null | Ball)
  const last_pos = useRef({x: 0, y: 0});
  const last_speed = useRef({x: 0, y: 0});
  const stop_timer = useRef(undefined as undefined | number);

  const click_timer = useRef(undefined as undefined | number);
  const click = useRef(false);

  const [interval_id, setIntervalID] = useState(undefined as undefined | number);

  // Init context
  useEffect(() => {
      setCtx(canvas.current?.getContext('2d'));
  }, [])

  // Init field and loop
  useEffect(() => {
      if (!ctx) return;

      balls.current = generateBalls(GENERATED_BALLS, width, height);

      const interval = setInterval(loop_callback, 60);

      setIntervalID(interval);

      return () => clearInterval(interval)
  }, [ctx])

  const loop_callback = useCallback(() => {
    if (!ctx) return;

    fillBackground(ctx, width, height);

    if (current_ball.current !== null) {
      current_ball.current.x = last_pos.current.x;
      current_ball.current.y = last_pos.current.y;
    }

    if (!pause)
      balls.current = loopStep(width, height, balls.current);

    for (const ball of balls.current) {
      drawBall(ctx, ball);
    }
  }, [ctx, height, pause, width]);

  useEffect(() => {
    clearInterval(interval_id);
    
    const interval = setInterval(loop_callback, 60);

    setIntervalID(interval);

    return () => clearInterval(interval)
  }, [pause])

  const getCursorPosition = (ev: MouseEvent) => {
    const rect = canvas.current!.getBoundingClientRect()
    const raw_x = ev.clientX - rect.left
    const raw_y = ev.clientY - rect.top

    const x = raw_x / rect.width * width;
    const y = raw_y / rect.height * height;

    return {x, y};
  }

  const onMouseDownHandler = (ev: MouseEvent) => {
    const {x, y} = getCursorPosition(ev);

    for (const ball of balls.current) {
      const dist = ((ball.x - x) ** 2 + (ball.y - y) ** 2) ** 0.5;

      if (Math.abs(dist) < ball.radius) {
        current_ball.current = ball;
        last_pos.current = {x, y};
        break;
      }
    }
  }

  const onMouseDown = (ev: MouseEvent) => {
    click.current = true;
    click_timer.current = setTimeout(() => {
      click.current = false;
      onMouseDownHandler(ev);     
    }, 150);
  }

  const onMouseMove = (ev: MouseEvent) => {
    if (current_ball.current === null) return;

    const {x, y} = getCursorPosition(ev);
    
    current_ball.current.x = x;
    current_ball.current.y = y;
    current_ball.current.speed_x = ev.movementX;
    current_ball.current.speed_y = ev.movementY;

    last_pos.current = {x, y};
    last_speed.current = {x: ev.movementX, y: ev.movementY};

    clearTimeout(stop_timer.current);
    stop_timer.current = setTimeout(() => {
      last_speed.current = {x: 0, y: 0};
    }, 400);

  }

  const onMouseUp = () => {
    if (current_ball.current === null) return;
    
    current_ball.current.speed_x = last_speed.current.x;
    current_ball.current.speed_y = last_speed.current.y;

    current_ball.current = null;
  }

  const innerOnClick = (ev: MouseEvent) => {
    if (!click.current) return;
    clearTimeout(click_timer.current);

    const {x, y} = getCursorPosition(ev);

    for (const ball of balls.current) {
      const dist = ((ball.x - x) ** 2 + (ball.y - y) ** 2) ** 0.5;

      if (Math.abs(dist) < ball.radius) {
        onClick(x, y, ball);

        break;
      }
    }
  }

  return (
    <canvas ref={canvas} width={width} height={height} style={style} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onClick={innerOnClick}>
      Oops!
    </canvas>
  )
}

export default Field
