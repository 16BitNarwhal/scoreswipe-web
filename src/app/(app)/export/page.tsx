'use client';

import { useScoreStore } from '@/store/score-store';
import { downloadLibraryBackup, importLibraryBackup } from '@/lib/storage/library-export';
import { useState } from 'react';
import { ArrowDownToLine, ArrowUpToLine } from 'lucide-react';

const ExportPage = () => {
  const { scores, folders, initialize } = useScoreStore((state) => ({
    scores: state.scores,
    folders: state.folders,
    initialize: state.initialize,
  }));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | undefined>();

  const handleExport = async () => {
    setBusy(true);
    setMessage(undefined);
    try {
      await downloadLibraryBackup(scores, folders);
      setMessage('Backup downloaded.');
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMessage(undefined);
    try {
      await importLibraryBackup(file);
      await initialize();
      setMessage('Library imported successfully.');
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      event.target.value = '';
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-semibold text-brand-500">Library backup</h1>
        <p className="text-brand-500/70">Export your library or import an existing backup file.</p>
      </div>
      <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            disabled={busy || (scores.length === 0 && folders.length === 0)}
            onClick={handleExport}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-400 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-300 disabled:cursor-not-allowed disabled:bg-brand-200 sm:w-auto"
          >
            <ArrowDownToLine className="h-4 w-4" />
            Download backup ({scores.length} scores · {folders.length} folders)
          </button>
          <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-brand-200 px-6 py-3 text-sm text-brand-400 transition hover:border-brand-300 sm:w-auto">
            <ArrowUpToLine className="h-4 w-4" />
            Import backup
            <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
          </label>
        </div>
        {message && <p className="mt-4 text-sm text-brand-400">{message}</p>}
      </div>
    </div>
  );
};

export default ExportPage;
