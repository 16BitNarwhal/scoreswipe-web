'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { Score } from '@/lib/models/score';

interface FullscreenViewerProps {
  score: Score;
  pageIndex: number;
  onPageChange: (index: number) => void;
  onClose: () => void;
}

const FullscreenViewer = ({ score, pageIndex, onPageChange, onClose }: FullscreenViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  const maxIndex = useMemo(() => Math.max(score.pages.length - 1, 0), [score.pages.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft' && !isTransitioning) {
        setIsTransitioning(true);
        onPageChange(Math.max(pageIndex - 1, 0));
        setTimeout(() => setIsTransitioning(false), 500);
      } else if (event.key === 'ArrowRight' && !isTransitioning) {
        setIsTransitioning(true);
        onPageChange(Math.min(pageIndex + 1, maxIndex));
        setTimeout(() => setIsTransitioning(false), 500);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [maxIndex, onClose, pageIndex, onPageChange, isTransitioning]);

  // Prevent body scroll and remove margins when fullscreen is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalMargin = document.body.style.margin;
    const htmlMargin = document.documentElement.style.margin;
    
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    document.documentElement.style.margin = '0';
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.margin = originalMargin;
      document.documentElement.style.margin = htmlMargin;
    };
  }, []);

  const handleNext = useCallback(() => {
    if (!isTransitioning && pageIndex < maxIndex) {
      setIsTransitioning(true);
      onPageChange(Math.min(pageIndex + 1, maxIndex));
      setTimeout(() => setIsTransitioning(false), 500);
    }
  }, [isTransitioning, pageIndex, maxIndex, onPageChange]);

  const handlePrev = useCallback(() => {
    if (!isTransitioning && pageIndex > 0) {
      setIsTransitioning(true);
      onPageChange(Math.max(pageIndex - 1, 0));
      setTimeout(() => setIsTransitioning(false), 500);
    }
  }, [isTransitioning, pageIndex, onPageChange]);

  const getClientX = (e: TouchEvent | MouseEvent): number => {
    if ('touches' in e) {
      return e.touches[0]?.clientX ?? 0;
    }
    return e.clientX;
  };

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (isTransitioning) return;
    setIsDragging(true);
    setDragStartX(getClientX(e.nativeEvent));
    setDragOffset(0);
  };

  const dragStateRef = useRef({ dragStartX: 0, dragOffset: 0, pageIndex, maxIndex, isTransitioning });

  useEffect(() => {
    dragStateRef.current = { dragStartX, dragOffset, pageIndex, maxIndex, isTransitioning };
  }, [dragStartX, dragOffset, pageIndex, maxIndex, isTransitioning]);

  const handleDragMove = (e: TouchEvent | MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const currentX = getClientX(e);
    const offset = currentX - dragStateRef.current.dragStartX;
    setDragOffset(offset);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const containerWidth = containerRef.current?.clientWidth ?? 1;
    const threshold = containerWidth * 0.2; // 20% of container width
    const currentOffset = dragStateRef.current.dragOffset;
    const currentPageIndex = dragStateRef.current.pageIndex;
    const currentMaxIndex = dragStateRef.current.maxIndex;
    
    if (Math.abs(currentOffset) > threshold) {
      if (currentOffset > 0 && currentPageIndex > 0) {
        // Swiped right, go to previous page
        handlePrev();
      } else if (currentOffset < 0 && currentPageIndex < currentMaxIndex) {
        // Swiped left, go to next page
        handleNext();
      }
    }
    
    setDragOffset(0);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: TouchEvent | MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const currentX = getClientX(e);
      const offset = currentX - dragStateRef.current.dragStartX;
      setDragOffset(offset);
    };

    const handleEnd = () => {
      if (!isDragging) return;
      setIsDragging(false);
      
      const containerWidth = containerRef.current?.clientWidth ?? 1;
      const threshold = containerWidth * 0.2;
      const currentOffset = dragStateRef.current.dragOffset;
      const currentPageIndex = dragStateRef.current.pageIndex;
      const currentMaxIndex = dragStateRef.current.maxIndex;
      
      if (Math.abs(currentOffset) > threshold) {
        if (currentOffset > 0 && currentPageIndex > 0) {
          handlePrev();
        } else if (currentOffset < 0 && currentPageIndex < currentMaxIndex) {
          handleNext();
        }
      }
      
      setDragOffset(0);
    };

    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);

    return () => {
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
    };
  }, [isDragging, handlePrev, handleNext]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] m-0 flex items-center justify-center bg-black p-0"
      onClick={(e) => {
        // Close if clicking on background (not on image or controls)
        if (e.target === containerRef.current) {
          onClose();
        }
      }}
    >
      {/* Exit button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-brand-500 shadow-lg transition-colors hover:bg-white"
        aria-label="Exit fullscreen"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Page counter */}
      <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white backdrop-blur-sm">
        {score.name} - Page {pageIndex + 1} / {score.pages.length}
      </div>

      {/* Image container */}
      <div 
        className="relative flex h-full w-full items-center justify-center overflow-hidden select-none"
        onTouchStart={handleDragStart}
        onMouseDown={handleDragStart}
      >
        <div
          ref={sliderRef}
          className="flex h-full"
          style={{
            transform: `translateX(calc(-${pageIndex * 100}% + ${dragOffset}px))`,
            width: `${score.pages.length * 100}%`,
            transition: isDragging ? 'none' : 'transform 0.5s ease-in-out',
          }}
        >
          {score.pages.map((page, idx) => (
            <FullscreenPageImage key={`${page.id || idx}-${score.id}`} page={page} index={idx} />
          ))}
        </div>

      </div>
    </div>
  );
};

// Separate component for fullscreen page images to manage blob URLs
const FullscreenPageImage = ({ page, index }: { page: Score['pages'][0]; index: number }) => {
  const urlRef = useRef<string | null>(null);
  const blobRef = useRef<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    // Only create new URL if blob has changed
    if (page?.imageBlob === blobRef.current && urlRef.current) {
      setUrl(urlRef.current);
      return;
    }

    // Clean up previous URL
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }

    if (page?.imageBlob) {
      try {
        // Ensure it's a valid Blob
        const blob = page.imageBlob instanceof Blob ? page.imageBlob : new Blob([page.imageBlob as any], { type: 'image/png' });
        const objectUrl = URL.createObjectURL(blob);
        blobRef.current = page.imageBlob;
        urlRef.current = objectUrl;
        setUrl(objectUrl);
      } catch (err) {
        console.error('Failed to create blob URL:', err);
        setUrl(null);
      }
    }

    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, [page?.imageBlob, page?.id]);

  return (
    <div className="flex h-full w-full flex-shrink-0 items-center justify-center" style={{ width: '100%' }}>
      {url ? (
        <img
          src={url}
          alt={`Page ${index + 1}`}
          className="max-h-full max-w-full object-contain"
          onError={() => setUrl(null)}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-white">Loading page...</div>
      )}
    </div>
  );
};

export default FullscreenViewer;

