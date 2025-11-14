import * as pdfjsLib from 'pdfjs-dist';
import type { ScorePage } from '@/lib/models/score';

// Set up the worker for pdfjs-dist
if (typeof window !== 'undefined') {
  // Use local worker file from public folder
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

const createScorePage = async (file: File, index: number): Promise<ScorePage> => {
  let imageBlob: Blob;
  let width = 0;
  let height = 0;

  if (file.type.startsWith('image/')) {
    // Create a blob from the file to ensure it's properly serializable
    imageBlob = new Blob([await file.arrayBuffer()], { type: file.type });
    // Get image dimensions
    const img = new Image();
    const objectUrl = URL.createObjectURL(imageBlob);
    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        width = img.naturalWidth;
        height = img.naturalHeight;
        URL.revokeObjectURL(objectUrl);
        resolve();
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error(`Failed to load image: ${err}`));
      };
      img.src = objectUrl;
    });
  } else {
    // This shouldn't happen for images, but handle it
    imageBlob = new Blob([await file.arrayBuffer()], { type: file.type });
  }

  return {
    id: crypto.randomUUID(),
    index,
    imageBlob,
    width,
    height,
  };
};

export const imagesToPages = async (files: File[]): Promise<ScorePage[]> => {
  const pages = await Promise.all(files.map((file, index) => createScorePage(file, index)));
  return pages;
};

const renderPdfPageToBlob = async (
  page: pdfjsLib.PDFPageProxy,
  scale: number = 2.0,
): Promise<{ blob: Blob; width: number; height: number }> => {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) {
    throw new Error('Could not get canvas context');
  }

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const renderContext = {
    canvasContext: context,
    viewport,
  };

  await page.render(renderContext).promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to convert canvas to blob'));
          return;
        }
        resolve({
          blob,
          width: viewport.width,
          height: viewport.height,
        });
      },
      'image/png',
      1.0,
    );
  });
};

export const pdfToPages = async (file: File): Promise<ScorePage[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const pages: ScorePage[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const { blob, width, height } = await renderPdfPageToBlob(page);
    
    pages.push({
      id: crypto.randomUUID(),
      index: pageNum - 1,
      imageBlob: blob,
      width,
      height,
    });
  }

  return pages;
};

export const generateThumbnail = async (blob: Blob, maxSize: number = 300): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(blob);
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      
      // Calculate thumbnail dimensions maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to data URL
      canvas.toBlob(
        (thumbnailBlob) => {
          if (!thumbnailBlob) {
            reject(new Error('Failed to create thumbnail'));
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.onerror = reject;
          reader.readAsDataURL(thumbnailBlob);
        },
        'image/jpeg',
        0.85,
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for thumbnail'));
    };
    
    img.src = objectUrl;
  });
};
