import React, { useState } from 'react';
import {
  Flame,
  Scroll,
  UserCheck,
  MessageCircle,
  DoorOpen,
  Sparkles,
  Heart,
  BookOpen,
  Beer,
  Coins
} from 'lucide-react';
import { FANTASY_SCENERY, FANTASY_NPCS } from '../constants/fantasyAssets';
import { soundFx } from '../services/audio';

export default function HotspotTavernScene({ onSelectQuest, onOpenDialogue, onRest, onOpenCompendium }) {
  const [activeHover, setActiveHover] = useState(null);
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8; // ±4px
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
    setParallaxOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setParallaxOffset({ x: 0, y: 0 });
    setActiveHover(null);
  };

  const hotspots = [
    {
      id: 'barkeep',
      title: 'Barkeep Barnaby',
      subtitle: 'Pour an ale, hear rumors & buy potions',
      icon: Beer,
      avatarUrl: FANTASY_NPCS[0].imageUrl,
      top: '42%',
      left: '26%',
      action: () => onOpenDialogue('barnaby'),
      badge: 'Talk with Barkeep',
      color: 'border-tavern-glow'
    },
    {
      id: 'quest-board',
      title: 'The Notice Board',
      subtitle: 'Inspect bounties & launch adventures',
      icon: Scroll,
      top: '30%',
      left: '74%',
      action: () => onOpenDialogue('questBoard'),
      badge: 'View Quests',
      color: 'border-tavern-gold'
    },
    {
      id: 'hooded-stranger',
      title: 'Mysterious Stranger',
      subtitle: 'Whispers from the shadows of the corner',
      icon: UserCheck,
      avatarUrl: FANTASY_NPCS[1].imageUrl,
      top: '64%',
      left: '16%',
      action: () => onOpenDialogue('stranger'),
      badge: 'Approach Stranger',
      color: 'border-purple-400'
    },
    {
      id: 'hearth',
      title: 'The Blazing Hearth',
      subtitle: 'Rest by the fire to restore full HP',
      icon: Flame,
      top: '52%',
      left: '50%',
      action: () => onRest(),
      badge: 'Rest & Heal HP',
      color: 'border-amber-500'
    },
    {
      id: 'codex',
      title: 'Tome of Lore & Bestiary',
      subtitle: 'Inspect fantasy monsters, items & realms',
      icon: BookOpen,
      top: '68%',
      left: '42%',
      action: () => (onOpenCompendium ? onOpenCompendium() : onOpenDialogue('compendium')),
      badge: 'Open Codex',
      color: 'border-emerald-400'
    },
    {
      id: 'doorway',
      title: 'Heavy Oak Doorway',
      subtitle: 'Embark into the dangerous wilds',
      icon: DoorOpen,
      top: '38%',
      left: '88%',
      action: () => onOpenDialogue('questBoard'),
      badge: 'Embark on Adventure',
      color: 'border-tavern-glow'
    }
  ];

  const handleSpotClick = (spot) => {
    soundFx.playClick();
    spot.action();
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full aspect-[16/9] max-h-[560px] rounded-2xl overflow-hidden border-2 border-tavern-gold/60 shadow-candle-lg select-none bg-tavern-darkest group"
    >
      {/* High-Resolution Illustrated Tavern Canvas Image */}
      <img
        src={FANTASY_SCENERY.tavern.imageUrl}
        alt="The Wayward Flagon Interior"
        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 ease-out scale-105"
        style={{
          transform: `scale(1.05) translate3d(${parallaxOffset.x * 0.4}px, ${parallaxOffset.y * 0.4}px, 0)`
        }}
      />

      {/* Atmospheric Firelight & Shadow Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-tavern-darkest/90 via-tavern-darkest/40 to-black/30 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-gradient from-tavern-amber/20 via-transparent to-black/60 pointer-events-none" />

      {/* Floating Ember Particle Motes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 rounded-full bg-tavern-glow animate-float opacity-80" />
        <div
          className="absolute bottom-1/4 left-1/3 w-2 h-2 rounded-full bg-tavern-amber animate-pulse opacity-70"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute bottom-1/2 left-2/3 w-1.5 h-1.5 rounded-full bg-tavern-gold animate-float opacity-75"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-1 h-1 rounded-full bg-tavern-glow animate-pulse opacity-60"
          style={{ animationDelay: '1.5s' }}
        />
      </div>

      {/* Interactive Visual Hotspot Tokens */}
      {hotspots.map((spot) => {
        const Icon = spot.icon;
        const isHovered = activeHover === spot.id;

        return (
          <div
            key={spot.id}
            style={{
              top: spot.top,
              left: spot.left,
              transform: `translate3d(calc(-50% + ${parallaxOffset.x}px), calc(-50% + ${parallaxOffset.y}px), 0)`
            }}
            className="absolute z-20 transition-transform duration-200 ease-out"
          >
            {/* Tooltip on Hover */}
            <div
              className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3.5 py-2 rounded-xl bg-tavern-darkest/95 border border-tavern-gold text-center pointer-events-none transition-all duration-300 shadow-candle whitespace-nowrap z-30 ${
                isHovered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
              }`}
            >
              <div className="text-xs font-cinzel font-bold text-tavern-glow flex items-center gap-1.5 justify-center">
                <Icon className="w-3.5 h-3.5 text-tavern-gold" />
                <span>{spot.title}</span>
              </div>
              <div className="text-[10px] text-tavern-parchment/80 font-sans mt-0.5">{spot.subtitle}</div>
              <div className="text-[9px] font-mono text-tavern-gold font-bold mt-1 uppercase tracking-wide">
                [{spot.badge}]
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-tavern-gold" />
            </div>

            {/* Glowing Interactive Button */}
            <button
              onClick={() => handleSpotClick(spot)}
              onMouseEnter={() => setActiveHover(spot.id)}
              onMouseLeave={() => setActiveHover(null)}
              onFocus={() => setActiveHover(spot.id)}
              onBlur={() => setActiveHover(null)}
              aria-label={spot.title}
              className={`relative p-2.5 sm:p-3 rounded-2xl bg-tavern-darkest/90 text-tavern-gold border-2 ${spot.color} hover:border-white shadow-candle hover:shadow-candle-lg hover:scale-115 active:scale-95 transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-tavern-glow group/btn backdrop-blur-xs`}
            >
              <span className="absolute -inset-1 rounded-2xl bg-tavern-glow/30 animate-ping pointer-events-none" />
              {spot.avatarUrl ? (
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl overflow-hidden border border-tavern-gold/60">
                  <img src={spot.avatarUrl} alt={spot.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-tavern-glow group-hover/btn:text-white" />
              )}
            </button>
          </div>
        );
      })}

      {/* Bottom Scene Legend HUD */}
      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between px-4 py-2 rounded-xl bg-tavern-darkest/85 backdrop-blur-md border border-tavern-amber/40 text-xs font-cinzel text-tavern-gold z-10 shadow-candle">
        <span className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-tavern-glow animate-flicker" />
          <span className="font-bold">The Wayward Flagon — Common Room</span>
        </span>
        <span className="text-[11px] text-tavern-parchment/70 font-sans hidden sm:inline">
          Tap any glowing patron, notice board, or codex on the canvas to interact
        </span>
      </div>
    </div>
  );
}
