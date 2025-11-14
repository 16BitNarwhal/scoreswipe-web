export interface TiltDetectorOptions {
  onTiltLeft: () => void;
  onTiltRight: () => void;
  sensitivity: number;
  invertDirection: boolean;
}

export class TiltDetector {
  private stream?: MediaStream;

  private rafId?: number;

  constructor(private readonly options: TiltDetectorOptions) {}

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
      
      this.loop();
    } catch (error) {
      // Don't log AbortError as it's expected in React StrictMode
      if (error instanceof Error && error.name !== 'AbortError') {
        // eslint-disable-next-line no-console
        console.error('Unable to start camera', error);
      }
      throw error;
    }
  }

  stop() {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = undefined;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }

  private loop = () => {
    // TODO: integrate MediaPipe face landmark detection and trigger callbacks based on yaw/roll angles.
    this.rafId = requestAnimationFrame(this.loop);
  };
}
