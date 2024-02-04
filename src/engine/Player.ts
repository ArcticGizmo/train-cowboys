import { CQ, CQHelper } from './ChangeQueue';
import { GameObject } from './GameObject';
import { Placement } from './Placement';
import { Resources } from './Resources';
import { Sprite } from './Sprite';
import { SpriteCircle } from './SpriteCircle';
import { Train } from './Train';
import { Vec2 } from './Vec2';
import { AnimationPlayer, FramePatterns } from './animations/AnimationPlayer';
import { FrameIndexPattern } from './animations/FrameIndexPattern';
import { SingleShotFrameIndexPattern } from './animations/SingleShotFrameIndexPattern';
import { PlayerAnimationName, PlayerAnimations } from './animations/playerAnimations';
import { Direction } from './direction';
import { getNextHorizontalPlacement, getNextVerticalPlacement, gridFromPos, posFromGrid } from './utils';

export interface PlayerConfig {
  id: string;
  gridPos?: Vec2;
  color: string;
  // train: Train;
}

const WALKING_SPEED = 0.05;
const SHOT_SPEED = 0.1;
const BUMP_SPEED = 0.1;
const HORSE_SPEED = 10;

export class Player extends GameObject {
  private _sprite: Sprite;
  private _direction: Direction = 'right';
  private _indicator: SpriteCircle;
  // private _train: Train;

  public id: string;
  public isAlive = true;
  public isUpright = true;
  public isSelected = false;

