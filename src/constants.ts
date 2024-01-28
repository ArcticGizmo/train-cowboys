import { Vec2 } from './vec2';

export const PROPS = {
  train: {
    widthOffset: 50,
    heightOffset: 50,
    width: 100,
    height: 40,
    carSpacing: 20,
    initialLength: 2
  },
  player: {
    size: new Vec2(10, 25)
  },
  showPlacements: true,
  initialPlayerCount: 2
};
