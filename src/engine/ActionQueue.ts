import { GameObject } from './GameObject';
import { Vec2 } from './Vec2';

type DoneCallback = () => void;
type ActionCallback = (deltaTime: number, done: DoneCallback) => void;

export class ActionQueue {
  private _queue: ActionQueue[] = [];
  private _actions: ActionCallback[] = [];

  constructor() {}

  isFinished() {
    return this._queue.length === 0 && this._actions.length === 0;
  }

  inProgress() {
    return !this.isFinished();
  }

  step(delta: number) {
    if (this.isFinished()) {
      return;
    }
    // run nested steps
    this._queue.forEach(q => q.step(delta));
    this._queue = this._queue.filter(q => !q.isFinished());

    if (this._queue.length !== 0) {
      return;
    }

    const curAction = this._actions[0];

    if (!curAction) return;

    let isDone = false;
    curAction(delta, () => (isDone = true));

    if (isDone) {
      this._actions.shift();
    }
  }

  do(callback: ActionCallback) {
    const aq = new ActionQueue().thenDo(callback);
    this._queue.push(aq);
    return aq;
  }

  thenDo(callback: ActionCallback) {
    this._actions.push(callback);
    return this;
  }

  clear() {
    this._queue = [];
    return this;
  }
}

export class AQHelper {
  static MoveTo(target: GameObject, targetPos: Vec2, speed: number): ActionCallback {
    // do i need to worry about global position here?
    const direction = Vec2.diff(targetPos, target.position).normalised();
    return (deltaTime, done) => {
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
    };
  }

  static DoFor(callback: (deltaTime: number) => void, duration: number): ActionCallback {
    let timeElapsed = 0;

    return (deltaTime, done) => {
      callback(deltaTime);
      timeElapsed += deltaTime;
      if (timeElapsed >= duration) {
        done();
      }
    };
  }
}

export const AQ = new ActionQueue();
