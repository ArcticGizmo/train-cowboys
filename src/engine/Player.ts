import { GameObject } from './GameObject';
import { Placement } from './Placement';
import { Resources } from './Resources';
import { Sprite } from './Sprite';
import { SpriteCircle } from './SpriteCircle';
import { Train } from './Train';
import { Vec2 } from './Vec2';
import { Direction } from './direction';
import { getNextHorizontalPlacement, getNextVerticalPlacement, gridFromPos, posFromGrid } from './utils';

export interface PlayerConfig {
  id: string;
  gridPos?: Vec2;
  color: string;
  train: Train;
}

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
      frameSize: new Vec2(16, 16),
      hFrames: 2,
      vFrames: 3,
      frame: 0
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
    if (this.isUpright) {
      this._sprite.frame = this._direction === 'left' ? 0 : 1;
    } else {
      this._sprite.frame = this._direction === 'left' ? 2 : 3;
    }
  }

  turn() {
    if (this.isInDeathZone) {
      return;
    }
    if (!this.isUpright) {
      this.isUpright = true;
      return;
    }
    this._direction = this._direction === 'left' ? 'right' : 'left';
  }

  moveToNextCar() {
    if (this.isInDeathZone) {
      return;
    }
    if (!this.isUpright) {
      this.isUpright = true;
      return;
    }
    this.doMoveToNextCar(this._direction);
  }

  private doMoveToNextCar(direction: Direction) {
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

    this.position = posFromGrid(nextGridPos);

    // look to bump other players
    const playerToBump = this.getOtherPlayers().find(p => p.globalGridPos.equals(nextGridPos));
    playerToBump?.bump(direction);
  }

  bump(direction: Direction) {
    const nextPlacement = getNextHorizontalPlacement(this.getPlacements(), this.globalGridPos, direction);
    if (nextPlacement) {
      this.moveToPlacement(nextPlacement, direction);
    }
  }

  shoot() {
    if (this.isInDeathZone) {
      return;
    }
    if (!this.isUpright) {
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

    const playerToShoot = otherPlayers[0];

    playerToShoot?.takeHit(this._direction);
  }

  takeHit(pushDirection: Direction) {
    if (this.isInDeathZone) {
      return;
    }
    this.isUpright = false;
    this.doMoveToNextCar(pushDirection);
  }

  climb() {
    if (this.isInDeathZone) {
      return;
    }
    if (!this.isUpright) {
      this.isUpright = true;
      return;
    }
    const placements = this.root.findAllChildrenOfType(Placement);
    const placement = getNextVerticalPlacement(placements, this.globalGridPos);
    if (placement) {
      this.position = posFromGrid(placement.globalGridPos);
    }
  }

  horse() {
    if (!this.isUpright) {
      this.isUpright = true;
      return;
    }
    const placement = this._train.getEngine().getBottomLeftPlacement();
    this._direction = 'right';
    this.moveToPlacement(placement, 'right');
  }

  reflex() {
    if (this.isInDeathZone) {
      return;
    }
    if (this.isUpright) {
      this.isUpright = false;
      return;
    }

    this.isUpright = true;
    this.shoot();
  }

  private moveToPlacement(placement: Placement, direction: Direction) {
    this.position = posFromGrid(placement.globalGridPos);

    const playerToBump = this.getOtherPlayers().find(p => p.globalGridPos.equals(placement.globalGridPos));
    playerToBump?.bump(direction);
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
