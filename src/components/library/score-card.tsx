'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { useScoreStore } from '@/store/score-store';
import { generateThumbnail } from '@/lib/pdf/pdf-utils';
import type { Score } from '@/lib/models/score';

interface ScoreCardProps {
  score: Score;
}

const ScoreCard = ({ score }: ScoreCardProps) => {
  const router = useRouter();
  const toggleFavorite = useScoreStore((state) => state.toggleFavorite);
  const selectScore = useScoreStore((state) => state.selectScore);
  const updateScore = useScoreStore((state) => state.updateScore);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(
    score.thumbnail && score.thumbnail.trim() ? score.thumbnail : null,
  );
  const [thumbnailLoading, setThumbnailLoading] = useState(false);

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

  const handleFavorite = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    await toggleFavorite(score.id);
  };

  return (
    <div
      onClick={handleOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleOpen();
        }
      }}
      role="button"
      tabIndex={0}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-brand-100 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
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
      </div>
    </div>
  );
};

export default ScoreCard;
