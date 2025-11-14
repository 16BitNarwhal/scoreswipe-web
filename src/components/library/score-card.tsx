'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { useScoreStore } from '@/store/score-store';
import type { Score } from '@/lib/models/score';

interface ScoreCardProps {
  score: Score;
}

const ScoreCard = ({ score }: ScoreCardProps) => {
  const router = useRouter();
  const toggleFavorite = useScoreStore((state) => state.toggleFavorite);
  const selectScore = useScoreStore((state) => state.selectScore);

  const handleOpen = () => {
    selectScore(score.id);
    router.push('/viewer');
  };

  const handleFavorite = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    await toggleFavorite(score.id);
  };

  return (
    <button
      type="button"
      onClick={handleOpen}
      className="group flex flex-col overflow-hidden rounded-3xl border border-brand-100 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-48 w-full overflow-hidden bg-brand-50">
        {score.thumbnail ? (
          <Image
            src={score.thumbnail}
            alt={`${score.name} thumbnail`}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-200">
            No preview available
          </div>
        )}
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-brand-400">
          {score.pages.length} page{score.pages.length === 1 ? '' : 's'}
        </div>
        <button
          type="button"
          onClick={handleFavorite}
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border bg-white/80 transition ${
            score.favorite
              ? 'border-brand-300 text-brand-400'
              : 'border-transparent text-brand-200 hover:text-brand-300'
          }`}
        >
          <Star className={score.favorite ? 'fill-current' : ''} />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-brand-500">{score.name}</h3>
        </div>
        <p className="text-sm text-brand-400">
          Updated {new Date(score.updatedAt).toLocaleDateString()} · Source {score.source}
        </p>
        <div className="mt-auto flex flex-wrap gap-2">
          {score.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-brand-100 px-3 py-1 text-xs text-brand-400">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
};

export default ScoreCard;
