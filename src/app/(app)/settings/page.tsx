'use client';

import type { ChangeEvent } from 'react';
import { useScoreStore } from '@/store/score-store';

const SettingsPage = () => {
  const { settings, upsertSettings } = useScoreStore((state) => ({
    settings: state.settings,
    upsertSettings: state.upsertSettings,
  }));

  const handleSensitivityChange = (event: ChangeEvent<HTMLInputElement>) => {
    upsertSettings({
      calibration: {
        ...settings.calibration,
        sensitivity: Number(event.target.value),
      },
    });
  };

  const handleInvertChange = (event: ChangeEvent<HTMLInputElement>) => {
    upsertSettings({
      calibration: {
        ...settings.calibration,
        invertDirection: event.target.checked,
      },
    });
  };

  const handleSwipeModeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    upsertSettings({
      calibration: {
        ...settings.calibration,
        swipeMode: event.target.value as typeof settings.calibration.swipeMode,
      },
    });
  };

  const handleViewerChange = (key: 'autoAdvance' | 'autoScroll' | 'highlightCurrentBar') => (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    upsertSettings({
      viewer: {
        ...settings.viewer,
        [key]: event.target.checked,
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold text-brand-500">Settings</h1>
        <p className="text-brand-500/70">Calibrate gestures and customize the viewing experience.</p>
      </div>
      <section className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-brand-500">Gesture controls</h2>
        <div className="mt-4 space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-brand-400" htmlFor="swipe-mode">
              Swipe mode
            </label>
            <select
              id="swipe-mode"
              value={settings.calibration.swipeMode}
              onChange={handleSwipeModeChange}
              className="w-full rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-brand-500 focus:border-brand-300 focus:outline-none"
            >
              <option value="tilt">Tilt (roll)</option>
              <option value="turn">Turn (yaw)</option>
              <option value="none">Manual only</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-brand-400" htmlFor="sensitivity">
              Sensitivity ({Math.round(settings.calibration.sensitivity * 100)}%)
            </label>
            <input
              id="sensitivity"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.calibration.sensitivity}
              onChange={handleSensitivityChange}
              className="accent-brand-400"
            />
          </div>
          <label className="inline-flex items-center gap-3 text-sm text-brand-400">
            <input
              type="checkbox"
              checked={settings.calibration.invertDirection}
              onChange={handleInvertChange}
              className="h-4 w-4 rounded border-brand-200 text-brand-400 focus:ring-brand-300"
            />
            Invert direction
          </label>
        </div>
      </section>
      <section className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-brand-500">Viewer preferences</h2>
        <ul className="mt-4 space-y-3 text-sm text-brand-400">
          <li className="flex items-center gap-3">
            <input
              id="auto-advance"
              type="checkbox"
              checked={settings.viewer.autoAdvance}
              onChange={handleViewerChange('autoAdvance')}
              className="h-4 w-4 rounded border-brand-200 text-brand-400 focus:ring-brand-300"
            />
            <label htmlFor="auto-advance">Auto advance at end of page</label>
          </li>
          <li className="flex items-center gap-3">
            <input
              id="auto-scroll"
              type="checkbox"
              checked={settings.viewer.autoScroll}
              onChange={handleViewerChange('autoScroll')}
              className="h-4 w-4 rounded border-brand-200 text-brand-400 focus:ring-brand-300"
            />
            <label htmlFor="auto-scroll">Smooth scroll between pages</label>
          </li>
          <li className="flex items-center gap-3">
            <input
              id="highlight-bar"
              type="checkbox"
              checked={settings.viewer.highlightCurrentBar}
              onChange={handleViewerChange('highlightCurrentBar')}
              className="h-4 w-4 rounded border-brand-200 text-brand-400 focus:ring-brand-300"
            />
            <label htmlFor="highlight-bar">Highlight active measure</label>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default SettingsPage;
