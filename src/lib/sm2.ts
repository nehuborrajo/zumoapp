/**
 * SM-2 (SuperMemo 2) Spaced Repetition Algorithm
 *
 * The algorithm calculates when a flashcard should be reviewed next
 * based on the quality of the user's response.
 *
 * Quality scale (0-5):
 *   0-2: Incorrect - reset repetitions
 *   3: Correct but difficult
 *   4: Correct
 *   5: Perfect recall
 */

export interface SM2Input {
  quality: number; // 0-5: quality of response
  easeFactor: number; // current ease factor (default 2.5)
  interval: number; // current interval in days
  repetitions: number; // number of consecutive correct responses
}

export interface SM2Output {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewAt: Date;
}

/**
 * Calculate the next review date and updated SM-2 parameters
 * based on the quality of response.
 */
export function calculateSM2(input: SM2Input): SM2Output {
  const { quality, easeFactor: currentEF, interval: currentInterval, repetitions: currentReps } = input;

  let newEaseFactor = currentEF;
  let newInterval: number;
  let newRepetitions: number;

  // Quality >= 3 means correct response
  if (quality >= 3) {
    // Increment repetitions
    newRepetitions = currentReps + 1;

    // Calculate new interval based on repetition count
    if (newRepetitions === 1) {
      newInterval = 1; // First correct: review tomorrow
    } else if (newRepetitions === 2) {
      newInterval = 6; // Second correct: review in 6 days
    } else {
      // Subsequent correct: interval = previous interval * ease factor
      newInterval = Math.round(currentInterval * currentEF);
    }

    // Update ease factor based on quality
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    newEaseFactor = currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    // Ease factor should never go below 1.3
    newEaseFactor = Math.max(1.3, newEaseFactor);
  } else {
    // Quality < 3 means incorrect - reset
    newRepetitions = 0;
    newInterval = 1; // Review tomorrow
    // Keep ease factor unchanged on incorrect (some variants lower it)
  }

  // Calculate next review date
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);
  // Set to start of day for consistency
  nextReviewAt.setHours(0, 0, 0, 0);

  return {
    easeFactor: Math.round(newEaseFactor * 100) / 100, // Round to 2 decimal places
    interval: newInterval,
    repetitions: newRepetitions,
    nextReviewAt,
  };
}

/**
 * Mapping of UI button responses to SM-2 quality values
 *
 * "No lo sabía" (Again) → 1: Complete blackout, wrong answer
 * "Más o menos" (Hard)  → 3: Correct but with difficulty
 * "¡Lo sabía!" (Easy)   → 5: Perfect recall
 */
export const QUALITY_MAP = {
  again: 1, // "No lo sabía" - incorrect
  hard: 3, // "Más o menos" - correct with difficulty
  easy: 5, // "¡Lo sabía!" - perfect recall
} as const;

export type QualityButton = keyof typeof QUALITY_MAP;

/**
 * Default SM-2 values for new flashcards
 */
export const SM2_DEFAULTS = {
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
} as const;
