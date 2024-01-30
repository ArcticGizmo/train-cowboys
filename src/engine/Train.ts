import { GameObject } from './GameObject';
import { Vec2 } from './Vec2';
import * as utils from './utils';
import { Car } from './Car';
import { Placement } from './Placement';

export interface TrainConfig {
  gridPosition: Vec2;
  playerCount: number;
}

export class Train extends GameObject {
  private _cars: Car[] = [];
  constructor(config: TrainConfig) {
    super({
      position: utils.posFromGrid(config.gridPosition)
    });

    const startAt = Vec2.ZERO();
    const placementCount = config.playerCount;

    // build the space at the front
    this._cars.push(new Car({ gridPos: startAt, placementCount, color: 'grey' }));
    startAt.x += placementCount + 1;

    // engine
    this._cars.push(new Car({ gridPos: startAt, placementCount, color: 'black' }));
    startAt.x += placementCount + 1;

    // make the train cars
    for (let carIndex = 0; carIndex < placementCount + 1; carIndex++) {
      this._cars.push(new Car({ gridPos: startAt, placementCount, color: 'brown' }));
      startAt.x += placementCount + 1;
    }

    // build space at the back
    this._cars.push(new Car({ gridPos: startAt, placementCount, color: 'grey' }));

    // add objects
    this._cars.forEach(c => this.addChild(c));
  }

  getCar(carIndex: number) {
    return this._cars[carIndex];
  }

  getCarIndexFromPlacement(placement: Placement) {
    for (let i = 0; i < this._cars.length; i++) {
      if (this._cars[i].containsPlacement(placement)) {
        return i;
      }
    }

    // this should not happen
    return -1;
  }

  getEngine() {
    return this._cars[2];
  }
}
