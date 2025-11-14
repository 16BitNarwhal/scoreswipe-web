'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import type { Score } from '@/lib/models/score';
import FullscreenViewer from './fullscreen-viewer';

interface PageViewerProps {
  score: Score;
  pageIndex: number;
  onPageChange: (index: number) => void;
}

const PageViewer = ({ score, pageIndex, onPageChange }: PageViewerProps) => {
  const maxIndex = useMemo(() => Math.max(score.pages.length - 1, 0), [score.pages.length]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  useEffect(() => {
    onPageChange(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score.id]);

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
    <>
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-500">{score.name}</h1>
          <div className="flex items-center gap-3">
        <p className="text-sm text-brand-400">
          Page {pageIndex + 1} / {score.pages.length}
        </p>
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="rounded-full bg-brand-400 p-2 text-white shadow-md transition-colors hover:bg-brand-300"
              aria-label="Enter fullscreen"
            >
              <Maximize2 className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div
          ref={containerRef}
          className="relative flex flex-1 items-center justify-center overflow-hidden rounded-3xl border border-brand-100 bg-white shadow select-none"
          onTouchStart={handleDragStart}
          onMouseDown={handleDragStart}
        >
          <div
            ref={sliderRef}
            className="flex h-[55vh] sm:h-[60vh] lg:h-[70vh]"
            style={{
              transform: `translateX(calc(-${pageIndex * 100}% + ${dragOffset}px))`,
              width: `${score.pages.length * 100}%`,
              transition: isDragging ? 'none' : 'transform 0.5s ease-in-out',
            }}
          >
            {score.pages.map((page, idx) => (
              <PageImage key={`${page.id || idx}-${score.id}`} page={page} index={idx} />
            ))}
      </div>
        <button
          type="button"
          onClick={handlePrev}
          disabled={pageIndex === 0 || isTransitioning}
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-brand-400 shadow transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 sm:left-6 sm:p-3"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={pageIndex === maxIndex || isTransitioning}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-brand-400 shadow transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 sm:right-6 sm:p-3"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
      </div>
      {isFullscreen && (
        <FullscreenViewer
          score={score}
          pageIndex={pageIndex}
          onPageChange={onPageChange}
          onClose={() => setIsFullscreen(false)}
        />
      )}
    </>
  );
};

// Separate component for page images to manage blob URLs
const PageImage = ({ page, index }: { page: Score['pages'][0]; index: number }) => {
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
        <img src={url} alt={`Page ${index + 1}`} className="max-h-full w-auto" onError={() => setUrl(null)} />
      ) : (
        <div className="flex h-full items-center justify-center text-brand-400">Loading page...</div>
      )}
    </div>
  );
};

export default PageViewer;
