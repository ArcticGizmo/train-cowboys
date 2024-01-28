import { ref } from 'vue';
import { GameObject } from './GameObject';
import { SpriteRect } from './SpirteRect';
import { Vec2 } from './Vec2';
import { GameLoop } from './GameLoop';
import { Sprite } from './Sprite';
import { Resources } from './Resources';
import * as utils from './utils';

export class GameEngine {
  private _ctx: CanvasRenderingContext2D = null!;
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
    const bg = new Sprite({
      resource: Resources.grid,
      frameSize: new Vec2(1024, 1024),
      opacity: 0.1
    });

    this.addChild(bg);

    // temp item
    const square = new SpriteRect({
      position: utils.posFromGrid(3, 3),
      size: new Vec2(16, 32),
      color: 'blue'
    });

    this.addChild(square);

    // create a player

    // create the "train car"
  }

  start() {
    this.isRunning.value = true;
    this._loop.start();
  }

  stop() {
    this.isRunning.value = false;
    this._loop.stop();
  }

  private addChild(gameObject: GameObject) {
    this._root.addChild(gameObject);
  }

  private update(delta) {}

  private render() {
    // clear everything to prevent artifacts
    this._ctx.clearRect(0, 0, this._canvasSize.x, this._canvasSize.y);

    this._root.draw(this._ctx, 0, 0);
  }
}
