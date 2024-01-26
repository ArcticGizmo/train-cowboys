import { GameObject } from './gameObject';
import { Vec2 } from './vec2';

export interface SpriteCircleConfig {
  position?: Vec2;
  color?: string;
  radius: number;
}

export class SpriteCircle extends GameObject {
  private _color: string;
  private _radius: number;

  constructor(config: SpriteCircleConfig) {
    super({ position: config.position });
    this._radius = config.radius ?? 1;
    this._color = config.color ?? 'purple';
  }

  drawImage(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.beginPath();
    ctx.arc(x, y, this._radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = this._color;
    ctx.fill();
  }
}
