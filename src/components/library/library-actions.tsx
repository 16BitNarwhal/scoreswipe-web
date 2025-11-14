'use client';

import Link from 'next/link';
import { FolderPlus, ToggleLeft } from 'lucide-react';

interface LibraryActionsProps {
  onToggleFavorites: (value: boolean) => void;
  favoritesOnly: boolean;
  onCreateFolder: () => void;
}

const LibraryActions = ({ onToggleFavorites, favoritesOnly, onCreateFolder }: LibraryActionsProps) => (
  <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
    <button
      type="button"
      onClick={onCreateFolder}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand-200 px-5 py-2 text-sm text-brand-400 transition hover:border-brand-300 sm:w-auto"
    >
      <FolderPlus className="h-4 w-4" />
      New folder
    </button>
    <Link
      href="/create"
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-400 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-300 sm:w-auto"
    >
      New score
    </Link>
    <button
      type="button"
      onClick={() => onToggleFavorites(!favoritesOnly)}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm transition sm:w-auto ${
        favoritesOnly
          ? 'border-brand-400 bg-brand-100 text-brand-400'
          : 'border-brand-100 bg-white text-brand-400 hover:border-brand-200'
      }`}
    >
      <ToggleLeft className="h-4 w-4" />
      Favorites only
    </button>
    <Link
      href="/export"
      className="text-center text-sm text-brand-400 underline decoration-dotted underline-offset-4 sm:text-left"
    >
      Export library
    </Link>
  </div>
);

export default LibraryActions;
