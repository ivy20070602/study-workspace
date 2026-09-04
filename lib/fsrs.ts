import {
  createEmptyCard,
  fsrs,
  Rating,
  State,
  type Card,
  type Grade,
  type RecordLog,
} from "ts-fsrs";

const scheduler = fsrs();

export const GRADES: Grade[] = [Rating.Again, Rating.Hard, Rating.Good, Rating.Easy];

export interface StoredCard {
  word_id: number;
  state: number;
  due: string;
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  last_review: string | null;
}

export function emptyCard(): StoredCard {
  const card = createEmptyCard(new Date());
  return toStored(card);
}

export function fromStored(c: StoredCard | null): Card {
  const base = createEmptyCard(new Date(c?.due ?? Date.now()));
  if (!c) return base;
  const now = Date.now();
  return createEmptyCard(new Date(now), () => ({
    ...base,
    due: new Date(c.due),
    stability: c.stability,
    difficulty: c.difficulty,
    reps: c.reps,
    lapses: c.lapses,
    state: c.state as State,
    last_review: c.last_review ? new Date(c.last_review) : undefined,
  }));
}

export function toStored(card: Card): StoredCard {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review ? card.last_review.toISOString() : null,
  } as StoredCard;
}

export interface AppliedRating {
  card: StoredCard;
  answer: number;
  scheduled_days: number;
  state: number;
}

export function applyRating(
  current: StoredCard | null,
  grade: Grade,
  now: Date = new Date()
): AppliedRating {
  const card = fromStored(current);
  const record: RecordLog = scheduler.repeat(card, now);
  const chosen = record[grade];
  return {
    card: toStored(chosen.card),
    answer: grade,
    scheduled_days: chosen.log.scheduled_days,
    state: chosen.log.state,
  };
}
