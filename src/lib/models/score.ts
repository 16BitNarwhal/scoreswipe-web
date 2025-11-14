export type ScoreSource = 'pdf' | 'image' | 'camera';

export interface ScorePage {
  id: string;
  index: number;
  imageBlob: Blob;
  width: number;
  height: number;
}

export interface Score {
  id: string;
  name: string;
  pages: ScorePage[];
  favorite: boolean;
  tags: string[];
  source: ScoreSource;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt?: string;
  thumbnail?: string;
}

export interface ScoreCalibrationSettings {
  neutralEulerY: number;
  neutralEulerZ: number;
  sensitivity: number;
  invertDirection: boolean;
  swipeMode: 'tilt' | 'turn' | 'none';
}

export interface ViewerPreferences {
  autoAdvance: boolean;
  autoScroll: boolean;
  highlightCurrentBar: boolean;
}

export interface AppSettings {
  calibration: ScoreCalibrationSettings;
  viewer: ViewerPreferences;
  onboardingCompleted: boolean;
}
