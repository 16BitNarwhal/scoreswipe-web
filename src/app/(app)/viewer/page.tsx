'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageViewer from '@/components/viewer/page-viewer';
import CameraOverlay from '@/components/viewer/camera-overlay';
import ViewerSettings from '@/components/viewer/viewer-settings';
import { useScoreStore } from '@/store/score-store';
import { AlertTriangle } from 'lucide-react';

const ViewerPageContent = () => {
  const router = useRouter();
  const { scores, loading, selectedScoreId, settings } = useScoreStore((state) => ({
    scores: state.scores,
    loading: state.loading,
    selectedScoreId: state.selectedScoreId,
    settings: state.settings,
  }));
  const [pageIndex, setPageIndex] = useState(0);

  const activeScore = useMemo(() => {
    if (!selectedScoreId) return undefined;
    return scores.find((score) => score.id === selectedScoreId);
  }, [selectedScoreId, scores]);

  useEffect(() => {
    // Only check for score existence after loading is complete
    if (!loading) {
      if (!scores.length) {
        router.push('/create');
      } else if (!selectedScoreId || !activeScore) {
        // No score selected or score not found, redirect to library
        router.push('/library');
      }
    }
  }, [router, scores.length, selectedScoreId, activeScore, loading]);

  useEffect(() => {
    setPageIndex(0);
  }, [activeScore?.id]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        setPageIndex((prev) => Math.max(prev - 1, 0));
      }
      if (event.key === 'ArrowRight') {
        setPageIndex((prev) =>
          Math.min(prev + 1, (activeScore?.pages.length ?? 1) - 1),
        );
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeScore?.pages.length]);

  // Define callbacks before conditional returns (Rules of Hooks)
  const handleTiltLeft = useCallback(() => {
    setPageIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleTiltRight = useCallback(() => {
    setPageIndex((prev) => {
      const maxIndex = activeScore?.pages.length ? activeScore.pages.length - 1 : 0;
      return Math.min(prev + 1, maxIndex);
    });
  }, [activeScore?.pages.length]);

  // Show loading state while scores are being loaded
  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-brand-200 bg-white/80 p-12 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-300 border-t-transparent" />
        <p className="text-sm text-brand-400">Loading score...</p>
      </div>
    );
  }

  // Only show error if loading is complete and score still not found
  if (!activeScore) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-brand-200 bg-white/80 p-12 text-center">
        <AlertTriangle className="h-8 w-8 text-brand-300" />
        <p className="max-w-sm text-sm text-brand-400">
          Score not found. Please select a score from your library.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <PageViewer score={activeScore} pageIndex={pageIndex} onPageChange={setPageIndex} />
      <div className="flex flex-col gap-6">
        <CameraOverlay
          sensitivity={settings.calibration.sensitivity}
          invertDirection={settings.calibration.invertDirection}
          swipeMode={settings.calibration.swipeMode}
          onTiltLeft={handleTiltLeft}
          onTiltRight={handleTiltRight}
        />
        <ViewerSettings />
      </div>
    </div>
  );
};

const ViewerPage = () => {
  return (
    <Suspense fallback={
      <div className="flex h-full flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-brand-200 bg-white/80 p-12 text-center">
        <p className="text-sm text-brand-400">Loading...</p>
      </div>
    }>
      <ViewerPageContent />
    </Suspense>
  );
};

export default ViewerPage;

