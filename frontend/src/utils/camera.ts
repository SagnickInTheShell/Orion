/**
 * Layer 1 Sensing: Camera Environmental Processing via HTML5 Canvas.
 * 
 * STRICT PRIVACY GUARANTEE:
 * Downsamples frames to a tiny 48x36 offscreen canvas.
 * Extracts only approximate brightness (0-1) and motion activity delta (0-1).
 * NEVER stores frames, detects faces, or uploads raw video.
 */

export class CameraSensor {
  private videoElement: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private stream: MediaStream | null = null;
  private timerId: any = null;
  private prevFrameData: Uint8ClampedArray | null = null;
  private onMetricsChange: (metrics: { brightness: number; activity: number }) => void;

  constructor(onMetricsChange: (metrics: { brightness: number; activity: number }) => void) {
    this.onMetricsChange = onMetricsChange;
  }

  async start(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 } },
        audio: false
      });

      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = this.stream;
      this.videoElement.playsInline = true;
      this.videoElement.muted = true;
      await this.videoElement.play();

      this.canvas = document.createElement('canvas');
      this.canvas.width = 48;
      this.canvas.height = 36;
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

      // Sample every 500ms (low frequency for privacy & performance)
      this.timerId = setInterval(() => {
        this.sampleFrame();
      }, 500);

      return true;
    } catch (err) {
      console.warn("Camera access denied or unavailable; continuing with manual simulation controls:", err);
      return false;
    }
  }

  private sampleFrame(): void {
    if (!this.ctx || !this.videoElement || !this.canvas) return;

    this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
    const frame = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = frame.data;

    let totalLuminance = 0;
    let totalMotionDelta = 0;
    const pixelCount = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      // Relative luminance formula: 0.299 R + 0.587 G + 0.114 B
      const lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
      totalLuminance += lum;

      if (this.prevFrameData) {
        const prevLum = (0.299 * this.prevFrameData[i] + 0.587 * this.prevFrameData[i + 1] + 0.114 * this.prevFrameData[i + 2]) / 255;
        totalMotionDelta += Math.abs(lum - prevLum);
      }
    }

    const avgBrightness = totalLuminance / pixelCount;
    const avgMotion = this.prevFrameData ? Math.min(1.0, (totalMotionDelta / pixelCount) * 8.0) : 0.4;

    // Cache current frame buffer for next delta calculation
    this.prevFrameData = new Uint8ClampedArray(data);

    this.onMetricsChange({
      brightness: Number(avgBrightness.toFixed(2)),
      activity: Number(avgMotion.toFixed(2))
    });
  }

  stop(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
    this.prevFrameData = null;
  }
}
