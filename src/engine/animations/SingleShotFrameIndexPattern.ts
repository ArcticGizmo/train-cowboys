import { AnimationConfig } from './AnimationPlayer';

export class SingleShotFrameIndexPattern {
  private _config: AnimationConfig;
  private _duration: number;

  public currentTime: number = 0;

  constructor(config: AnimationConfig) {
    this._config = config;
    this._duration = config.duration;
  }

  get frame() {
    const frames = this._config.frames;

    if (this.currentTime > this._duration) {
      return frames[frames.length - 1].frame;
    }

    for (let i = frames.length - 1; i >= 0; i--) {
      if (this.currentTime >= frames[i].time) {
        return frames[i].frame;
      }
    }
    throw 'Time is before the first keyframe';
  }

  step(delta: number) {
    if (this.currentTime < this._duration) {
      this.currentTime += delta;
    }
  }
}
