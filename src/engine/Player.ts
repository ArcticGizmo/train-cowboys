import { GameObject } from './GameObject';
import { Resources } from './Resources';
import { Sprite } from './Sprite';
import { Vec2 } from './Vec2';

export class Player extends GameObject {
  _sprite: Sprite;

  constructor() {
    super();
    this._sprite = new Sprite({
      resource: Resources.player,
      frameSize: new Vec2(16, 16)
    });

    this.addChild(this._sprite);
  }
}