  constructor(config: PlayerConfig) {
    super({ position: posFromGrid(config.gridPos ?? Vec2.ZERO()) });

    // this._train = config.train;
    this.id = config.id;

    const animationPlayerConfig: FramePatterns = {};
    Object.entries(PlayerAnimations).forEach(([key, value]) => {
      if (value.singleShot) {
        animationPlayerConfig[key] = new SingleShotFrameIndexPattern(value);
      } else {
        animationPlayerConfig[key] = new FrameIndexPattern(value);
      }
    });

    this._sprite = new Sprite({
      resource: Resources.player,
      frameSize: new Vec2(16, 16),
      hFrames: 6,
      vFrames: 7,
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

  get globalGridPos() {
    return gridFromPos(this.globalPosition);
  }

  select() {
    this.isSelected = true;
    this._indicator.radius = 3;
  }

  unselect() {
    this.isSelected = false;
    this._indicator.radius = 1;
  }

  // get isInDeathZone() {
  //   const curPlacement = this.getPlacements().find(p => p.globalGridPos.equals(this.globalGridPos))!;
  //   return this._train.isInDeathZone(curPlacement);
  // }

  step(delta: number) {
    // if (this.isUpright) {
    //   this._sprite.frame = this._direction === 'left' ? 0 : 1;
    // } else {
    //   this._sprite.frame = this._direction === 'left' ? 2 : 3;
    // }
  }

  // setAnimation(name: PlayerAnimationName) {
  //   this._sprite.animationPlayer?.play(name);
  // }

  // turn() {
  //   if (this.isInDeathZone) {
  //     return;
  //   }
  //   if (!this.isUpright) {
  //     // TODO: standup animation
  //     this.isUpright = true;
  //     return;
  //   }

  //   // TODO: turn animation (if required)
  //   this._direction = this._direction === 'left' ? 'right' : 'left';
  // }

  // moveToNextCar() {
  //   if (this.isInDeathZone) {
  //     return;
  //   }
  //   if (!this.isUpright) {
  //     // TODO: standup animation
  //     this.isUpright = true;
  //     return;
  //   }

  //   this.doMoveToNextCar(this._direction, WALKING_SPEED, true);
  // }

  // private doMoveToNextCar(direction: Direction, speed: number, animate = false) {
  //   // get all placements
  //   const curPlacement = this.getPlacements().find(p => p.globalGridPos.equals(this.globalGridPos))!;

  //   const carIndex = this._train.getCarIndexFromPlacement(curPlacement);

  //   let nextPlacement: Placement;
  //   const level = this._train.getEngine().getLevelFromPlacement(curPlacement);
  //   if (direction === 'left') {
  //     nextPlacement = this._train.getCar(carIndex - 1).getPlacement(level, 'right');
  //   } else {
  //     nextPlacement = this._train.getCar(carIndex + 1).getPlacement(level, 'left');
  //   }

  //   this.moveToPlacement(nextPlacement, this._direction, speed, animate);
  // }

  // bump(direction: Direction) {
  //   const nextPlacement = getNextHorizontalPlacement(this.getPlacements(), this.globalGridPos, direction);
  //   if (nextPlacement) {
  //     this.moveToPlacement(nextPlacement, direction, BUMP_SPEED);
  //   }
  // }

  // shoot() {
  //   if (this.isInDeathZone) {
  //     return;
  //   }
  //   if (!this.isUpright) {
  //     // TODO: standup animation
  //     this.isUpright = true;
  //     return;
  //   }

  //   const { x, y } = this.globalGridPos;

  //   let otherPlayers = this.getOtherPlayers().filter(p => p.isAlive && p.isUpright && p.globalGridPos.y === y);

  //   if (this._direction === 'left') {
  //     otherPlayers = otherPlayers.filter(p => p.globalGridPos.x < x);
  //     otherPlayers.sort((a, b) => b.globalGridPos.x - a.globalGridPos.x);
  //   } else {
  //     otherPlayers = otherPlayers.filter(p => p.globalGridPos.x > x);
  //     otherPlayers.sort((a, b) => a.globalGridPos.x - b.globalGridPos.x);
  //   }

  //   CQ.do(CQHelper.Animate(1000, () => this.setAnimation('SHOOT_RIGHT'))).thenDo((deltaTime, done) => {
  //     this.setAnimation('IDLE_RIGHT');
  //     done();
  //   });
  //   const playerToShoot = otherPlayers[0];

  //   playerToShoot?.takeHit(this._direction);
  // }

  // takeHit(pushDirection: Direction) {
  //   if (this.isInDeathZone) {
  //     return;
  //   }

  //   // TODO: shot animation (animate falling down here, then move auto animated)
  //   this.isUpright = false;
  //   CQ.do(CQHelper.Wait(200)).thenDo((deltaTime, done) => {
  //     this.setAnimation('FALL_RIGHT');
  //     this.doMoveToNextCar(pushDirection, SHOT_SPEED);
  //     done();
  //   });
  // }

  // climb() {
  //   if (this.isInDeathZone) {
  //     return;
  //   }
  //   if (!this.isUpright) {
  //     this.isUpright = true;
  //     return;
  //   }

  //   // TODO: fix pathing not working correctly
  //   // TODO: chained animation of walking then climbing
  //   const placements = this.root.findAllChildrenOfType(Placement);
  //   const placement = getNextVerticalPlacement(placements, this.globalGridPos);

  //   CQ.do(CQHelper.Animate(500, () => this.setAnimation('CLIMB')))
  //     .do(CQHelper.MoveTo(this, placement.globalPosition, WALKING_SPEED))
  //     .thenDo((deltaTime, done) => {
  //       this.setAnimation('IDLE_RIGHT');
  //       done();
  //     });
  // }

  // horse() {
  //   if (!this.isUpright) {
  //     // TODO: standup animation
  //     this.isUpright = true;
  //     return;
  //   }

  //   // TODO: animate horse
  //   const placement = this._train.getEngine().getBottomLeftPlacement();
  //   this._direction = 'right';
  //   this.moveToPlacement(placement, 'right', HORSE_SPEED);
  // }

  // reflex() {
  //   if (this.isInDeathZone) {
  //     return;
  //   }
  //   if (this.isUpright) {
  //     // TODO: animate falling over (like a comical slip)
  //     this.isUpright = false;
  //     return;
  //   }

  //   // TODO: animate standing up, then shoot (might need to split animations here?)
  //   this.isUpright = true;
  //   this.shoot();
  // }

  // private moveToPlacement(placement: Placement, direction: Direction, speed: number, animate = false) {
  //   const targetPos = posFromGrid(placement.globalGridPos);
  //   if (this.position.equals(targetPos)) {
  //     return;
  //   }

  //   if (animate == false) {
  //     CQ.do(CQHelper.MoveTo(this, targetPos, speed)).thenDo((deltaTime, done) => {
  //       const playerToBump = this.getOtherPlayers().find(p => p.globalGridPos.equals(placement.globalGridPos));
  //       playerToBump?.bump(direction);
  //       done();
  //     });
  //     return;
  //   }

  //   CQ.thenDo((deltaTime, done) => {
  //     if (animate) this.setAnimation('WALK_RIGHT');
  //     done();
  //   })
  //     .thenDo(CQHelper.MoveTo(this, targetPos, speed))
  //     .thenDo((deltaTime, done) => {
  //       const playerToBump = this.getOtherPlayers().find(p => p.globalGridPos.equals(placement.globalGridPos));
  //       playerToBump?.bump(direction);
  //       if (animate) this.setAnimation('IDLE_RIGHT');
  //       done();
  //     });
  // }

  // private getPlacements() {
  //   return this.root.findAllChildrenOfType(Placement);
  // }

  // private getOtherPlayers() {
  //   return this.root.findAllChildrenOfType(Player).filter(p => p.id !== this.id);
  // }
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
