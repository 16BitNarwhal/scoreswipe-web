'use client';

import Link from 'next/link';
import { ToggleLeft } from 'lucide-react';

interface LibraryActionsProps {
  onToggleFavorites: (value: boolean) => void;
  favoritesOnly: boolean;
}

const LibraryActions = ({ onToggleFavorites, favoritesOnly }: LibraryActionsProps) => (
  <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
    <Link
      href="/create"
      className="inline-flex items-center gap-2 rounded-full bg-brand-400 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-300"
    >
      New score
    </Link>
    <button
      type="button"
      onClick={() => onToggleFavorites(!favoritesOnly)}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
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
      className="text-sm text-brand-400 underline decoration-dotted underline-offset-4"
    >
      Export library
    </Link>
  </div>
);

export default LibraryActions;
