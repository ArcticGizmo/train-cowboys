import { AnimationDefinition } from './AnimationPlayer';

export const range = (first: number, last: number): number[] => {
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

export const buildEqualFrames = (frameNumbers: number[], duration: number): AnimationDefinition => {
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
