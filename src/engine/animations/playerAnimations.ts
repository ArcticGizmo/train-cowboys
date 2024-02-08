import { RemoveAndKeepWithEnding } from '@/types/typeHelpers';
import { AnimationDefinition } from './AnimationPlayer';
import { buildEqualFrames, range } from './animationHelpers';

// frame offset for varient
const MIRROR_OFFSET = 15 * 5;

type MirroredAnimationDefinition<T extends string> = Required<{
  [key in `${T}_RIGHT` | `${T}_LEFT`]: AnimationDefinition;
}>;

const buildMirroredEqualFrames = <T extends string>(name: T, frameNumbers: number[], duration: number) => {
  const right = buildEqualFrames(frameNumbers, duration);
  const left = buildEqualFrames(
    frameNumbers.map(n => n + MIRROR_OFFSET),
    duration
  );

  return { [`${name}_LEFT`]: left, [`${name}_RIGHT`]: right } as MirroredAnimationDefinition<T>;
};

export const PlayerAnimations = {
  ...buildMirroredEqualFrames('IDLE', range(0, 3), 500),
  ...buildMirroredEqualFrames('WALK', range(5, 8), 500),
  ...buildMirroredEqualFrames('SHOOT', [...range(10, 18), ...range(12, 10)], 1000),
  ...buildMirroredEqualFrames('CLIMB', range(20, 23), 1000),
  ...buildMirroredEqualFrames('FALL', range(25, 29), 500),
  ...buildMirroredEqualFrames('TURN_FROM', range(30, 32), 500),
  ...buildMirroredEqualFrames('REFLEX', range(35, 45), 1500),
  ...buildMirroredEqualFrames('STAND', range(50, 59), 1500),
  ...buildMirroredEqualFrames('FREE_FALL', range(60, 64), 1000),
  ...buildMirroredEqualFrames('TUMBLE', range(65, 70), 500)
};

export type PlayerAnimationName = keyof typeof PlayerAnimations;

// Does this need to be done ... no ... but why not learn some TS magic.
// This allows us to add on the direciton afterwards
export type PlayerAnimationBaseName = RemoveAndKeepWithEnding<PlayerAnimationName, '_LEFT'>;
