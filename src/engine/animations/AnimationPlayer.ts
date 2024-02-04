import { AnimationPattern } from './AnimationPattern';

export interface AnimationDefinition {
  duration: number;
  frames: AnimationFrame[];
}

export interface AnimationFrame {
  time: number;
  frame: number;
}

export interface PlayRequest {
  key: string;
  once?: boolean;
}

export type AnimationPatterns = Record<string, AnimationPattern>;

export class AnimationPlayer {
  private _patterns: AnimationPatterns;
  private _activeKey: string;
  private _isContinuous = true;

  isFinished = true;

  constructor(patterns: AnimationPatterns) {
    this._patterns = patterns;
    // default to the first pattern
    this._activeKey = Object.keys(patterns)[0];
  }

  get frame() {
    return this._patterns[this._activeKey].frame;
  }

  play(req: PlayRequest) {
    if (req.once) {
      this.playOnce(req.key);
    } else {
      this.playForever(req.key);
    }
  }

  playForever(key: string) {
    if (this._activeKey === key && this._isContinuous) {
      // don't restart the animation, it is already playing
      return;
    }

    this.isFinished = false;
    this._isContinuous = true;
    this._activeKey = key;
    this._patterns[key].currentTime = 0;
  }

  playOnce(key: string) {
    // this one will always trigger the start of the animation
    this._isContinuous = false;
    this._activeKey = key;
    this._patterns[key].currentTime = 0;
  }

  step(delta: number) {
    const pattern = this._patterns[this._activeKey];
    const isDone = pattern.step(delta);

    // if still running, nothing to report
    if (!isDone) {
      return;
    }

    // if done, but in continuous mode, restart animation
    if (this._isContinuous) {
      pattern.currentTime = 0;
      return;
    }

    // if done and in single shot mode, mark as finished
    this.isFinished = true;
  }
}
