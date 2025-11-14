'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { db, getDefaultSettings } from '@/lib/storage/db';
import type { AppSettings, Score, ScorePage } from '@/lib/models/score';

interface ScoreState {
  scores: Score[];
  selectedScoreId?: string;
  settings: AppSettings;
  loading: boolean;
  error?: string;
  initialize: () => Promise<void>;
  addScore: (input: Omit<Score, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateScore: (id: string, updates: Partial<Score>) => Promise<void>;
  deleteScore: (id: string) => Promise<void>;
  reorderScores: (ids: string[]) => void;
  toggleFavorite: (id: string) => Promise<void>;
  selectScore: (id?: string) => void;
  upsertSettings: (partial: Partial<AppSettings>) => Promise<void>;
}

const serializePages = async (pages: ScorePage[]): Promise<ScorePage[]> => {
  const clones = await Promise.all(
    pages.map(async (page) => ({
      ...page,
      imageBlob: page.imageBlob,
    })),
  );
  return clones;
};

export const useScoreStore = create<ScoreState>()(
  devtools((set, get) => ({
    scores: [],
    settings: getDefaultSettings(),
    loading: true,
    initialize: async () => {
      try {
        const [scores, settingsRecord] = await Promise.all([
          db.scores.toArray(),
          db.settings.toCollection().first(),
        ]);
        
        // Ensure blobs are proper Blob instances after retrieval from IndexedDB
        // IndexedDB should preserve Blobs, but we validate them anyway
        const normalizedScores = scores.map((score) => ({
          ...score,
          pages: score.pages.map((page) => {
            // If it's already a Blob, use it; otherwise IndexedDB should have preserved it
            // but we'll ensure it's valid
            let blob = page.imageBlob;
            if (!(blob instanceof Blob)) {
              console.warn('Blob not properly preserved from IndexedDB, attempting reconstruction');
              // This shouldn't happen, but handle it gracefully
              blob = new Blob([], { type: 'image/png' });
            }
            return {
              ...page,
              imageBlob: blob,
            };
          }),
        }));
        
        const settings = settingsRecord
          ? (({ id: _id, ...rest }: AppSettings & { id?: number }) => rest)(settingsRecord)
          : getDefaultSettings();
        set({
          scores: normalizedScores,
          settings,
          loading: false,
        });
      } catch (error) {
        set({ error: (error as Error).message, loading: false });
      }
    },
    addScore: async (input) => {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const score: Score = {
        id,
        createdAt: now,
        updatedAt: now,
        ...input,
        pages: await serializePages(input.pages),
      };
      await db.scores.put(score);
      set({ scores: [...get().scores, score] });
      return id;
    },
    updateScore: async (id, updates) => {
      const prev = get().scores.find((score) => score.id === id);
      if (!prev) return;
      const updated: Score = {
        ...prev,
        ...updates,
        pages: updates.pages ? await serializePages(updates.pages) : prev.pages,
        updatedAt: new Date().toISOString(),
      };
      await db.scores.put(updated);
      set({
        scores: get().scores.map((score) => (score.id === id ? updated : score)),
      });
    },
    deleteScore: async (id) => {
      await db.scores.delete(id);
      set({
        scores: get().scores.filter((score) => score.id !== id),
        selectedScoreId: get().selectedScoreId === id ? undefined : get().selectedScoreId,
      });
    },
    reorderScores: (ids) => {
      const map = new Map(get().scores.map((score) => [score.id, score] as const));
      const reordered = ids
        .map((id) => map.get(id))
        .filter((score): score is Score => Boolean(score));
      set({ scores: reordered });
    },
    toggleFavorite: async (id) => {
      const prev = get().scores.find((score) => score.id === id);
      if (!prev) return;
      const updated = { ...prev, favorite: !prev.favorite };
      await db.scores.put(updated);
      set({
        scores: get().scores.map((score) => (score.id === id ? updated : score)),
      });
    },
    selectScore: (id) => set({ selectedScoreId: id }),
    upsertSettings: async (partial) => {
      const merged = {
        ...get().settings,
        ...partial,
        calibration: {
          ...get().settings.calibration,
          ...(partial.calibration ?? {}),
        },
        viewer: {
          ...get().settings.viewer,
          ...(partial.viewer ?? {}),
        },
      };
      await db.transaction('rw', db.settings, async () => {
        await db.settings.clear();
        await db.settings.add({ ...merged });
      });
      set({ settings: merged });
    },
  })),
);
