import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { AppSettings, Score } from '@/lib/models/score';

export class ScoreSwipeDatabase extends Dexie {
  scores!: Table<Score>;
  settings!: Table<AppSettings & { id?: number }>;

  constructor() {
    super('scoreswipe');
    this.version(1).stores({
      scores: '&id, name, favorite, updatedAt',
      settings: '++id',
    });
  }
}

export const db = new ScoreSwipeDatabase();

export const getDefaultSettings = (): AppSettings => ({
  calibration: {
    neutralEulerY: 0,
    neutralEulerZ: 0,
    sensitivity: 0.5,
    invertDirection: false,
    swipeMode: 'tilt',
  },
  viewer: {
    autoAdvance: false,
    autoScroll: false,
    highlightCurrentBar: false,
  },
  onboardingCompleted: false,
});
