/**
 * AI DM Voice Narration Engine (Web Speech API)
 * Zero-cost, low-latency text-to-speech for Dungeon Master narration beats.
 * Features pitch/rate tuning, voice selection heuristics (deep fantasy tones),
 * and speech queue lifecycle management.
 */

class VoiceEngine {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.selectedVoice = null;
    this.isEnabled = false; // Enabled by default only when user toggles
    this.pitch = 0.92;
    this.rate = 0.95;
    this.volume = 0.9;
    this.isSpeaking = false;
    this.currentUtterance = null;
    this.onHighlightCallback = null;

    if (this.synth) {
      this.initVoices();
      if (typeof window !== 'undefined' && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return;

    // Preference: English (UK/US/IE) natural / male deep voices for classic DM feel
    const preferred = voices.find(v => 
      (v.name.includes('Natural') || v.name.includes('George') || v.name.includes('Oliver') || v.name.includes('UK') || v.name.includes('Arthur')) &&
      v.lang.startsWith('en')
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

    this.selectedVoice = preferred;
  }

  setEnabled(enabled) {
    this.isEnabled = Boolean(enabled);
    if (!this.isEnabled) {
      this.stop();
    }
  }

  getEnabled() {
    return this.isEnabled;
  }

  speak(text, onBoundary = null, onEnd = null) {
    if (!this.synth || !this.isEnabled || !text) return;

    this.stop();

    // Strip markdown formatting before sending to speech synth
    const cleanText = text
      .replace(/[#*_`~[\]()]/g, ' ')
      .replace(/>/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.pitch = this.pitch;
    utterance.rate = this.rate;
    utterance.volume = this.volume;

    utterance.onstart = () => {
      this.isSpeaking = true;
    };

    utterance.onboundary = (event) => {
      if (onBoundary) onBoundary(event);
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
  }

  pause() {
    if (this.synth && this.isSpeaking) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth) {
      this.synth.resume();
    }
  }
}

export const voiceEngine = new VoiceEngine();
