import { events } from './events';
import { GameObject } from './gameObject';
import { Vec2 } from './vec2';

export class Camera extends GameObject {
  private _width: number;
  private _height: number;
  constructor(width: number, height: number) {
    super();

    this._width = width;
    this._height = height;

    events.on('PLAYER_POSITION_CHANGED', this, pos => {
      // center on person
      const personHalf = 8;
      const halfWidth = -personHalf + this._width / 2;
      const halfHeight = -personHalf + this._height / 2;
      this.position = pos.copy().scale(-1).add(new Vec2(halfWidth, halfHeight));
    });
  }
}
