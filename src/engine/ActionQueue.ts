import { GameObject } from './GameObject';
import { Vec2 } from './Vec2';

type DoneCallback = () => void;
type ActionCallback = (deltaTime: number, done: DoneCallback) => void;

export class ActionQueue {
  private _queue: ActionCallback[] = [];

  constructor() {}

  isFinished() {
    return this._queue.length === 0;
  }

  step(delta: number) {
    const cur = this._queue[0];
    if (!cur) return;

    let isDone = false;
    cur(delta, () => (isDone = true));

    if (isDone) {
      this._queue.shift();
    }
  }

  do(callback: ActionCallback) {
    this._queue.push(callback);
    return this;
  }

  thenDo(callback: ActionCallback) {
    this._queue.push(callback);
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

// interface ChangeAction {
//   do: (deltaTime: number) => void;
//   until: () => boolean;
// }
// // type ChangeAction = (deltaTime: number, finishedWhen: () => boolean) => void;

// export class ChangeManager {
//   private _queue: ChangeAction[] = [];

//   step(delta: number) {
//     const cur = this._queue[0];
//     if (!cur) {
//       return;
//     }
//     cur.do(delta);
//     if (cur.until()) {
//       this._queue.shift();
//     }
//   }

//   get hasFinished() {
//     return this._queue.length === 0;
//   }

//   get isRunning() {
//     return this._queue.length !== 0;
//   }

//   then(action: ChangeAction) {
//     this._queue.push(action);
//     return this;
//   }
// }
