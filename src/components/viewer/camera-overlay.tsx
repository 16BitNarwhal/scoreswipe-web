'use client';

import { useEffect, useRef, useState } from 'react';
import { CameraOff, Loader2 } from 'lucide-react';
import { TiltDetector } from '@/lib/vision/tilt-detector';

type CameraOverlayProps = {
  sensitivity: number;
  invertDirection: boolean;
  onTiltLeft: () => void;
  onTiltRight: () => void;
};

const CameraOverlay = ({ sensitivity, invertDirection, onTiltLeft, onTiltRight }: CameraOverlayProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectorRef = useRef<TiltDetector | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const startingRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || startingRef.current) return;

    // Clean up previous detector
    if (detectorRef.current) {
      detectorRef.current.stop();
      detectorRef.current = null;
    }

    const detector = new TiltDetector({
      sensitivity,
      invertDirection,
      onTiltLeft,
      onTiltRight,
    });
    detectorRef.current = detector;

    const start = async () => {
      if (startingRef.current) return;
      startingRef.current = true;
      setStatus('loading');
      try {
        await detector.start(video);
        setStatus('ready');
      } catch (error) {
        // Only log if it's not an AbortError (which is expected in StrictMode)
        if (error instanceof Error && error.name !== 'AbortError') {
          // eslint-disable-next-line no-console
          console.error(error);
        }
        setStatus('error');
      } finally {
        startingRef.current = false;
      }
    };

    start();

    return () => {
      startingRef.current = false;
      if (detectorRef.current) {
        detectorRef.current.stop();
        detectorRef.current = null;
      }
    };
  }, [invertDirection, onTiltLeft, onTiltRight, sensitivity]);

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-3xl border border-brand-100 bg-brand-50 p-4">
        <div className="flex items-center justify-between text-sm text-brand-400">
          <span>Gesture camera</span>
          <span>
            {status === 'ready' && 'Live'}
            {status === 'loading' && ' activating...'}
            {status === 'error' && ' permission denied'}
          </span>
        </div>
        <div className="mt-4 flex h-48 items-center justify-center overflow-hidden rounded-2xl bg-black/70">
          <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
          {status === 'loading' && <Loader2 className="h-8 w-8 animate-spin text-white" />}
          {status === 'error' && <CameraOff className="h-8 w-8 text-red-400" />}
        </div>
      </div>
    </div>
  );
};

export default CameraOverlay;
