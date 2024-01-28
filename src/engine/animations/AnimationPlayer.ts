import { FrameIndexPattern } from './FrameIndexPattern';

export interface AnimationConfig {
  duration: number;
  frames: AnimationFrame[];
}

export interface AnimationFrame {
  time: number;
  frame: number;
}

export type FramePatterns = Record<string, FrameIndexPattern>;

export class AnimationPlayer {
  private _patterns: FramePatterns;
  private _activeKey: string;

  constructor(patterns: FramePatterns) {
    this._patterns = patterns;
    this._activeKey = Object.keys(patterns)[0];
  }

  get frame() {
    return this._patterns[this._activeKey].frame;
  }

  play(key: string, startAtTime = 0) {
    if (this._activeKey === key) {
      return;
    }
    this._activeKey = key;
    this._patterns[key].currentTime = startAtTime;
  }

  step(delta: number) {
    this._patterns[this._activeKey].step(delta);
  }
}
