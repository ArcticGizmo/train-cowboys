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

  minus(other: Vec2) {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  scale(scale: number) {
    this.x *= scale;
    this.y *= scale;
    return this;
  }

  distanceTo = (other: Vec2) => Vec2.distanceBetween(this, other);

  magnitude = () => Vec2.magnitude(this);

  normalised = () => Vec2.normalised(this);

  static equals(a: Vec2, b: Vec2) {
    // probably need an epsilon and a type check
    return a.x === b.x && a.y == b.y;
  }

  static combine(a: Vec2, b: Vec2) {
    return new Vec2(a.x + b.x, a.y + b.y);
  }

  static diff(a: Vec2, b: Vec2) {
    return new Vec2(a.x - b.x, a.y - b.y);
  }

  static magnitude(a: Vec2) {
    return Math.sqrt(a.x * a.x + a.y * a.y);
  }

  static normalised(a: Vec2) {
    const mag = this.magnitude(a);
    return new Vec2(a.x / mag, a.y / mag);
  }

  static ZERO = () => new Vec2(0, 0);

  static distanceBetween(a: Vec2, b: Vec2) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  static isEqualOrOvershot(pos: Vec2, targetPos: Vec2, direction: Vec2) {
    // protect against null divisor
    if (pos.x === targetPos.x && pos.y === targetPos.y) {
      return true;
    }

    const diff = Vec2.diff(targetPos, pos);
    return diff.x / direction.x < 0 || diff.y / direction.y < 0;
  }
}
