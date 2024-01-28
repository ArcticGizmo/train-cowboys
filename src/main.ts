import { PROPS } from './constants';
import { GameLoop } from './gameEngine';
import { GameObject } from './gameObject';
import { ChangeManager } from './objects/changeManager';
import { GameArea } from './objects/gameArea';
import { Player } from './objects/player';
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
  <br>
  <button id="move-player-front-of-train" style="font-size: 2rem">Front of Train</button>
  <button id="move-player-back-of-train" style="font-size: 2rem">Back of Train</button>
  <br>
  <button id="perform-actions" style="font-size: 2rem">perform-actions</button>
`;

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas')!;
const ctx = canvas.getContext('2d')!;
// disable smoothing (we are using pixels)
ctx.imageSmoothingEnabled = false;

const mainScene = new GameObject({
  position: Vec2.ZERO()
});

const changeManager = new ChangeManager();

const gameArea = new GameArea({ initialPlayerCount: PROPS.initialPlayerCount });
mainScene.addChild(gameArea);

// draw a player
const player1 = new Player({
  index: new Vec2(2, 0),
  size: PROPS.player.size,
  color: 'red'
});

const player2 = new Player({
  index: new Vec2(3, 1),
  size: PROPS.player.size,
  color: 'blue'
});

mainScene.addChild(player1);
mainScene.addChild(player2);

gameArea.movePlayerTo(player1, player1.index);
gameArea.movePlayerTo(player2, player2.index);

const update = (delta: number) => {
  changeManager.step(delta);
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
  if (changeManager.isRunning) {
    return;
  }

  const newIndex = new Vec2(player1.index.x + xDelta, player1.index.y + yDelta);

  if (!gameArea.isValidPlacement(newIndex)) {
    return;
  }

  player1.index.set(newIndex);
  const targetPos = gameArea.getPlacement(newIndex).position;

  const targetDir = targetPos.copy().minus(player1.position).normalised();

  changeManager.then({
    do: delta => {
      player1.position.add(targetDir.copy().scale(0.05 * delta));
    },
    until: () => {
      const dist = player1.position.distanceTo(targetPos);
      return dist < 1;
    }
  });
};

document.querySelector<HTMLButtonElement>('#move-player-up')!.onclick = () => onMovePlayer(0, -1);
document.querySelector<HTMLButtonElement>('#move-player-down')!.onclick = () => onMovePlayer(0, 1);
document.querySelector<HTMLButtonElement>('#move-player-left')!.onclick = () => onMovePlayer(-1, 0);
document.querySelector<HTMLButtonElement>('#move-player-right')!.onclick = () => onMovePlayer(1, 0);

document.querySelector<HTMLButtonElement>('#move-player-front-of-train')!.onclick = () => {
  player1.index = gameArea.getIndexForCar(0, 'front', 'top');
  gameArea.movePlayerTo(player1, player1.index);
};
document.querySelector<HTMLButtonElement>('#move-player-back-of-train')!.onclick = () => {
  player1.index = gameArea.getIndexForCar(PROPS.initialPlayerCount + 1, 'back', 'bottom');
  gameArea.movePlayerTo(player1, player1.index);
};

document.querySelector<HTMLButtonElement>('#perform-actions')!.onclick = () => {
  if (changeManager.isRunning) {
    console.log('---- cannot queue changes at the moment');
    return;
  }

  changeManager
    .then({
      do: deltaTime => (player1.position.x += 0.05 * deltaTime),
      until: () => player1.position.x > 120
    })
    .then({
      do: deltaTime => (player1.position.x -= 0.05 * deltaTime),
      until: () => player1.position.x < 30
    });
};

const gl = new GameLoop(update, draw);
gl.start();
