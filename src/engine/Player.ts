import { GameObject } from './GameObject';
import { Placement } from './Placement';
import { Resources } from './Resources';
import { Sprite } from './Sprite';
import { Vec2 } from './Vec2';
import { getNextHorizontalPlacement, getNextVerticalPlacement, gridFromPos, posFromGrid } from './utils';

export interface PlayerConfig {
  gridPos?: Vec2;
}

export class Player extends GameObject {
  private _sprite: Sprite;
  private _direction: 'forward' | 'back' = 'forward';

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

  get globalGridPos() {
    return gridFromPos(this.globalPosition);
  }

  step(delta: number) {
    this._sprite.frame = this._direction === 'forward' ? 6 : 9;
  }

  turn() {
    this._direction = this._direction === 'forward' ? 'back' : 'forward';
  }

  move() {
    // find next marker in the line
    const placements = this.root.findAllChildrenOfType(Placement);
    const placement = getNextHorizontalPlacement(placements, this.globalGridPos, this._direction);
    this.position = posFromGrid(placement.globalGridPos);
  }

  shoot() {}

  impacted() {}

  climb() {
    const placements = this.root.findAllChildrenOfType(Placement);
    const placement = getNextVerticalPlacement(placements, this.globalGridPos);
    this.position = posFromGrid(placement.globalGridPos);
  }
}
