import { GameObject } from './GameObject';
import { Vec2 } from './Vec2';
import * as utils from './utils';
import { TrainCar } from './TrainCar';
import { Placement } from './Placement';
import { Sprite } from './Sprite';
import { Resources } from './Resources';
import { AnimationPlayer } from './animations/AnimationPlayer';
import { AnimationPattern } from './animations/AnimationPattern';
import { SmokeAnimations } from './animations/smokeAnimations';
import { SpriteRect } from './SpirteRect';
import { DeathZone } from './DeathZone';
import { Direction } from './direction.type';
import { Level } from './level.type';

const MIN_WIDTH = 6;

export interface TrainConfig {
  gridPosition: Vec2;
  playerCount: number;
}

const buildSprite = (gridPos: Vec2, xIndex: number) => {
  return new Sprite({
    position: utils.posFromGrid(gridPos),
    resource: Resources.trainCar,
    frameSize: new Vec2(16, 64),
    vFrames: 1,
    hFrames: 12,
    frame: xIndex + 5
  });
};

const buildSmoke = (grid: Vec2) => {
  const smoke = new Sprite({
    position: utils.posFromGrid(grid).add(new Vec2(20, 44)),
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

const buildEngine = (startAt: Vec2, playerCount: number) => {
  const s: GameObject[] = [];
  const w: Sprite[] = [];

  const grid = startAt.copy();
  grid.x -= playerCount + 1;

  // build the front part of the engine
  s.push(buildSprite(grid, 0));
  grid.x += 1;

  s.push(buildSprite(grid, 1));
  w.push(buildSmoke(grid));
  grid.x += 1;

  s.push(buildSprite(grid, 2));
  w.push(buildSmoke(grid));
  grid.x += 1;

  s.push(buildSprite(grid, 3));
  grid.x += 1;

  // expandable zone
  const segCount = Math.max(playerCount, 0);
  for (let i = 0; i < segCount; i++) {
    s.push(buildSprite(grid, 4));
    grid.x += 1;
  }

  w.push(buildSmoke(grid.copy().add(new Vec2(-1, 0))));

  // build end of train
  s.push(buildSprite(grid, 5));
  grid.x += 1;
  s.push(buildSprite(grid, 6));

  return [...s];
};

export class Train extends GameObject {
  private frontZone: DeathZone = null!;
  private backZone: DeathZone = null!;
  private cars: TrainCar[] = [];
  constructor(config: TrainConfig) {
    super({
      position: utils.posFromGrid(config.gridPosition)
    });

    const width = Math.max(config.playerCount + 2, MIN_WIDTH);

    const startAt = Vec2.ZERO();
    const movePos = () => (startAt.x += width);

    const placementCount = config.playerCount;

    // build front death zone
    this.frontZone = new DeathZone({ gridPos: startAt });
    startAt.x += 5;

    // engine
    buildEngine(startAt, config.playerCount).forEach(g => this.addChild(g));
    this.cars.push(new TrainCar({ gridPos: startAt, width, placementCount, noSprites: true, carIndex: 0 }));
    movePos();

    // make the train cars
    for (let carIndex = 0; carIndex < placementCount + 1; carIndex++) {
      this.cars.push(new TrainCar({ gridPos: startAt, width, placementCount, carIndex: carIndex + 1 }));
      movePos();
    }

    // build back death zone
    this.backZone = new DeathZone({ gridPos: startAt });

    // add cars
    this.cars.forEach(c => this.addChild(c));

    // add death zones
    this.addChild(this.frontZone);
    this.addChild(this.backZone);

    // Add train track
    this.addChild(
      new SpriteRect({
        position: new Vec2(-100, 56),
        color: 'grey',
        size: new Vec2(10_000, 2)
      })
    );
  }

  getAllPlacements() {
    return this.root.findAllChildrenOfType(Placement);
  }

  getCar(carIndex: number) {
    return this.cars[carIndex];
  }

  getCarFromBack(carIndex: number) {
    return this.cars[this.cars.length - carIndex - 1];
  }

  getEngine() {
    return this.cars[0];
  }

  getCaboose() {
    return this.getCarFromBack(0);
  }

  removeCaboose() {
    // TODO: need to move the death zone around
    if (this.cars.length <= 3) {
      throw 'Cannot remove engine';
    }
    const lastCar = this.cars.pop()!;
    lastCar.destroy(true);

    // remove sprites from last car
    this.getCar(-1).clearSprites();
  }

  getNextHorizontalMovePlacement(curPlacement: Placement, direction: Direction) {
    const { carIndex, level } = curPlacement;

    if (direction === 'left') {
      return this.getCar(carIndex - 1)?.getEnteringPlacement(level, 'right') || this.frontZone.getPlacement(curPlacement.level);
    } else {
      return this.getCar(carIndex + 1)?.getEnteringPlacement(level, 'left') || this.backZone.getPlacement(curPlacement.level);
    }
  }

  getClimbTarget(carIndex: number, curLevel: Level, direction: Direction) {
    return this.getCar(carIndex).getClimbTarget(curLevel, direction);
  }

  getNextHorizontalBumpPlacement(curPlacement: Placement, direction: Direction) {
    const placements = this.getAllPlacements();
    let relevant = placements.filter(p => (p.level = curPlacement.level));
    if (direction === 'left') {
      relevant = relevant.filter(p => p.globalGridPos.x < curPlacement.globalGridPos.x);
      relevant.sort((a, b) => b.globalGridPos.x - a.globalGridPos.x);
      return relevant[0];
    } else {
      relevant = relevant.filter(p => p.globalGridPos.x > curPlacement.globalGridPos.x);
      relevant.sort((a, b) => a.globalGridPos.x - b.globalGridPos.x);
      return relevant[0];
    }
  }
}
