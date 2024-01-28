import { AnimationConfig } from './AnimationPlayer';

const buildWalkingFrames = (rootFrame: number): AnimationConfig => {
  return {
    duration: 400,
    frames: [
      {
        time: 0,
        frame: rootFrame + 1
      },
      {
        time: 100,
        frame: rootFrame
      },
      {
        time: 200,
        frame: rootFrame + 1
      },
      {
        time: 300,
        frame: rootFrame + 2
      }
    ]
  };
};

const buildIdleFrames = (rootFrame: number): AnimationConfig => {
  return {
    duration: 400,
    frames: [
      {
        time: 0,
        frame: rootFrame
      }
    ]
  };
};

export const PlayerAnimations = {
  WALK_DOWN: buildWalkingFrames(0),
  WALK_UP: buildWalkingFrames(3),
  WALK_LEFT: buildWalkingFrames(6),
  WALK_RIGHT: buildWalkingFrames(9),
  IDLE_DOWN: buildIdleFrames(1),
  IDLE_UP: buildIdleFrames(4),
  IDLE_LEFT: buildIdleFrames(7),
  IDLE_RIGHT: buildIdleFrames(10)
};
