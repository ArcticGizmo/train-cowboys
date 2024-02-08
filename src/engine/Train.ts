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
  private _cars: TrainCar[] = [];
  constructor(config: TrainConfig) {
    super({
      position: utils.posFromGrid(config.gridPosition)
    });

    const width = Math.max(config.playerCount + 2, MIN_WIDTH);

    const startAt = Vec2.ZERO();
    const movePos = () => (startAt.x += width);

    const placementCount = config.playerCount;

    // build the space at the front
    this._cars.push(new TrainCar({ gridPos: startAt, width, placementCount, color: 'grey', noSprites: true }));
    movePos();

    // engine
    buildEngine(startAt, config.playerCount).forEach(g => this.addChild(g));
    this._cars.push(new TrainCar({ gridPos: startAt, width, placementCount, color: 'black', noSprites: true }));
    movePos();

    // make the train cars
    for (let carIndex = 0; carIndex < placementCount + 1; carIndex++) {
      this._cars.push(new TrainCar({ gridPos: startAt, width, placementCount, color: 'brown' }));
      movePos();
    }

    // build space at the back
    this._cars.push(new TrainCar({ gridPos: startAt, width, placementCount, color: 'grey', noSprites: true }));

    // add objects
    this._cars.forEach(c => this.addChild(c));

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
    return this._cars.flatMap(c => c.getAllPlacements());
  }

  getCar(carIndex: number) {
    if (carIndex < 0) {
      carIndex = this._cars.length + carIndex;
    }
    return this._cars[carIndex];
  }

  getCarIndexFromPlacement(placement: Placement) {
    for (let i = 0; i < this._cars.length; i++) {
      if (this._cars[i].containsPlacement(placement)) {
        return i;
      }
    }
    return -1;
  }

  getEngine() {
    return this._cars[1];
  }

  getCaboose() {
    return this.getCar(-2);
  }

  isInDeathZone(placement: Placement) {
    const index = this.getCarIndexFromPlacement(placement);
    return index === 0 || index === this._cars.length - 1;
  }

  removeCaboose() {
    if (this._cars.length <= 3) {
      throw 'Cannot remove engine';
    }
    const lastCar = this._cars.pop()!;
    lastCar.destroy(true);

    // remove sprites from last car
    this.getCar(-1).clearSprites();
  }
}
