import { AnimationConfig, AnimationFrame } from './AnimationPlayer';

const buildEqualFrames = (frameNumbers: number[], duration: number): AnimationConfig => {
  const frames: AnimationFrame[] = [];
  const timeStep = duration / frameNumbers.length;

  for (let i = 0; i < frameNumbers.length; i++) {
    frames.push({
      time: timeStep * i,
      frame: i
    });
  }

  return {
    duration,
    frames
  };
};

export const PlayerAnimations = {
  IDLE_RIGHT: buildEqualFrames([0, 1, 2, 3], 500)
};

export type PlayerAnimationName = keyof typeof PlayerAnimations;
