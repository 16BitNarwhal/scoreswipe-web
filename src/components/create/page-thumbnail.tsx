'use client';

import { useEffect, useRef, useState } from 'react';
import type { ScorePage } from '@/lib/models/score';

interface PageThumbnailProps {
  page: ScorePage;
}

const PageThumbnail = ({ page }: PageThumbnailProps) => {
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const blobRef = useRef<Blob | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    // Only create a new URL if the blob has changed
    if (page.imageBlob === blobRef.current && urlRef.current) {
      setUrl(urlRef.current);
      return;
    }

    // Clean up previous URL
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }

    try {
      if (!page.imageBlob) {
        throw new Error('No image blob provided');
      }

      // Ensure it's a Blob instance
      let blob: Blob;
      if (page.imageBlob instanceof Blob) {
        blob = page.imageBlob;
      } else {
        // Try to reconstruct from array buffer if needed
        blob = new Blob([page.imageBlob as BlobPart], { type: 'image/png' });
      }

      const objectUrl = URL.createObjectURL(blob);
      blobRef.current = page.imageBlob;
      urlRef.current = objectUrl;
      setUrl(objectUrl);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create image URL');
      setUrl(null);
    }

    // Cleanup on unmount or blob change
    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, [page.imageBlob]);

  if (error || !url) {
    return (
      <div className="flex h-64 w-full items-center justify-center bg-brand-100 text-sm text-brand-400">
        {error || 'Failed to load image'}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={`Page ${page.index + 1}`}
      className="h-64 w-full object-cover"
      onError={() => setError('Image failed to load')}
      onLoad={() => setError(null)}
    />
  );
};

export default PageThumbnail;
