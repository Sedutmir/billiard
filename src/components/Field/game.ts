const IMP = .9;
const MIN_STOP = .2;
const RAND_RADIUS = .1;
const MIN_RADIUS = 20;
const MAX_RADIUS = 60;
const MIN_SPEED = -10;
const MAX_SPEED = 10;

const COLORS = ["#ff6961", "#77dd77", "#fdfd96", "#84b6f4", "#fdcae1"];
const S_COLORS = ["#c94139", "#4cad4c", "#cbcd69", "#5589c4", "#cd9cb2"];

export type Ball = {
    speed_x: number,
    speed_y: number,
    x: number,
    y: number,
    radius: number,
    color: string,
    stroke: string,
  }

function getRandom(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function loopStep(width: number, height: number, balls: Ball[]) {
  for (const ball of balls) {
    ball.x += ball.speed_x;
    ball.y += ball.speed_y;

    if (ball.x <= ball.radius) {
      ball.x = ball.radius;
      ball.speed_x *= -IMP;
      ball.speed_x += getRandom(-RAND_RADIUS, RAND_RADIUS);
    } else
    if (ball.x >= width - ball.radius) {
      ball.x = width - ball.radius;
      ball.speed_x *= -IMP;
      ball.speed_x += getRandom(-RAND_RADIUS, RAND_RADIUS);
    }

    if (ball.y <= ball.radius) {
      ball.y = ball.radius;
      ball.speed_y *= -IMP;
      ball.speed_y += getRandom(-RAND_RADIUS, RAND_RADIUS);
    } else
    if (ball.y >= height - ball.radius) {
      ball.y = height - ball.radius;
      ball.speed_y *= -IMP;
      ball.speed_y += getRandom(-RAND_RADIUS, RAND_RADIUS);
    }

    if (ball.speed_x < MIN_STOP && ball.speed_x > -MIN_STOP) ball.speed_x = 0;
    if (ball.speed_y < MIN_STOP && ball.speed_y > -MIN_STOP) ball.speed_y = 0;

    for (const ball2 of balls) {
      if (ball === ball2) continue;

      collision(ball, ball2);
    }
  }

  return balls;
}

// TODO: переделать на CSS
export function fillBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const color1 = "#aaa";
  const color2 = "#eee";

  const square_side = Math.min(width, height) / 20;

  ctx.fillStyle = color1;
  ctx.fillRect(0, 0, width, height);
  
  let x = 0, y = 0, columnType = 0;
  
  ctx.fillStyle = color2;

  while (x < width) {
    while (y < height) {
      ctx.fillRect(x, y, square_side, square_side);
      
      y += square_side * 2;
    }
    
    columnType = (columnType + 1) % 2;

    y = square_side * columnType;

    x += square_side;
  }
}

export function generateBalls (count: number, width: number, height: number): Ball[] {
  const res: Ball[] = [];

  while (res.length < count) {
    const radius = getRandom(MIN_RADIUS, MAX_RADIUS);
    const color_i = Math.floor(getRandom(0, COLORS.length));

    const ball = {
      speed_x: getRandom(MIN_SPEED, MAX_SPEED),
      speed_y: getRandom(MIN_SPEED, MAX_SPEED),
      x: getRandom(radius, width - radius),
      y: getRandom(radius, height - radius),
      radius,
      color: COLORS[color_i],
      stroke: S_COLORS[color_i],
    };

    for (const old_ball of res) {
      collision(old_ball, ball); // TODO:
    }

    res.push(ball);
  }

  return res;
}

function getSpeed(r1: number, r2: number, v1: number, v2: number) {
  const res1 = ((r1 - r2) * v1 + 2 * r2 * v2) / (r1 + r2);
  const res2 = (2 * r1 * v1 + (r2 - r1) * v2) / (r1 + r2);

  return [res1, res2];
}

export function drawBall(ctx: CanvasRenderingContext2D, ball: Ball) {
  const { x, y, radius, color, stroke } = ball;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 3;
  ctx.stroke();
}

function collision(ball1: Ball, ball2: Ball) {
  const { x: x1, y: y1, radius: r1 } = ball1;
  const { x: x2, y: y2, radius: r2 } = ball2;

  const distance = Math.sqrt(Math.abs(x2 - x1) ** 2 + Math.abs(y2 - y1) ** 2);

  if (distance >= r1 + r2) return;

  const intersect = r1 + r2 - distance;

  const x_shift = Math.abs(ball1.x - ball2.x) * intersect / distance;
  const y_shift = Math.abs(ball1.y - ball2.y) * intersect / distance; 
  const share_r = ball1.radius + ball2.radius;
  const koeff_1 = ball2.radius / share_r;
  const koeff_2 = ball1.radius / share_r;

  const sign_x = ball1.x < ball2.x ? 1 : -1
  ball1.x -= sign_x * x_shift * koeff_1;
  ball2.x += sign_x * x_shift * koeff_2;

  const sign_y = ball1.y < ball2.y ? 1 : -1
  ball1.y -= sign_y * y_shift * koeff_1;
  ball2.y += sign_y * y_shift * koeff_2;

  const [sx1, sx2] = getSpeed(ball1.radius, ball2.radius, ball1.speed_x, ball2.speed_x);
  const [sy1, sy2] = getSpeed(ball1.radius, ball2.radius, ball1.speed_y, ball2.speed_y);

  ball1.speed_x = sx1 * IMP;
  ball2.speed_x = sx2 * IMP;
  
  ball1.speed_y = sy1 * IMP;
  ball2.speed_y = sy2 * IMP;
}