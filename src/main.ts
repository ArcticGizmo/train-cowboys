import { Camera } from './camera';
import { GameLoop } from './gameEngine';
import { GameObject } from './gameObject';
import { Player } from './player/player';
import { Resources } from './resources';
import { Sprite } from './sprite';
import { SpriteDebug } from './spriteDebug';
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

const trainSize = new Vec2(60, 40);
const trainHeightOffset = 50;
const trainWidthOffset = 50;

const getTrainPos = (carIndex: number) => {
  const x = trainWidthOffset + (20 + trainSize.x) * carIndex;
  const y = trainHeightOffset;
  return new Vec2(x, y);
};

// draw the train
const trainCarSprite1 = new SpriteDebug({ position: getTrainPos(0), size: trainSize, color: 'grey' });
mainScene.addChild(trainCarSprite1);

const trainCarSprite2 = new SpriteDebug({ position: getTrainPos(1), size: trainSize, color: 'brown' });
mainScene.addChild(trainCarSprite2);

const trainCarSprite3 = new SpriteDebug({ position: getTrainPos(2), size: trainSize, color: 'brown' });
mainScene.addChild(trainCarSprite3);

// draw a player
const playerSize = new Vec2(10, 20);
const playerPos = new Vec2(trainWidthOffset, trainHeightOffset - playerSize.y);
const player = new SpriteDebug({ position: playerPos, size: playerSize, color: 'green' });
mainScene.addChild(player);

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
