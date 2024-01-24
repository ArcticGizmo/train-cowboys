import { events } from './events';
import { GameLoop } from './gameEngine';
import { GameObject } from './gameObject';
import { Player } from './player/player';
import { Resources } from './resources';
import { Sprite } from './sprite';
import './style.css';
import { Vec2 } from './vec2';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <canvas id="game-canvas"  width="360" height="200"></canvas>
`;

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas')!;
const ctx = canvas.getContext('2d')!;

const mainScene = new GameObject({
  position: Vec2.ZERO()
});

const backgroundSprite = new Sprite({
  resource: Resources.background,
  frameSize: new Vec2(626, 427),
  scale: 0.5
});
mainScene.addChild(backgroundSprite);

const square = new Sprite({
  resource: Resources.square,
  frameSize: new Vec2(16, 16)
});

mainScene.addChild(square);

events.on('PLAYER_POSITION_CHANGED', mainScene, pos => {
  console.log('Player moved', pos);
});

const player = new Player(16 * 5, 16 * 4);
mainScene.addChild(player);

const update = (delta: number) => {
  mainScene.stepEntry(delta, mainScene);
};

const draw = () => {
  mainScene.draw(ctx, 0, 0);
};

const gl = new GameLoop(update, draw);
gl.start();
