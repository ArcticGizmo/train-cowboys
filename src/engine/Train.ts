import { start } from 'repl';
import { GameObject } from './GameObject';
import { Placement } from './Placement';
import { SpriteRect } from './SpirteRect';
import { Vec2 } from './Vec2';
import * as utils from './utils';

export interface TrainConfig {
  gridPosition: Vec2;
  playerCount: number;
}

interface CarConfig {
  gridPos: Vec2;
  placementCount: number;
  color: string;
}

class Car extends GameObject {
  private _topPlacements: Placement[] = [];
  private _bottomPlacements: Placement[] = [];

  constructor(config: CarConfig) {
    super({ position: utils.posFromGrid(config.gridPos) });
    this.addChild(
      new SpriteRect({
        position: Vec2.ZERO(),
        size: utils.posFromGrid(new Vec2(2, 4)),
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

  getPlacement(level: 'top' | 'bottom', enterFrom: 'front' | 'back') {
    const placements = level === 'top' ? this._topPlacements : this._bottomPlacements;
    return enterFrom === 'front' ? placements[0] : placements[placements.length - 1];
  }
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
    return this._cars[carIndex + 1];
  }

  getEngine() {
    return this._cars[2];
  }
}
