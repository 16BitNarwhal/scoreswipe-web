'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Score } from '@/lib/models/score';

interface PageViewerProps {
  score: Score;
  pageIndex: number;
  onPageChange: (index: number) => void;
}

const PageViewer = ({ score, pageIndex, onPageChange }: PageViewerProps) => {
  const maxIndex = useMemo(() => Math.max(score.pages.length - 1, 0), [score.pages.length]);
  const urlRef = useRef<string | null>(null);
  const blobRef = useRef<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    onPageChange(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score.id]);

  const handleNext = () => onPageChange(Math.min(pageIndex + 1, maxIndex));
  const handlePrev = () => onPageChange(Math.max(pageIndex - 1, 0));

  const page = score.pages[pageIndex];

  // Create blob URL properly, ensuring we revoke old ones
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-500">{score.name}</h1>
        <p className="text-sm text-brand-400">
          Page {pageIndex + 1} / {score.pages.length}
        </p>
      </div>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-3xl border border-brand-100 bg-white shadow">
        {url ? (
          <img src={url} alt={`Page ${pageIndex + 1}`} className="max-h-[70vh] w-auto" onError={() => setUrl(null)} />
        ) : (
          <div className="flex h-[70vh] items-center justify-center text-brand-400">Loading page...</div>
        )}
        <button
          type="button"
          onClick={handlePrev}
          disabled={pageIndex === 0}
          className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 text-brand-400 shadow hover:bg-white disabled:opacity-40"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={pageIndex === maxIndex}
          className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 text-brand-400 shadow hover:bg-white disabled:opacity-40"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default PageViewer;
