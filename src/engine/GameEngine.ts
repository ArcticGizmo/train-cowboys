import { ref } from 'vue';
import { GameObject } from './GameObject';
import { Vec2 } from './Vec2';
import { GameLoop } from './GameLoop';
import { posFromGrid } from './utils';

type Resolve = (value: void | PromiseLike<void>) => void;
export type HandleCallback = (done: () => void, delta: number) => void;

type Timing = { duration: number } | { speed: number };

class Handle {
  private _resolve: Resolve = null!;
  private _cb: HandleCallback;

  promise: Promise<void>;
  private _doneCallback: () => void;

  isDone = false;

  constructor(cb: HandleCallback) {
    this._cb = cb;
    this._doneCallback = () => this.done();
    this.promise = new Promise(res => {
      this._resolve = res;
    });
  }

  private done() {
    this.isDone = true;
    this._resolve();
  }

  step(delta: number) {
    if (this.isDone) {
      return;
    }

    this._cb(this._doneCallback, delta);
  }
}

const durationFromTiming = (timing: Timing) => {
  const t = timing as any;
  if (t.duration) {
    return t.duration;
  }

  if (t.speed >= 0) {
    return 1000 / t.speed;
  }

  return 0;
};

export class GameEngine {
  private _loop = new GameLoop(
    delta => this.update(delta),
    () => this.render()
  );
  private _handles: Handle[] = [];

  canvasSize: Vec2;

  ctx: CanvasRenderingContext2D = null!;
  root = new GameObject();
  isRunning = ref(false);

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    ctx.imageSmoothingEnabled = false;
    this.canvasSize = new Vec2(this.ctx.canvas.width, this.ctx.canvas.height);
  }

  async registerHandle(cb: HandleCallback) {
    const h = new Handle(cb);
    this._handles.push(h);
    return h.promise;
  }

  async moveTo(target: GameObject, targetPos: Vec2, timing: Timing) {
    const t = timing as any;

    const diff = Vec2.diff(targetPos, target.position);
    const direction = Vec2.normalised(diff);

    let speed = t.speed / 1000;

    if (t.duration) {
      let duration = t.duration;
      if (duration <= 0) duration = 1;

      const distance = diff.magnitude();

      speed = distance / duration;
    }

    return this.registerHandle((done, deltaTime) => {
      const newPos = direction
        .copy()
        .scale(deltaTime * speed)
        .add(target.position);

      const isFinished = Vec2.isEqualOrOvershot(newPos, targetPos, direction);

      if (isFinished) {
        target.position.set(targetPos);
        done();
      } else {
        target.position.set(newPos);
      }
    });
  }

  async moveToGrid(target: GameObject, targetGrid: Vec2, timing: Timing) {
    return this.moveTo(target, posFromGrid(targetGrid), timing);
  }

  start() {
    this.isRunning.value = true;
    this._loop.start();
  }

  stop() {
    this.isRunning.value = false;
    this._loop.stop();
  }

  private update(delta: number) {
    this.root.stepEntry(delta, this.root);

    this._handles.forEach(h => h.step(delta));
    this._handles = this._handles.filter(h => !h.isDone);
  }

  private render() {
    // clear everything to prevent artifacts
    this.ctx.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y);

    this.root.draw(this.ctx, 0, 0);
  }
}
