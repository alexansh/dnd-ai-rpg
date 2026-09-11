import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  X,
  Sparkles,
  Search,
  Shield,
  Sword,
  User,
  Skull,
  Compass,
  Zap,
  Tag,
  RefreshCw,
  Flame,
  CheckCircle2
} from 'lucide-react';
import {
  FANTASY_SCENERY,
  FANTASY_NPCS,
  FANTASY_ITEMS,
  FANTASY_ENEMIES,
  FANTASY_WILDLIFE
} from '../constants/fantasyAssets';
import { soundFx } from '../services/audio';

// Resilient Image Component with 3-tier fallback and skeleton loader
function CompendiumImage({ src, fallbackSrc, alt, category, className = '', isLarge = false }) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (currentSrc !== fallbackSrc && fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setHasError(true);
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Enemies':
        return Skull;
      case 'Items':
        return Shield;
      case 'NPCs':
        return User;
      case 'Wildlife':
        return Zap;
      case 'Scenery':
      default:
        return Compass;
    }
  };

  const IconComponent = getCategoryIcon(category);

  return (
    <div className={`relative w-full h-full bg-tavern-darkest flex items-center justify-center overflow-hidden ${className}`}>
      {!hasError && (
        <img
          src={currentSrc}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={handleError}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          loading="lazy"
        />
      )}

      {/* Loading Skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-tavern-darkest/90 text-tavern-gold/70 p-2 text-center animate-pulse">
          <Sparkles className="w-5 h-5 text-tavern-glow animate-spin mb-1" />
          <span className="text-[10px] font-cinzel">Painting Lore...</span>
        </div>
      )}

      {/* Styled SVG Fallback Card if network offline/fails */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-tavern-umber to-tavern-darkest p-3 text-center border border-tavern-amber/40">
          <IconComponent className={`${isLarge ? 'w-12 h-12 mb-2' : 'w-7 h-7 mb-1'} text-tavern-glow animate-pulse`} />
          <span className="text-xs font-cinzel font-bold text-tavern-glow truncate max-w-full px-1">{alt}</span>
          <span className="text-[9px] font-mono text-tavern-gold/70 uppercase tracking-widest">{category}</span>
        </div>
      )}
    </div>
  );
}

