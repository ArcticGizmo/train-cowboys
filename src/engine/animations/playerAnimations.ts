import { AnimationDefinition } from './AnimationPlayer';

const buildEqualFrames = (frameNumbers: number[], duration: number): AnimationDefinition => {
  const timeStep = duration / frameNumbers.length;

  const frames = frameNumbers.map((num, index) => {
    return {
      time: timeStep * index,
      frame: num
    };
  });

  return {
    duration,
    frames
  };
};

const range = (first: number, last: number): number[] => {
  const r: number[] = [];
  if (first < last) {
    for (let i = first; i <= last; i++) {
      r.push(i);
    }
  } else {
    for (let i = last; i >= last; i--) {
      r.push(i);
    }
  }

  return r;
};

export const PlayerAnimations = {
  IDLE_RIGHT: buildEqualFrames(range(0, 3), 500),
  WALK_RIGHT: buildEqualFrames(range(5, 8), 500),
  SHOOT_RIGHT: buildEqualFrames([...range(10, 18), ...range(12, 10)], 1000),
  CLIMB: buildEqualFrames(range(20, 23), 1000),
  FALL_RIGHT: buildEqualFrames(range(25, 29), 500),
  TURN_FROM_RIGHT: buildEqualFrames(range(30, 32), 500),
  REFLEX_RIGHT: buildEqualFrames(range(35, 45), 1500),
  STAND_RIGHT: buildEqualFrames(range(50, 59), 1500)
};

export type PlayerAnimationName = keyof typeof PlayerAnimations;
