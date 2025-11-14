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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const detector = new TiltDetector({
      sensitivity,
      invertDirection,
      onTiltLeft,
      onTiltRight,
    });
    detectorRef.current = detector;

    const start = async () => {
      setStatus('loading');
      try {
        await detector.start(video);
        setStatus('ready');
      } catch (error) {
        setStatus('error');
        // eslint-disable-next-line no-console
        console.error(error);
      }
    };

    start();

    return () => {
      detector.stop();
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
