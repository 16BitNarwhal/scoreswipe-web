import { db } from '@/lib/storage/db';
import type { Score } from '@/lib/models/score';
import type { Folder } from '@/lib/models/folder';

interface LibraryBackup {
  version: number;
  exportedAt: string;
  scores: Array<Omit<Score, 'folderId'> & { folderId?: string | null; tags?: string[] }>;
  folders?: Folder[];
}

const BACKUP_VERSION = 2;

export const downloadLibraryBackup = async (scores: Score[], folders: Folder[]) => {
  const backup: LibraryBackup = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    scores: scores.map((score) => ({ ...score })),
    folders,
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `scoreswipe-backup-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importLibraryBackup = async (file: File) => {
  const text = await file.text();
  const backup = JSON.parse(text) as LibraryBackup;

  if (!backup.scores?.length) {
    throw new Error('No scores found in backup.');
  }

  const normalizedScores: Score[] = backup.scores.map((score) => {
    const { folderId, ...rest } = score;
    return {
      ...rest,
      folderId: folderId ?? null,
    } as Score;
  });

  const folders: Folder[] = (backup.folders ?? []).map((folder) => ({
    ...folder,
    parentId: folder.parentId ?? null,
  }));

  await db.transaction('rw', db.scores, db.folders, async () => {
    await db.folders.clear();
    await db.scores.clear();
    if (folders.length) {
      await db.folders.bulkPut(folders);
    }
    await db.scores.bulkPut(normalizedScores);
  });
};