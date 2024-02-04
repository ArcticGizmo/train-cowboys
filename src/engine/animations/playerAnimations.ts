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

// frame offset for varient
const MIRROR_OFFSET = 12 * 5;

type MirroredAnimationDefinition<T extends string> = Required<{
  [key in `${T}_RIGHT` | `${T}_LEFT`]: AnimationDefinition;
}>;

const buildMirroredEqualFrames = <T extends string>(name: T, frameNumbers: number[], duration: number) => {
  const left = buildEqualFrames(frameNumbers, duration);
  const right = buildEqualFrames(
    frameNumbers.map(n => n + MIRROR_OFFSET),
    duration
  );

  return { [`${name}_LEFT`]: left, [`${name}_RIGHT`]: right } as MirroredAnimationDefinition<T>;
};

export const PlayerAnimations = {
  ...buildMirroredEqualFrames('IDLE', range(0, 3), 500),
  ...buildMirroredEqualFrames('WALK', range(5, 8), 500),
  ...buildMirroredEqualFrames('SHOOT', [...range(10, 18), ...range(12, 10)], 1000),
  CLIMB: buildEqualFrames(range(20, 23), 1000),
  ...buildMirroredEqualFrames('FALL', range(25, 29), 500),
  ...buildMirroredEqualFrames('TURN_FROM', range(30, 32), 500),
  ...buildMirroredEqualFrames('REFLEX', range(35, 45), 1500),
  ...buildMirroredEqualFrames('STAND', range(50, 59), 1500)
};

export type PlayerAnimationName = keyof typeof PlayerAnimations;
