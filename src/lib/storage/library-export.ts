import { db } from '@/lib/storage/db';
import type { Score } from '@/lib/models/score';

interface LibraryBackup {
  version: number;
  exportedAt: string;
  scores: Score[];
}

export const downloadLibraryBackup = async (scores: Score[]) => {
  const backup: LibraryBackup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    scores,
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

  await db.transaction('rw', db.scores, async () => {
    await db.scores.clear();
    await db.scores.bulkPut(backup.scores);
  });
};
