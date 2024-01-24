import { Camera } from './camera';
import { GameLoop } from './gameEngine';
import { GameObject } from './gameObject';
import { Player } from './player/player';
import { Resources } from './resources';
import { Sprite } from './sprite';
import './style.css';
import { Vec2 } from './vec2';

const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 200;

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <canvas id="game-canvas" style="border: 1px solid black"  width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}"></canvas>
`;

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas')!;
const ctx = canvas.getContext('2d')!;
// disable smoothing (we are using pixels)
ctx.imageSmoothingEnabled = false;

const mainScene = new GameObject({
  position: Vec2.ZERO()
});

// const backgroundSprite = new Sprite({
//   resource: Resources.background,
//   frameSize: new Vec2(626, 427),
//   scale: 0.5
// });
// mainScene.addChild(backgroundSprite);

// const square = new Sprite({
//   resource: Resources.square,
//   frameSize: new Vec2(16, 16)
// });

// mainScene.addChild(square);

// const player = new Player(16 * 5, 16 * 4);
// mainScene.addChild(player);

// const camera = new Camera(CANVAS_WIDTH, CANVAS_HEIGHT);

const update = (delta: number) => {
  mainScene.stepEntry(delta, mainScene);
};

const draw = () => {
  // clear everything to prevent artifacts
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  mainScene.draw(ctx, 0, 0);
};

const gl = new GameLoop(update, draw);
gl.start();
