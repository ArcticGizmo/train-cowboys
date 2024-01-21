import { GameLoop } from './gameEngine';
import { Input } from './input';
import { Resources } from './resources';
import { Sprite } from './sprite';
import './style.css';
import { Vec2 } from './vector2';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <canvas id="game-canvas"  width="1080" height="720"></canvas>
`;

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas')!;
const ctx = canvas.getContext('2d')!;

const backgroundSprite = new Sprite({
  resource: Resources.background,
  frameSize: new Vec2(626, 427)
});

const playerSprite = new Sprite({
  resource: Resources.player,
  frameSize: new Vec2(16, 16),
  scale: 4
});

const playerPos = new Vec2(16 * 5, 16 * 5);
const input = new Input();

const PLAYER_SPEED = 0.25;

const update = (deltaTime: number) => {
  // console.log(input.keyPressed);
  const posChange = PLAYER_SPEED * deltaTime;
  if (input.isKeyDown('up')) playerPos.y -= posChange;
  if (input.isKeyDown('down')) playerPos.y += posChange;
  if (input.isKeyDown('left')) playerPos.x -= posChange;
  if (input.isKeyDown('right')) playerPos.x += posChange;
};

const draw = () => {
  backgroundSprite.drawImage(ctx, 0, 0);
  playerSprite.drawImage(ctx, playerPos.x, playerPos.y);
};

const gl = new GameLoop(update, draw);
gl.start();
