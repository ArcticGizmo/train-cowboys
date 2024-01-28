import { PROPS } from '../constants';
import { GameObject } from '../gameObject';
import { Vec2 } from '../vec2';
import { Placement } from './placement';
import { Player } from './player';

// game area is made up of three regions
// - front fall zone
// - train cars
// - back fall zone
// during the game the train car zones can be removed

export interface GameAreaConfig {
  initialPlayerCount: number;
}

const buildPlacements = (playerCount: number): Placement[][] => {
  const placementGrid: Placement[][] = [[], []];

  const numberOfCars = playerCount + 2;

  for (let rowIndex = 0; rowIndex < 2; rowIndex++) {
    let x = 20;
    let y = 50 * (rowIndex + 1);

    const row = placementGrid[rowIndex];
    // create front falloff zone
    for (let f = 0; f < playerCount; f++) {
      row.push(
        new Placement({
          position: new Vec2(x, y),
          color: 'black',
          opacity: 0.1
        })
      );
      x += PROPS.train.placementGap;
    }

    x += PROPS.train.carSpacing;

    // create train cars
    for (let car = 0; car < numberOfCars; car++) {
      for (let i = 0; i < playerCount; i++) {
        row.push(
          new Placement({
            position: new Vec2(x, y),
            color: car === 0 ? 'black' : 'brown'
          })
        );
        x += PROPS.train.placementGap;
      }
      x += PROPS.train.carSpacing;
    }

    // create back falloff zone
    for (let b = 0; b < playerCount; b++) {
      row.push(
        new Placement({
          position: new Vec2(x, y),
          color: 'black',
          opacity: 0.1
        })
      );
      x += PROPS.train.placementGap;
    }
  }

  return placementGrid;
};

export class GameArea extends GameObject {
  private _placements: Placement[][] = [];
  private _initialPlayerCount: number;

  constructor(config: GameAreaConfig) {
    super();
    this._initialPlayerCount = config.initialPlayerCount;
    this._placements = buildPlacements(config.initialPlayerCount);
    this._placements.flat().forEach(p => this.addChild(p));
  }

  movePlayerTo(player: Player, index: Vec2) {
    const placement = this._placements[index.y]?.[index.x];
    if (!placement) {
      console.warn('Unable to move to placement index', index);
      return;
    }
    player.position.set(placement.position);
  }

  getPlacement(index: Vec2) {
    return this._placements[index.y]?.[index.x];
  }

  getIndexForCar(carIndex: number, side: 'front' | 'back', level: 'top' | 'bottom') {
    const rowIndex = level === 'top' ? 0 : 1;

    let colIndex = (carIndex + 1) * this._initialPlayerCount;
    if (side == 'back') {
      colIndex += this._initialPlayerCount - 1;
    }
    return new Vec2(colIndex, rowIndex);
  }

  isValidPlacement(index: Vec2) {
    return this._placements[index.y]?.[index.x] != null;
  }
}
