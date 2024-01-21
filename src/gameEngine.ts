type UpdateCallback = (deltaTime: number) => void;
type RenderCallback = () => void;
export class GameLoop {
  private _update: UpdateCallback;
  private _render: RenderCallback;

  private _lastFrameTime = 0;
  private _accumulatedTime = 0;

  private _timeStep = 1000 / 60;

  // request animation frame id
  private _rafId: number | null = null;
  private _isRunning = false;

  constructor(update: UpdateCallback, render: RenderCallback) {
    this._update = update;
    this._render = render;
  }

  private mainLoop(timestamp: number) {
    if (!this._isRunning) {
      return;
    }

    const deltaTime = timestamp - this._lastFrameTime;

    this._accumulatedTime += deltaTime;

    // fixed time updates
    while (this._accumulatedTime >= this._timeStep) {
      this._update(this._timeStep);
      this._accumulatedTime -= this._timeStep;
    }

    // render
    this._render();

    this._rafId = requestAnimationFrame(ts => this.mainLoop(ts));
  }

  start() {
    if (!this._isRunning) {
      this._rafId = requestAnimationFrame(ts => this.mainLoop(ts));
    }
    this._isRunning = true;
  }

  stop() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
    }
    this._isRunning = false;
  }
}
