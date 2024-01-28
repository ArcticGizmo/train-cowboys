import { AnimationPlayer } from '../animations/animationPlayer';
import { FrameIndexPattern } from '../animations/frameIndexPattern';
import { PlayerAnimations } from '../animations/playerAnimations';
import { events } from '../events';
import { GameObject } from '../gameObject';
import { Input } from '../input';
import { Resources } from '../resources';
import { Sprite } from '../sprite';
import { Vec2 } from '../vec2';

type PLAYER_DIRECTION = 'up' | 'down' | 'left' | 'right';

const playerSprite = new Sprite({
  resource: Resources.player,
  frameSize: new Vec2(16, 16),
  vFrames: 10,
  hFrames: 3,
  frame: 0,
  scale: 2,
  animationPlayer: new AnimationPlayer({
    WALK_DOWN: new FrameIndexPattern(PlayerAnimations.WALK_DOWN),
    WALK_UP: new FrameIndexPattern(PlayerAnimations.WALK_UP),
    WALK_LEFT: new FrameIndexPattern(PlayerAnimations.WALK_LEFT),
    WALK_RIGHT: new FrameIndexPattern(PlayerAnimations.WALK_RIGHT),
    IDLE_DOWN: new FrameIndexPattern(PlayerAnimations.IDLE_DOWN),
    IDLE_UP: new FrameIndexPattern(PlayerAnimations.IDLE_UP),
    IDLE_LEFT: new FrameIndexPattern(PlayerAnimations.IDLE_LEFT),
    IDLE_RIGHT: new FrameIndexPattern(PlayerAnimations.IDLE_RIGHT)
  })
});

const input = new Input();

export class PlayerOld extends GameObject {
  private _playerDirection: PLAYER_DIRECTION = 'down';
  private _playerSpeed = 0.1;
  private _lastPos = Vec2.ZERO();

  constructor(x: number, y: number) {
    const pos = new Vec2(x, y);
    super({ position: pos });

    this.addChild(playerSprite);
  }

  private tryMovePlayer(deltaTime: number) {
    let direction: PLAYER_DIRECTION | null = null;
    if (input.isKeyDown('up')) direction = 'up';
    if (input.isKeyDown('down')) direction = 'down';
    if (input.isKeyDown('left')) direction = 'left';
    if (input.isKeyDown('right')) direction = 'right';

    const posChange = this._playerSpeed * deltaTime;
    switch (direction) {
      case 'up':
        this.position.y -= posChange;
        playerSprite.animationPlayer?.play('WALK_UP');
        break;

      case 'down':
        this.position.y += posChange;
        playerSprite.animationPlayer?.play('WALK_DOWN');
        break;

      case 'left':
        this.position.x -= posChange;
        playerSprite.animationPlayer?.play('WALK_LEFT');
        break;

      case 'right':
        this.position.x += posChange;
        playerSprite.animationPlayer?.play('WALK_RIGHT');
        break;

      default:
        if (this._playerDirection === 'up') playerSprite.animationPlayer?.play('IDLE_UP');
        if (this._playerDirection === 'down') playerSprite.animationPlayer?.play('IDLE_DOWN');
        if (this._playerDirection === 'left') playerSprite.animationPlayer?.play('IDLE_LEFT');
        if (this._playerDirection === 'right') playerSprite.animationPlayer?.play('IDLE_RIGHT');
        break;
    }

    this._playerDirection = direction ?? this._playerDirection;
  }

  step(delta: number): void {
    this.tryMovePlayer(delta);
    if (!this.position.equals(this._lastPos)) {
      this._lastPos = this.position.copy();
      events.emit('PLAYER_POSITION_CHANGED', this.position);
    }
  }
}
