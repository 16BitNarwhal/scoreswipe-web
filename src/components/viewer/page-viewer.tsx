'use client';

import { useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Score } from '@/lib/models/score';

interface PageViewerProps {
  score: Score;
  pageIndex: number;
  onPageChange: (index: number) => void;
}

const PageViewer = ({ score, pageIndex, onPageChange }: PageViewerProps) => {
  const maxIndex = useMemo(() => Math.max(score.pages.length - 1, 0), [score.pages.length]);

  useEffect(() => {
    onPageChange(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score.id]);

  const handleNext = () => onPageChange(Math.min(pageIndex + 1, maxIndex));
  const handlePrev = () => onPageChange(Math.max(pageIndex - 1, 0));

  const page = score.pages[pageIndex];
  const url = useMemo(() => URL.createObjectURL(page.imageBlob), [page.imageBlob]);

  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-500">{score.name}</h1>
        <p className="text-sm text-brand-400">
          Page {pageIndex + 1} / {score.pages.length}
        </p>
      </div>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-3xl border border-brand-100 bg-white shadow">
        <img src={url} alt={`Page ${pageIndex + 1}`} className="max-h-[70vh] w-auto" />
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
