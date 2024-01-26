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
const PLAYER_COUNT = 3;
const PLACEMENT_RADIUS = 2;

const createWheel = (carSize: Vec2, radius: number, placement: 'front' | 'back') => {
  const x = placement === 'front' ? radius : carSize.x - radius;
  const y = carSize.y + radius / 2;
  const position = new Vec2(x, y);

  return new SpriteCircle({ position, radius, color: 'black' });
};

const createPlacements = (carSize: Vec2) => {
  const placements: GameObject[] = [];
  const topY = -15;
  const bottomY = carSize.y - 12;

  let xStart = 10;
  const xStep = (carSize.x * 0.9) / PLAYER_COUNT;
  for (let i = 0; i < PLAYER_COUNT; i++) {
    placements.push(
      new SpriteCircle({
        position: new Vec2(xStart + xStep * i, topY),
        radius: PLACEMENT_RADIUS
      })
    );

    placements.push(
      new SpriteCircle({
        position: new Vec2(xStart + xStep * i, bottomY),
        radius: PLACEMENT_RADIUS
      })
    );
  }

  return placements;
};

export class TrainCar extends GameObject {
  constructor(config: TrainCarConfig) {
    super({ position: config.position });

    this.addChild(new SpriteDebug({ size: config.size, color: config.color }));
    this.addChild(createWheel(config.size, WHEEL_RADIUS, 'front'));
    this.addChild(createWheel(config.size, WHEEL_RADIUS, 'back'));

    const placements = createPlacements(config.size);
    placements.forEach(p => this.addChild(p));

    // TODO:
    // generate all the posible player placement positions in the train car
    // - top positions
    // - bottom positions
    // - out of car positions? (maybe later)
  }
}
