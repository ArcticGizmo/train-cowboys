import { GameObject } from '@/engine/GameObject';
import { SpriteCircle } from '@/engine/SpriteCircle';
import { Vec2 } from '@/engine/Vec2';
import { GRID_SIZE, gridFromPos, posFromGrid } from '@/engine/utils';

const RENDER_PLACEMENTS = true;

export interface PlacementMarkerConfig {
  gridPos: Vec2;
  regionIndex: number;
}

export class PlacementMarker extends GameObject {
  regionIndex = -1;

  constructor(config: PlacementMarkerConfig) {
    super({ position: posFromGrid(config.gridPos) });
    this.regionIndex = config.regionIndex;

    if (RENDER_PLACEMENTS) {
      const sprite = new SpriteCircle({
        position: new Vec2(GRID_SIZE / 2, GRID_SIZE / 2),
        radius: config.regionIndex + 2,
        color: 'red'
      });
      this.addChild(sprite);
    }
  }

  get gridPos() {
    return gridFromPos(this.position);
  }

  get globalGridPos() {
    return gridFromPos(this.globalPosition);
  }
}
