import { AnimationDefinition } from '@/engine/animations/AnimationPlayer';
import { buildEqualFrames } from '@/engine/animations/animationHelpers';
import { RemoveAndKeepWithEnding } from '@/types/typeHelpers';

export const AstronautAnimations = {
  IDLE_LEFT: buildEqualFrames([0], 100),
  IDLE_RIGHT: buildEqualFrames([1], 100),
  STAND_LEFT: buildEqualFrames([0], 100),
  STAND_RIGHT: buildEqualFrames([1], 100),
};

type MirroredAnimationDefinition<T extends string> = Required<{
  [key in `${T}_LEFT` | `${T}_RIGHT`]: AnimationDefinition;
}>;

export type AstronautAnimationName = keyof typeof AstronautAnimations;

// Does this need to be done ... no ... but why not learn some TS magic.
// This allows us to add on the direciton afterwards
export type AstronautAnimationBaseName = RemoveAndKeepWithEnding<AstronautAnimationName, '_LEFT'>;