import { AnimationPlayer } from './animations/animationPlayer';
import { FrameIndexPattern } from './animations/frameIndexPattern';
import { PlayerAnimations } from './animations/playerAnimations';
import { GameLoop } from './gameEngine';
import { Input } from './input';
import { Resources } from './resources';
import { Sprite } from './sprite';
import './style.css';
import { Vec2 } from './vector2';

type PLAYER_DIRECTION = 'up' | 'down' | 'left' | 'right';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <canvas id="game-canvas"  width="360" height="200"></canvas>
`;

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas')!;
const ctx = canvas.getContext('2d')!;

const backgroundSprite = new Sprite({
  resource: Resources.background,
  frameSize: new Vec2(626, 427),
  scale: 0.5
});

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

const square = new Sprite({
  resource: Resources.square,
  frameSize: new Vec2(16, 16)
});

const playerPos = new Vec2(16 * 5, 16 * 5);
let playerDirection: PLAYER_DIRECTION = 'down';
const input = new Input();

const PLAYER_SPEED = 0.1;

const movePlayer = (deltaTime: number) => {
  let direction: PLAYER_DIRECTION | null = null;
  if (input.isKeyDown('up')) direction = 'up';
  if (input.isKeyDown('down')) direction = 'down';
  if (input.isKeyDown('left')) direction = 'left';
  if (input.isKeyDown('right')) direction = 'right';

  const posChange = PLAYER_SPEED * deltaTime;

  switch (direction) {
    case 'up':
      playerPos.y -= posChange;
      playerSprite.animationPlayer?.play('WALK_UP');
      break;

    case 'down':
      playerPos.y += posChange;
      playerSprite.animationPlayer?.play('WALK_DOWN');
      break;

    case 'left':
      playerPos.x -= posChange;
      playerSprite.animationPlayer?.play('WALK_LEFT');
      break;

    case 'right':
      playerPos.x += posChange;
      playerSprite.animationPlayer?.play('WALK_RIGHT');
      break;

    default:
      if (playerDirection === 'up') playerSprite.animationPlayer?.play('IDLE_UP');
      if (playerDirection === 'down') playerSprite.animationPlayer?.play('IDLE_DOWN');
      if (playerDirection === 'left') playerSprite.animationPlayer?.play('IDLE_LEFT');
      if (playerDirection === 'right') playerSprite.animationPlayer?.play('IDLE_RIGHT');
      break;
  }

  // switch(hero)
};

const update = (deltaTime: number) => {
  movePlayer(deltaTime);

  playerSprite.step(deltaTime);
};

const draw = () => {
  backgroundSprite.drawImage(ctx, 0, 0);
  playerSprite.drawImage(ctx, playerPos.x, playerPos.y);
  square.drawImage(ctx, 10, 10);
};

const gl = new GameLoop(update, draw);
gl.start();
