import { Vec2 } from './vector2';

export interface GameObjectConfig {
  position: Vec2;
  drawOffset?: Vec2;
}

export class GameObject {
  private _drawOffset: Vec2;

  public position: Vec2;
  public children: GameObject[] = [];

  constructor(config: GameObjectConfig) {
    this.position = config.position;
    this._drawOffset = config.drawOffset ?? Vec2.ZERO();
  }

  stepEntry(delta: number, root: GameObject) {
    // call updates on all children first
    this.children.forEach(c => c.stepEntry(delta, root));

    // call any implemented code
    this.step(delta);
  }

  step(delta: number) {
    // override
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const drawPosX = x + this.position.x + this._drawOffset.x;
    const drawPosY = y + this.position.y + this._drawOffset.y;

    this.drawImage(ctx, drawPosX, drawPosY);

    this.children.forEach(c => c.draw(ctx, drawPosX, drawPosY));
  }

  drawImage(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // override
  }

  addChild(child: GameObject) {
    this.children.push(child);
  }

  removeChild(child: GameObject) {
    this.children = this.children.filter(c => c !== child);
  }
}
