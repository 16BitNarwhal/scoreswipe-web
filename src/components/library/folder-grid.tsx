import { useState } from 'react';
import { Folder as FolderIcon } from 'lucide-react';
import type { Folder } from '@/lib/models/folder';

interface FolderGridProps {
  folders: Folder[];
  onOpen: (folderId: string) => void;
  onDropScore?: (scoreId: string, folderId: string | null) => void;
}

const FolderGrid = ({ folders, onOpen, onDropScore }: FolderGridProps) => {
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
        <button
          key={folder.id}
          type="button"
          data-folder-id={folder.id}
          onClick={() => onOpen(folder.id)}
          onDragOver={(e) => handleDragOver(e, folder.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, folder.id)}
          className={`group flex items-center justify-between rounded-3xl border border-brand-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:bg-brand-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-300 ${
            dragOverId === folder.id ? 'border-brand-400 bg-brand-100 ring-2 ring-brand-300' : ''
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-400 transition group-hover:bg-brand-200">
              <FolderIcon className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold text-brand-500">{folder.name}</span>
              <span className="text-xs text-brand-300">
                Updated {new Date(folder.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default FolderGrid;
