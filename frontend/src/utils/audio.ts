/**
 * Layer 1 Sensing: Microphone Audio Processing via Browser Web Audio API.
 * 
 * STRICT PRIVACY GUARANTEE:
 * Calculates approximate RMS ambient volume locally in memory.
 * NEVER records, stores, or transmits raw audio.
 */

export class AudioSensor {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private animationId: number | null = null;
  private onLevelChange: (level: number) => void;

  constructor(onLevelChange: (level: number) => void) {
    this.onLevelChange = onLevelChange;
  }

  async start(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      this.microphone = this.audioContext.createMediaStreamSource(this.stream);
      this.microphone.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const poll = () => {
        if (!this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        // Map 0 - 128 to 0.0 - 1.0
        const normalized = Math.min(1.0, Math.max(0.0, avg / 85));
        this.onLevelChange(Number(normalized.toFixed(2)));

        this.animationId = requestAnimationFrame(poll);
      };

      poll();
      return true;
    } catch (err) {
      console.warn("Microphone access denied or unavailable; continuing with manual simulation controls:", err);
      return false;
    }
  }

  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
