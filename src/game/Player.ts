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
import { PlacementMarker } from './PlacementMarker';

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
      position: new Vec2(GRID_SIZE / 2, - GRID_SIZE / 4),
      radius: 4,
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
    this._indicator.radius = 8;
  }

  unselect() {
    this.isSelected = false;
    this._indicator.radius = 4;
  }

  changeDirection() {
    this.direction = this.direction === 'left' ? 'right' : 'left';
  }

  private getPlacements() {
    return this.root.findAllChildrenOfType(PlacementMarker);
  }

  get placement() {
    return this.getPlacements().find(p => p.globalGridPos.equals(this.globalGridPos));
  }

  isInDeathZone() {
    return this.placement?.isDeathZone || false;
  }

  async standup() {
    this.isStunned = false;
    // player.playAnimation('STAND', true);
    // await delay(1500);
    // player.isStunned = false;
    // player.playAnimation('IDLE');
  }

  async eject() {
    // TODO: groundY might be static for drawing the tracks?
    // const groundY = this._train.getEngine().getBottomLeftPlacement().globalGridPos.y + 1;
    // player.playAnimation('FREE_FALL');
    // const fallTo = new Vec2(player.globalGridPos.x, groundY);
    // await this._engine.moveToGrid(player, fallTo, { duration: 250 });
    // player.direction = 'left';
    // player.playAnimation('TUMBLE', true);
    // await this._engine.moveToGrid(player, new Vec2(this._playerCount * 40, groundY), { duration: 1000 });
  }
}
