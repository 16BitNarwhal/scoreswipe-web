'use client';

import { useEffect, useMemo, useState } from 'react';
import { useScoreStore } from '@/store/score-store';
import ScoreGrid from '@/components/library/score-grid';
import LibraryActions from '@/components/library/library-actions';
import { SpotlightSearch } from '@/components/library/spotlight-search';
import FolderGrid from '@/components/library/folder-grid';
import { getChildFolders, getFolderAncestors } from '@/lib/utils/folders';

const DropZone = ({
  onDropScore,
  currentFolderId,
  parentFolderId,
}: {
  onDropScore: (scoreId: string, folderId: string | null) => void;
  currentFolderId: string | null;
  parentFolderId: string | null;
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const scoreId = e.dataTransfer.getData('application/score-id') || e.dataTransfer.getData('text/plain');
    if (scoreId && currentFolderId) {
      // Move to parent folder instead of root
      onDropScore(scoreId, parentFolderId);
    }
  };

  if (!currentFolderId) return null;

  return (
      <div
      data-drop-zone
      data-parent-folder-id={parentFolderId ?? 'null'}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-2xl border-2 border-dashed p-4 text-center transition ${
        isDragOver
          ? 'border-brand-400 bg-brand-50'
          : 'border-brand-200 bg-transparent'
      }`}
    >
      <p className="text-sm text-brand-400">
        {isDragOver ? 'Drop here to move to parent folder' : 'Drag scores here to move to parent folder'}
      </p>
    </div>
  );
};

const LibraryPage = () => {
  const {
    scores,
    folders,
    loading,
    initialize,
    currentFolderId,
    setCurrentFolder,
    createFolder,
    updateScore,
    updateFolder,
    deleteFolder,
  } = useScoreStore((state) => ({
    scores: state.scores,
    folders: state.folders,
    loading: state.loading,
    initialize: state.initialize,
    currentFolderId: state.currentFolderId,
    setCurrentFolder: state.setCurrentFolder,
    createFolder: state.createFolder,
    updateScore: state.updateScore,
    updateFolder: state.updateFolder,
    deleteFolder: state.deleteFolder,
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

  const parentFolderId = useMemo(() => {
    if (!currentFolderId) return null;
    const currentFolder = folders.find((f) => f.id === currentFolderId);
    return currentFolder?.parentId ?? null;
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

  const handleDropScore = async (scoreId: string, folderId: string | null) => {
    try {
      await updateScore(scoreId, { folderId });
    } catch (error) {
      setFolderError((error as Error).message);
    }
  };

  const handleEditFolder = async (folderId: string, newName: string) => {
    try {
      setFolderError(undefined);
      await updateFolder(folderId, { name: newName });
    } catch (error) {
      setFolderError((error as Error).message);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return;

    // Count child folders recursively
    const getAllChildFolderIds = (parentId: string): string[] => {
      const children = folders.filter((f) => f.parentId === parentId);
      const childIds = children.map((f) => f.id);
      const grandchildIds = childIds.flatMap((childId) => getAllChildFolderIds(childId));
      return [...childIds, ...grandchildIds];
    };

    const childFolderIds = getAllChildFolderIds(folderId);
    const allFolderIdsToDelete = [folderId, ...childFolderIds];
    const scoresToDelete = scores.filter((score) =>
      allFolderIdsToDelete.includes(score.folderId ?? ''),
    );

    const folderCount = allFolderIdsToDelete.length;
    const scoreCount = scoresToDelete.length;

    let message = `Are you sure you want to delete "${folder.name}"?`;
    if (folderCount > 1 || scoreCount > 0) {
      message += '\n\nThis will permanently delete:';
      if (folderCount > 1) {
        message += `\n• ${folderCount} folders (including all subfolders)`;
      }
      if (scoreCount > 0) {
        message += `\n• ${scoreCount} score${scoreCount === 1 ? '' : 's'}`;
      }
      message += '\n\nThis action cannot be undone.';
    }

    if (window.confirm(message)) {
      try {
        setFolderError(undefined);
        await deleteFolder(folderId);
        // Navigate to parent if we deleted the current folder
        if (currentFolderId === folderId) {
          const parentId = folder.parentId;
          setCurrentFolder(parentId);
        }
      } catch (error) {
        setFolderError((error as Error).message);
      }
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
          <FolderGrid
            folders={childFolders}
            onOpen={(id) => setCurrentFolder(id)}
            onDropScore={handleDropScore}
            onEditFolder={handleEditFolder}
            onDeleteFolder={handleDeleteFolder}
          />
        </section>
      )}
      <SpotlightSearch value={query} onChange={setQuery} onSortChange={setSort} sort={sort} />
      <DropZone onDropScore={handleDropScore} currentFolderId={currentFolderId} parentFolderId={parentFolderId} />
      <ScoreGrid scores={filtered} loading={loading} emptyMessage={emptyMessage} onDropScore={handleDropScore} />
    </div>
  );
};

export default LibraryPage;