export default function VisualCompendiumModal({ onClose }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const categories = [
    { id: 'All', label: 'All Lore & Art', icon: BookOpen },
    { id: 'Scenery', label: 'Scenery & Realms', icon: Compass },
    { id: 'NPCs', label: 'Tavern NPCs & Patrons', icon: User },
    { id: 'Items', label: 'Items & Relics', icon: Shield },
    { id: 'Enemies', label: 'Enemies & Bosses', icon: Skull },
    { id: 'Wildlife', label: 'Wildlife & Beasts', icon: Zap }
  ];

  // Aggregate all assets
  const allAssets = [
    ...Object.values(FANTASY_SCENERY).map((s) => ({ ...s, category: 'Scenery', name: s.title })),
    ...FANTASY_NPCS.map((n) => ({ ...n, category: 'NPCs' })),
    ...FANTASY_ITEMS.map((i) => ({ ...i, category: 'Items' })),
    ...FANTASY_ENEMIES.map((e) => ({ ...e, category: 'Enemies' })),
    ...FANTASY_WILDLIFE.map((w) => ({ ...w, category: 'Wildlife' }))
  ];

  const filteredAssets = allAssets.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      (item.name || item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.role || item.type || item.cr || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const activeDisplay = selectedItem || filteredAssets[0];

  const handleSelect = (item) => {
    soundFx.playClick();
    setSelectedItem(item);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl bg-tavern-wood border-2 border-tavern-gold rounded-2xl shadow-candle-lg text-tavern-parchment relative max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-tavern-amber/40 bg-tavern-darkest/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-tavern-umber border border-tavern-gold shadow-candle">
              <BookOpen className="w-6 h-6 text-tavern-glow animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-cinzel font-bold text-tavern-glow">
                The Wayward Codex & Bestiary
              </h3>
              <p className="text-xs text-tavern-parchment/70 font-sans">
                Curated visual compendium of realms, items, monsters, wildlife, and characters
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-tavern-darkest hover:bg-tavern-umber text-tavern-gold hover:text-white border border-tavern-amber/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Navigation & Search */}
        <div className="p-3 sm:p-4 border-b border-tavern-amber/30 bg-tavern-darkest/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-cinzel text-xs flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-gradient-to-r from-tavern-amber to-tavern-gold text-tavern-darkest font-bold shadow-candle'
                      : 'bg-tavern-darkest/80 text-tavern-parchment/80 border border-tavern-amber/30 hover:border-tavern-gold/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-tavern-gold/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lore, items, beasts..."
              className="w-full pl-8 pr-3 py-1.5 bg-tavern-darkest/90 border border-tavern-amber/50 rounded-lg text-xs text-tavern-parchment focus:border-tavern-glow focus:outline-none"
            />
          </div>
        </div>

        {/* Content Body: Split View (List + Detail Card) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Grid: Thumbnails */}
          <div className="md:col-span-7 p-4 overflow-y-auto space-y-3 max-h-[55vh] md:max-h-none border-r border-tavern-amber/20">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredAssets.map((asset) => {
                const isSelected = activeDisplay?.id === asset.id;

                return (
                  <div
                    key={asset.id}
                    onClick={() => handleSelect(asset)}
                    className={`group cursor-pointer rounded-xl overflow-hidden border-2 transition-all flex flex-col bg-tavern-darkest/90 ${
                      isSelected
                        ? 'border-tavern-glow shadow-candle ring-1 ring-tavern-gold scale-[1.02]'
                        : 'border-tavern-amber/30 hover:border-tavern-gold/70 opacity-90 hover:opacity-100'
                    }`}
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-black/40">
                      <CompendiumImage
                        src={asset.imageUrl}
                        fallbackSrc={asset.fallbackUrl}
                        alt={asset.name || asset.title}
                        category={asset.category}
                        className="group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-tavern-darkest/85 border border-tavern-amber/40 text-[9px] font-cinzel font-bold text-tavern-gold pointer-events-none z-10">
                        {asset.category}
                      </span>
                    </div>
                    <div className="p-2">
                      <h4 className="font-cinzel font-bold text-xs text-tavern-glow truncate">
                        {asset.name || asset.title}
                      </h4>
                      <p className="text-[10px] text-tavern-parchment/60 font-sans truncate">
                        {asset.role || asset.type || asset.cr || asset.category}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Inspection Feature Card */}
          <div className="md:col-span-5 p-5 bg-tavern-darkest/60 flex flex-col justify-between overflow-y-auto">
            {activeDisplay ? (
              <div className="space-y-4">
                <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border-2 border-tavern-gold shadow-parchment bg-black/50">
                  <CompendiumImage
                    key={activeDisplay.id}
                    src={activeDisplay.imageUrl}
                    fallbackSrc={activeDisplay.fallbackUrl}
                    alt={activeDisplay.name || activeDisplay.title}
                    category={activeDisplay.category}
                    isLarge={true}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-tavern-darkest via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="text-[10px] font-cinzel font-bold px-2 py-0.5 rounded bg-tavern-amber text-tavern-darkest shadow-sm">
                      {activeDisplay.category}
                    </span>
                    {(activeDisplay.cr || activeDisplay.type || activeDisplay.role) && (
                      <span className="text-[10px] font-mono font-bold text-tavern-gold px-2 py-0.5 rounded bg-tavern-darkest/90 border border-tavern-gold/40">
                        {activeDisplay.cr || activeDisplay.type || activeDisplay.role}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-cinzel font-bold text-tavern-glow">
                    {activeDisplay.name || activeDisplay.title}
                  </h3>
                  <div className="w-12 h-0.5 bg-tavern-gold/60" />
                  <p className="text-xs text-tavern-parchment/90 font-sans leading-relaxed">
                    {activeDisplay.description}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-tavern-wood/80 border border-tavern-amber/40 text-[11px] font-sans text-tavern-parchment/80 space-y-1">
                  <div className="font-cinzel font-bold text-tavern-gold text-xs uppercase">
                    Tavern Master Lore Notes
                  </div>
                  <div>
                    This asset can be summoned dynamically by the AI Dungeon Master during quests, combat encounters,
                    and tavern dialogues.
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-tavern-gold/60">
                <BookOpen className="w-10 h-10 mb-2 animate-pulse" />
                <p className="text-xs font-cinzel">Select an entry from the codex to inspect details</p>
              </div>
            )}

            <div className="pt-4 border-t border-tavern-amber/20 flex justify-end">
              <button
                onClick={() => {
                  soundFx.playClick();
                  onClose();
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-tavern-amber via-tavern-gold to-tavern-glow text-tavern-darkest font-cinzel font-bold text-xs hover:brightness-110 shadow-candle transition-all"
              >
                Close Codex
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
