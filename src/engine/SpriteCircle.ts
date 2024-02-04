import { GameObject } from './GameObject';
import { Vec2 } from './Vec2';

export interface SpriteCircleConfig {
  position?: Vec2;
  color?: string;
  opacity?: number;
  radius: number;
}

export class SpriteCircle extends GameObject {
  public color: string;
  public radius: number;
  public opacity: number;

  constructor(config: SpriteCircleConfig) {
    super({ position: config.position });
    this.radius = config.radius ?? 1;
    this.color = config.color ?? 'purple';
    this.opacity = config.opacity ?? 1;
  }

  drawImage(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.beginPath();
    ctx.globalAlpha = this.opacity;
    ctx.arc(x, y, this.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}
