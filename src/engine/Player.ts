import { GameObject } from './GameObject';
import { Resources } from './Resources';
import { Sprite } from './Sprite';
import { Vec2 } from './Vec2';
import { gridFromPos, posFromGrid } from './utils';

export interface PlayerConfig {
  gridPos?: Vec2;
}

export class Player extends GameObject {
  private _sprite: Sprite;
  private _direction = new Vec2(1, 0);

  constructor(config: PlayerConfig) {
    super({ position: posFromGrid(config.gridPos ?? Vec2.ZERO()) });
    this._sprite = new Sprite({
      resource: Resources.player,
      frameSize: new Vec2(16, 16),
      hFrames: 3,
      vFrames: 4,
      frame: 6
    });

    this.addChild(this._sprite);
  }

  get gridPos() {
    return gridFromPos(this.position);
  }

  step(delta: number) {
    this._sprite.frame = this._direction.x === 1 ? 6 : 9;
  }

  turn() {
    this._direction.x *= -1;
  }

  move() {
    // find next marker in the line
  }

  shoot() {}

  impacted() {}

  climb() {}
}
