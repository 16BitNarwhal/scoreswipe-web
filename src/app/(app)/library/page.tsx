'use client';

import { useEffect, useMemo, useState } from 'react';
import { useScoreStore } from '@/store/score-store';
import ScoreGrid from '@/components/library/score-grid';
import LibraryActions from '@/components/library/library-actions';
import { SpotlightSearch } from '@/components/library/spotlight-search';

const LibraryPage = () => {
  const { scores, loading, initialize } = useScoreStore((state) => ({
    scores: state.scores,
    loading: state.loading,
    initialize: state.initialize,
  }));
  const [query, setQuery] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sort, setSort] = useState<'recent' | 'alpha'>('recent');

  useEffect(() => {
    initialize();
  }, [initialize]);

  const filtered = useMemo(() => {
    const byQuery = scores.filter((score) =>
      score.name.toLowerCase().includes(query.toLowerCase()),
    );
    const byFavorite = favoritesOnly ? byQuery.filter((score) => score.favorite) : byQuery;
    return byFavorite.sort((a, b) => {
      if (sort === 'recent') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      return a.name.localeCompare(b.name);
    });
  }, [scores, query, favoritesOnly, sort]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-brand-500">Library</h1>
          <p className="text-brand-500/70">
            Manage your scores, mark favorites, and jump straight into performance.
          </p>
        </div>
        <LibraryActions onToggleFavorites={setFavoritesOnly} favoritesOnly={favoritesOnly} />
      </div>
      <SpotlightSearch value={query} onChange={setQuery} onSortChange={setSort} sort={sort} />
      <ScoreGrid scores={filtered} loading={loading} emptyMessage="Add your first score to begin." />
    </div>
  );
};

export default LibraryPage;
