'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageViewer from '@/components/viewer/page-viewer';
import CameraOverlay from '@/components/viewer/camera-overlay';
import { useScoreStore } from '@/store/score-store';
import { AlertTriangle } from 'lucide-react';

const ViewerPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { scores, selectedScoreId, selectScore, settings } = useScoreStore((state) => ({
    scores: state.scores,
    selectedScoreId: state.selectedScoreId,
    selectScore: state.selectScore,
    settings: state.settings,
  }));
  const [pageIndex, setPageIndex] = useState(0);

  const scoreFromQuery = searchParams.get('id');
  const activeScore = useMemo(() => {
    const id = selectedScoreId ?? scoreFromQuery ?? scores[0]?.id;
    if (!id) return undefined;
    return scores.find((score) => score.id === id);
  }, [scoreFromQuery, scores, selectedScoreId]);

  useEffect(() => {
    if (scoreFromQuery) {
      selectScore(scoreFromQuery);
    }
  }, [scoreFromQuery, selectScore]);

  useEffect(() => {
    if (!scores.length) {
      router.push('/create');
    }
  }, [router, scores.length]);

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

  if (!activeScore) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-brand-200 bg-white/80 p-12 text-center">
        <AlertTriangle className="h-8 w-8 text-brand-300" />
        <p className="max-w-sm text-sm text-brand-400">
          No score selected. Create or select a score from your library first.
        </p>
      </div>
    );
  }

  const handleTiltLeft = () => {
    setPageIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleTiltRight = () => {
    setPageIndex((prev) => Math.min(prev + 1, activeScore.pages.length - 1));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <PageViewer score={activeScore} pageIndex={pageIndex} onPageChange={setPageIndex} />
      <div className="flex flex-col gap-6">
        <CameraOverlay
          sensitivity={settings.calibration.sensitivity}
          invertDirection={settings.calibration.invertDirection}
          onTiltLeft={handleTiltLeft}
          onTiltRight={handleTiltRight}
        />
        <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-brand-500">Performance tips</h2>
          <ul className="mt-3 space-y-2 text-sm text-brand-400">
            <li>Keep your face centered in the frame for consistent detection.</li>
            <li>Use the settings page to calibrate a neutral pose before performing.</li>
            <li>Keyboard arrows and on-screen buttons remain available as a fallback.</li>
          </ul>
        </div>
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
