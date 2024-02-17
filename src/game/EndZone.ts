import { GameObject } from '@/engine/GameObject';
import { Vec2 } from '@/engine/Vec2';
import { GRID_SIZE, posFromGrid } from '@/engine/utils';
import { PlacementMarker } from './PlacementMarker';
import { Sprite } from '@/engine/Sprite';
import { Resources } from '@/engine/Resources';

const TOP = 1;
const BOTTOM = 3;

export interface EndZoneConfig {
  gridPos: Vec2;
  roomIndex: number;
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

const buildPlacements = (gridPos: Vec2, roomIndex: number) => {
  return [
    new PlacementMarker({ gridPos: new Vec2(gridPos.x, TOP), roomIndex, level: 'top' }),
    new PlacementMarker({ gridPos: new Vec2(gridPos.x, BOTTOM), roomIndex, level: 'bottom' })
  ];
};

export class EndZone extends GameObject {
  constructor(config: EndZoneConfig) {
    super({ position: posFromGrid(config.gridPos) });

    const startAt = Vec2.ZERO();
    const moveRight = (step = 1) => (startAt.x += step);

    const placements: PlacementMarker[] = [];
    const sprites: Sprite[] = [];

    sprites.push(buildSegmentSprite(startAt, 10));
    moveRight();
    sprites.push(buildSegmentSprite(startAt, 11));
    moveRight();
    placements.push(...buildPlacements(startAt, config.roomIndex));

    sprites.forEach(s => this.addChild(s));
    placements.forEach(p => this.addChild(p));
  }
}