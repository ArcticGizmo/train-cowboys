import { GameObject } from '../engine/GameObject';
import { Resources } from '../engine/Resources';
import { Sprite } from '../engine/Sprite';
import { SpriteCircle } from '../engine/SpriteCircle';
import { Vec2 } from '../engine/Vec2';
import { AnimationPlayer, AnimationPatterns } from '../engine/animations/AnimationPlayer';
import { AnimationPattern } from '../engine/animations/AnimationPattern';
import type { Direction } from './direction.type';
import { GRID_SIZE, gridFromPos, posFromGrid } from '../engine/utils';
import { AstronautAnimationBaseName, AstronautAnimationName, AstronautAnimations } from './astronautAnimations';

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
    Object.entries(AstronautAnimations).forEach(([key, value]) => {
      animationPlayerConfig[key] = new AnimationPattern(value);
    });

    this._sprite = new Sprite({
      resource: Resources.astronaut,
      frameSize: new Vec2(GRID_SIZE, GRID_SIZE),
      hFrames: 2,
      vFrames: 8,
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

  playAnimation(base: AstronautAnimationBaseName, once = false) {
    const key = `${base}_${this.direction.toUpperCase()}` as AstronautAnimationName;
    this.playAnimationByKey(key, once);
  }

  playAnimationByKey(key: AstronautAnimationName, once = false) {
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
