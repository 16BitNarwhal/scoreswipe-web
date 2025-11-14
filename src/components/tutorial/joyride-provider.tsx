'use client';

import Joyride, { STATUS } from 'react-joyride';
import type { CallBackProps, Step } from 'react-joyride';
import { useEffect, useState } from 'react';

const steps: Step[] = [
  {
    target: 'body',
    placement: 'center',
    title: 'Welcome to ScoreSwipe Web',
    content: 'Use your head tilt or arrow keys to flip pages while you perform.',
    disableBeacon: true,
  },
];

const JoyrideProvider = ({ children }: { children: React.ReactNode }) => {
  const [run, setRun] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const hasSeenTour = window.localStorage.getItem('scoreswipe.seenTour');
      if (!hasSeenTour) {
        setTimeout(() => setRun(true), 1000);
      }
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      window.localStorage.setItem('scoreswipe.seenTour', 'true');
      setRun(false);
    }
  };

  return (
    <>
      {mounted && (
        <Joyride
          steps={steps}
          continuous
          run={run}
          showProgress
          showSkipButton
          styles={{
            options: { primaryColor: '#72BEE8', zIndex: 10000 },
          }}
          callback={handleJoyrideCallback}
        />
      )}
      {children}
    </>
  );
};

export default JoyrideProvider;
