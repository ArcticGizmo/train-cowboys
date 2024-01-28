import { GameObject } from '../gameObject';
import { Vec2 } from '../vec2';
import { Placement } from './placement';

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
  const frontZone = playerCount;
  const backZone = playerCount;
  const trainCars = playerCount * playerCount;
  const length = frontZone + backZone + trainCars;

  const basePosition = new Vec2(50, 50);

  const placementGrid: Placement[][] = [[], []];

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < length; col++) {
      const index = new Vec2(col, row);
      // TODO: position should be a render concern, not a logic concern
      // There will need to be padding applied potentially
      const position = new Vec2(basePosition.x + col * 20, basePosition.y + row * 50);
      const placement = new Placement({ index, position, color: 'blue' });
      placementGrid[row][col] = placement;
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
}
