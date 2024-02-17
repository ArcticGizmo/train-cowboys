import { GameObject } from './GameObject';
import { Placement } from './Placement';
import { Resources } from './Resources';
import { Sprite } from './Sprite';
import { Vec2 } from './Vec2';
import { AnimationPattern } from './animations/AnimationPattern';
import { AnimationPlayer } from './animations/AnimationPlayer';
import { SmokeAnimations } from './animations/smokeAnimations';
import { Direction } from './direction.type';
import { Level } from './level.type';
import { posFromGrid } from './utils';

export interface TrainCarConfig {
  gridPos: Vec2;
  width: number;
  carIndex: number;
  placementCount: number;
  noSprites?: boolean;
}

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
    position: posFromGrid(grid).add(new Vec2(14, 44)),
    resource: Resources.smoke,
    frameSize: new Vec2(150, 150),
    vFrames: 1,
    hFrames: 4,
    scale: 0.08,
    xScale: 0.24,
    opacity: 0.5,
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

  return [...s];
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
        gridPos: new Vec2(i, 0),
        level: 'top',
        carIndex: config.carIndex
      });
      this._topPlacements.push(topPlacement);
      this.addChild(topPlacement);

      const bottomPlacement = new Placement({
        gridPos: new Vec2(i, 2),
        level: 'bottom',
        carIndex: config.carIndex
      });
      this._bottomPlacements.push(bottomPlacement);
      this.addChild(bottomPlacement);
    }
  }

  clearSprites() {
    const keep: GameObject[] = [];

    for (let c of this.children) {
      if (c instanceof Sprite) {
        c.destroy();
      } else {
        keep.push(c);
      }
    }

    this.children = keep;
  }

  getEnteringPlacement(level: Level, enterFrom: Direction) {
    const placements = level === 'top' ? this._topPlacements : this._bottomPlacements;
    return enterFrom === 'left' ? placements[0] : placements[placements.length - 1];
  }

  getBottomLeftPlacement() {
    return this.getEnteringPlacement('bottom', 'right');
  }

  getAllPlacements() {
    return [...this._topPlacements, ...this._bottomPlacements];
  }

  getClimbTarget(curLevel: Level, direction: Direction) {
    // get left and right target placements
    const placementsOnLevel = this.getAllPlacements().filter(p => p.level !== curLevel);
    placementsOnLevel.sort((a, b) => a.globalGridPos.x - b.globalGridPos.x);

    return direction === 'right' ? placementsOnLevel[0] : placementsOnLevel[placementsOnLevel.length - 1];
  }
}
