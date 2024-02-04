import { GameObject } from './GameObject';
import { Resources } from './Resources';
import { Sprite } from './Sprite';
import { SpriteCircle } from './SpriteCircle';
import { Vec2 } from './Vec2';
import { AnimationPlayer, AnimationPatterns, PlayRequest } from './animations/AnimationPlayer';
import { AnimationPattern } from './animations/AnimationPattern';
import { PlayerAnimationName, PlayerAnimations } from './animations/playerAnimations';
import { Direction } from './direction';
import { gridFromPos, posFromGrid } from './utils';

export interface PlayerConfig {
  id: string;
  gridPos?: Vec2;
  color: string;
}

export class Player extends GameObject {
  private _sprite: Sprite;
  private _indicator: SpriteCircle;

  public direction: Direction = 'right';
  public id: string;
  public isAlive = true;
  public isStunned = false;
  public isSelected = false;

  constructor(config: PlayerConfig) {
    super({ position: posFromGrid(config.gridPos ?? Vec2.ZERO()) });

    this.id = config.id;

    const animationPlayerConfig: AnimationPatterns = {};
    Object.entries(PlayerAnimations).forEach(([key, value]) => {
      animationPlayerConfig[key] = new AnimationPattern(value);
    });

    this._sprite = new Sprite({
      resource: Resources.player,
      frameSize: new Vec2(16, 16),
      hFrames: 5,
      vFrames: 25,
      frame: 0,
      animationPlayer: new AnimationPlayer(animationPlayerConfig)
    });

    this.addChild(this._sprite);

    this._indicator = new SpriteCircle({
      position: new Vec2(8, -4),
      radius: 1,
      color: config.color
    });

    this.addChild(this._indicator);
  }

  set gridPos(value: Vec2) {
    this.position = posFromGrid(value);
  }

  get globalGridPos() {
    return gridFromPos(this.globalPosition);
  }

  playAnimation(key: PlayerAnimationName, once = false) {
    this._sprite.animationPlayer?.play({
      key,
      once
    });
  }

  select() {
    this.isSelected = true;
    this._indicator.radius = 3;
  }

  unselect() {
    this.isSelected = false;
    this._indicator.radius = 1;
  }

  changeDirection() {
    this.direction = this.direction === 'left' ? 'right' : 'left';
  }
}
