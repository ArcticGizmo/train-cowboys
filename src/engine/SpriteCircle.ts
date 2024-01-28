import { GameObject } from './GameObject';
import { Vec2 } from './Vec2';

export interface SpriteCircleConfig {
  position?: Vec2;
  color?: string;
  opacity?: number;
  radius: number;
}

export class SpriteCircle extends GameObject {
  private _color: string;
  private _radius: number;
  private _opacity: number;

  constructor(config: SpriteCircleConfig) {
    super({ position: config.position });
    this._radius = config.radius ?? 1;
    this._color = config.color ?? 'purple';
    this._opacity = config.opacity ?? 1;
  }

  drawImage(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.beginPath();
    ctx.globalAlpha = this._opacity;
    ctx.arc(x, y, this._radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = this._color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}
