import { GameObject } from '../gameObject';
import { SpriteCircle } from '../spriteCircle';
import { SpriteDebug } from '../spriteDebug';
import { Vec2 } from '../vec2';

export interface TrainCarConfig {
  position?: Vec2;
  size: Vec2;
  color?: string;
}

const WHEEL_RADIUS = 10;

const createWheel = (carSize: Vec2, radius: number, placement: 'front' | 'back') => {
  const x = placement === 'front' ? radius : carSize.x - radius;
  const y = carSize.y + radius / 2;
  const position = new Vec2(x, y);

  return new SpriteCircle({ position, radius, color: 'green' });
};

export class TrainCar extends GameObject {
  constructor(config: TrainCarConfig) {
    super({ position: config.position });

    this.addChild(new SpriteDebug({ size: config.size, color: config.color }));
    this.addChild(createWheel(config.size, WHEEL_RADIUS, 'front'));
    this.addChild(createWheel(config.size, WHEEL_RADIUS, 'back'));

    this.setup();
  }

  private setup() {
    // generate all the posible player placement positions in the train car
    // - top positions
    // - bottom positions
    // - out of car positions? (maybe later)
  }
}
