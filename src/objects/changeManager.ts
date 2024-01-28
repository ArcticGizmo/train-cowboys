interface ChangeAction {
  do: (deltaTime: number) => void;
  until: () => boolean;
}
// type ChangeAction = (deltaTime: number, finishedWhen: () => boolean) => void;

export class ChangeManager {
  private _queue: ChangeAction[] = [];

  step(delta: number) {
    const cur = this._queue[0];
    if (!cur) {
      return;
    }
    cur.do(delta);
    if (cur.until()) {
      this._queue.shift();
    }
  }

  get hasFinished() {
    return this._queue.length === 0;
  }

  get isRunning() {
    return this._queue.length !== 0;
  }

  then(action: ChangeAction) {
    this._queue.push(action);
    return this;
  }
}
