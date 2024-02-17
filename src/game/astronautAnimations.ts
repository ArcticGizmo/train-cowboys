import { AnimationDefinition } from '@/engine/animations/AnimationPlayer';
import { buildEqualFrames } from '@/engine/animations/animationHelpers';
import { RemoveAndKeepWithEnding } from '@/types/typeHelpers';

export const AstronautAnimations = {
  IDLE_LEFT: buildEqualFrames([0], 100),
  IDLE_RIGHT: buildEqualFrames([1], 100),
  STAND_LEFT: buildEqualFrames([0], 100),
  STAND_RIGHT: buildEqualFrames([1], 100),
  WALK_LEFT: buildEqualFrames([0], 100),
  WALK_RIGHT: buildEqualFrames([1], 100),
  TURN_FROM_LEFT: buildEqualFrames([0], 100),
  TURN_FROM_RIGHT: buildEqualFrames([1], 100),
  CLIMB_LEFT: buildEqualFrames([0], 100),
  CLIMB_RIGHT: buildEqualFrames([1], 100),
  FALL_LEFT: buildEqualFrames([0], 100),
  FALL_RIGHT: buildEqualFrames([1], 100),
  FREE_FALL_LEFT: buildEqualFrames([0], 100),
  FREE_FALL_RIGHT: buildEqualFrames([1], 100),
  SHOOT_LEFT: buildEqualFrames([0], 100),
  SHOOT_RIGHT: buildEqualFrames([1], 100),
  REFLEX_LEFT: buildEqualFrames([0], 100),
  REFLEX_RIGHT: buildEqualFrames([1], 100),
};

type MirroredAnimationDefinition<T extends string> = Required<{
  [key in `${T}_LEFT` | `${T}_RIGHT`]: AnimationDefinition;
}>;

export type AstronautAnimationName = keyof typeof AstronautAnimations;

// Does this need to be done ... no ... but why not learn some TS magic.
// This allows us to add on the direciton afterwards
export type AstronautAnimationBaseName = RemoveAndKeepWithEnding<AstronautAnimationName, '_LEFT'>;