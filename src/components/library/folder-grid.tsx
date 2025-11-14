import { useState } from 'react';
import FolderCard from './folder-card';
import type { Folder } from '@/lib/models/folder';

interface FolderGridProps {
  folders: Folder[];
  onOpen: (folderId: string) => void;
  onDropScore?: (scoreId: string, folderId: string | null) => void;
  onEditFolder?: (folderId: string, newName: string) => Promise<void>;
  onDeleteFolder?: (folderId: string) => Promise<void>;
}

const FolderGrid = ({ folders, onOpen, onDropScore, onEditFolder, onDeleteFolder }: FolderGridProps) => {
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  if (!folders.length) {
    return null;
  }

  const handleDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(folderId);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverId(null);
    const scoreId = e.dataTransfer.getData('application/score-id') || e.dataTransfer.getData('text/plain');
    if (scoreId && onDropScore) {
      onDropScore(scoreId, folderId);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {folders.map((folder) => (
        <div
          key={folder.id}
          onDragOver={(e) => handleDragOver(e, folder.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, folder.id)}
          className={dragOverId === folder.id ? 'rounded-3xl border-2 border-brand-400 bg-brand-100 ring-2 ring-brand-300' : ''}
        >
          <FolderCard
            folder={folder}
            onOpen={onOpen}
            onEdit={onEditFolder}
            onDelete={onDeleteFolder}
          />
        </div>
      ))}
    </div>
  );
};

export default FolderGrid;
