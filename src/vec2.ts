export class Vec2 {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  copy() {
    return new Vec2(this.x, this.y);
  }

  equals(other: Vec2) {
    return Vec2.equals(this, other);
  }

  static equals(a: Vec2, b: Vec2) {
    // probably need an epsilon and a type check
    return a.x === b.x && a.y == b.y;
  }

  static ZERO = () => new Vec2(0, 0);
}
