import { GameObject } from '@/engine/GameObject';
import { Vec2 } from '@/engine/Vec2';
import { posFromGrid } from '@/engine/utils';
import { PlacementMarker } from './PlacementMarker';
import { ShipRoom } from './ShipRoom';
import { EndZone } from './EndZone';
import { FrontZone } from './FrontZone';

export type GameStatus = 'ongoing' | 'win' | 'draw';

export interface SpaceShipConfig {
  gridPos: Vec2;
  playerCount: number;
}

export class SpaceShip extends GameObject {
  private frontZone: FrontZone = null!;
  private rooms: ShipRoom[] = [];
  private endZone: EndZone = null!;

  constructor(config: SpaceShipConfig) {
    super({ position: posFromGrid(config.gridPos) });
    this.setup(config.playerCount);
  }

  private setup(playerCount: number) {
    this.rooms = [];

    const placementCount = Math.max(playerCount, 4);
    const startAt = Vec2.ZERO();

    this.frontZone = new FrontZone({ gridPos: startAt, roomIndex: -1 });
    startAt.x += 3;

    for (let p = 0; p < playerCount + 1; p++) {
      const room = new ShipRoom({ gridPos: startAt, placementCount, roomIndex: p, hideFrontSprites: p === 0 });
      this.rooms.push(room);
      startAt.x += 5;
    }

    // add end death zone
    this.endZone = new EndZone({ gridPos: startAt, roomIndex: playerCount + 1 });

    // attach
    this.rooms.forEach(r => this.addChild(r));
    this.addChild(this.frontZone);
    this.addChild(this.endZone);
  }

  getAllPlacements() {
    return this.root.findAllChildrenOfType(PlacementMarker);
  }

  getRoom(roomIndex: number) {
    if (roomIndex < 0) {
      roomIndex = this.rooms.length + roomIndex;
    }
    return this.rooms[roomIndex];
  }
}
