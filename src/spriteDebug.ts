import { GameObject } from './gameObject';
import { Vec2 } from './vec2';

export interface SpriteDebugConfig {
  position?: Vec2;
  size: Vec2;
  color?: string;
  scale?: number;
}

export class SpriteDebug extends GameObject {
  private _color: string;
  private _scale: number;
  private _size: Vec2;

  constructor(config: SpriteDebugConfig) {
    super({ position: config.position ?? Vec2.ZERO() });
    this._size = config.size;
    this._scale = config.scale ?? 1;
    this._color = config.color ?? 'purple';
  }

  drawImage(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const prevStyle = ctx.fillStyle;
    ctx.fillStyle = this._color;
    ctx.fillRect(x, y, this._size.x * this._scale, this._size.y * this._scale);
    ctx.fillStyle = prevStyle;
  }
}
