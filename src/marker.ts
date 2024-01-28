import { PROPS } from './constants';
import { GameObject } from './gameObject';
import { SpriteCircle } from './spriteCircle';
import { Vec2 } from './vec2';

const RADIUS = 3;

interface MarkerConfig {
  position?: Vec2;
  color?: string;
  radius?: number;
}

export class Marker extends GameObject {
  constructor(config: MarkerConfig) {
    super({ position: config.position });

    if (PROPS.showPlacements) {
      this.addChild(
        new SpriteCircle({
          radius: config.radius ?? RADIUS,
          color: config.color
        })
      );
    }
  }
}
