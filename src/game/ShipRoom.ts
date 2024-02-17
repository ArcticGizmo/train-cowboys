import { GameObject } from '@/engine/GameObject';
import { Sprite } from '@/engine/Sprite';
import { Vec2 } from '@/engine/Vec2';
import { GRID_SIZE, posFromGrid } from '@/engine/utils';
import { PlacementMarker } from './PlacementMarker';
import { Resources } from '@/engine/Resources';
import { Level } from './level.type';
import { Direction } from './direction.type';

const TOP = 1;
const BOTTOM = 3;

export interface ShipRoomConfig {
  gridPos: Vec2;
  placementCount: number;
  roomIndex: number;
  hideFrontSprites?: boolean;
}

const buildPlacements = (gridPos: Vec2, roomIndex: number) => {
  return [
    new PlacementMarker({ gridPos: new Vec2(gridPos.x, TOP), roomIndex, level: 'top' }),
    new PlacementMarker({ gridPos: new Vec2(gridPos.x, BOTTOM), roomIndex, level: 'bottom' })
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

export class ShipRoom extends GameObject {
  private sprites: Sprite[] = [];
  private placements: PlacementMarker[] = [];

  constructor(config: ShipRoomConfig) {
    super({ position: posFromGrid(config.gridPos) });

    const startAt = Vec2.ZERO();
    const roomIndex = config.roomIndex;
    const sprites = this.sprites;
    const placements = this.placements;

    const moveRight = (step = 1) => (startAt.x += step);

    // TODO: build the overlap to the previous shuttle
    if (!config.hideFrontSprites) {
      sprites.push(buildSegmentSprite(startAt, 8));
    }
    moveRight();
    if (!config.hideFrontSprites) {
      sprites.push(buildSegmentSprite(startAt, 9));
    }
    moveRight();

    // create room
    sprites.push(...buildEngineSprites(startAt.x));
    placements.push(...buildPlacements(startAt, roomIndex));
    sprites.push(buildSegmentSprite(startAt, 8));
    moveRight();
    placements.push(...buildPlacements(startAt, roomIndex));
    sprites.push(buildSegmentSprite(startAt, 5));
    moveRight();
    for (let i = 0; i < config.placementCount - 4; i++) {
      placements.push(...buildPlacements(startAt, roomIndex));
      sprites.push(buildSegmentSprite(startAt, 6));
      moveRight();
    }
    placements.push(...buildPlacements(startAt, roomIndex));
    sprites.push(buildSegmentSprite(startAt, 7));
    moveRight();
    placements.push(...buildPlacements(startAt, roomIndex));
    sprites.push(buildSegmentSprite(startAt, 8));

    // attach
    sprites.forEach(s => this.addChild(s));
    placements.forEach(p => this.addChild(p));
  }

  private getTopPlacements() {
    return this.placements.filter(p => p.level === 'top');
  }

  private getBottomPlacements() {
    return this.placements.filter(p => p.level === 'bottom');
  }

  getEnteringPlacement(level: Level, enteringFrom: Direction) {
    const placements = level === 'top' ? this.getTopPlacements() : this.getBottomPlacements();
    return enteringFrom === 'left' ? placements[0] : placements[placements.length - 1];
  }

  getPlacements() {
    return this.placements;
  }
}
