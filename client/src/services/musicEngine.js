/**
 * Pocket Bard Reactive Audio & Music Engine (Web Audio API)
 * Procedurally generates adaptive fantasy soundscapes, layered ambiance,
 * dynamic intensity transitions (1-5), and instant soundboard stings.
 */

class MusicEngine {
  constructor() {
    this.ctx = null;
    this.currentMood = 'tavern_calm';
    this.isMuted = false;
    this.intensity = 2; // 1: Calm, 2: Travel, 3: Suspense, 4: Combat, 5: Boss Climax
    this.isPlaying = false;
    this.arpeggioTimer = null;
    this.drumTimer = null;
    this.droneTimer = null;
    this.currentScale = [];
    
    // Channel Gain Nodes
    this.masterGain = null;
    this.musicGain = null;
    this.ambienceGain = null;
    this.sfxGain = null;
    
    // Volume Levels (0.0 to 1.0)
    this.volumes = {
      master: 0.8,
      music: 0.7,
      ambience: 0.6,
      sfx: 0.85
    };

    // Active ambient loops
    this.activeAmbienceNodes = {};
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        
        // Master Bus
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volumes.master, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // Sub Buses
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.volumes.music, this.ctx.currentTime);
        this.musicGain.connect(this.masterGain);

        this.ambienceGain = this.ctx.createGain();
        this.ambienceGain.gain.setValueAtTime(this.volumes.ambience, this.ctx.currentTime);
        this.ambienceGain.connect(this.masterGain);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.volumes.sfx, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const targetGain = muted ? 0 : this.volumes.master;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
    }
    if (muted) {
      this.stopSequencer();
    } else if (this.isPlaying) {
      this.startSequencer();
    }
  }

  setVolume(channel, value) {
    const val = Math.max(0, Math.min(1, value));
    this.volumes[channel] = val;
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (channel === 'master' && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : val, now, 0.05);
    } else if (channel === 'music' && this.musicGain) {
      this.musicGain.gain.setTargetAtTime(val, now, 0.05);
    } else if (channel === 'ambience' && this.ambienceGain) {
      this.ambienceGain.gain.setTargetAtTime(val, now, 0.05);
    } else if (channel === 'sfx' && this.sfxGain) {
      this.sfxGain.gain.setTargetAtTime(val, now, 0.05);
    }
  }

  setIntensity(level) {
    this.intensity = Math.max(1, Math.min(5, Math.round(level)));
    if (this.isPlaying && !this.isMuted) {
      this.restartSequencers();
    }
  }

  // --- Instrument Synthesizers ---

  // Plucked Lute / Harp
  pluckNote(freq, time, duration = 1.2, volume = 0.09) {
    if (!this.ctx || this.isMuted) return;

    try {
      const osc = this.ctx.createOscillator();
      const oscHarmonic = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      oscHarmonic.type = 'triangle';
      oscHarmonic.frequency.setValueAtTime(freq * 2, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 3.8, time);
      filter.frequency.exponentialRampToValueAtTime(Math.max(70, freq * 0.7), time + duration);

      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(volume * (0.6 + this.intensity * 0.1), time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(filter);
      oscHarmonic.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      oscHarmonic.start(time);
      osc.stop(time + duration);
      oscHarmonic.stop(time + duration);
    } catch (e) {}
  }

  // Resonant Cello / Contrabass Drone
  playDroneNote(freq, time, duration = 3.5, volume = 0.05) {
    if (!this.ctx || this.isMuted) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320 + this.intensity * 80, time);

      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(volume * (0.5 + this.intensity * 0.15), time + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + duration);
    } catch (e) {}
  }

  // War Drum / Bodhrán Percussion Pulse
  playWarDrum(time, volume = 0.12, pitch = 85) {
    if (!this.ctx || this.isMuted) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, time);
      osc.frequency.exponentialRampToValueAtTime(30, time + 0.18);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, time);

      gain.gain.setValueAtTime(volume, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + 0.24);
    } catch (e) {}
  }

  // Ethereal Bell / Flute Shimmer
  playFluteBell(freq, time, duration = 1.8, volume = 0.06) {
    if (!this.ctx || this.isMuted) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.01, time + duration);

      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(volume, time + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + duration);
    } catch (e) {}
  }

  // --- Sequencer Core & Dynamic Scales ---

  restartSequencers() {
    this.stopSequencer();
    this.startSequencer();
  }

  startSequencer() {
    this.stopSequencer();
    if (this.isMuted || !this.ctx) return;

    // Mood Scales (Frequencies in Hz)
    const SCALES = {
      tavern_calm: [146.83, 174.61, 196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00], // D Dorian (Warm Folk)
      exploration_wonder: [130.81, 146.83, 164.81, 185.00, 196.00, 246.94, 261.63, 293.66, 329.63], // C Lydian (Mystic Wonder)
      dungeon_suspense: [110.00, 123.47, 130.81, 146.83, 155.56, 174.61, 220.00], // A Phrygian (Tense Dark)
      combat_clash: [110.00, 130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66], // Driving A Minor Pulse
      boss_epic: [98.00, 110.00, 116.54, 130.81, 146.83, 174.61, 196.00, 220.00] // G Minor / Dramatic March
    };

    this.currentScale = SCALES[this.currentMood] || SCALES.tavern_calm;

    // 1. Melody / Pluck Sequencer
    const playMelody = () => {
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;
      const noteIdx = Math.floor(Math.random() * this.currentScale.length);
      const freq = this.currentScale[noteIdx];

      if (this.currentMood === 'exploration_wonder') {
        this.playFluteBell(freq * 1.5, now, 1.8, 0.05);
      } else {
        this.pluckNote(freq, now, 1.2, 0.08);
      }

      // Intensity affects tempo & note density
      const speedFactor = Math.max(0.4, 1.3 - this.intensity * 0.18);
      const baseDelay = (this.currentMood.includes('combat') || this.currentMood.includes('boss')) ? 400 : 800;
      const nextDelay = (baseDelay + Math.random() * 300) * speedFactor;

      this.arpeggioTimer = setTimeout(playMelody, nextDelay);
    };

    // 2. Drone / Bass Sequencer (Active for Intensity >= 2)
    const playDrone = () => {
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;
      const rootFreq = this.currentScale[0] * 0.5;

      if (this.intensity >= 2) {
        this.playDroneNote(rootFreq, now, 4.0, 0.05 * (this.intensity * 0.3));
      }

      const droneInterval = (this.currentMood.includes('combat') ? 2200 : 3800) / (0.6 + this.intensity * 0.15);
      this.droneTimer = setTimeout(playDrone, droneInterval);
    };

    // 3. War Drum / Percussion Beat (Active for Intensity >= 3 or Combat moods)
    const playDrums = () => {
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;

      if (this.intensity >= 3 || this.currentMood.includes('combat') || this.currentMood.includes('boss')) {
        this.playWarDrum(now, 0.09 * (this.intensity * 0.25), 90);
        if (this.intensity >= 4) {
          this.playWarDrum(now + 0.18, 0.06, 75);
        }
      }

      const drumTempo = (this.currentMood.includes('boss') ? 500 : this.currentMood.includes('combat') ? 600 : 1000) / (0.7 + this.intensity * 0.1);
      this.drumTimer = setTimeout(playDrums, drumTempo);
    };

    playMelody();
    playDrone();
    playDrums();
  }

  stopSequencer() {
    if (this.arpeggioTimer) clearTimeout(this.arpeggioTimer);
    if (this.droneTimer) clearTimeout(this.droneTimer);
    if (this.drumTimer) clearTimeout(this.drumTimer);
    this.arpeggioTimer = null;
    this.droneTimer = null;
    this.drumTimer = null;
  }

  setMood(moodKey) {
    this.init();
    this.currentMood = moodKey;
    this.isPlaying = true;

    // Auto-align default intensity based on mood if not explicitly set
    if (moodKey === 'tavern_calm') this.intensity = 1;
    else if (moodKey === 'exploration_wonder') this.intensity = 2;
    else if (moodKey === 'dungeon_suspense') this.intensity = 3;
    else if (moodKey === 'combat_clash') this.intensity = 4;
    else if (moodKey === 'boss_epic') this.intensity = 5;

    if (!this.isMuted) {
      this.startSequencer();
    }
  }

  // --- Multi-Track Ambient Soundscapes ---

  startAmbienceTrack(type = 'hearth') {
    if (this.isMuted || !this.ctx) return;
    this.stopAmbienceTrack(type);

    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      if (type === 'hearth') {
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() > 0.993 ? (Math.random() * 2 - 1) * 0.28 : (Math.random() * 2 - 1) * 0.007;
        }
      } else if (type === 'rain_thunder') {
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.02;
        }
      } else if (type === 'cave_drips') {
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() > 0.998 ? (Math.random() * 2 - 1) * 0.35 : (Math.random() * 2 - 1) * 0.004;
        }
      } else {
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.015;
        }
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = type === 'hearth' ? 'bandpass' : type === 'cave_drips' ? 'lowpass' : 'bandpass';
      noiseFilter.frequency.setValueAtTime(type === 'hearth' ? 850 : type === 'cave_drips' ? 450 : 650, this.ctx.currentTime);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.018, this.ctx.currentTime);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ambienceGain);

      noiseSource.start();
      this.activeAmbienceNodes[type] = { noiseSource, noiseGain };
    } catch (e) {}
  }

  stopAmbienceTrack(type) {
    if (this.activeAmbienceNodes[type]) {
      try {
        this.activeAmbienceNodes[type].noiseSource.stop();
      } catch (e) {}
      delete this.activeAmbienceNodes[type];
    }
  }

  stopAllAmbience() {
    Object.keys(this.activeAmbienceNodes).forEach(type => this.stopAmbienceTrack(type));
  }

  // --- Pocket Bard Soundboard Stings ---

  triggerSting(stingKey) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    try {
      if (stingKey === 'spell_cast') {
        [440, 554.37, 659.25, 880, 1108.73].forEach((f, i) => {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + i * 0.05);
          osc.frequency.exponentialRampToValueAtTime(f * 1.5, now + i * 0.05 + 0.3);
          g.gain.setValueAtTime(0.08, now + i * 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.4);
          osc.connect(g);
          g.connect(this.sfxGain);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.45);
        });
      } else if (stingKey === 'sword_clash') {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(280, now + 0.15);
        g.gain.setValueAtTime(0.15, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (stingKey === 'stealth_whisper') {
        [523.25, 659.25, 783.99].forEach((f, i) => {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + i * 0.09);
          g.gain.setValueAtTime(0.06, now + i * 0.09);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.6);
          osc.connect(g);
          g.connect(this.sfxGain);
          osc.start(now + i * 0.09);
          osc.stop(now + i * 0.09 + 0.65);
        });
      } else if (stingKey === 'victory_fanfare') {
        const chords = [
          { f: 261.63, t: 0 },
          { f: 329.63, t: 0.12 },
          { f: 392.00, t: 0.24 },
          { f: 523.25, t: 0.38 },
          { f: 659.25, t: 0.52 }
        ];
        chords.forEach(({ f, t }) => {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + t);
          g.gain.setValueAtTime(0.12, now + t);
          g.gain.exponentialRampToValueAtTime(0.001, now + t + 0.65);
          osc.connect(g);
          g.connect(this.sfxGain);
          osc.start(now + t);
          osc.stop(now + t + 0.7);
        });
      }
    } catch (e) {}
  }

  stop() {
    this.stopSequencer();
    this.stopAllAmbience();
    this.isPlaying = false;
  }
}

export const musicEngine = new MusicEngine();
