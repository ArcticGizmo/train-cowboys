import { PROPS } from '../constants';
import { GameObject } from '../gameObject';
import { SpriteCircle } from '../spriteCircle';
import { Vec2 } from '../vec2';

const RADIUS = 3;

interface PlacementConfig {
  index: Vec2,
  position?: Vec2;
  color?: string;
  radius?: number;
}

export class Placement extends GameObject {
  constructor(config: PlacementConfig) {
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

