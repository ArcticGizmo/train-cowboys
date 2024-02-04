import { GameObject } from './GameObject';
import { Placement } from './Placement';
import { SpriteRect } from './SpirteRect';
import { Vec2 } from './Vec2';
import { Direction } from './direction';
import { Level } from './level';
import { posFromGrid } from './utils';

export interface CarConfig {
  gridPos: Vec2;
  placementCount: number;
  color: string;
}

export class Car extends GameObject {
  private _topPlacements: Placement[] = [];
  private _bottomPlacements: Placement[] = [];

  constructor(config: CarConfig) {
    super({ position: posFromGrid(config.gridPos) });
    this.addChild(
      new SpriteRect({
        position: Vec2.ZERO(),
        size: posFromGrid(new Vec2(config.placementCount, 4)),
        color: config.color,
        opacity: 0.1
      })
    );

    for (let i = 0; i < config.placementCount; i++) {
      const topPlacement = new Placement({
        gridPos: new Vec2(i, 0)
      });
      this._topPlacements.push(topPlacement);
      this.addChild(topPlacement);

      const bottomPlacement = new Placement({
        gridPos: new Vec2(i, 3)
      });
      this._bottomPlacements.push(bottomPlacement);
      this.addChild(bottomPlacement);
    }
  }

  getPlacement(level: Level, enterFrom: Direction) {
    const placements = level === 'top' ? this._topPlacements : this._bottomPlacements;
    return enterFrom === 'left' ? placements[0] : placements[placements.length - 1];
  }

  containsPlacement(placement: Placement) {
    return this._topPlacements.includes(placement) || this._bottomPlacements.includes(placement);
  }

  getLevelFromPlacement(placement: Placement): Level {
    console.log(placement.globalGridPos);
    console.log(this._topPlacements[0].globalGridPos);
    console.log(this._bottomPlacements[0].globalGridPos);
    if (this._topPlacements.some(p => p.globalGridPos.y === placement.globalGridPos.y)) {
      return 'top';
    }
    return 'bottom';
  }

  getBottomLeftPlacement() {
    return this._bottomPlacements[0];
  }

  getAllPlacements() {
    return [...this._topPlacements, ...this._bottomPlacements];
  }
}
