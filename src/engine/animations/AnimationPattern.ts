import { AnimationDefinition } from './AnimationPlayer';

export class AnimationPattern {
  private _config: AnimationDefinition;
  private _duration: number;

  public currentTime: number = 0;

  constructor(config: AnimationDefinition) {
    this._config = config;
    this._duration = config.duration;
  }

  get frame() {
    const frames = this._config.frames;

    for (let i = frames.length - 1; i >= 0; i--) {
      if (this.currentTime >= frames[i].time) {
        return frames[i].frame;
      }
    }
    throw 'Time is before the first keyframe';
  }

  step(delta: number) {
    this.currentTime += delta;
    return this.currentTime >= this._duration;
  }
}
