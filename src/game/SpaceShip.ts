import { GameObject } from '@/engine/GameObject';
import { Vec2 } from '@/engine/Vec2';
import { GRID_SIZE, gridFromPos, posFromGrid } from '@/engine/utils';
import { PlacementMarker } from './PlacementMarker';
import { Sprite } from '@/engine/Sprite';
import { Resources } from '@/engine/Resources';

const TOP = 1;
const BOTTOM = 3;

export type GameStatus = 'ongoing' | 'win' | 'draw';

export interface SpaceShipConfig {
  gridPos: Vec2;
  playerCount: number;
}

const buildSegmentSprite = (gridPos: Vec2, frame: number) => {
  return new Sprite({
    resource: Resources.station,
    position: posFromGrid(gridPos),
    frameSize: new Vec2(GRID_SIZE, 5 * GRID_SIZE),
    vFrames: 17,
    hFrames: 17,
    frame
  });
};

const buildEngineSprites = (xPos: number) => {
  const engineLeft = new Sprite({
    position: posFromGrid(new Vec2(xPos, 5)),
    resource: Resources.station,
    frameSize: new Vec2(GRID_SIZE * 4, GRID_SIZE),
    vFrames: 7,
    hFrames: 1,
    frame: 6
  });

  const engineEffectLeft = new Sprite({
    position: posFromGrid(new Vec2(xPos + 3, 5)),
    resource: Resources.station,
    frameSize: new Vec2(GRID_SIZE, GRID_SIZE),
    vFrames: 6,
    hFrames: 5,
    frame: 29
  });

  const engineRight = new Sprite({
    position: posFromGrid(new Vec2(xPos, -1)),
    resource: Resources.station,
    frameSize: new Vec2(GRID_SIZE * 4, GRID_SIZE),
    vFrames: 7,
    hFrames: 1,
    frame: 5
  });

  const engineEffectRight = new Sprite({
    position: posFromGrid(new Vec2(xPos + 3, -1)),
    resource: Resources.station,
    frameSize: new Vec2(GRID_SIZE, GRID_SIZE),
    vFrames: 6,
    hFrames: 5,
    frame: 29
  });

  return [engineLeft, engineEffectLeft, engineRight, engineEffectRight];
};

const buildPlacements = (gridPos: Vec2, regionIndex: number) => {
  return [
    new PlacementMarker({ gridPos: new Vec2(gridPos.x, TOP), regionIndex }),
    new PlacementMarker({ gridPos: new Vec2(gridPos.x, BOTTOM), regionIndex })
  ];
};

export class SpaceShip extends GameObject {
  constructor(config: SpaceShipConfig) {
    super({ position: posFromGrid(config.gridPos) });
    this.setup(config.playerCount);
  }

  setup(playerCount: number) {
    // TODO: break this up into smaller components
    // make it so that sprite overlap for simplicity
    // (this will make it easier to animate)
    const placeCount = Math.max(playerCount, 4);
    const startAt = Vec2.ZERO();
    const sprites: Sprite[] = [];
    const placements: PlacementMarker[] = [];

    const moveRight = (step = 1) => (startAt.x += step);

    // build the placements outside the ship
    placements.push(...buildPlacements(startAt, 0));
    moveRight();

    // build the front of the ship
    sprites.push(buildSegmentSprite(startAt, 0));
    moveRight();
    sprites.push(buildSegmentSprite(startAt, 1));
    moveRight();
    sprites.push(buildSegmentSprite(startAt, 2));
    moveRight();
    sprites.push(buildSegmentSprite(startAt, 3));
    moveRight();

    // build the cockpit
    placements.push(...buildPlacements(startAt, 1));
    sprites.push(buildSegmentSprite(startAt, 4));
    sprites.push(...buildEngineSprites(startAt.x));
    moveRight();

    placements.push(...buildPlacements(startAt, 1));
    sprites.push(buildSegmentSprite(startAt, 5));
    moveRight();

    for (let i = 0; i < placeCount - 4; i++) {
      placements.push(...buildPlacements(startAt, 1));
      sprites.push(buildSegmentSprite(startAt, 6));
      moveRight();
    }

    placements.push(...buildPlacements(startAt, 1));
    sprites.push(buildSegmentSprite(startAt, 7));
    moveRight();
    placements.push(...buildPlacements(startAt, 1));
    sprites.push(buildSegmentSprite(startAt, 8));
    moveRight();

    // create playerCount + 1 segments
    for (let seg = 0; seg < playerCount; seg++) {
      const regionIndex = seg + 2;
      sprites.push(buildSegmentSprite(startAt, 9));
      moveRight();
      sprites.push(...buildEngineSprites(startAt.x));
      placements.push(...buildPlacements(startAt, regionIndex));
      sprites.push(buildSegmentSprite(startAt, 8));
      moveRight();
      placements.push(...buildPlacements(startAt, regionIndex));
      sprites.push(buildSegmentSprite(startAt, 5));
      moveRight();
      for (let i = 0; i < placeCount - 4; i++) {
        placements.push(...buildPlacements(startAt, regionIndex));
        sprites.push(buildSegmentSprite(startAt, 6));
        moveRight();
      }
      placements.push(...buildPlacements(startAt, regionIndex));
      sprites.push(buildSegmentSprite(startAt, 7));
      moveRight();
      placements.push(...buildPlacements(startAt, regionIndex));
      sprites.push(buildSegmentSprite(startAt, 8));
      moveRight();
    }

    // add the back portion
    startAt.x -= 1;
    sprites.push(buildSegmentSprite(startAt, 10));
    moveRight();
    sprites.push(buildSegmentSprite(startAt, 11));
    moveRight();
    placements.push(...buildPlacements(startAt, playerCount + 1));

    // attach
    sprites.forEach(s => this.addChild(s));
    placements.forEach(p => this.addChild(p));
  }
}
