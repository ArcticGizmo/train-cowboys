import { GameObject } from './GameObject';
import { Vec2 } from './Vec2';
import * as utils from './utils';
import { TrainCar } from './TrainCar';
import { Placement } from './Placement';

const MIN_WIDTH = 6;

export interface TrainConfig {
  gridPosition: Vec2;
  playerCount: number;
}

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
    // TODO: add engine sprite
    // will likely be a longer sprite so might need to move by more than 6
    this._cars.push(new TrainCar({ gridPos: startAt, width, placementCount, color: 'black' }));
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
  }
}
