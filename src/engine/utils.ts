import { Vec2 } from './Vec2';

const GRID_SIZE = 16;

export const posFromGrid = (gridPos: Vec2) => {
  return new Vec2(gridPos.x * GRID_SIZE, gridPos.y * GRID_SIZE);
};

export const gridFromPos = (pos: Vec2) => {
  return new Vec2(Math.floor(pos.x / GRID_SIZE), Math.floor(pos.y / GRID_SIZE));
};
