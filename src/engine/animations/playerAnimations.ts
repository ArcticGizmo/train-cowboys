import { AnimationConfig } from './AnimationPlayer';

interface FrameRange {
  from: number;
  to: number;
}

const buildEqualFrames = (maybeFrameNumbers: number[] | FrameRange, duration: number): AnimationConfig => {
  const frameNumbers = extractRange(maybeFrameNumbers);

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

const extractRange = (maybeFrameNumbers: number[] | FrameRange): number[] => {
  const asFrameRange = maybeFrameNumbers as FrameRange;
  if (asFrameRange.to != null) {
    return range(asFrameRange.from, asFrameRange.to);
  }

  return maybeFrameNumbers as number[];
};

const range = (first: number, last: number): number[] => {
  const r: number[] = [];
  if (first < last) {
    for (let i = first; i <= last; i++) {
      r.push(i);
    }
  } else {
    for (let i = first; i >= last; i++) {
      r.push(i);
    }
  }

  return r;
};

export const PlayerAnimations = {
  IDLE_RIGHT: buildEqualFrames({ from: 0, to: 3 }, 500),
  WALK_RIGHT: buildEqualFrames({ from: 6, to: 9 }, 500),
  SHOOT_RIGHT: buildEqualFrames([...range(12, 20), 14, 13, 12], 1000),
  CLIMB: buildEqualFrames({ from: 24, to: 27 }, 1000),
  FALL_RIGHT: buildEqualFrames({ from: 30, to: 35 }, 500)
};

export type PlayerAnimationName = keyof typeof PlayerAnimations;
