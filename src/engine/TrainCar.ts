import { GameObject } from './GameObject';
import { Placement } from './Placement';
import { Resources } from './Resources';
import { SpriteRect } from './SpirteRect';
import { Sprite } from './Sprite';
import { Vec2 } from './Vec2';
import { AnimationPattern } from './animations/AnimationPattern';
import { AnimationPlayer } from './animations/AnimationPlayer';
import { SmokeAnimations } from './animations/smokeAnimations';
import { Direction } from './direction';
import { Level } from './level';
import { posFromGrid } from './utils';

export interface TrainCarConfig {
  gridPos: Vec2;
  width: number;
  placementCount: number;
  color: string;
  noSprites?: boolean;
}

// 80 x 64

const buildSprite = (gridPos: Vec2, xIndex: number) => {
  return new Sprite({
    position: posFromGrid(gridPos),
    resource: Resources.trainCar,
    frameSize: new Vec2(16, 64),
    vFrames: 1,
    hFrames: 5,
    frame: xIndex
  });
};

const buildSmoke = (grid: Vec2) => {
  const smoke = new Sprite({
    position: posFromGrid(grid).add(new Vec2(14, 38)),
    resource: Resources.smoke,
    frameSize: new Vec2(150, 150),
    vFrames: 1,
    hFrames: 4,
    scale: 0.12,
    xScale: 0.24,
    animationPlayer: new AnimationPlayer({
      NORMAL: new AnimationPattern(SmokeAnimations.NORMAL)
    })
  });

  smoke.animationPlayer?.playForever('NORMAL', Math.random() * 1000, true);

  return smoke;
};

const buildSprites = (width: number) => {
  // makes the trains look less weird
  const s: Sprite[] = [];
  const w: Sprite[] = [];
  const innerSegmentCount = width - 4; // because the start and ends

  const grid = new Vec2(-1, 0);

  // add start side
  s.push(buildSprite(grid, 0));
  w.push(buildSmoke(grid));

  grid.x += 1;

  // add ladder
  s.push(buildSprite(grid, 1));
  grid.x += 1;

  // add inner segments
  for (let i = 0; i < innerSegmentCount; i++) {
    s.push(buildSprite(grid, 2));
    grid.x += 1;
  }

  // add ladder
  s.push(buildSprite(grid, 3));
  w.push(buildSmoke(grid));
  grid.x += 1;

  // add right side
  s.push(buildSprite(grid, 4));
  grid.x += 1;

  return [...s, ...w];
};

export class TrainCar extends GameObject {
  private _topPlacements: Placement[] = [];
  private _bottomPlacements: Placement[] = [];

  constructor(config: TrainCarConfig) {
    super({ position: posFromGrid(config.gridPos) });

    const placementCount = config.width - 2;

    if (!config.noSprites) {
      buildSprites(config.width).map(s => this.addChild(s));
    }

    for (let i = 0; i < placementCount; i++) {
      const topPlacement = new Placement({
        gridPos: new Vec2(i, 0)
      });
      this._topPlacements.push(topPlacement);
      this.addChild(topPlacement);

      const bottomPlacement = new Placement({
        gridPos: new Vec2(i, 2)
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
