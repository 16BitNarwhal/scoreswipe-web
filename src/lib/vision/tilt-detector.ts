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
  private neutralAngle = 0;
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

      // Calibrate neutral position after a short delay
      setTimeout(() => {
        this.calibrateNeutral(videoElement);
      }, 1000);

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

  private calibrateNeutral(videoElement: HTMLVideoElement) {
    // Capture a few frames to establish neutral position
    let samples = 0;
    const maxSamples = 10;
    const sampleInterval = setInterval(() => {
      if (!this.faceLandmarker || samples >= maxSamples) {
        clearInterval(sampleInterval);
        return;
      }

      const results = this.faceLandmarker.detectForVideo(videoElement, Date.now());
      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const face = results.faceLandmarks[0];
        // Use roll angle (Z-axis rotation) for tilt detection
        const roll = this.calculateRollAngle(face);
        this.neutralAngle = (this.neutralAngle * samples + roll) / (samples + 1);
        samples++;
      }
    }, 100);
  }

  private calculateRollAngle(landmarks: any[]): number {
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

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const face = results.faceLandmarks[0];
        const roll = this.calculateRollAngle(face);

        // Only process if we have a valid roll angle
        if (roll === 0 && this.previousAngle === 0) {
          // No face detected or invalid angle, skip
          this.rafId = requestAnimationFrame(() => this.loop(videoElement));
          return;
        }

        const relativeAngle = roll - this.neutralAngle;

        // Calculate threshold based on sensitivity (higher sensitivity = lower threshold)
        // Sensitivity 0 = 15 degree threshold, Sensitivity 1 = 0 degree threshold
        const threshold = (1 - this.options.sensitivity) * 15; // Range: 0-15 degrees

        // Calculate angular speed to prevent false triggers
        const timeDelta = now - this.previousTime;
        const angleDelta = Math.abs(relativeAngle - this.previousAngle);
        const angularSpeed = timeDelta > 0 ? angleDelta / timeDelta : 0;

        // Only trigger if movement is significant and fast enough
        // Lower angular speed threshold to be more responsive
        if (angularSpeed > 0.005 && !this.turningPage) {
          if (relativeAngle > threshold) {
            // Tilted right (head tilted to viewer's right)
            // Since video is flipped, this appears as left tilt on screen
            this.options.invertDirection ? this.options.onTiltLeft() : this.options.onTiltRight();
            this.turningPage = true;
          } else if (relativeAngle < -threshold) {
            // Tilted left (head tilted to viewer's left)
            // Since video is flipped, this appears as right tilt on screen
            this.options.invertDirection ? this.options.onTiltRight() : this.options.onTiltLeft();
            this.turningPage = true;
          }
        }

        // Reset turning flag when head returns to neutral
        if (Math.abs(relativeAngle) < threshold * 0.6 && this.turningPage) {
          this.turningPage = false;
        }

        this.previousAngle = relativeAngle;
        this.previousTime = now;
      } else {
        // No face detected - reset state
        this.previousAngle = 0;
      }
    } catch (error) {
      // Silently handle processing errors
    }

    this.rafId = requestAnimationFrame(() => this.loop(videoElement));
  };
}
