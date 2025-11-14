import ScoreCard from '@/components/library/score-card';
import type { Score } from '@/lib/models/score';

interface ScoreGridProps {
  scores: Score[];
  loading?: boolean;
  emptyMessage?: string;
  onDropScore?: (scoreId: string, folderId: string | null) => void;
}

const ScoreGrid = ({ scores, loading = false, emptyMessage, onDropScore }: ScoreGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-64 animate-shimmer rounded-3xl bg-gradient-to-r from-brand-50 via-brand-100 to-brand-50"
          />
        ))}
      </div>
    );
  }

  if (!scores.length) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-brand-200 bg-white/70 text-brand-400">
        <p className="text-sm font-medium">{emptyMessage ?? 'No scores yet.'}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {scores.map((score) => (
        <ScoreCard key={score.id} score={score} onDropScore={onDropScore} />
      ))}
    </div>
  );
};

export default ScoreGrid;
