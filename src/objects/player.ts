import { GameObject } from '../gameObject';
import { SpriteDebug } from '../spriteDebug';
import { Vec2 } from '../vec2';

export type Direction = 'forward' | 'back';

export interface PlayerConfig {
  position?: Vec2;
  size: Vec2;
  color?: string;
}

export class Player extends GameObject {
  private _size: Vec2;

  constructor(config: PlayerConfig) {
    super({ position: config.position });

    this._size = config.size;

    this.addChild(new SpriteDebug({ size: config.size, color: config.color }));
    // direction indicator
    this.addChild(
      new SpriteDebug({
        position: new Vec2(0, config.size.y / 4),
        size: new Vec2(3, 3),
        color: 'white'
      })
    );
  }

  moveTo(pos: Vec2) {
    this.position = new Vec2(pos.x - this._size.x / 2, pos.y - this._size.y / 2);
  }
}
