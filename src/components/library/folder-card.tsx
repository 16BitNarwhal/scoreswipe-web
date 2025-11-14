'use client';

import { useEffect, useRef, useState } from 'react';
import { Folder as FolderIcon, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import type { Folder } from '@/lib/models/folder';

interface FolderCardProps {
  folder: Folder;
  onOpen: (folderId: string) => void;
  onEdit?: (folderId: string, newName: string) => Promise<void>;
  onDelete?: (folderId: string) => Promise<void>;
}

const FolderCard = ({ folder, onOpen, onEdit, onDelete }: FolderCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(folder.name);
  const [showMenu, setShowMenu] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) {
      setEditedName(folder.name);
    }
  }, [folder.name, isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const handleEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setShowMenu(false);
    setIsEditing(true);
    setEditedName(folder.name);
  };

  const handleSaveEdit = async () => {
    const trimmed = editedName.trim();
    if (trimmed && trimmed !== folder.name && onEdit) {
      await onEdit(folder.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedName(folder.name);
    setIsEditing(false);
  };

  const handleDelete = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setShowMenu(false);
    if (onDelete) {
      await onDelete(folder.id);
    }
  };

  return (
    <button
      type="button"
      data-folder-id={folder.id}
      onClick={(e) => {
        if (!showMenu && !isEditing) {
          onOpen(folder.id);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (!showMenu && !isEditing) {
            e.preventDefault();
            onOpen(folder.id);
          }
        }
        if (e.key === 'Escape' && isEditing) {
          handleCancelEdit();
        }
      }}
      className="group flex items-center justify-between rounded-3xl border border-brand-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:bg-brand-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-400 transition group-hover:bg-brand-200">
          <FolderIcon className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          {isEditing ? (
            <input
              ref={nameInputRef}
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveEdit();
                } else if (e.key === 'Escape') {
                  handleCancelEdit();
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-lg border border-brand-300 bg-white px-2 py-1 text-base font-semibold text-brand-500 focus:border-brand-400 focus:outline-none"
            />
          ) : (
            <span className="text-base font-semibold text-brand-500">{folder.name}</span>
          )}
          <span className="text-xs text-brand-300">
            Updated {new Date(folder.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      {(onEdit || onDelete) && (
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent bg-white/80 text-brand-300 transition hover:border-brand-200 hover:text-brand-400"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-10 z-10 min-w-[160px] rounded-2xl border border-brand-100 bg-white shadow-lg">
              {onEdit && (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-brand-500 transition hover:bg-brand-50 first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit name
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-500 transition hover:bg-red-50 first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </button>
  );
};

export default FolderCard;

