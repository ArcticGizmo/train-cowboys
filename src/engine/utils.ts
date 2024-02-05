import { Placement } from './Placement';
import { Train } from './Train';
import { Vec2 } from './Vec2';
import { Direction } from './direction';

const GRID_SIZE = 16;

export const posFromGrid = (gridPos: Vec2) => {
  return new Vec2(gridPos.x * GRID_SIZE, gridPos.y * GRID_SIZE);
};

export const gridFromPos = (pos: Vec2) => {
  return new Vec2(Math.floor(pos.x / GRID_SIZE), Math.floor(pos.y / GRID_SIZE));
};

export const getNextHorizontalBumpPlacement = (placements: Placement[], curGridPos: Vec2, direction: Direction) => {
  let relevant = placements.filter(p => p.globalGridPos.y === curGridPos.y);
  if (direction === 'left') {
    relevant = relevant.filter(p => p.globalGridPos.x < curGridPos.x);
    relevant.sort((a, b) => b.globalGridPos.x - a.globalGridPos.x);
    return relevant[0];
  } else {
    relevant = relevant.filter(p => p.globalGridPos.x > curGridPos.x);
    relevant.sort((a, b) => a.globalGridPos.x - b.globalGridPos.x);
    return relevant[0];
  }
};

export const getNextHorizonalMovePlacement = (train: Train, curGridPos: Vec2, direction: Direction) => {
  const placements = train.getAllPlacements();
  const curPlacement = placements.find(p => p.globalGridPos.equals(curGridPos))!;

  const carIndex = train.getCarIndexFromPlacement(curPlacement);

  const level = train.getEngine().getLevelFromPlacement(curPlacement);
  if (direction === 'left') {
    return train.getCar(carIndex - 1).getPlacement(level, 'right');
  } else {
    return train.getCar(carIndex + 1).getPlacement(level, 'left');
  }
};

export const getNextVerticalPlacement = (placements: Placement[], curGridPos: Vec2) => {
  return placements.find(p => p.globalGridPos.x === curGridPos.x && p.globalGridPos.y !== curGridPos.y)!;
};

