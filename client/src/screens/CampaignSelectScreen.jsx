import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Compass } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { soundFx } from '../services/audio';
import { SAMPLE_QUESTS } from '../constants/sampleQuests';
import CampaignCard from '../components/CampaignCard';
import ConfirmModal from '../components/ConfirmModal';
import EmberParticles from '../components/EmberParticles';

const getArchetypeFallback = (cls) => {
  const c = (cls || '').toLowerCase();
  if (c.includes('bard')) return '/assets/images/archetypes/bard.jpg';
  if (c.includes('cleric') || c.includes('paladin')) return '/assets/images/archetypes/cleric.jpg';
  if (c.includes('mage') || c.includes('wizard') || c.includes('sorcerer') || c.includes('warlock')) return '/assets/images/archetypes/mage.jpg';
  if (c.includes('ranger') || c.includes('druid')) return '/assets/images/archetypes/ranger.jpg';
  if (c.includes('rogue') || c.includes('thief') || c.includes('monk')) return '/assets/images/archetypes/rogue.jpg';
  return '/assets/images/archetypes/warrior.jpg';
};

export default function CampaignSelectScreen() {
  const { pendingCharacter, createNewSlot, setCurrentScreen } = useGame();
  const [showAbandonModal, setShowAbandonModal] = useState(false);

  const hero = pendingCharacter || {
    name: 'Valiant Hero',
    class: 'Warrior',
    race: 'Human',
    portraitUrl: null
  };

  const portraitSrc = hero.portraitUrl || getArchetypeFallback(hero.class);

  const handleSelectCampaign = (campaign) => {
    createNewSlot(hero, campaign);
  };

  const handleBackToCreation = () => {
    soundFx.playClick();
    setShowAbandonModal(true);
  };

  const handleConfirmAbandon = () => {
    setShowAbandonModal(false);
    setCurrentScreen('create');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between p-4 sm:p-8 bg-[#0a0704] text-tavern-parchment overflow-y-auto select-none">
      {/* Background Layers */}
      <div className="absolute inset-0 bg-radial-gradient from-tavern-amber/15 via-tavern-darkest/95 to-[#0a0704] pointer-events-none" />
      <EmberParticles count={8} />

      {/* Top Header Section */}
      <div className="relative z-10 max-w-4xl mx-auto w-full mb-6">
        <div className="flex items-center justify-between pb-4">
          <button
            onClick={handleBackToCreation}
            className="flex items-center gap-2 text-xs font-cinzel font-bold text-tavern-gold/80 hover:text-tavern-glow transition-colors px-3 py-1.5 rounded-lg bg-black/40 border border-tavern-gold/20 hover:border-tavern-gold/50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Modify Hero</span>
          </button>

          {/* Pending Hero Mini Badge */}
          <div className="flex items-center gap-2.5 bg-black/60 border border-tavern-gold/30 rounded-full px-3 py-1 backdrop-blur-md">
            <img
              src={portraitSrc}
              alt={hero.name}
              className="w-7 h-7 rounded-full object-cover border border-tavern-gold/50"
            />
            <div className="text-left">
              <div className="text-xs font-cinzel font-bold text-tavern-glow leading-none">
                {hero.name}
              </div>
              <div className="text-[10px] text-tavern-gold/70 font-sans leading-none mt-0.5">
                {hero.race} {hero.class}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center space-y-2 pt-2">
          <h2 className="text-3xl sm:text-4xl font-cinzel font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-tavern-glow via-tavern-gold to-tavern-amber">
            Choose Your Destiny
          </h2>
          <p className="text-xs sm:text-sm font-sans text-tavern-parchment/70 max-w-md mx-auto">
            Select the chronicle where <span className="text-tavern-glow font-cinzel">{hero.name}</span> will carve their legacy
          </p>
          <div className="w-40 mx-auto gradient-divider mt-4" />
        </div>
      </div>

      {/* Campaign Cards Grid */}
      <div className="relative z-10 max-w-4xl mx-auto w-full flex-1">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8"
        >
          {SAMPLE_QUESTS.map((campaign, idx) => (
            <motion.div key={campaign.id} variants={cardVariants} custom={idx}>
              <CampaignCard
                campaign={campaign}
                onSelect={handleSelectCampaign}
              />
            </motion.div>
          ))}

          {/* The Arcane Architect card at the end */}
          <motion.div variants={cardVariants} custom={SAMPLE_QUESTS.length}>
            <CampaignCard isCustomArchitect={true} />
          </motion.div>
        </motion.div>
      </div>

      {/* Confirmation modal if returning to creation */}
      <ConfirmModal
        isOpen={showAbandonModal}
        title="Return to Hero Forge?"
        message="Your forged hero will be preserved, but you will re-enter the creation forge to adjust stats and appearance."
        confirmText="Return to Forge"
        cancelText="Stay Here"
        isDestructive={false}
        onConfirm={handleConfirmAbandon}
        onCancel={() => setShowAbandonModal(false)}
      />
    </div>
  );
}
