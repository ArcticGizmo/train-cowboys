import { Vec2 } from '@/engine/Vec2';
import { PlacementMarker } from './PlacementMarker';
import { Direction } from './direction.type';
import { SpaceShip } from './SpaceShip';

export const getNextHorizontalBumpPlacement = (placements: PlacementMarker[], curGridPos: Vec2, direction: Direction) => {
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

export const getNextHorizonalMovePlacement = (ship: SpaceShip, curGridPos: Vec2, direction: Direction) => {
  const placements = ship.getAllPlacements();
  const curPlacement = placements.find(p => p.globalGridPos.equals(curGridPos))!;
  const { roomIndex, level } = curPlacement;

  if (direction === 'left') {
    return ship.getRoom(roomIndex - 1).getEnteringPlacement(level, 'right');
  } else {
    return ship.getRoom(roomIndex + 1).getEnteringPlacement(level, 'left');
  }
};

export const getClimbTarget = (placements: PlacementMarker[], curGridPos: Vec2, direction: Direction) => {
  // get left and right target placements
  const placementsOnLevel = placements.filter(p => p.globalGridPos.y !== curGridPos.y);
  placementsOnLevel.sort((a, b) => a.globalGridPos.x - b.globalGridPos.x);

  return direction === 'right' ? placementsOnLevel[0] : placementsOnLevel[placementsOnLevel.length - 1];
};
