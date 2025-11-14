'use client';

import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { imagesToPages, pdfToPages, generateThumbnail } from '@/lib/pdf/pdf-utils';
import { useScoreStore } from '@/store/score-store';
import type { ScorePage, ScoreSource } from '@/lib/models/score';
import { Camera, FileImage, FileText, Loader2, Trash } from 'lucide-react';
import PageThumbnail from '@/components/create/page-thumbnail';
import CameraCapture from '@/components/create/camera-capture';
import { getFolderTree, getFolderPathLabel } from '@/lib/utils/folders';

const CreatePage = () => {
  const router = useRouter();
  const { addScore, folders, currentFolderId } = useScoreStore((state) => ({
    addScore: state.addScore,
    folders: state.folders,
    currentFolderId: state.currentFolderId,
  }));
  const [name, setName] = useState('');
  const [pages, setPages] = useState<ScorePage[]>([]);
  const [folderId, setFolderId] = useState<string | null>(currentFolderId);
  const [source, setSource] = useState<ScoreSource>('pdf');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [showCamera, setShowCamera] = useState(false);

  const isValid = useMemo(() => name.trim().length > 0 && pages.length > 0, [name, pages.length]);
  const folderOptions = useMemo(() => getFolderTree(folders), [folders]);
  const selectedFolder = useMemo(
    () => folders.find((folder) => folder.id === folderId) ?? null,
    [folders, folderId],
  );

  const ingestFiles = async (files: FileList | null, handler: (files: File[]) => Promise<void>) => {
    if (!files?.length) return;
    setIsBusy(true);
    setError(undefined);
    try {
      await handler(Array.from(files));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsBusy(false);
    }
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    await ingestFiles(event.target.files, async (files) => {
      const newPages = await imagesToPages(files);
      setPages((prev) => [...prev, ...newPages.map((page, idx) => ({ ...page, index: prev.length + idx }))]);
      setSource('image');
    });
    event.target.value = '';
  };

  const handlePdfUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    await ingestFiles(event.target.files, async (files) => {
      const pdfPages = await pdfToPages(files[0]);
      setPages((prev) => [...prev, ...pdfPages.map((page, idx) => ({ ...page, index: prev.length + idx }))]);
      setSource('pdf');
    });
    event.target.value = '';
  };

  const handleDeletePage = (id: string) => {
    setPages((prev) => prev.filter((page) => page.id !== id).map((page, index) => ({ ...page, index })));
  };

  const handleCameraCapture = (newPages: ScorePage[]) => {
    setPages((prev) => [...prev, ...newPages.map((page, idx) => ({ ...page, index: prev.length + idx }))]);
    setSource('camera');
    setShowCamera(false);
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsBusy(true);
    setError(undefined);
    try {
      // Generate thumbnail from first page
      let thumbnail: string | undefined;
      if (pages.length > 0 && pages[0].imageBlob) {
        try {
          thumbnail = await generateThumbnail(pages[0].imageBlob);
        } catch (err) {
          console.warn('Failed to generate thumbnail:', err);
          // Continue without thumbnail
        }
      }
      
      const id = await addScore({
        name: name.trim(),
        favorite: false,
        pages,
        source,
        folderId: folderId ?? null,
        thumbnail,
      });
      router.push(`/viewer/${id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[2fr,1fr]">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2 text-center md:text-left">
          <h1 className="text-3xl font-semibold text-brand-500">Create a score</h1>
          <p className="text-brand-500/70">
            Import pages, arrange them, and save your score to begin performing hands-free.
          </p>
        </header>
        <div className="flex flex-col gap-4 rounded-3xl border border-dashed border-brand-200 bg-white/70 p-6 text-center sm:p-8">
          <p className="text-brand-400">Drop files here or use the buttons below</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
            <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-brand-200 px-5 py-3 text-sm text-brand-400 transition hover:border-brand-300 sm:w-auto">
              <FileText className="h-4 w-4" />
              Import PDF
              <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
            </label>
            <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-brand-200 px-5 py-3 text-sm text-brand-400 transition hover:border-brand-300 sm:w-auto">
              <FileImage className="h-4 w-4" />
              Add images
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            </label>
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand-200 px-5 py-3 text-sm text-brand-400 transition hover:border-brand-300 sm:w-auto"
              onClick={() => setShowCamera(true)}
            >
              <Camera className="h-4 w-4" />
              Capture from camera
            </button>
          </div>
        </div>
        <section className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-brand-500">Pages ({pages.length})</h2>
          {pages.length === 0 ? (
            <p className="mt-2 text-sm text-brand-400">No pages yet. Upload a PDF or images to begin.</p>
          ) : (
            <ul className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
              {pages.map((page) => (
                <li key={page.id} className="relative overflow-hidden rounded-2xl border border-brand-100 bg-brand-50">
                  <PageThumbnail page={page} />
                  <div className="absolute left-3 top-3 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-brand-400">
                    Page {page.index + 1}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeletePage(page.id)}
                    className="absolute right-3 top-3 inline-flex items-center justify-center rounded-full bg-white/90 p-1 text-brand-300 transition hover:text-brand-400"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <aside className="flex flex-col gap-6">
        <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
          <label className="text-sm font-medium text-brand-400" htmlFor="score-name">
            Score name
          </label>
          <input
            id="score-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Debussy - Clair de Lune"
            className="mt-2 w-full rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-brand-500 focus:border-brand-300 focus:outline-none"
          />
        </div>
        <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
          <label className="text-sm font-medium text-brand-400" htmlFor="folder">
            Folder
          </label>
          <select
            id="folder"
            value={folderId ?? ''}
            onChange={(event) => setFolderId(event.target.value ? event.target.value : null)}
            className="mt-2 w-full rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-brand-500 focus:border-brand-300 focus:outline-none"
          >
            <option value="">All scores</option>
            {folderOptions.map(({ folder }) => (
              <option key={folder.id} value={folder.id}>
                {getFolderPathLabel(folder, folders)}
              </option>
            ))}
          </select>
          {selectedFolder && (
            <p className="mt-2 text-xs text-brand-300">
              {getFolderPathLabel(selectedFolder, folders)}
            </p>
          )}
        </div>
        <button
          type="button"
          disabled={!isValid || isBusy}
          onClick={handleSubmit}
          className="inline-flex items-center justify-center rounded-full bg-brand-400 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-300 disabled:cursor-not-allowed disabled:bg-brand-200"
        >
          {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save score'}
        </button>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </aside>
      {showCamera && (
        <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />
      )}
    </div>
  );
};

export default CreatePage;
