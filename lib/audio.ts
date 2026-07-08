import { RadioStation } from '@/types/radio';

class AudioManager {
  private audioElement: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private retryCount = 0;
  private maxRetries = 3;
  private retryDelay = 2000;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioElement = new Audio();
      this.setupAudioElement();
    }
  }

  private setupAudioElement(): void {
    if (!this.audioElement) return;

    this.audioElement.preload = 'none';
    this.audioElement.crossOrigin = 'anonymous';
  }

  private async initializeAudioContext(): Promise<void> {
    if (this.audioContext) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      
      if (this.audioElement) {
        this.sourceNode = this.audioContext.createMediaElementSource(this.audioElement);
        this.sourceNode.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
      }
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
    }
  }

  async play(station: RadioStation, volume: number = 0.75): Promise<void> {
    if (!this.audioElement) {
      throw new Error('Audio element not initialized');
    }

    try {
      await this.initializeAudioContext();
      
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.audioElement.src = station.url;
      this.audioElement.volume = volume;
      
      if (this.gainNode) {
        this.gainNode.gain.value = volume;
      }

      await this.audioElement.play();
      this.retryCount = 0;
    } catch (error) {
      console.error('Playback error:', error);
      
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`Retrying playback (${this.retryCount}/${this.maxRetries})...`);
        
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.play(station, volume);
      }
      
      throw error;
    }
  }

  pause(): void {
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  stop(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioElement.src = '';
    }
  }

  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    if (this.audioElement) {
      this.audioElement.volume = clampedVolume;
    }
    
    if (this.gainNode) {
      this.gainNode.gain.value = clampedVolume;
    }
  }

  getVolume(): number {
    return this.audioElement?.volume || 0;
  }

  isPlaying(): boolean {
    return this.audioElement ? !this.audioElement.paused && this.audioElement.currentTime > 0 : false;
  }

  onPlay(callback: () => void): void {
    if (this.audioElement) {
      this.audioElement.addEventListener('play', callback);
    }
  }

  onPause(callback: () => void): void {
    if (this.audioElement) {
      this.audioElement.addEventListener('pause', callback);
    }
  }

  onEnded(callback: () => void): void {
    if (this.audioElement) {
      this.audioElement.addEventListener('ended', callback);
    }
  }

  onError(callback: (error: ErrorEvent) => void): void {
    if (this.audioElement) {
      this.audioElement.addEventListener('error', callback);
    }
  }

  onWaiting(callback: () => void): void {
    if (this.audioElement) {
      this.audioElement.addEventListener('waiting', callback);
    }
  }

  onCanPlay(callback: () => void): void {
    if (this.audioElement) {
      this.audioElement.addEventListener('canplay', callback);
    }
  }

  removeListeners(): void {
    if (!this.audioElement) return;

    const clone = this.audioElement.cloneNode(true) as HTMLAudioElement;
    this.audioElement.parentNode?.replaceChild(clone, this.audioElement);
    this.audioElement = clone;
    this.setupAudioElement();
  }

  destroy(): void {
    this.stop();
    this.removeListeners();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.gainNode = null;
    this.sourceNode = null;
    this.audioElement = null;
  }
}

// Singleton instance
let audioManagerInstance: AudioManager | null = null;

export function getAudioManager(): AudioManager {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager();
  }
  return audioManagerInstance;
}

export function destroyAudioManager(): void {
  if (audioManagerInstance) {
    audioManagerInstance.destroy();
    audioManagerInstance = null;
  }
}
