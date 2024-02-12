import { GameObject } from '@/engine/GameObject';
import { Vec2 } from '@/engine/Vec2';
import { GRID_SIZE, gridFromPos, posFromGrid } from '@/engine/utils';
import { PlacementMarker } from './PlacementMarker';
import { Sprite } from '@/engine/Sprite';
import { Resources } from '@/engine/Resources';

const LEFT = 1;
const RIGHT = 3;

export type GameStatus = 'ongoing' | 'win' | 'draw';

export interface SpaceShipConfig {
  gridPos: Vec2;
  playerCount: number;
}

const buildSegmentSprite = (gridPos: Vec2, frame: number) => {
  return new Sprite({
    resource: Resources.station,
    position: posFromGrid(gridPos),
    frameSize: new Vec2(5 * GRID_SIZE, GRID_SIZE),
    vFrames: 20,
    hFrames: 1,
    frame
  });
};

const buildPlacements = (gridPos: Vec2, regionIndex: number) => {
  return [
    new PlacementMarker({ gridPos: new Vec2(LEFT, gridPos.y), regionIndex }),
    new PlacementMarker({ gridPos: new Vec2(RIGHT, gridPos.y), regionIndex })
  ];
};

export class SpaceShip extends GameObject {
  constructor(config: SpaceShipConfig) {
    super({ position: posFromGrid(config.gridPos) });
    this.setup(config.playerCount);
  }

  setup(playerCount: number) {
    const placeCount = Math.max(playerCount, 4);
    const startAt = Vec2.ZERO();
    const sprites: Sprite[] = [];
    const placements: PlacementMarker[] = [];

    const moveDown = (step = 1) => (startAt.y += step);

    // build the placements outside the ship
    placements.push(...buildPlacements(startAt, 0));
    moveDown();

    // build the front of the ship
    sprites.push(
      new Sprite({
        resource: Resources.station,
        position: posFromGrid(new Vec2(0, startAt.y)),
        frameSize: new Vec2(5 * GRID_SIZE, 4 * GRID_SIZE)
      })
    );
    moveDown(4);

    placements.push(...buildPlacements(startAt, 1));
    sprites.push(buildSegmentSprite(startAt, 4));
    moveDown();

    // build the cockpit
    placements.push(...buildPlacements(startAt, 1));
    sprites.push(buildSegmentSprite(startAt, 6));
    moveDown();

    for (let i = 0; i < placeCount - 4; i++) {
      placements.push(...buildPlacements(startAt, 1));
      sprites.push(buildSegmentSprite(startAt, 8));
      moveDown();
    }

    placements.push(...buildPlacements(startAt, 1));
    sprites.push(buildSegmentSprite(startAt, 10));
    moveDown();
    placements.push(...buildPlacements(startAt, 1));
    sprites.push(buildSegmentSprite(startAt, 11));
    moveDown();

    // create playerCount + 1 segments
    for (let seg = 0; seg < playerCount; seg++) {
      const regionIndex = seg + 2;
      sprites.push(buildSegmentSprite(startAt, 13));
      moveDown();
      placements.push(...buildPlacements(startAt, regionIndex));
      sprites.push(buildSegmentSprite(startAt, 11));
      moveDown();
      for (let i = 0; i < placeCount - 4; i++) {
        placements.push(...buildPlacements(startAt, regionIndex));
        sprites.push(buildSegmentSprite(startAt, 8));
        moveDown();
      }
      placements.push(...buildPlacements(startAt, regionIndex));
      sprites.push(buildSegmentSprite(startAt, 8));
      moveDown();
      placements.push(...buildPlacements(startAt, regionIndex));
      sprites.push(buildSegmentSprite(startAt, 10));
      moveDown();
      placements.push(...buildPlacements(startAt, regionIndex));
      sprites.push(buildSegmentSprite(startAt, 11));
      moveDown();
    }

    sprites.push(buildSegmentSprite(startAt, 16))
    moveDown();
    placements.push(...buildPlacements(startAt, playerCount + 1));

    // attach
    sprites.forEach(s => this.addChild(s));
    placements.forEach(p => this.addChild(p));
  }
}
