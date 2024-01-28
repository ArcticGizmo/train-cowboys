import { Camera } from './camera';
import { PROPS } from './constants';
import { GameLoop } from './gameEngine';
import { GameObject } from './gameObject';
import { Marker } from './marker';
import { Cowboy } from './objects/cowboy';
import { TrainCar } from './objects/trainCar';
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
  <button id="move-player" style="font-size: 2rem">Move Player</button>
`;

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas')!;
const ctx = canvas.getContext('2d')!;
// disable smoothing (we are using pixels)
ctx.imageSmoothingEnabled = false;

const mainScene = new GameObject({
  position: Vec2.ZERO()
});

const getTrainPos = (carIndex: number) => {
  const x = PROPS.train.widthOffset + (PROPS.train.carSpacing + PROPS.train.width) * carIndex;
  const y = PROPS.train.heightOffset;
  return new Vec2(x, y);
};

const buildTrainCars = () => {
  const trainCars: TrainCar[] = [];
  const size = new Vec2(PROPS.train.width, PROPS.train.height);
  for (let i = 0; i < PROPS.train.initialLength; i++) {
    const color = i === 0 ? 'grey' : 'brown';
    const position = getTrainPos(i);
    trainCars.push(new TrainCar({ position, size, color }));
  }

  return trainCars;
};

const trainCars = buildTrainCars();
trainCars.forEach(tc => mainScene.addChild(tc));

const trainTrack = new SpriteDebug({ position: new Vec2(0, 105), size: new Vec2(CANVAS_WIDTH, 5), color: 'grey' });
mainScene.addChild(trainTrack);

// draw a player
const cowboy = new Cowboy({
  position: new Vec2(30, 25),
  size: PROPS.cowboy.size,
  color: 'red'
});
mainScene.addChild(cowboy);

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

const onMovePlayer = () => {
  const markers = mainScene.findAllChildrenOfType(Marker);

  if (markers.length === 0) {
    console.warn('--- no markers');
    return;
  }

  const nextMarker = getNextMarker(cowboy.globalPosition, markers)!;

  const newX = nextMarker.globalPosition.x - PROPS.cowboy.size.x / 2;

  cowboy.position.x = newX;
};

const getNextMarker = (pos: Vec2, markers: Marker[], minDistance = 15) => {
  let closest: Marker | undefined;
  let bestDistance = Infinity;
  for (let m of markers) {
    const dist = m.globalPosition.distanceTo(pos);
    if (dist > minDistance && dist < bestDistance) {
      closest = m;
      bestDistance = dist;
    }
  }

  return closest;
};

document.querySelector<HTMLButtonElement>('#move-player')!.onclick = onMovePlayer;

const gl = new GameLoop(update, draw);
gl.start();
