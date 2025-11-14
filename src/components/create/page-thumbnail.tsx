'use client';

import { useEffect, useMemo } from 'react';
import type { ScorePage } from '@/lib/models/score';

interface PageThumbnailProps {
  page: ScorePage;
}

const PageThumbnail = ({ page }: PageThumbnailProps) => {
  const url = useMemo(() => URL.createObjectURL(page.imageBlob), [page.imageBlob]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  return <img src={url} alt={`Page ${page.index + 1}`} className="h-64 w-full object-cover" />;
};

export default PageThumbnail;
