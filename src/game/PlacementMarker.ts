import { GameObject } from '@/engine/GameObject';
import { SpriteCircle } from '@/engine/SpriteCircle';
import { Vec2 } from '@/engine/Vec2';
import { GRID_SIZE, gridFromPos, posFromGrid } from '@/engine/utils';
import { Level } from './level.type';

const RENDER_PLACEMENTS = true;

export interface PlacementMarkerConfig {
  gridPos: Vec2;
  roomIndex: number;
  level: Level;
  isDeathZone?: boolean;
}

export class PlacementMarker extends GameObject {
  roomIndex = -1;
  isDeathZone = false;
  level: Level;

  constructor(config: PlacementMarkerConfig) {
    super({ position: posFromGrid(config.gridPos) });
    this.roomIndex = config.roomIndex;
    this.isDeathZone = config.isDeathZone || false;
    this.level = config.level;

    if (RENDER_PLACEMENTS) {
      const sprite = new SpriteCircle({
        position: new Vec2(GRID_SIZE / 2, GRID_SIZE / 2),
        radius: config.roomIndex + 2,
        color: 'red'
      });
      this.addChild(sprite);
    }
  }

  get globalGridPos() {
    return gridFromPos(this.globalPosition);
  }
}
