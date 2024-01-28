import { Vec2 } from './Vec2';

const GRID_SIZE = 16;

export const posFromGrid = (x: number, y: number) => {
  return new Vec2(x * GRID_SIZE, y * GRID_SIZE);
};
