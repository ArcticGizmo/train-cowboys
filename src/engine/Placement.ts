import { GameObject } from './GameObject';
import { SpriteCircle } from './SpriteCircle';
import { Vec2 } from './Vec2';
import { Level } from './level.type';
import { GRID_SIZE, gridFromPos, posFromGrid } from './utils';

const RENDER_PLACEMENTS = true;

export interface PlacementConfig {
  gridPos: Vec2;
  level: Level;
  carIndex: number;
  isDeathZone?: boolean;
}

export class Placement extends GameObject {
  carIndex = -1;
  isDeathZone = false;
  level: Level = null!;

  constructor(config: PlacementConfig) {
    super({ position: posFromGrid(config.gridPos) });
    this.carIndex = config.carIndex;
    this.isDeathZone = config.isDeathZone || false;
    this.level = config.level;

    if (RENDER_PLACEMENTS) {
      const sprite = new SpriteCircle({
        position: new Vec2(GRID_SIZE / 2, GRID_SIZE / 2),
        radius: GRID_SIZE / 8,
        color: 'green'
      });
      this.addChild(sprite);
    }
  }

  get globalGridPos() {
    return gridFromPos(this.globalPosition);
  }
}
