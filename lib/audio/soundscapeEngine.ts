"use client";

export type AmbianceType = "tavern_warm" | "crypt_solemn" | "dungeon_creepy" | "battle_tense";

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentAmbiance: AmbianceType = "tavern_warm";
  private activeNodes: { stop: () => void }[] = [];
  private isMuted: boolean = true;
  private volume: number = 0.5;
  private beatInterval: NodeJS.Timeout | null = null;
  private dripInterval: NodeJS.Timeout | null = null;

  constructor() {
    // AudioContext will be initialized upon user gesture
  }

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const targetGain = muted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
    }
    if (!muted) {
      this.getContext();
      this.applyAmbiance(this.currentAmbiance);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (!this.isMuted && this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setAmbiance(ambiance: AmbianceType): void {
    if (this.currentAmbiance === ambiance && this.activeNodes.length > 0) return;
    this.currentAmbiance = ambiance;
    if (!this.isMuted) {
      this.applyAmbiance(ambiance);
    }
  }

  private clearActiveNodes(): void {
    if (this.beatInterval) {
      clearInterval(this.beatInterval);
      this.beatInterval = null;
    }
    if (this.dripInterval) {
      clearInterval(this.dripInterval);
      this.dripInterval = null;
    }
    for (const node of this.activeNodes) {
      try {
        node.stop();
      } catch {}
    }
    this.activeNodes = [];
  }

  private applyAmbiance(ambiance: AmbianceType): void {
    const ctx = this.getContext();
    this.clearActiveNodes();

    const crossfadeGain = ctx.createGain();
    crossfadeGain.gain.setValueAtTime(0, ctx.currentTime);
    crossfadeGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.2);
    crossfadeGain.connect(this.masterGain!);

    switch (ambiance) {
      case "tavern_warm":
        this.synthTavern(ctx, crossfadeGain);
        break;
      case "crypt_solemn":
        this.synthCrypt(ctx, crossfadeGain);
        break;
      case "dungeon_creepy":
        this.synthDungeon(ctx, crossfadeGain);
        break;
      case "battle_tense":
        this.synthBattle(ctx, crossfadeGain);
        break;
    }
  }

  // --- 1. TAVERN WARM: Fireplace crackle + cozy warm drone ---
  private synthTavern(ctx: AudioContext, dest: AudioNode): void {
    // Warm sub-pad drone (F2 + C3)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const droneGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(87.31, ctx.currentTime); // F2
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(130.81, ctx.currentTime); // C3

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(320, ctx.currentTime);

    droneGain.gain.setValueAtTime(0.12, ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(dest);

    osc1.start();
    osc2.start();

    // Fireplace crackle buffer
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // random micro-pops for wood crackle
      output[i] = Math.random() > 0.995 ? white * 0.8 : white * 0.03;
    }

    const crackle = ctx.createBufferSource();
    crackle.buffer = noiseBuffer;
    crackle.loop = true;

    const crackleFilter = ctx.createBiquadFilter();
    crackleFilter.type = "bandpass";
    crackleFilter.frequency.setValueAtTime(1200, ctx.currentTime);
    crackleFilter.Q.setValueAtTime(1.5, ctx.currentTime);

    const crackleGain = ctx.createGain();
    crackleGain.gain.setValueAtTime(0.18, ctx.currentTime);

    crackle.connect(crackleFilter);
    crackleFilter.connect(crackleGain);
    crackleGain.connect(dest);
    crackle.start();

    this.activeNodes.push(
      { stop: () => { osc1.stop(); osc2.stop(); } },
      { stop: () => crackle.stop() }
    );
  }

  // --- 2. CRYPT SOLEMN: Sub-bass D minor + eerie choir overtone ---
  private synthCrypt(ctx: AudioContext, dest: AudioNode): void {
    const oscRoot = ctx.createOscillator();
    const oscMinor = ctx.createOscillator();
    const subGain = ctx.createGain();
    const lpf = ctx.createBiquadFilter();

    oscRoot.type = "sawtooth";
    oscRoot.frequency.setValueAtTime(73.42, ctx.currentTime); // D2
    oscMinor.type = "sine";
    oscMinor.frequency.setValueAtTime(87.31, ctx.currentTime); // F2

    lpf.type = "lowpass";
    lpf.frequency.setValueAtTime(180, ctx.currentTime);

    subGain.gain.setValueAtTime(0.18, ctx.currentTime);

    oscRoot.connect(lpf);
    oscMinor.connect(lpf);
    lpf.connect(subGain);
    subGain.connect(dest);

    oscRoot.start();
    oscMinor.start();

    // Eerie high resonant overtone with slow LFO
    const highOsc = ctx.createOscillator();
    const highGain = ctx.createGain();
    const highFilter = ctx.createBiquadFilter();

    highOsc.type = "sine";
    highOsc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    highFilter.type = "bandpass";
    highFilter.frequency.setValueAtTime(600, ctx.currentTime);
    highFilter.Q.setValueAtTime(8, ctx.currentTime);

    highGain.gain.setValueAtTime(0.04, ctx.currentTime);

    highOsc.connect(highFilter);
    highFilter.connect(highGain);
    highGain.connect(dest);
    highOsc.start();

    this.activeNodes.push(
      { stop: () => { oscRoot.stop(); oscMinor.stop(); } },
      { stop: () => highOsc.stop() }
    );
  }

  // --- 3. DUNGEON CREEPY: Howling wind draft + periodic water droplets ---
  private synthDungeon(ctx: AudioContext, dest: AudioNode): void {
    // Pink noise wind draft
    const bufferSize = ctx.sampleRate * 3;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2) * 0.12;
    }

    const wind = ctx.createBufferSource();
    wind.buffer = noiseBuffer;
    wind.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = "bandpass";
    windFilter.frequency.setValueAtTime(350, ctx.currentTime);
    windFilter.Q.setValueAtTime(3.0, ctx.currentTime);

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.2, ctx.currentTime);

    wind.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(dest);
    wind.start();

    // Water droplets interval
    this.dripInterval = setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      this.playWaterDrip(this.ctx, dest);
    }, 4500);

    this.activeNodes.push(
      { stop: () => wind.stop() }
    );
  }

  private playWaterDrip(ctx: AudioContext, dest: AudioNode): void {
    try {
      const dripOsc = ctx.createOscillator();
      const dripGain = ctx.createGain();

      const startFreq = 800 + Math.random() * 400;
      dripOsc.type = "sine";
      dripOsc.frequency.setValueAtTime(startFreq, ctx.currentTime);
      dripOsc.frequency.exponentialRampToValueAtTime(startFreq * 1.8, ctx.currentTime + 0.08);

      dripGain.gain.setValueAtTime(0.08, ctx.currentTime);
      dripGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      dripOsc.connect(dripGain);
      dripGain.connect(dest);

      dripOsc.start(ctx.currentTime);
      dripOsc.stop(ctx.currentTime + 0.13);
    } catch {}
  }

  // --- 4. BATTLE TENSE: 110 BPM rhythmic war drum heartbeat + driving pulse ---
  private synthBattle(ctx: AudioContext, dest: AudioNode): void {
    // Tense saw pulse
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(55.0, ctx.currentTime); // A1
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(140, ctx.currentTime);

    gain.gain.setValueAtTime(0.14, ctx.currentTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    osc.start();

    // War drum hits every 545ms (~110 BPM)
    let beatStep = 0;
    this.beatInterval = setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      const isAccent = beatStep % 2 === 0;
      this.playWarDrum(this.ctx, dest, isAccent);
      beatStep = (beatStep + 1) % 4;
    }, 545);

    this.activeNodes.push(
      { stop: () => osc.stop() }
    );
  }

  private playWarDrum(ctx: AudioContext, dest: AudioNode, isAccent: boolean): void {
    try {
      const drumOsc = ctx.createOscillator();
      const drumGain = ctx.createGain();

      const pitch = isAccent ? 95 : 75;
      drumOsc.type = "sine";
      drumOsc.frequency.setValueAtTime(pitch, ctx.currentTime);
      drumOsc.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + 0.18);

      const hitGain = isAccent ? 0.35 : 0.22;
      drumGain.gain.setValueAtTime(hitGain, ctx.currentTime);
      drumGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      drumOsc.connect(drumGain);
      drumGain.connect(dest);

      drumOsc.start(ctx.currentTime);
      drumOsc.stop(ctx.currentTime + 0.26);
    } catch {}
  }
}

// Global browser instance
let soundscapeInstance: SoundscapeEngine | null = null;

export function getSoundscapeEngine(): SoundscapeEngine {
  if (typeof window === "undefined") {
    return new SoundscapeEngine();
  }
  if (!soundscapeInstance) {
    soundscapeInstance = new SoundscapeEngine();
  }
  return soundscapeInstance;
}
