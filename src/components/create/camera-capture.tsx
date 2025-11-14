'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Camera, RotateCcw } from 'lucide-react';
import { imagesToPages } from '@/lib/pdf/pdf-utils';
import type { ScorePage } from '@/lib/models/score';

interface CameraCaptureProps {
    onCapture: (pages: ScorePage[]) => void;
    onClose: () => void;
    onAddMore?: () => void;
}

const CameraCapture = ({ onCapture, onClose }: CameraCaptureProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [error, setError] = useState<string | undefined>();
    const [isCapturing, setIsCapturing] = useState(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [capturedPages, setCapturedPages] = useState<ScorePage[]>([]);

    useEffect(() => {
        const startCamera = async () => {
            try {
                setError(undefined);
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode,
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                    },
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    streamRef.current = stream;
                }
            } catch (err) {
                setError((err as Error).message || 'Failed to access camera');
                console.error('Camera error:', err);
            }
        };

        startCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, [facingMode]);

    const handleCapture = async () => {
        if (!videoRef.current || isCapturing) return;

        setIsCapturing(true);
        try {
            const video = videoRef.current;
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                throw new Error('Could not get canvas context');
            }

            // Draw video frame to canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert canvas to blob
            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Failed to convert canvas to blob'));
                            return;
                        }
                        resolve(blob);
                    },
                    'image/jpeg',
                    0.92,
                );
            });

            // Create a File-like object from the blob
            const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
                type: 'image/jpeg',
            });

            // Convert to ScorePage format
            const pages = await imagesToPages([file]);
            const newPages = pages.map((page, idx) => ({ ...page, index: capturedPages.length + idx }));
            setCapturedPages((prev) => [...prev, ...newPages]);
        } catch (err) {
            setError((err as Error).message || 'Failed to capture image');
        } finally {
            setIsCapturing(false);
        }
    };

    const handleSwitchCamera = () => {
        setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    };

    const handleClose = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
        }
        onClose();
    };

    const handleDone = () => {
        if (capturedPages.length > 0) {
            onCapture(capturedPages);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
            <div className="relative flex h-full w-full flex-col">
                <button
                    type="button"
                    onClick={handleClose}
                    className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-brand-500 shadow-lg transition-colors hover:bg-white"
                    aria-label="Close camera"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="flex flex-1 items-center justify-center overflow-hidden">
                    {error ? (
                        <div className="flex flex-col items-center gap-4 text-white">
                            <p className="text-lg font-semibold">Camera Error</p>
                            <p className="text-sm text-white/80">{error}</p>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="rounded-full bg-brand-400 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-300"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="h-full w-full object-contain"
                        />
                    )}
                </div>

                {!error && (
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-4 bg-gradient-to-t from-black/80 to-transparent p-8 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
                        <button
                            type="button"
                            onClick={handleSwitchCamera}
                            className="rounded-full bg-white/20 p-4 text-white backdrop-blur transition hover:bg-white/30"
                            aria-label="Switch camera"
                        >
                            <RotateCcw className="h-6 w-6" />
                        </button>
                        <button
                            type="button"
                            onClick={handleCapture}
                            disabled={isCapturing}
                            className="h-16 w-16 rounded-full border-4 border-white bg-white shadow-lg transition hover:scale-105 disabled:opacity-50"
                            aria-label="Capture photo"
                        >
                            <Camera className="mx-auto h-6 w-6 text-brand-500" />
                        </button>
                        {capturedPages.length > 0 ? (
                            <button
                                type="button"
                                onClick={handleDone}
                                className="rounded-full bg-brand-400 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-300"
                                aria-label="Done capturing"
                            >
                                Done ({capturedPages.length})
                            </button>
                        ) : (
                            <div className="w-16" />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CameraCapture;
