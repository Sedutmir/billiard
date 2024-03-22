const COLORS = ['#ff6961', '#77dd77', '#fdfd96', '#84b6f4', '#fdcae1'];
const S_COLORS = ['#c94139', '#4cad4c', '#cbcd69', '#5589c4', '#cd9cb2'];

export type State = {
  count: number;
  balls: Ball[];
  impulse: number;
  min_start_speed: number;
  max_start_speed: number;
  min_radius: number;
  max_radius: number;
  randomization: number;
  stop_speed: number;
  width: number;
  height: number;
};

export type Ball = {
  speed_x: number;
  speed_y: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  stroke: string;
};

export class Game {
  public count: number;
  public balls: Ball[];
  public impulse: number;
  public min_start_speed: number;
  public max_start_speed: number;
  public min_radius: number;
  public max_radius: number;
  public randomization: number;
  public stop_speed: number;
  public width: number;
  public height: number;

  constructor(state: State) {
    this.count = state.count;
    this.balls = state.balls;
    this.impulse = state.impulse;
    this.min_start_speed = state.min_start_speed;
    this.max_start_speed = state.max_start_speed;
    this.min_radius = state.min_radius;
    this.max_radius = state.max_radius;
    this.randomization = state.randomization;
    this.stop_speed = state.stop_speed;
    this.width = state.width;
    this.height = state.height;
  }

  public loopStep() {
    for (const ball of this.balls) {
      ball.x += ball.speed_x;
      ball.y += ball.speed_y;

      if (ball.x <= ball.radius) {
        ball.x = ball.radius;
        ball.speed_x *= -this.impulse;
        ball.speed_x += getRandom(-this.randomization, this.randomization);
      } else if (ball.x >= this.width - ball.radius) {
        ball.x = this.width - ball.radius;
        ball.speed_x *= -this.impulse;
        ball.speed_x += getRandom(-this.randomization, this.randomization);
      }

      if (ball.y <= ball.radius) {
        ball.y = ball.radius;
        ball.speed_y *= -this.impulse;
        ball.speed_y += getRandom(-this.randomization, this.randomization);
      } else if (ball.y >= this.height - ball.radius) {
        ball.y = this.height - ball.radius;
        ball.speed_y *= -this.impulse;
        ball.speed_y += getRandom(-this.randomization, this.randomization);
      }

      if (ball.speed_x < this.stop_speed && ball.speed_x > -this.stop_speed) ball.speed_x = 0;
      if (ball.speed_y < this.stop_speed && ball.speed_y > -this.stop_speed) ball.speed_y = 0;

      for (const ball2 of this.balls) {
        if (ball === ball2) continue;

        this.collision(ball, ball2);
      }
    }
  }

  // TODO: переделать на CSS
  public fillBackground(ctx: CanvasRenderingContext2D) {
    const color1 = '#aaa';
    const color2 = '#eee';

    const square_side = Math.min(this.width, this.height) / 20;

    ctx.fillStyle = color1;
    ctx.fillRect(0, 0, this.width, this.height);

    let x = 0,
      y = 0,
      columnType = 0;

    ctx.fillStyle = color2;

    while (x < this.width) {
      while (y < this.height) {
        ctx.fillRect(x, y, square_side, square_side);

        y += square_side * 2;
      }

      columnType = (columnType + 1) % 2;

      y = square_side * columnType;

      x += square_side;
    }
  }

  public generateBalls() {
    this.balls = [];

    while (this.balls.length < this.count) {
      const radius = getRandom(this.min_radius, this.max_radius);
      const color_i = Math.floor(getRandom(0, COLORS.length));

      const ball = {
        speed_x: getRandom(this.min_start_speed, this.max_start_speed),
        speed_y: getRandom(this.min_start_speed, this.max_start_speed),
        x: getRandom(radius, this.width - radius),
        y: getRandom(radius, this.height - radius),
        radius,
        color: COLORS[color_i],
        stroke: S_COLORS[color_i],
      };

      for (const old_ball of this.balls) {
        this.collision(old_ball, ball);
      }

      this.balls.push(ball);
    }
  }

  private getSpeed(r1: number, r2: number, v1: number, v2: number) {
    const res1 = ((r1 - r2) * v1 + 2 * r2 * v2) / (r1 + r2);
    const res2 = (2 * r1 * v1 + (r2 - r1) * v2) / (r1 + r2);

    return [res1, res2];
  }

  public drawBalls(ctx: CanvasRenderingContext2D) {
    for (const ball of this.balls) {
      this.drawBall(ctx, ball);
    }
  }

  private drawBall(ctx: CanvasRenderingContext2D, ball: Ball) {
    const { x, y, radius, color, stroke } = ball;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  private collision(ball1: Ball, ball2: Ball) {
    const { x: x1, y: y1, radius: r1 } = ball1;
    const { x: x2, y: y2, radius: r2 } = ball2;

    const distance = Math.sqrt(Math.abs(x2 - x1) ** 2 + Math.abs(y2 - y1) ** 2);

    if (distance >= r1 + r2) return;

    const intersect = r1 + r2 - distance;

    const x_shift = (Math.abs(ball1.x - ball2.x) * intersect) / distance;
    const y_shift = (Math.abs(ball1.y - ball2.y) * intersect) / distance;
    const total_r = ball1.radius + ball2.radius;
    const ratio_1 = ball2.radius / total_r;
    const ratio_2 = ball1.radius / total_r;

    const sign_x = ball1.x < ball2.x ? 1 : -1;
    ball1.x -= sign_x * x_shift * ratio_1;
    ball2.x += sign_x * x_shift * ratio_2;

    const sign_y = ball1.y < ball2.y ? 1 : -1;
    ball1.y -= sign_y * y_shift * ratio_1;
    ball2.y += sign_y * y_shift * ratio_2;

    const [speed_x1, speed_x2] = this.getSpeed(ball1.radius, ball2.radius, ball1.speed_x, ball2.speed_x);
    const [speed_y1, speed_y2] = this.getSpeed(ball1.radius, ball2.radius, ball1.speed_y, ball2.speed_y);

    ball1.speed_x = speed_x1 * this.impulse;
    ball2.speed_x = speed_x2 * this.impulse;

    ball1.speed_y = speed_y1 * this.impulse;
    ball2.speed_y = speed_y2 * this.impulse;
  }
}

function getRandom(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
