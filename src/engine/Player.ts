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

  constructor(config: PlayerConfig) {
    super({ position: posFromGrid(config.gridPos ?? Vec2.ZERO()) });

    this._train = config.train;
    this.id = config.id;

    this._sprite = new Sprite({
      resource: Resources.player,
      frameSize: new Vec2(16, 16),
      hFrames: 3,
      vFrames: 4,
      frame: 6
    });

    this.addChild(this._sprite);

    this.addChild(
      new SpriteCircle({
        position: new Vec2(8, 8),
        radius: 4,
        color: config.color
      })
    );
  }

  get globalGridPos() {
    return gridFromPos(this.globalPosition);
  }

  step(delta: number) {
    this._sprite.frame = this._direction === 'left' ? 6 : 9;
  }

  turn() {
    this._direction = this._direction === 'left' ? 'right' : 'left';
  }

  moveToNextCar() {
    // get all placements
    const curPlacement = this.getPlacements().find(p => p.globalGridPos.equals(this.globalGridPos))!;

    const carIndex = this._train.getCarIndexFromPlacement(curPlacement);

    let nextGridPos: Vec2;
    // TODO: fix level
    if (this._direction === 'left') {
      nextGridPos = this._train.getCar(carIndex - 1).getPlacement('top', 'right').globalGridPos;
    } else {
      nextGridPos = this._train.getCar(carIndex + 1).getPlacement('top', 'left').globalGridPos;
    }

    console.log(this.globalGridPos);
    console.log(nextGridPos);

    this.position = posFromGrid(nextGridPos);

    // look to bump other players
    const playerToBump = this.getOtherPlayers().find(p => p.globalGridPos.equals(nextGridPos));
    playerToBump?.bump(this._direction);
  }

  bump(direction: Direction) {
    const nextPlacement = getNextHorizontalPlacement(this.getPlacements(), this.globalGridPos, direction);

    this.position = posFromGrid(nextPlacement.globalGridPos);

    const playerToBump = this.getOtherPlayers().find(p => p.globalGridPos.equals(nextPlacement.globalGridPos));
    playerToBump?.bump(direction);
  }

  shoot() {}

  impacted() {}

  climb() {
    const placements = this.root.findAllChildrenOfType(Placement);
    const placement = getNextVerticalPlacement(placements, this.globalGridPos);
    this.position = posFromGrid(placement.globalGridPos);
  }

  private getPlacements() {
    return this.root.findAllChildrenOfType(Placement);
  }

  private getOtherPlayers() {
    return this.root.findAllChildrenOfType(Player).filter(p => p.id !== this.id);
  }
}
