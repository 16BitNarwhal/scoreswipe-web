'use client';

import { useEffect, useMemo, useState } from 'react';
import { useScoreStore } from '@/store/score-store';
import ScoreGrid from '@/components/library/score-grid';
import LibraryActions from '@/components/library/library-actions';
import { SpotlightSearch } from '@/components/library/spotlight-search';
import FolderGrid from '@/components/library/folder-grid';
import { getChildFolders, getFolderAncestors } from '@/lib/utils/folders';

const LibraryPage = () => {
  const { scores, folders, loading, initialize, currentFolderId, setCurrentFolder, createFolder } =
    useScoreStore((state) => ({
      scores: state.scores,
      folders: state.folders,
      loading: state.loading,
      initialize: state.initialize,
      currentFolderId: state.currentFolderId,
      setCurrentFolder: state.setCurrentFolder,
      createFolder: state.createFolder,
    }));
  const [query, setQuery] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sort, setSort] = useState<'recent' | 'alpha'>('recent');
  const [folderError, setFolderError] = useState<string | undefined>();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const displayedScores = useMemo(
    () =>
      scores.filter(
        (score) => (score.folderId ?? null) === (currentFolderId ?? null),
      ),
    [scores, currentFolderId],
  );

  const childFolders = useMemo(
    () => getChildFolders(folders, currentFolderId),
    [folders, currentFolderId],
  );

  const breadcrumbs = useMemo(() => {
    const ancestors = currentFolderId ? getFolderAncestors(folders, currentFolderId) : [];
    return [{ id: null, name: 'All scores' }, ...ancestors.map((folder) => ({ id: folder.id, name: folder.name }))];
  }, [folders, currentFolderId]);

  const filtered = useMemo(() => {
    const byQuery = displayedScores.filter((score) =>
      score.name.toLowerCase().includes(query.toLowerCase()),
    );
    const byFavorite = favoritesOnly ? byQuery.filter((score) => score.favorite) : byQuery;
    return byFavorite.sort((a, b) => {
      if (sort === 'recent') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      return a.name.localeCompare(b.name);
    });
  }, [displayedScores, query, favoritesOnly, sort]);

  const handleBreadcrumbClick = (id: string | null) => {
    setFolderError(undefined);
    setCurrentFolder(id);
  };

  const handleCreateFolder = async () => {
    const name = window.prompt('Folder name');
    if (!name) return;
    try {
      const newId = await createFolder(name, currentFolderId);
      setFolderError(undefined);
      setCurrentFolder(newId);
    } catch (error) {
      setFolderError((error as Error).message);
    }
  };

  const emptyMessage =
    childFolders.length > 0
      ? 'This folder has no scores yet. Add or move scores into it to get started.'
      : 'Add your first score to begin.';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-semibold text-brand-500">Library</h1>
          <p className="text-brand-500/70">
            Manage your scores, mark favorites, and jump straight into performance.
          </p>
        </div>
        <LibraryActions
          onToggleFavorites={setFavoritesOnly}
          favoritesOnly={favoritesOnly}
          onCreateFolder={handleCreateFolder}
        />
      </div>
      <nav className="flex flex-wrap items-center gap-2 text-sm text-brand-400">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.id ?? 'root'} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleBreadcrumbClick(crumb.id)}
              className={`transition hover:text-brand-500 ${
                (crumb.id ?? null) === (currentFolderId ?? null) ? 'text-brand-500 font-medium' : ''
              }`}
            >
              {crumb.name}
            </button>
            {index < breadcrumbs.length - 1 && <span className="text-brand-200">/</span>}
          </div>
        ))}
      </nav>
      {folderError && <p className="text-sm text-red-500">{folderError}</p>}
      {childFolders.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-300">Folders</h2>
          <FolderGrid folders={childFolders} onOpen={(id) => setCurrentFolder(id)} />
        </section>
      )}
      <SpotlightSearch value={query} onChange={setQuery} onSortChange={setSort} sort={sort} />
      <ScoreGrid scores={filtered} loading={loading} emptyMessage={emptyMessage} />
    </div>
  );
};

export default LibraryPage;
