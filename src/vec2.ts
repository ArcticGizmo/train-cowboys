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

  set(other: Vec2) {
    this.x = other.x;
    this.y = other.y;
    return this;
  }

  add(other: Vec2) {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  scale(scale: number) {
    this.x *= scale;
    this.y *= scale;
    return this;
  }

  distanceTo(other: Vec2) {
    return Vec2.distanceBetween(this, other);
  }

  static equals(a: Vec2, b: Vec2) {
    // probably need an epsilon and a type check
    return a.x === b.x && a.y == b.y;
  }

  static ZERO = () => new Vec2(0, 0);

  static distanceBetween(a: Vec2, b: Vec2) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }
}
