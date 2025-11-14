import type { ScorePage } from '@/lib/models/score';

const createScorePage = async (file: File, index: number): Promise<ScorePage> => {
  const imageBlob = file.type.startsWith('image/') ? file : new Blob([await file.arrayBuffer()]);
  return {
    id: crypto.randomUUID(),
    index,
    imageBlob,
    width: 0,
    height: 0,
  };
};

export const imagesToPages = async (files: File[]): Promise<ScorePage[]> => {
  const pages = await Promise.all(files.map((file, index) => createScorePage(file, index)));
  return pages;
};

export const pdfToPages = async (_file: File): Promise<ScorePage[]> => {
  // TODO: Implement PDF rasterization using pdfjs-dist worker in a Web Worker context.
  // For now, return an empty array to unblock UI wiring.
  return [];
};
