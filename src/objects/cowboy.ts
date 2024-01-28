import { GameObject } from '../gameObject';
import { SpriteDebug } from '../spriteDebug';
import { Vec2 } from '../vec2';

export type Direction = 'forward' | 'back';

export interface CowboyConfig {
  position?: Vec2;
  size: Vec2;
  color?: string;
}

export class Cowboy extends GameObject {
  constructor(config: CowboyConfig) {
    super({ position: config.position });

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
}
