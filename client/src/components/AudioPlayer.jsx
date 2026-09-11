import React, { useState } from 'react';
import { Volume2, VolumeX, Music, Sliders, ChevronDown, ChevronUp, Sparkles, Swords, Shield, Eye, Flame, CloudRain, Mountain, Wind } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { soundFx, musicEngine } from '../services/audio';

export default function AudioPlayer() {
  const { isAudioMuted, toggleAudio } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const [activeMood, setActiveMood] = useState('tavern_calm');
  const [intensity, setIntensity] = useState(2);
  const [volumes, setVolumes] = useState({
    master: 80,
    music: 70,
    ambience: 60,
    sfx: 85
  });
  const [activeAmbience, setActiveAmbience] = useState({
    hearth: true,
    rain_thunder: false,
    cave_drips: false,
    wind: false
  });

  const handleMoodChange = (moodKey) => {
    soundFx.playClick();
    setActiveMood(moodKey);
    soundFx.setMood(moodKey);
    // sync intensity default
    const map = { tavern_calm: 1, exploration_wonder: 2, dungeon_suspense: 3, combat_clash: 4, boss_epic: 5 };
    setIntensity(map[moodKey] || 2);
  };

  const handleIntensityChange = (val) => {
    setIntensity(val);
    soundFx.setIntensity(val);
  };

  const handleVolumeChange = (channel, val) => {
    setVolumes(prev => ({ ...prev, [channel]: val }));
    soundFx.setVolume(channel, val / 100);
  };

  const handleToggleAmbience = (type) => {
    soundFx.playClick();
    const nextState = !activeAmbience[type];
    setActiveAmbience(prev => ({ ...prev, [type]: nextState }));
    if (nextState) {
      soundFx.startAmbience(type);
    } else {
      soundFx.stopAmbience(type);
    }
  };

  const handleSting = (stingKey) => {
    soundFx.triggerSting(stingKey);
  };

  const moodLabels = {
    tavern_calm: { label: 'Tavern & Hearth', color: 'from-amber-500 to-orange-600', icon: '🍺' },
    exploration_wonder: { label: 'Feywild & Trail', color: 'from-emerald-500 to-teal-600', icon: '🌲' },
    dungeon_suspense: { label: 'Crypt & Darkness', color: 'from-purple-600 to-indigo-800', icon: '🕯️' },
    combat_clash: { label: 'Skirmish Combat', color: 'from-red-600 to-orange-700', icon: '⚔️' },
    boss_epic: { label: 'Boss Encounter', color: 'from-yellow-500 to-red-800', icon: '🐉' }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end">
      {/* Mini Badge Bar */}
      <div className="flex items-center gap-2 bg-stone-950/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-tavern-amber/60 shadow-candle transition-all">
        <button
          onClick={() => { soundFx.playClick(); setIsOpen(!isOpen); }}
          className="flex items-center gap-2 text-xs text-tavern-gold font-cinzel hover:text-tavern-glow focus:outline-none"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{moodLabels[activeMood]?.icon || '🎵'}</span>
            <div className="flex flex-col text-left">
              <span className="font-bold text-[11px] tracking-wider text-tavern-glow uppercase flex items-center gap-1">
                Pocket Bard
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-tavern-amber/30 text-tavern-gold border border-tavern-gold/40">
                  Tier {intensity}
                </span>
              </span>
              <span className="text-[10px] text-tavern-parchment/70 leading-tight">
                {moodLabels[activeMood]?.label}
              </span>
            </div>
          </div>
          {/* Animated EQ Bars */}
          {!isAudioMuted && (
            <div className="flex items-end gap-0.5 h-3 ml-1">
              <span className="w-0.5 h-3 bg-tavern-glow animate-pulse rounded-full" />
              <span className="w-0.5 h-2 bg-tavern-gold animate-bounce rounded-full" style={{ animationDelay: '0.15s' }} />
              <span className="w-0.5 h-3.5 bg-tavern-amber animate-pulse rounded-full" style={{ animationDelay: '0.3s' }} />
            </div>
          )}
          {isOpen ? <ChevronUp className="w-3.5 h-3.5 ml-1 text-tavern-gold" /> : <ChevronDown className="w-3.5 h-3.5 ml-1 text-tavern-gold" />}
        </button>

        <div className="h-4 w-px bg-tavern-amber/40 mx-0.5" />

        <button
          onClick={toggleAudio}
          title={isAudioMuted ? 'Unmute All Audio' : 'Mute All Audio'}
          className="p-1 rounded-full text-tavern-gold hover:text-tavern-glow hover:bg-tavern-umber/60 transition-colors focus:outline-none"
          aria-label="Toggle audio"
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4 text-stone-500" /> : <Volume2 className="w-4 h-4 text-tavern-glow animate-pulse" />}
        </button>
      </div>

      {/* Expanded Pocket Bard Panel */}
      {isOpen && (
        <div className="mt-2 w-80 sm:w-96 bg-stone-950/98 border-2 border-tavern-gold/60 rounded-2xl shadow-2xl p-4 backdrop-blur-xl animate-scale-in text-tavern-parchment space-y-4">
          <div className="flex items-center justify-between border-b border-tavern-amber/30 pb-2.5">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-tavern-glow" />
              <h3 className="font-cinzel font-bold text-sm text-tavern-glow">Pocket Bard Sound Studio</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-tavern-gold/70 hover:text-tavern-gold px-2 py-0.5 rounded bg-tavern-umber/40"
            >
              Close
            </button>
          </div>

          {/* 1. Dynamic Intensity Dial (1 to 5) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-cinzel">
              <span className="text-tavern-gold font-bold">Soundtrack Intensity</span>
              <span className="text-tavern-glow font-bold">Level {intensity} / 5</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {[
                { val: 1, label: 'I. Calm' },
                { val: 2, label: 'II. Travel' },
                { val: 3, label: 'III. Suspense' },
                { val: 4, label: 'IV. Combat' },
                { val: 5, label: 'V. Climax' }
              ].map(tier => (
                <button
                  key={tier.val}
                  onClick={() => handleIntensityChange(tier.val)}
                  className={`py-1.5 px-1 rounded text-[10px] font-cinzel font-bold text-center transition-all ${
                    intensity === tier.val
                      ? 'bg-gradient-to-r from-tavern-amber to-tavern-glow text-stone-950 shadow-candle scale-105'
                      : 'bg-stone-900/90 text-tavern-parchment/60 hover:text-tavern-parchment hover:bg-stone-800'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Scene / Mood Preset selector */}
          <div className="space-y-1.5">
            <span className="text-xs font-cinzel text-tavern-gold font-bold">Atmospheric Preset</span>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(moodLabels).map(([key, data]) => (
                <button
                  key={key}
                  onClick={() => handleMoodChange(key)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-cinzel text-left flex items-center gap-2 border transition-all ${
                    activeMood === key
                      ? 'bg-tavern-umber/80 border-tavern-glow text-tavern-glow shadow-sm'
                      : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-tavern-amber/50'
                  }`}
                >
                  <span>{data.icon}</span>
                  <span className="truncate">{data.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Layered Soundscape Ambiance Toggles */}
          <div className="space-y-1.5">
            <span className="text-xs font-cinzel text-tavern-gold font-bold">Layered Soundscapes</span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                onClick={() => handleToggleAmbience('hearth')}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all ${
                  activeAmbience.hearth
                    ? 'bg-amber-950/60 border-amber-500/80 text-amber-200'
                    : 'bg-stone-900/60 border-stone-800 text-stone-400'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>Hearth Crackle</span>
              </button>

              <button
                onClick={() => handleToggleAmbience('rain_thunder')}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all ${
                  activeAmbience.rain_thunder
                    ? 'bg-blue-950/60 border-blue-500/80 text-blue-200'
                    : 'bg-stone-900/60 border-stone-800 text-stone-400'
                }`}
              >
                <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                <span>Rain & Storm</span>
              </button>

              <button
                onClick={() => handleToggleAmbience('cave_drips')}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all ${
                  activeAmbience.cave_drips
                    ? 'bg-purple-950/60 border-purple-500/80 text-purple-200'
                    : 'bg-stone-900/60 border-stone-800 text-stone-400'
                }`}
              >
                <Mountain className="w-3.5 h-3.5 text-purple-400" />
                <span>Cave Drips</span>
              </button>

              <button
                onClick={() => handleToggleAmbience('wind')}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all ${
                  activeAmbience.wind
                    ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200'
                    : 'bg-stone-900/60 border-stone-800 text-stone-400'
                }`}
              >
                <Wind className="w-3.5 h-3.5 text-emerald-400" />
                <span>Forest Breeze</span>
              </button>
            </div>
          </div>

          {/* 4. Instant SFX Soundboard */}
          <div className="space-y-1.5">
            <span className="text-xs font-cinzel text-tavern-gold font-bold">Instant Soundboard Stings</span>
            <div className="grid grid-cols-4 gap-1 text-[11px]">
              <button
                onClick={() => handleSting('sword_clash')}
                className="p-2 rounded bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-red-500/60 flex flex-col items-center gap-1 active:scale-95 transition-all text-red-300"
                title="Sword Clash Sting"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Strike</span>
              </button>

              <button
                onClick={() => handleSting('spell_cast')}
                className="p-2 rounded bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-cyan-500/60 flex flex-col items-center gap-1 active:scale-95 transition-all text-cyan-300"
                title="Spellcast Whoosh"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Spell</span>
              </button>

              <button
                onClick={() => handleSting('stealth_whisper')}
                className="p-2 rounded bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-purple-500/60 flex flex-col items-center gap-1 active:scale-95 transition-all text-purple-300"
                title="Stealth / Mystery Chime"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Stealth</span>
              </button>

              <button
                onClick={() => handleSting('victory_fanfare')}
                className="p-2 rounded bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/60 flex flex-col items-center gap-1 active:scale-95 transition-all text-amber-300"
                title="Victory Fanfare"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Triumph</span>
              </button>
            </div>
          </div>

          {/* 5. AI Voice Narration (TTS) Toggle */}
          <div className="border-t border-tavern-amber/20 pt-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-tavern-glow" />
              <div>
                <span className="font-cinzel font-bold text-tavern-gold block">AI Voice Narration</span>
                <span className="text-[10px] text-stone-400">Web Speech TTS</span>
              </div>
            </div>
            <button
              onClick={() => { soundFx.playClick(); toggleVoiceNarration(); }}
              className={`px-3 py-1 rounded-lg text-xs font-cinzel font-bold border transition-all ${
                isVoiceEnabled
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-stone-950 border-emerald-400 shadow-sm'
                  : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
              }`}
            >
              {isVoiceEnabled ? 'Voice: Active' : 'Voice: Muted'}
            </button>
          </div>

          {/* 6. Volume Sliders */}
          <div className="space-y-2 border-t border-tavern-amber/20 pt-2.5 text-[11px]">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between text-tavern-parchment/80">
                  <span>Music Vol</span>
                  <span>{volumes.music}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volumes.music}
                  onChange={(e) => handleVolumeChange('music', Number(e.target.value))}
                  className="w-full accent-tavern-glow h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-tavern-parchment/80">
                  <span>Ambiance Vol</span>
                  <span>{volumes.ambience}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volumes.ambience}
                  onChange={(e) => handleVolumeChange('ambience', Number(e.target.value))}
                  className="w-full accent-tavern-glow h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

