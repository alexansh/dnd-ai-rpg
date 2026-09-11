import React, { useState } from 'react';
import { Sparkles, Scroll, MessageSquare, DoorOpen, Flame, Heart, Coins, Shield, User, X, Check, Coffee, PlusCircle, BookOpen, Compass } from 'lucide-react';
import HotspotTavernScene from '../components/HotspotTavernScene';
import CharacterSheet from '../components/CharacterSheet';
import CampaignGeneratorModal from '../components/CampaignGeneratorModal';
import CampaignSelectorModal from '../components/CampaignSelectorModal';
import VisualCompendiumModal from '../components/VisualCompendiumModal';
import { SAMPLE_QUESTS } from '../constants/sampleQuests';
import { useGame } from '../context/GameContext';
import { soundFx } from '../services/audio';

export default function TavernHubScreen() {
  const {
    character,
    setCharacter,
    companions,
    customQuests,
    addCustomCampaign,
    activeCampaign,
    launchCampaign,
    completedQuests,
    launchQuest,
    saveGame,
    setCurrentScreen
  } = useGame();

  const [activeModal, setActiveModal] = useState(null); // 'barnaby' | 'stranger' | 'questBoard' | 'campaignSelector' | 'restNotice' | 'campaignGenerator' | 'compendium' | null
  const [selectedTagFilter, setSelectedTagFilter] = useState('All');

  const allQuests = [...customQuests, ...SAMPLE_QUESTS];
  const tags = ['All', 'Bounty', 'Exploration', 'Dungeon Crawl', 'Mystery', 'Boss Raid'];

  const filteredQuests = selectedTagFilter === 'All'
    ? allQuests
    : allQuests.filter(q => (q.tag || '').toLowerCase().includes(selectedTagFilter.toLowerCase()));

  const handleRest = () => {
    soundFx.playClick();
    if (!character) return;
    const restored = { ...character, hp: character.maxHp };
    setCharacter(restored);
    saveGame(restored);
    soundFx.playSuccess(false);
    setActiveModal('restNotice');
  };

  const handleBuyPotion = () => {
    if (!character || character.gold < 20) return;
    soundFx.playClick();
    soundFx.playSuccess(false);
    const updated = {
      ...character,
      gold: character.gold - 20,
      inventory: [...character.inventory, 'Minor Healing Potion']
    };
    setCharacter(updated);
    saveGame(updated);
  };

  const handleOpenDialogue = (type) => {
    setActiveModal(type);
  };

  return (
    <div className="min-h-screen p-3 sm:p-6 candle-glow-bg flex flex-col justify-between">
      <div className="max-w-7xl mx-auto w-full space-y-4">
        {/* Top Tavern Header & HUD */}
        <div className="flex items-center justify-between bg-tavern-wood/90 border border-tavern-amber/50 rounded-xl px-4 py-3 shadow-candle">
          <div className="flex items-center gap-2 sm:gap-3">
            <Flame className="w-5 h-5 text-tavern-glow animate-flicker" />
            <div>
              <h2 className="font-cinzel font-bold text-base sm:text-lg text-tavern-glow">The Wayward Flagon</h2>
              <p className="text-[11px] text-tavern-parchment/70 font-sans hidden sm:block">Sanctuary of Adventurers, Bards & Sellswords</p>
            </div>
          </div>

          {/* Quick HUD */}
          <div className="flex items-center gap-3 sm:gap-5 text-xs font-cinzel">
            <div className="flex items-center gap-1.5 text-tavern-gold font-bold">
              <Coins className="w-4 h-4 text-tavern-glow" />
              <span>{character?.gold || 0}g</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-400 font-bold">
              <Heart className="w-4 h-4 text-red-400 fill-red-400" />
              <span>{character?.hp}/{character?.maxHp} HP</span>
            </div>
            <button
              onClick={() => { soundFx.playClick(); setCurrentScreen('title'); }}
              className="text-[11px] px-2.5 py-1 rounded bg-tavern-umber/80 hover:bg-tavern-umber text-tavern-gold border border-tavern-amber/40 transition-colors"
            >
              Main Menu
            </button>
          </div>
        </div>

        {/* Main Tavern Layout: Scene + Character Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Main Interactive Tavern Scene View */}
          <div className="lg:col-span-8 space-y-3">
            <HotspotTavernScene
              onSelectQuest={() => handleOpenDialogue('questBoard')}
              onOpenDialogue={handleOpenDialogue}
              onRest={handleRest}
              onOpenCompendium={() => handleOpenDialogue('compendium')}
            />

            {/* Hub Quick Action Bar below scene */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleOpenDialogue('campaignSelector')}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-tavern-amber/90 via-tavern-gold/90 to-tavern-glow/90 hover:brightness-110 border border-tavern-gold text-stone-950 font-cinzel font-bold text-xs flex items-center justify-center gap-2 shadow-candle hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Compass className="w-4 h-4 text-stone-950" />
                <span>Campaign Sagas</span>
              </button>
              <button
                onClick={() => handleOpenDialogue('questBoard')}
                className="py-2.5 px-3 rounded-xl bg-tavern-wood hover:bg-tavern-umber border border-tavern-gold/50 text-tavern-glow font-cinzel font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Scroll className="w-4 h-4 text-tavern-gold" />
                <span>Notice Board</span>
              </button>
              <button
                onClick={() => handleOpenDialogue('compendium')}
                className="py-2.5 px-3 rounded-xl bg-tavern-wood hover:bg-tavern-umber border border-tavern-gold/50 text-tavern-glow font-cinzel font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:scale-[1.02] active:scale-95 transition-all"
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Lore & Bestiary</span>
              </button>
              <button
                onClick={handleRest}
                className="py-2.5 px-3 rounded-xl bg-tavern-wood hover:bg-tavern-umber border border-tavern-gold/50 text-tavern-glow font-cinzel font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Rest at Hearth</span>
              </button>
            </div>
          </div>

          {/* Right Column: Persistent Character Sheet Panel */}
          <div className="lg:col-span-4">
            <CharacterSheet />
          </div>
        </div>
      </div>

      {/* ================= MODAL DIALOGUES ================= */}

      {/* 1. Quest Notice Board Modal */}
      {activeModal === 'questBoard' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-3xl bg-tavern-wood border-2 border-tavern-gold rounded-2xl p-6 shadow-candle-lg text-tavern-parchment relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => { soundFx.playClick(); setActiveModal(null); }}
              className="absolute top-4 right-4 text-tavern-gold hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tavern-umber border border-tavern-amber text-xs font-cinzel text-tavern-gold uppercase mb-1">
                <Scroll className="w-3.5 h-3.5 text-tavern-glow" />
                <span>Bounties & Expeditions</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-cinzel font-bold text-tavern-glow">The Tavern Notice Board</h3>
              <p className="text-xs text-tavern-parchment/70 mt-1 font-sans">
                Select a contract or forge a dynamic AI campaign with your companions
              </p>
            </div>

            {/* Campaign Generator Trigger Bar & Tag Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-tavern-amber/30">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                {tags.map(t => (
                  <button
                    key={t}
                    onClick={() => { soundFx.playClick(); setSelectedTagFilter(t); }}
                    className={`text-[11px] font-cinzel px-2.5 py-1 rounded-full border transition-all ${
                      selectedTagFilter === t
                        ? 'bg-tavern-gold text-tavern-darkest font-bold border-tavern-glow shadow-sm'
                        : 'bg-tavern-darkest/70 text-tavern-parchment/70 border-tavern-amber/30 hover:border-tavern-gold/60'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <button
                onClick={() => { soundFx.playClick(); setActiveModal('campaignGenerator'); }}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-tavern-amber via-tavern-gold to-tavern-glow text-tavern-darkest font-cinzel font-bold text-xs shadow-candle hover:brightness-110 active:scale-95 flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Forge Custom Campaign</span>
              </button>
            </div>

            {/* Quests Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredQuests.map((quest) => {
                const isCompleted = completedQuests.includes(quest.id);
                return (
                  <div
                    key={quest.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                      isCompleted
                        ? 'bg-tavern-darkest/60 border-emerald-800/40 opacity-75'
                        : 'bg-tavern-darkest/90 border-tavern-amber/60 hover:border-tavern-gold shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-cinzel font-bold px-2 py-0.5 rounded bg-tavern-umber text-tavern-gold border border-tavern-amber/40">
                          {quest.tag} • {quest.difficulty}
                        </span>
                        {isCompleted && (
                          <span className="text-[10px] font-cinzel text-emerald-400 flex items-center gap-1 font-bold">
                            <Check className="w-3.5 h-3.5" /> Completed
                          </span>
                        )}
                      </div>
                      <h4 className="font-cinzel font-bold text-sm text-tavern-glow">{quest.title}</h4>
                      <p className="text-xs text-tavern-parchment/80 font-sans mt-1 leading-relaxed">
                        {quest.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-tavern-amber/30 flex items-center justify-between">
                      <div className="text-[11px] font-mono text-tavern-gold font-bold">
                        Reward: {quest.rewardGold}g {quest.rewardItem ? `+ ${quest.rewardItem}` : ''}
                      </div>
                      <button
                        onClick={() => launchQuest(quest)}
                        className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-tavern-amber to-tavern-gold text-tavern-darkest font-cinzel font-bold text-xs shadow-sm hover:brightness-110 active:scale-95 flex items-center gap-1 transition-all"
                      >
                        <DoorOpen className="w-3.5 h-3.5" />
                        <span>{isCompleted ? 'Revisit' : 'Embark'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Campaign Selector Modal */}
      {activeModal === 'campaignSelector' && (
        <CampaignSelectorModal
          isOpen={true}
          currentCampaignId={activeCampaign?.id}
          onSelectCampaign={(campaign) => {
            setActiveModal(null);
            launchCampaign(campaign);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* 2. Custom Campaign Generator Modal */}
      {activeModal === 'campaignGenerator' && (
        <CampaignGeneratorModal
          player={character}
          companions={companions}
          onCampaignCreated={(camp) => {
            addCustomCampaign(camp);
            setActiveModal('questBoard');
          }}
          onClose={() => setActiveModal('questBoard')}
        />
      )}

      {/* 3. Barkeep Barnaby Dialogue Modal */}
      {activeModal === 'barnaby' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-tavern-wood border-2 border-tavern-gold rounded-2xl p-6 shadow-candle-lg text-tavern-parchment relative">
            <button
              onClick={() => { soundFx.playClick(); setActiveModal(null); }}
              className="absolute top-4 right-4 text-tavern-gold hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-tavern-amber/40">
              <div className="w-12 h-12 rounded-full bg-tavern-amber/30 border-2 border-tavern-gold flex items-center justify-center">
                <Coffee className="w-6 h-6 text-tavern-glow" />
              </div>
              <div>
                <h3 className="font-cinzel font-bold text-lg text-tavern-glow">Barkeep Barnaby</h3>
                <p className="text-xs text-tavern-gold font-sans">Proprietor of The Wayward Flagon</p>
              </div>
            </div>

            <div className="py-4 space-y-3 font-sans text-sm text-tavern-parchment/90 leading-relaxed">
              <p className="italic">
                "Welcome to the hearth, friend! Pull up a bench with your party and have a warm mug of spiced cider. Looking for work? The Notice Board across the room is always pinned with bounties from all across the realm."
              </p>
            </div>

            {/* Barkeep Options */}
            <div className="space-y-2 pt-2 border-t border-tavern-amber/30">
              <button
                onClick={handleBuyPotion}
                disabled={character?.gold < 20}
                className="w-full p-2.5 rounded-lg bg-tavern-darkest/80 hover:bg-tavern-umber border border-tavern-amber/40 text-left text-xs text-tavern-gold font-cinzel font-bold flex items-center justify-between disabled:opacity-40 transition-colors"
              >
                <span>Purchase Minor Healing Potion (+10 HP)</span>
                <span className="font-mono text-tavern-glow">20 Gold</span>
              </button>
              <button
                onClick={() => { setActiveModal(null); handleOpenDialogue('questBoard'); }}
                className="w-full p-2.5 rounded-lg bg-tavern-darkest/80 hover:bg-tavern-umber border border-tavern-amber/40 text-left text-xs text-tavern-gold font-cinzel font-bold flex items-center justify-between transition-colors"
              >
                <span>"Point me toward the biggest bounty in town."</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Mysterious Stranger Modal */}
      {activeModal === 'stranger' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-tavern-wood border-2 border-tavern-gold rounded-2xl p-6 shadow-candle-lg text-tavern-parchment relative">
            <button
              onClick={() => { soundFx.playClick(); setActiveModal(null); }}
              className="absolute top-4 right-4 text-tavern-gold hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-tavern-amber/40">
              <div className="w-12 h-12 rounded-full bg-tavern-darkest border-2 border-tavern-gold/60 flex items-center justify-center">
                <User className="w-6 h-6 text-tavern-gold" />
              </div>
              <div>
                <h3 className="font-cinzel font-bold text-lg text-tavern-glow">The Hooded Patron</h3>
                <p className="text-xs text-tavern-gold/70 font-sans">Sitting in the dimly-lit alcove</p>
              </div>
            </div>

            <div className="py-4 space-y-3 font-sans text-sm text-tavern-parchment/90 leading-relaxed">
              <p className="italic">
                "Keep your voice low, wanderer. In the crypts and dragon calderas, don't trust the braziers that burn without heat. Coordinate your strikes with your allies, and remember: failing a check is just the start of the real story."
              </p>
            </div>

            <div className="pt-2 border-t border-tavern-amber/30">
              <button
                onClick={() => { setActiveModal(null); handleOpenDialogue('questBoard'); }}
                className="w-full py-2.5 rounded-lg bg-tavern-gold text-tavern-darkest font-cinzel font-bold text-xs hover:bg-tavern-glow transition-all"
              >
                "I'll heed your warning." (Go to Quests)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Rest Notification */}
      {activeModal === 'restNotice' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-tavern-wood border-2 border-tavern-gold rounded-xl p-5 text-center shadow-candle">
            <Flame className="w-8 h-8 text-tavern-glow mx-auto mb-2 animate-flicker" />
            <h4 className="font-cinzel font-bold text-base text-tavern-glow">Party Well Rested!</h4>
            <p className="text-xs text-tavern-parchment/80 font-sans mt-1">
              You and your companions sit by the glowing hearth fire. Your vitality and health have been fully restored to {character?.maxHp} HP.
            </p>
            <button
              onClick={() => setActiveModal(null)}
              className="mt-4 px-6 py-2 rounded-lg bg-tavern-gold text-tavern-darkest font-cinzel font-bold text-xs hover:bg-tavern-glow transition-all"
            >
              Back to Common Room
            </button>
          </div>
        </div>
      )}

      {/* 6. Visual Compendium & Bestiary Modal */}
      {activeModal === 'compendium' && (
        <VisualCompendiumModal onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}
