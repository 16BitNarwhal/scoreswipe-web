'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Star, Trash2, Edit2 } from 'lucide-react';
import { useScoreStore } from '@/store/score-store';
import { generateThumbnail } from '@/lib/pdf/pdf-utils';
import type { Score } from '@/lib/models/score';

interface ScoreCardProps {
  score: Score;
  onDropScore?: (scoreId: string, folderId: string | null) => void;
}

const ScoreCard = ({ score, onDropScore }: ScoreCardProps) => {
  const router = useRouter();
  const toggleFavorite = useScoreStore((state) => state.toggleFavorite);
  const selectScore = useScoreStore((state) => state.selectScore);
  const updateScore = useScoreStore((state) => state.updateScore);
  const deleteScore = useScoreStore((state) => state.deleteScore);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(
    score.thumbnail && score.thumbnail.trim() ? score.thumbnail : null,
  );
  const [thumbnailLoading, setThumbnailLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(score.name);
  const [showMenu, setShowMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync editedName when score.name changes externally
  useEffect(() => {
    if (!isEditing) {
      setEditedName(score.name);
    }
  }, [score.name, isEditing]);

  // Generate thumbnail on-the-fly if missing
  useEffect(() => {
    if (!thumbnailUrl && score.pages.length > 0 && score.pages[0].imageBlob) {
      setThumbnailLoading(true);
      generateThumbnail(score.pages[0].imageBlob)
        .then((thumb) => {
          setThumbnailUrl(thumb);
          // Save thumbnail to score for future use
          updateScore(score.id, { thumbnail: thumb }).catch(console.error);
        })
        .catch((err) => {
          console.warn('Failed to generate thumbnail:', err);
        })
        .finally(() => {
          setThumbnailLoading(false);
        });
    }
  }, [score.id, score.pages, thumbnailUrl, updateScore]);

  const handleOpen = () => {
    selectScore(score.id);
    router.push(`/viewer/${score.id}`);
  };

  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditing]);

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

  const handleFavorite = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    await toggleFavorite(score.id);
  };

  const handleEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setShowMenu(false);
    setIsEditing(true);
    setEditedName(score.name);
  };

  const handleSaveEdit = async () => {
    const trimmed = editedName.trim();
    if (trimmed && trimmed !== score.name) {
      await updateScore(score.id, { name: trimmed });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedName(score.name);
    setIsEditing(false);
  };

  const handleDelete = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setShowMenu(false);
    if (window.confirm(`Are you sure you want to delete "${score.name}"?`)) {
      await deleteScore(score.id);
    }
  };

  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const draggedScoreIdRef = useRef<string | null>(null);
  const isDraggingRef = useRef(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', score.id);
    e.dataTransfer.setData('application/score-id', score.id);
    draggedScoreIdRef.current = score.id;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    draggedScoreIdRef.current = null;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    dragStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    draggedScoreIdRef.current = score.id;
    // Don't set isDragging yet - wait for movement
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragStartPosRef.current) return;
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - dragStartPosRef.current.x);
    const deltaY = Math.abs(touch.clientY - dragStartPosRef.current.y);
    
    // Only start dragging if moved more than 10px
    if (deltaX > 10 || deltaY > 10) {
      isDraggingRef.current = true;
      setIsDragging(true);
      e.preventDefault(); // Prevent scrolling
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!dragStartPosRef.current || !draggedScoreIdRef.current) {
      dragStartPosRef.current = null;
      draggedScoreIdRef.current = null;
      isDraggingRef.current = false;
      setIsDragging(false);
      return;
    }

    // If we were dragging (moved more than threshold), handle drop
    if (isDraggingRef.current && onDropScore) {
      const touch = e.changedTouches[0];
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      
      // Find the drop target (folder or drop zone)
      let dropTarget: HTMLElement | null = elementBelow as HTMLElement;
      while (dropTarget && dropTarget !== document.body) {
        const folderId = dropTarget.getAttribute('data-folder-id');
        const isDropZone = dropTarget.hasAttribute('data-drop-zone');
        
        if (folderId !== null) {
          // Drop on folder
          e.preventDefault(); // Prevent click
          onDropScore(draggedScoreIdRef.current, folderId);
          break;
        } else if (isDropZone) {
          // Drop on drop zone (move to parent)
          e.preventDefault(); // Prevent click
          const parentId = dropTarget.getAttribute('data-parent-folder-id');
          onDropScore(draggedScoreIdRef.current, parentId === 'null' ? null : parentId);
          break;
        }
        dropTarget = dropTarget.parentElement;
      }
    }

    setIsDragging(false);
    isDraggingRef.current = false;
    dragStartPosRef.current = null;
    draggedScoreIdRef.current = null;
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={(e) => {
        if (!showMenu && !isEditing && !isDragging) {
          handleOpen();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (!showMenu && !isEditing) {
            e.preventDefault();
            handleOpen();
          }
        }
        if (e.key === 'Escape' && isEditing) {
          handleCancelEdit();
        }
      }}
      role="button"
      tabIndex={0}
      className={`group flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-brand-100 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-300 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="relative h-48 w-full overflow-hidden bg-brand-50">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={`${score.name} thumbnail`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={() => {
              console.warn('Thumbnail image failed to load for score:', score.id);
              setThumbnailUrl(null);
            }}
          />
        ) : thumbnailLoading ? (
          <div className="flex h-full items-center justify-center bg-brand-100">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-300 border-t-transparent" />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-brand-200">
            No preview available
          </div>
        )}
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-brand-400">
          {score.pages.length} page{score.pages.length === 1 ? '' : 's'}
        </div>
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <button
            type="button"
            onClick={handleFavorite}
            className={`flex h-10 w-10 items-center justify-center rounded-full border bg-white/80 transition ${
              score.favorite
                ? 'border-brand-300 text-brand-400'
                : 'border-transparent text-brand-200 hover:text-brand-300'
            }`}
          >
            <Star className={score.favorite ? 'fill-current' : ''} />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-white/80 text-brand-300 transition hover:border-brand-200 hover:text-brand-400"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-12 z-10 min-w-[160px] rounded-2xl border border-brand-100 bg-white shadow-lg">
                <button
                  type="button"
                  onClick={handleEdit}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-brand-500 transition hover:bg-brand-50 first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit name
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-500 transition hover:bg-red-50 first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between">
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
              className="flex-1 rounded-lg border border-brand-300 bg-white px-2 py-1 text-lg font-semibold text-brand-500 focus:border-brand-400 focus:outline-none"
            />
          ) : (
            <h3 className="text-lg font-semibold text-brand-500">{score.name}</h3>
          )}
        </div>
        <p className="text-sm text-brand-400">
          Updated {new Date(score.updatedAt).toLocaleDateString()} · Source {score.source}
        </p>
      </div>
    </div>
  );
};

export default ScoreCard;
