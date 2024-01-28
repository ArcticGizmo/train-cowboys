import { Camera } from './camera';
import { PROPS } from './constants';
import { GameLoop } from './gameEngine';
import { GameObject } from './gameObject';
import { Marker } from './marker';
import { GameArea } from './objects/gameArea';
import { Player } from './objects/player';
import { TrainCar } from './objects/trainCar';
import { Resources } from './resources';
import { Sprite } from './sprite';
import { SpriteDebug } from './spriteDebug';
import './style.css';
import { Vec2 } from './vec2';

const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 200;

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <canvas id="game-canvas" style="border: 1px solid black"  width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}"></canvas>
  <button id="move-player-left" style="font-size: 2rem">Left</button>
  <button id="move-player-right" style="font-size: 2rem">Right</button>
  <button id="move-player-up" style="font-size: 2rem">Up</button>
  <button id="move-player-down" style="font-size: 2rem">Down</button>
`;

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas')!;
const ctx = canvas.getContext('2d')!;
// disable smoothing (we are using pixels)
ctx.imageSmoothingEnabled = false;

const mainScene = new GameObject({
  position: Vec2.ZERO()
});

const gameArea = new GameArea({ initialPlayerCount: PROPS.initialPlayerCount });
mainScene.addChild(gameArea);

// draw a player
const player = new Player({
  position: new Vec2(30, 25),
  size: PROPS.player.size,
  color: 'red'
});
mainScene.addChild(player);

const playerPlacementIndex = new Vec2(0, 0);

gameArea.movePlayerTo(player, playerPlacementIndex);

const update = (delta: number) => {
  mainScene.stepEntry(delta, mainScene);
};

// TODO: if there are two many train cars to fit on the screen, we can just pass
// in another draw context with a translation offset underneath
const draw = () => {
  // clear everything to prevent artifacts
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  mainScene.draw(ctx, 0, 0);
};

const onMovePlayer = (xDelta: number, yDelta: number) => {
  const newIndex = new Vec2(playerPlacementIndex.x + xDelta, playerPlacementIndex.y + yDelta);

  if (gameArea.isValidPlacement(newIndex)) {
    playerPlacementIndex.set(newIndex);
    gameArea.movePlayerTo(player, playerPlacementIndex);
  }
};

document.querySelector<HTMLButtonElement>('#move-player-up')!.onclick = () => onMovePlayer(0, -1);
document.querySelector<HTMLButtonElement>('#move-player-down')!.onclick = () => onMovePlayer(0, 1);
document.querySelector<HTMLButtonElement>('#move-player-left')!.onclick = () => onMovePlayer(-1, 0);
document.querySelector<HTMLButtonElement>('#move-player-right')!.onclick = () => onMovePlayer(1, 0);

const gl = new GameLoop(update, draw);
gl.start();
