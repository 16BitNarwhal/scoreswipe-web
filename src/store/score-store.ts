'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { db, getDefaultSettings } from '@/lib/storage/db';
import type { AppSettings, Score, ScorePage } from '@/lib/models/score';
import type { Folder } from '@/lib/models/folder';

interface ScoreState {
  scores: Score[];
  folders: Folder[];
  selectedScoreId?: string;
  currentFolderId: string | null;
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
  createFolder: (name: string, parentId?: string | null) => Promise<string>;
  updateFolder: (id: string, updates: Partial<Pick<Folder, 'name' | 'parentId'>>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  setCurrentFolder: (id: string | null) => void;
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
    folders: [],
    settings: getDefaultSettings(),
    currentFolderId: null,
    loading: true,
    initialize: async () => {
      try {
        const [scores, settingsRecord, folders] = await Promise.all([
          db.scores.toArray(),
          db.settings.toCollection().first(),
          db.folders.toArray(),
        ]);
        
        // Ensure blobs are proper Blob instances after retrieval from IndexedDB
        // IndexedDB should preserve Blobs, but we validate them anyway
        const normalizedScores = scores.map((score) => ({
          ...score,
          folderId: score.folderId ?? null,
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
          folders,
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
        folderId: input.folderId ?? null,
        pages: await serializePages(input.pages),
      };
      await db.scores.put(score);
      set({ scores: [...get().scores, score] });
      return id;
    },
    updateScore: async (id, updates) => {
      const prev = get().scores.find((score) => score.id === id);
      if (!prev) return;
      const normalizedUpdates: Partial<Score> = { ...updates };
      if (Object.prototype.hasOwnProperty.call(normalizedUpdates, 'folderId')) {
        normalizedUpdates.folderId = normalizedUpdates.folderId ?? null;
      }
      const updated: Score = {
        ...prev,
        ...normalizedUpdates,
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
    createFolder: async (name, parentId = null) => {
      const trimmed = name.trim();
      if (!trimmed) {
        throw new Error('Folder name cannot be empty.');
      }
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const folder: Folder = {
        id,
        name: trimmed,
        parentId: parentId ?? null,
        createdAt: now,
        updatedAt: now,
      };
      await db.folders.put(folder);
      set({ folders: [...get().folders, folder] });
      return id;
    },
    updateFolder: async (id, updates) => {
      const folder = get().folders.find((item) => item.id === id);
      if (!folder) return;
      const normalized: Partial<Folder> = { ...updates };
      if (normalized.name !== undefined) {
        normalized.name = normalized.name.trim();
        if (!normalized.name) {
          throw new Error('Folder name cannot be empty.');
        }
      }
      const updated: Folder = {
        ...folder,
        ...normalized,
        updatedAt: new Date().toISOString(),
      };
      await db.folders.put(updated);
      set({
        folders: get().folders.map((item) => (item.id === id ? updated : item)),
      });
    },
    deleteFolder: async (id) => {
      // Recursively get all child folder IDs
      const getAllChildFolderIds = (parentId: string): string[] => {
        const children = get().folders.filter((folder) => folder.parentId === parentId);
        const childIds = children.map((folder) => folder.id);
        // Recursively get grandchildren
        const grandchildIds = childIds.flatMap((childId) => getAllChildFolderIds(childId));
        return [...childIds, ...grandchildIds];
      };

      const childFolderIds = getAllChildFolderIds(id);
      const allFolderIdsToDelete = [id, ...childFolderIds];

      // Get all scores in this folder and all child folders
      const scoresToDelete = get().scores.filter(
        (score) => allFolderIdsToDelete.includes(score.folderId ?? ''),
      );

      // Delete all scores
      for (const score of scoresToDelete) {
        await db.scores.delete(score.id);
      }

      // Delete all folders (children first, then parent)
      for (const folderId of allFolderIdsToDelete.reverse()) {
        await db.folders.delete(folderId);
      }

      // Update state
      set((state) => ({
        folders: state.folders.filter((folder) => !allFolderIdsToDelete.includes(folder.id)),
        scores: state.scores.filter((score) => !scoresToDelete.some((s) => s.id === score.id)),
        currentFolderId: allFolderIdsToDelete.includes(state.currentFolderId ?? '') ? null : state.currentFolderId,
        selectedScoreId: scoresToDelete.some((s) => s.id === state.selectedScoreId)
          ? undefined
          : state.selectedScoreId,
      }));
    },
    setCurrentFolder: (id) => set({ currentFolderId: id ?? null }),
  })),
);
