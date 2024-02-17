import { GameObject } from './GameObject';
import { Placement } from './Placement';
import { Vec2 } from './Vec2';
import { Level } from './level.type';
import { posFromGrid } from './utils';

export interface DeathZoneConfig {
  gridPos: Vec2;
}

export class DeathZone extends GameObject {
  private topPlacement: Placement;
  private bottomPlacement: Placement;

  constructor(config: DeathZoneConfig) {
    super({ position: posFromGrid(config.gridPos) });

    this.topPlacement = new Placement({
      gridPos: new Vec2(0, 0),
      level: 'top',
      carIndex: -1,
      isDeathZone: true
    });
    this.addChild(this.topPlacement);

    this.bottomPlacement = new Placement({
      gridPos: new Vec2(0, 2),
      level: 'bottom',
      carIndex: -1,
      isDeathZone: true
    });
    this.addChild(this.bottomPlacement);
  }

  getPlacement(level: Level) {
    return level === 'top' ? this.topPlacement : this.bottomPlacement;
  }
}
