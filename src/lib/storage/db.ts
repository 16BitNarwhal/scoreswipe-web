import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { AppSettings, Score } from '@/lib/models/score';
import type { Folder } from '@/lib/models/folder';

export class ScoreSwipeDatabase extends Dexie {
  scores!: Table<Score>;
  settings!: Table<AppSettings & { id?: number }>;
  folders!: Table<Folder>;

  constructor() {
    super('scoreswipe');
    this.version(1).stores({
      scores: '&id, name, favorite, updatedAt',
      settings: '++id',
    });
    this.version(2)
      .stores({
        scores: '&id, name, favorite, updatedAt, folderId',
        settings: '++id',
        folders: '&id, name, parentId, updatedAt',
      })
      .upgrade(async (transaction) => {
        await transaction.table('scores').toCollection().modify((score: unknown) => {
          const scoreRecord = score as Partial<Score> & { folderId?: string | null; tags?: unknown };
          if (!('folderId' in scoreRecord)) {
            scoreRecord.folderId = null;
          }
          if ('tags' in scoreRecord) {
            delete scoreRecord.tags;
          }
        });
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
});
