import { Resource } from './resources';
import { Vec2 } from './vector2';

export interface SpriteConfig {
  resource: Resource;
  frameSize: Vec2;
  hFrames?: number;
  vFrames?: number;
  frame?: number;
  scale?: number;
  position?: Vec2;
}

export class Sprite {
  private _resource: Resource;
  private _frameSize: Vec2;
  private _hFrames: number;
  private _vFrames: number;
  private _frame: number;
  private _scale: number;
  private _position: Vec2;

  private _frameMap: Map<number, Vec2> = new Map();

  constructor(config: SpriteConfig) {
    this._resource = config.resource;
    (this._frameSize = config.frameSize), (this._hFrames = config.hFrames ?? 1);
    this._vFrames = config.vFrames ?? 1;
    this._frame = config.frame ?? 0;
    this._scale = config.scale ?? 1;
    this._position = config.position ?? new Vec2(0, 0);

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

  drawImage(ctx: CanvasRenderingContext2D, x: number, y: number) {
    if (!this._resource.isLoaded) {
      return;
    }

    // Find the correct sprite sheet frame to  use
    const frame = this._frameMap.get(this._frame);

    const { x: frameSizeX, y: frameSizeY } = this._frameSize;

    ctx.drawImage(
      this._resource.image,
      frame?.x ?? 0,
      frame?.y ?? 0,
      frameSizeX,
      frameSizeY,
      x,
      y,
      frameSizeX * this._scale,
      frameSizeY * this._scale
    );
  }
}
