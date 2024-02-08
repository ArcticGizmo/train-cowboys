import { AnimationPlayer } from './animations/AnimationPlayer';
import { GameObject } from './GameObject';
import { Resource } from './Resources';
import { Vec2 } from './Vec2';

export interface SpriteConfig {
  resource: Resource;
  frameSize: Vec2;
  hFrames?: number;
  vFrames?: number;
  frame?: number;
  scale?: number;
  xScale?: number;
  yScale?: number;
  position?: Vec2;
  opacity?: number;
  animationPlayer?: AnimationPlayer;
}

export class Sprite extends GameObject {
  private _resource: Resource;
  private _frameSize: Vec2;
  private _hFrames: number;
  private _vFrames: number;
  frame: number;
  xScale: number;
  yScale: number;
  opacity: number;
  animationPlayer?: AnimationPlayer;

  private _frameMap: Map<number, Vec2> = new Map();

  constructor(config: SpriteConfig) {
    super({ position: config.position ?? Vec2.ZERO() });
    this._resource = config.resource;
    this._frameSize = config.frameSize;
    this._hFrames = config.hFrames ?? 1;
    this._vFrames = config.vFrames ?? 1;
    this.frame = config.frame ?? 0;
    this.xScale = config.xScale ?? config.scale ?? 1;
    this.yScale = config.yScale ?? config.scale ?? 1;
    this.opacity = config.opacity ?? 1;

    this.animationPlayer = config.animationPlayer;

    this.buildFrameMap();
  }

  private buildFrameMap() {
    let frameCount = 0;
    const frameSizeX = this._frameSize.x;
    const frameSizeY = this._frameSize.y;
    for (let v = 0; v < this._vFrames; v++) {
      for (let h = 0; h < this._hFrames; h++) {
        this._frameMap.set(frameCount, new Vec2(frameSizeX * h, frameSizeY * v));
        frameCount++;
      }
    }
  }

  step(delta: number) {
    if (!this.animationPlayer) {
      return;
    }

    this.animationPlayer.step(delta);
    this.frame = this.animationPlayer.frame;
  }

  drawImage(ctx: CanvasRenderingContext2D, x: number, y: number) {
    if (!this._resource.isLoaded) {
      return;
    }

    // Find the correct sprite sheet frame to  use
    const frame = this._frameMap.get(this.frame);

    const { x: frameSizeX, y: frameSizeY } = this._frameSize;

    ctx.globalAlpha = this.opacity;
    ctx.drawImage(
      this._resource.image,
      frame?.x ?? 0,
      frame?.y ?? 0,
      frameSizeX,
      frameSizeY,
      x,
      y,
      frameSizeX * this.xScale,
      frameSizeY * this.yScale
    );
    ctx.globalAlpha = 1;
  }
}
