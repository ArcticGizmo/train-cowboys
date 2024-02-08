import { GameObject } from './GameObject';
import { SpriteCircle } from './SpriteCircle';
import { Vec2 } from './Vec2';
import { gridFromPos, posFromGrid } from './utils';

const RENDER_PLACEMENTS = false;

export interface PlacementConfig {
  gridPos: Vec2;
}

export class Placement extends GameObject {
  constructor(config: PlacementConfig) {
    super({ position: posFromGrid(config.gridPos) });

    if (RENDER_PLACEMENTS) {
      const sprite = new SpriteCircle({
        position: new Vec2(8, 8),
        radius: 2,
        color: 'green'
      });
      this.addChild(sprite);
    }
  }

  get globalGridPos() {
    return gridFromPos(this.globalPosition);
  }
}
