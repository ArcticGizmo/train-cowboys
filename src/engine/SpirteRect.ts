import { GameObject } from './GameObject';
import { Vec2 } from './Vec2';

export interface SpriteRectConfig {
  position?: Vec2;
  size: Vec2;
  color?: string;
  scale?: number;
  opacity?: number;
}

export class SpriteRect extends GameObject {
  private _color: string;
  private _scale: number;
  private _size: Vec2;
  private _opacity: number;

  constructor(config: SpriteRectConfig) {
    super({ position: config.position });
    this._size = config.size;
    this._scale = config.scale ?? 1;
    this._color = config.color ?? 'purple';
    this._opacity = config.opacity ?? 1;
  }

  drawImage(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.beginPath();
    ctx.globalAlpha = this._opacity;
    ctx.fillStyle = this._color;
    ctx.fillRect(x, y, this._size.x * this._scale, this._size.y * this._scale);
    ctx.globalAlpha = 1;
  }
}
