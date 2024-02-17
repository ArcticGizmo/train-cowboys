import { GameObject } from '@/engine/GameObject';
import { Sprite } from '@/engine/Sprite';
import { Vec2 } from '@/engine/Vec2';
import { GRID_SIZE, posFromGrid } from '@/engine/utils';
import { PlacementMarker } from './PlacementMarker';
import { Resources } from '@/engine/Resources';

const TOP = 1;
const BOTTOM = 3;

export interface ShipCockpitConfig {
  gridPos: Vec2;
  placementCount: number;
}

const buildPlacements = (gridPos: Vec2, regionIndex: number) => {
  return [
    new PlacementMarker({ gridPos: new Vec2(gridPos.x, TOP), regionIndex }),
    new PlacementMarker({ gridPos: new Vec2(gridPos.x, BOTTOM), regionIndex })
  ];
};

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

export class ShipCockpit extends GameObject {
  private sprites: Sprite[] = [];
  private placements: PlacementMarker[] = [];

  constructor(config: ShipCockpitConfig) {
    super({ position: posFromGrid(config.gridPos) });

    const startAt = Vec2.ZERO();

    const placementCount = config.placementCount;

    const moveRight = (step = 1) => (startAt.x += step);

    const placements = this.placements;
    const sprites = this.sprites;

    // build the placements outside the ship
    placements.push(...buildPlacements(startAt, 0));
    moveRight();

    // build the nose cone
    sprites.push(buildSegmentSprite(startAt, 0));
    moveRight();
    sprites.push(buildSegmentSprite(startAt, 1));
    moveRight();
    sprites.push(buildSegmentSprite(startAt, 2));
    moveRight();
    sprites.push(buildSegmentSprite(startAt, 3));
    moveRight();

    // build the playable area
    placements.push(...buildPlacements(startAt, 1));
    sprites.push(buildSegmentSprite(startAt, 4));
    sprites.push(...buildEngineSprites(startAt.x));
    moveRight();

    placements.push(...buildPlacements(startAt, 1));
    sprites.push(buildSegmentSprite(startAt, 5));
    moveRight();

    for (let i = 0; i < placementCount - 4; i++) {
      placements.push(...buildPlacements(startAt, 1));
      sprites.push(buildSegmentSprite(startAt, 6));
      moveRight();
    }

    placements.push(...buildPlacements(startAt, 1));
    sprites.push(buildSegmentSprite(startAt, 7));
    moveRight();
    placements.push(...buildPlacements(startAt, 1));
    sprites.push(buildSegmentSprite(startAt, 10));
    moveRight();
    sprites.push(buildSegmentSprite(startAt, 11));
    moveRight();

    // add to game
    sprites.forEach(o => this.addChild(o));
    placements.forEach(o => this.addChild(o));
  }
}
