import { AQ, AQHelper } from './ActionQueue';
import { GameObject } from './GameObject';
import { Placement } from './Placement';
import { Resources } from './Resources';
import { Sprite } from './Sprite';
import { SpriteCircle } from './SpriteCircle';
import { Train } from './Train';
import { Vec2 } from './Vec2';
import { AnimationPlayer } from './animations/AnimationPlayer';
import { FrameIndexPattern } from './animations/FrameIndexPattern';
import { PlayerAnimationName, PlayerAnimations } from './animations/playerAnimations';
import { Direction } from './direction';
import { getNextHorizontalPlacement, getNextVerticalPlacement, gridFromPos, posFromGrid } from './utils';

export interface PlayerConfig {
  id: string;
  gridPos?: Vec2;
  color: string;
  train: Train;
}

const WALKING_SPEED = 0.05;
const SHOT_SPEED = 0.5;
const BUMP_SPEED = 0.1;
const HORSE_SPEED = 10;

export class Player extends GameObject {
  private _sprite: Sprite;
  private _direction: Direction = 'left';
  private _train: Train;

  public id: string;
  public isAlive = true;
  public isUpright = true;

  constructor(config: PlayerConfig) {
    super({ position: posFromGrid(config.gridPos ?? Vec2.ZERO()) });

    this._train = config.train;
    this.id = config.id;

    this._sprite = new Sprite({
      resource: Resources.player,
      frameSize: new Vec2(64, 64),
      hFrames: 6,
      vFrames: 4,
      frame: 0,
      scale: 0.25,
      animationPlayer: new AnimationPlayer({
        IDLE_RIGHT: new FrameIndexPattern(PlayerAnimations.IDLE_RIGHT)
      })
    });

    this.addChild(this._sprite);

    this.addChild(
      new SpriteCircle({
        position: new Vec2(8, -4),
        radius: 3,
        color: config.color
      })
    );
  }

  get globalGridPos() {
    return gridFromPos(this.globalPosition);
  }

  get isInDeathZone() {
    const curPlacement = this.getPlacements().find(p => p.globalGridPos.equals(this.globalGridPos))!;
    return this._train.isInDeathZone(curPlacement);
  }

  step(delta: number) {
    // if (this.isUpright) {
    //   this._sprite.frame = this._direction === 'left' ? 0 : 1;
    // } else {
    //   this._sprite.frame = this._direction === 'left' ? 2 : 3;
    // }
  }

  setAnimation(name: PlayerAnimationName) {
    this._sprite.animationPlayer?.play(name);
  }

  turn() {
    if (this.isInDeathZone) {
      return;
    }
    if (!this.isUpright) {
      // TODO: standup animation
      this.isUpright = true;
      return;
    }

    // TODO: turn animation (if required)
    this._direction = this._direction === 'left' ? 'right' : 'left';
  }

  moveToNextCar() {
    if (this.isInDeathZone) {
      return;
    }
    if (!this.isUpright) {
      // TODO: standup animation
      this.isUpright = true;
      return;
    }

    this.doMoveToNextCar(this._direction, WALKING_SPEED);
  }

  private doMoveToNextCar(direction: Direction, speed: number) {
    // get all placements
    const curPlacement = this.getPlacements().find(p => p.globalGridPos.equals(this.globalGridPos))!;

    const carIndex = this._train.getCarIndexFromPlacement(curPlacement);

    let nextGridPos: Vec2;
    // TODO: fix level
    const level = this._train.getEngine().getLevelFromPlacement(curPlacement);
    if (direction === 'left') {
      nextGridPos = this._train.getCar(carIndex - 1).getPlacement(level, 'right').globalGridPos;
    } else {
      nextGridPos = this._train.getCar(carIndex + 1).getPlacement(level, 'left').globalGridPos;
    }

    // look to bump other players
    const playerToBump = this.getOtherPlayers().find(p => p.globalGridPos.equals(nextGridPos));

    AQ.do(AQHelper.MoveTo(this, posFromGrid(nextGridPos), speed)).thenDo((deltaTime, done) => {
      playerToBump?.bump(direction);
      done();
    });
  }

  bump(direction: Direction) {
    const nextPlacement = getNextHorizontalPlacement(this.getPlacements(), this.globalGridPos, direction);
    if (nextPlacement) {
      this.moveToPlacement(nextPlacement, direction, BUMP_SPEED);
    }
  }

  shoot() {
    if (this.isInDeathZone) {
      return;
    }
    if (!this.isUpright) {
      // TODO: standup animation
      this.isUpright = true;
      return;
    }

    const { x, y } = this.globalGridPos;

    let otherPlayers = this.getOtherPlayers().filter(p => p.isAlive && p.isUpright && p.globalGridPos.y === y);

    if (this._direction === 'left') {
      otherPlayers = otherPlayers.filter(p => p.globalGridPos.x < x);
      otherPlayers.sort((a, b) => b.globalGridPos.x - a.globalGridPos.x);
    } else {
      otherPlayers = otherPlayers.filter(p => p.globalGridPos.x > x);
      otherPlayers.sort((a, b) => a.globalGridPos.x - b.globalGridPos.x);
    }

    // TODO: shoot animation
    const playerToShoot = otherPlayers[0];

    playerToShoot?.takeHit(this._direction);
  }

  takeHit(pushDirection: Direction) {
    if (this.isInDeathZone) {
      return;
    }

    // TODO: shot animation (animate falling down here, then move auto animated)
    this.isUpright = false;
    this.doMoveToNextCar(pushDirection, SHOT_SPEED);
  }

  climb() {
    if (this.isInDeathZone) {
      return;
    }
    if (!this.isUpright) {
      this.isUpright = true;
      return;
    }

    // TODO: fix pathing not working correctly
    // TODO: chained animation of walking then climbing
    const placements = this.root.findAllChildrenOfType(Placement);
    const placement = getNextVerticalPlacement(placements, this.globalGridPos);
    if (placement) {
      this.position = posFromGrid(placement.globalGridPos);
    }
  }

  horse() {
    if (!this.isUpright) {
      // TODO: standup animation
      this.isUpright = true;
      return;
    }

    // TODO: animate horse
    const placement = this._train.getEngine().getBottomLeftPlacement();
    this._direction = 'right';
    this.moveToPlacement(placement, 'right', HORSE_SPEED);
  }

  reflex() {
    if (this.isInDeathZone) {
      return;
    }
    if (this.isUpright) {
      // TODO: animate falling over (like a comical slip)
      this.isUpright = false;
      return;
    }

    // TODO: animate standing up, then shoot (might need to split animations here?)
    this.isUpright = true;
    this.shoot();
  }

  private moveToPlacement(placement: Placement, direction: Direction, speed: number) {
    const targetPos = posFromGrid(placement.globalGridPos);
    if (this.position.equals(targetPos)) {
      return;
    }
    AQ.thenDo(AQHelper.MoveTo(this, targetPos, speed)).thenDo((deltaTime, done) => {
      const playerToBump = this.getOtherPlayers().find(p => p.globalGridPos.equals(placement.globalGridPos));
      playerToBump?.bump(direction);
      done();
    });
  }

  private getPlacements() {
    return this.root.findAllChildrenOfType(Placement);
  }

  private getOtherPlayers() {
    return this.root.findAllChildrenOfType(Player).filter(p => p.id !== this.id);
  }
}

/*
next iteration
- just create a 2d grid that has state only representations
- each representation stores the player at that coordinate
- on each move, move the matching player game object instead
-- this will allow for animations and the such
- also want to make sure that all game state is globally accessible in the root
so that it can be more easily used (the game is really quite simple really)
*/
