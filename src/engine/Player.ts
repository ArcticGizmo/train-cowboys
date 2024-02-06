import { GameObject } from './GameObject';
import { Resources } from './Resources';
import { Sprite } from './Sprite';
import { SpriteCircle } from './SpriteCircle';
import { Vec2 } from './Vec2';
import { AnimationPlayer, AnimationPatterns, PlayRequest } from './animations/AnimationPlayer';
import { AnimationPattern } from './animations/AnimationPattern';
import { PlayerAnimationBaseName, PlayerAnimationName, PlayerAnimations } from './animations/playerAnimations';
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

  public direction: Direction = 'left';
  public id: string;
  public isStunned = false;
  public isSelected = false;
  public loot = 0;

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
      vFrames: 30,
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

    this.playAnimation('IDLE');
  }

  set gridPos(value: Vec2) {
    this.position = posFromGrid(value);
  }

  get globalGridPos() {
    return gridFromPos(this.globalPosition);
  }

  playAnimation(base: PlayerAnimationBaseName, once = false) {
    const key = `${base}_${this.direction.toUpperCase()}` as PlayerAnimationName;
    this.playAnimationByKey(key, once);
  }

  playAnimationByKey(key: PlayerAnimationName, once = false) {
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
