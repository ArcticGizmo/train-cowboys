import { ref } from 'vue';
import { GameObject } from './GameObject';
import { SpriteRect } from './SpirteRect';
import { Vec2 } from './Vec2';
import { GameLoop } from './GameLoop';

export class GameEngine {
  private _ctx: CanvasRenderingContext2D;
  private _loop = new GameLoop(
    delta => this.update(delta),
    () => this.render()
  );
  private _canvasSize: Vec2;
  private _root = new GameObject();

  isReady = ref(false);
  isRunning = ref(false);

  constructor(canvasSize: Vec2) {
    this._canvasSize = canvasSize;
  }

  bindContext(ctx: CanvasRenderingContext2D) {
    this._ctx = ctx;
    this.isReady.value = true;
  }

  init() {
    // temp item
    const square = new SpriteRect({
      position: new Vec2(30, 30),
      size: new Vec2(10, 30),
      color: 'blue'
    });

    this._root.addChild(square);

    this.start();
  }

  start() {
    this.isRunning.value = true;
    this._loop.start();
  }

  stop() {
    this.isRunning.value = false;
    this._loop.stop();
  }

  private update(delta) {}

  private render() {
    // clear everything to prevent artifacts
    this._ctx.clearRect(0, 0, this._canvasSize.x, this._canvasSize.y);

    this._root.draw(this._ctx, 0, 0);
  }
}
