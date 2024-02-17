import { Placement } from './Placement';
import { Direction } from './direction.type';

export const getNextHorizontalBumpPlacement = (placements: Placement[], curPlacement: Placement, direction: Direction) => {
  let relevant = placements.filter(p => (p.level = curPlacement.level));
  if (direction === 'left') {
    relevant = relevant.filter(p => p.globalGridPos.x < curPlacement.globalGridPos.x);
    relevant.sort((a, b) => b.globalGridPos.x - a.globalGridPos.x);
    return relevant[0];
  } else {
    relevant = relevant.filter(p => p.globalGridPos.x > curPlacement.globalGridPos.x);
    relevant.sort((a, b) => a.globalGridPos.x - b.globalGridPos.x);
    return relevant[0];
  }
};


