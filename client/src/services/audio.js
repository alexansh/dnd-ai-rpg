import { musicEngine } from './musicEngine';

/**
 * Procedural Web Audio API Engine
 * Generates ambient tavern hearth crackles, dice roll clatter, combat impacts,
 * and UI audio feedback with zero external dependencies.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.ambientNodes = null;
    this.isAmbientPlaying = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    musicEngine.init();
  }

  setMuted(muted) {
    this.isMuted = muted;
    musicEngine.setMuted(muted);
    if (muted && this.ambientNodes) {
      this.stopAmbience();
    } else if (!muted && !this.isAmbientPlaying) {
      this.startTavernAmbience();
    }
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  setMood(mood) {
    musicEngine.setMood(mood);
  }

  // Play subtle wood/parchment UI click
  playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch (e) {}
  }

  // Play realistic rolling dice clatter
  playDiceRoll() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const bounces = [0, 0.08, 0.17, 0.28, 0.42, 0.58];

      bounces.forEach((timeOffset, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        const baseFreq = 220 + Math.random() * 180 + (idx === bounces.length - 1 ? -60 : 0);
        osc.frequency.setValueAtTime(baseFreq, now + timeOffset);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + timeOffset + 0.06);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now + timeOffset);

        const volume = (0.15 / (idx * 0.3 + 1)) * (0.8 + Math.random() * 0.4);
        gain.gain.setValueAtTime(volume, now + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.07);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + 0.08);
      });
    } catch (e) {}
  }

  // Play Success / Critical Fanfare
  playSuccess(isCrit = false) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = isCrit ? [261.63, 329.63, 392.00, 523.25, 659.25] : [261.63, 329.63, 392.00, 523.25];

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.15, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.45);
      });
    } catch (e) {}
  }

  // Play Failure / Damage Thud (deep wooden dull impact)
  playFailure() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(95, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.25);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch (e) {}
  }

  // Start continuous ambient tavern fireplace and gentle lute melody
  startTavernAmbience() {
    if (this.isMuted || this.isAmbientPlaying) return;
    this.init();
    if (!this.ctx) return;

    try {
      musicEngine.setMood('tavern_calm');

      // Soft fireplace crackle simulator using buffer noise
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() > 0.992 ? (Math.random() * 2 - 1) * 0.25 : (Math.random() * 2 - 1) * 0.008;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(800, this.ctx.currentTime);
      noiseFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.015, this.ctx.currentTime);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      whiteNoise.start();

      this.ambientNodes = { whiteNoise, noiseGain };
      this.isAmbientPlaying = true;
    } catch (e) {
      console.warn('Could not start audio ambience:', e);
    }
  }

  setIntensity(level) {
    musicEngine.setIntensity(level);
  }

  setVolume(channel, value) {
    musicEngine.setVolume(channel, value);
  }

  triggerSting(stingKey) {
    musicEngine.triggerSting(stingKey);
  }

  startAmbience(type) {
    musicEngine.startAmbienceTrack(type);
  }

  stopAmbience(type) {
    if (type) {
      musicEngine.stopAmbienceTrack(type);
    } else {
      musicEngine.stopAllAmbience();
      if (this.ambientNodes) {
        try {
          this.ambientNodes.whiteNoise?.stop();
        } catch (e) {}
        this.ambientNodes = null;
      }
      this.isAmbientPlaying = false;
    }
  }
}

export const soundFx = new SoundEngine();
export { musicEngine };
