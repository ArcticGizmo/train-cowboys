import { Vec2 } from './Vec2';

export interface GameObjectConfig {
  position?: Vec2;
  drawOffset?: Vec2;
}

export class GameObject {
  private _drawOffset: Vec2;

  public position: Vec2;
  public parent?: GameObject;
  public children: GameObject[] = [];

  constructor(config?: GameObjectConfig) {
    const c = config ?? {};
    this.position = c.position ?? Vec2.ZERO();
    this._drawOffset = c.drawOffset ?? Vec2.ZERO();
  }

  get globalPosition(): Vec2 {
    if (!this.parent) {
      return Vec2.ZERO();
    }

    return this.position.copy().add(this.parent.globalPosition);
  }

  get root(): GameObject {
    if (!this.parent) {
      return this;
    }

    let root: GameObject = this;
    while (root.parent) {
      root = root.parent;
    }
    return root;
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
    child.parent = this;
    this.children.push(child);
  }

  removeChild(child: GameObject) {
    child.parent = undefined;
    this.children = this.children.filter(c => c !== child);
  }

  destroy() {
    this.onDestroy();
    this.parent?.removeChild(this);
  }

  destroyChildren() {
    this.children.forEach(c => c.destroyChildren());
    this.destroy();
  }

  onDestroy() {}

  findAllChildrenOfType<T extends GameObject>(type: Constructor<T>): T[] {
    const children = this.children.flatMap(c => c.findAllChildrenOfType(type));
    if (this instanceof type) children.push(this);
    return children;
  }
}

// tslint:disable-next-line: no-any
type Constructor<T> = new (...args: any[]) => T;
