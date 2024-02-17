import { GameObject } from '@/engine/GameObject';
import { Vec2 } from '@/engine/Vec2';
import { GRID_SIZE, gridFromPos, posFromGrid } from '@/engine/utils';
import { PlacementMarker } from './PlacementMarker';
import { Sprite } from '@/engine/Sprite';
import { Resources } from '@/engine/Resources';
import { ShipCockpit } from './ShipCockpit';
import { ShipRoom } from './ShipRoom';
import { DeathZone } from './DeathZone';

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
    const placementCount = Math.max(playerCount, 4);
    const startAt = Vec2.ZERO();

    const cockpit = new ShipCockpit({ gridPos: startAt, placementCount });
    this.addChild(cockpit);
    startAt.x += 8;

    for (let p = 0; p < playerCount; p++) {
      const room = new ShipRoom({ gridPos: startAt, placementCount, regionIndex: 1 });
      this.addChild(room);
      startAt.x += 5;
    }

    // add end death zone
    const endZone = new DeathZone({ gridPos: startAt, regionIndex: 10 });
    this.addChild(endZone);
  }
}
