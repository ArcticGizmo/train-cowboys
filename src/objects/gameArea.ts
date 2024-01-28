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

// class Grid {
//   cheese
// }

const buildPlacements = (playerCount: number): Placement[][] => {
  const placementGrid: Placement[][] = [[], []];

  // for (let row = 0; row < 2; row++) {
  //   for (let col = 0; col < length; col++) {
  //     const index = new Vec2(col, row);
  //     // TODO: position should be a render concern, not a logic concern
  //     // There will need to be padding applied potentially
  //     const position = new Vec2(basePosition.x + col * 20, basePosition.y + row * 50);
  //     const placement = new Placement({ index, position, color: 'blue' });
  //     placementGrid[row][col] = placement;
  //   }
  // }

  const numberOfCars = playerCount + 2;

  for (let rowIndex = 0; rowIndex < 2; rowIndex++) {
    let x = 50;
    let y = 50 * (rowIndex + 1);

    const row = placementGrid[rowIndex];
    // create front falloff zone
    for (let f = 0; f < Math.ceil(playerCount / 2); f++) {
      row.push(
        new Placement({
          position: new Vec2(x, y),
          color: 'black',
          opacity: 0.25
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
    for (let b = 0; b < Math.ceil(playerCount / 2); b++) {
      row.push(
        new Placement({
          position: new Vec2(x, y),
          color: 'black',
          opacity: 0.25
        })
      );
      x += PROPS.train.placementGap;
    }
  }

  return placementGrid;
};

export class GameArea extends GameObject {
  private _placements: Placement[][] = [];

  constructor(config: GameAreaConfig) {
    super();
    this._placements = buildPlacements(config.initialPlayerCount);
    this._placements.flat().forEach(p => this.addChild(p));
  }

  movePlayerTo(player: Player, index: Vec2) {
    const placement = this._placements[index.y][index.x];
    player.moveTo(placement.position);
  }

  isValidPlacement(index: Vec2) {
    return this._placements[index.y]?.[index.x] != null;
  }
}
