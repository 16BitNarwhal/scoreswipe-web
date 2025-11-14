import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export interface TiltDetectorOptions {
  onTiltLeft: () => void;
  onTiltRight: () => void;
  sensitivity: number;
  invertDirection: boolean;
}

export class TiltDetector {
  private stream?: MediaStream;
  private rafId?: number;
  private faceLandmarker?: FaceLandmarker;
  private lastProcessTime = -1;
  private previousAngle = 0;
  private previousTime = Date.now();
  private turningPage = false;
  private initialized = false;

  constructor(private readonly options: TiltDetectorOptions) { }

  async start(videoElement: HTMLVideoElement) {
    try {
      // Stop any existing stream first
      this.stop();

      this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      videoElement.srcObject = this.stream;

      // Handle play() interruption gracefully
      try {
        await videoElement.play();
      } catch (playError) {
        // If play was interrupted, stop the stream and rethrow
        this.stop();
        throw playError;
      }

      // Initialize MediaPipe FaceLandmarker
      if (!this.initialized) {
        await this.initializeFaceLandmarker();
        this.initialized = true;
      }

      this.loop(videoElement);
    } catch (error) {
      // Don't log AbortError as it's expected in React StrictMode
      // Re-throw to let the caller handle it
      throw error;
    }
  }

  private async initializeFaceLandmarker() {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm',
      );

      this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: 'GPU',
        },
        outputFaceBlendshapes: false,
        runningMode: 'VIDEO',
        numFaces: 1,
      });
    } catch (error) {
      // Fallback to CPU if GPU fails
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm',
        );
        this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: 'CPU',
          },
          outputFaceBlendshapes: false,
          runningMode: 'VIDEO',
          numFaces: 1,
        });
      } catch (fallbackError) {
        // Failed to initialize MediaPipe - detection will not work
      }
    }
  }

  private getLargestFace(results: { faceLandmarks?: Array<Array<{ x: number; y: number; z?: number }>> }) {
    // Select face with largest bounding box area (matching old ScoreSwipe logic)
    if (!results.faceLandmarks || results.faceLandmarks.length === 0) return null;
    if (results.faceLandmarks.length === 1) return results.faceLandmarks[0];

    // Calculate bounding box areas and select largest
    let largestFace = results.faceLandmarks[0];
    let largestArea = 0;

    for (const face of results.faceLandmarks) {
      // Estimate bounding box from landmarks
      const xs = face.map((p: { x: number; y: number; z?: number }) => p.x);
      const ys = face.map((p: { x: number; y: number; z?: number }) => p.y);
      const width = Math.max(...xs) - Math.min(...xs);
      const height = Math.max(...ys) - Math.min(...ys);
      const area = width * height;

      if (area > largestArea) {
        largestArea = area;
        largestFace = face;
      }
    }

    return largestFace;
  }

  private calculateRollAngle(landmarks: Array<{ x: number; y: number; z?: number }>): number {
    // Calculate roll angle from face landmarks
    // MediaPipe FaceLandmarker returns 468 landmarks
    if (!landmarks || landmarks.length < 468) return 0;

    // Use eye landmarks for roll detection
    // Left eye outer corner: landmark 33
    // Right eye outer corner: landmark 263
    // Alternative: use eye centers for more stability
    // Left eye center: landmark 468/2 - 33, Right eye center: landmark 468/2 + 33

    const leftEyeOuter = landmarks[33];
    const rightEyeOuter = landmarks[263];

    // Fallback to eye centers if outer corners aren't available
    const leftEyeCenter = landmarks[468 / 2 - 33] || landmarks[33];
    const rightEyeCenter = landmarks[468 / 2 + 33] || landmarks[263];

    const leftEye = leftEyeOuter || leftEyeCenter;
    const rightEye = rightEyeOuter || rightEyeCenter;

    if (!leftEye || !rightEye || !leftEye.x || !rightEye.x) return 0;

    // Calculate angle from horizontal (roll angle)
    // Since video is flipped horizontally, we need to account for that
    const dx = rightEye.x - leftEye.x;
    const dy = rightEye.y - leftEye.y;

    // If dx is very small, face is looking straight, return 0
    if (Math.abs(dx) < 0.001) return 0;

    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    return angle;
  }

  stop() {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = undefined;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    this.faceLandmarker?.close();
    this.faceLandmarker = undefined;
    this.initialized = false;
  }

  private loop = (videoElement: HTMLVideoElement) => {
    if (!this.faceLandmarker || !this.stream) {
      this.rafId = requestAnimationFrame(() => this.loop(videoElement));
      return;
    }

    const now = Date.now();
    // Process at ~30fps
    if (now - this.lastProcessTime < 33) {
      this.rafId = requestAnimationFrame(() => this.loop(videoElement));
      return;
    }
    this.lastProcessTime = now;

    try {
      const results = this.faceLandmarker.detectForVideo(videoElement, now);

      const face = this.getLargestFace(results);
      if (!face) {
        // No face detected - reset state
        this.previousAngle = 0;
        this.rafId = requestAnimationFrame(() => this.loop(videoElement));
        return;
      }

      // Calculate roll angle (Z-axis rotation) - matching headEulerAngleZ from old ScoreSwipe
      const rot = this.calculateRollAngle(face);

      // If angle is null/invalid, skip
      if (rot === 0 && this.previousAngle === 0) {
        this.rafId = requestAnimationFrame(() => this.loop(videoElement));
        return;
      }

      // Calculate threshold: (100 - sensitivity) / 100 * 40
      // Sensitivity is 0-1 in our system, so convert to 0-100 range first
      const sensitivityPercent = this.options.sensitivity * 100;
      const threshold = ((100 - sensitivityPercent) / 100) * 40;

      // Calculate angular speed: abs((rot - previousAngle) / timeDelta)
      const timeDelta = now - this.previousTime;
      const angularSpeed = timeDelta > 0 ? Math.abs((rot - this.previousAngle) / timeDelta) : 0;

      // Exact logic from old ScoreSwipe:
      // if (rot > threshold) {
      //   if (!__turningPage && angularSpeed > 0.01 && angularSpeed > 0.01) {
      //     (Config.invertDirection) ? previousPage() : nextPage();
      //     __turningPage = true;
      //   }
      // } else if (rot < -threshold) {
      //   if (!__turningPage && angularSpeed > 0.01 && angularSpeed > 0.01) {
      //     (Config.invertDirection) ? nextPage() : previousPage();
      //     __turningPage = true;
      //   }
      // } else if (rot.abs() < threshold * 0.6 && __turningPage) {
      //   __turningPage = false;
      // }

      if (rot > threshold) {
        if (!this.turningPage && angularSpeed > 0.01) {
          this.options.invertDirection ? this.options.onTiltLeft() : this.options.onTiltRight();
          this.turningPage = true;
        }
      } else if (rot < -threshold) {
        if (!this.turningPage && angularSpeed > 0.01) {
          this.options.invertDirection ? this.options.onTiltRight() : this.options.onTiltLeft();
          this.turningPage = true;
        }
      } else if (Math.abs(rot) < threshold * 0.6 && this.turningPage) {
        this.turningPage = false;
      }

      this.previousAngle = rot;
      this.previousTime = now;
    } catch (error) {
      // Silently handle processing errors
    }

    this.rafId = requestAnimationFrame(() => this.loop(videoElement));
  };
}
