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

const draw = () => {
  backgroundSprite.drawImage(ctx, 0, 0);
};

setInterval(() => {
  draw();
}, 300);
