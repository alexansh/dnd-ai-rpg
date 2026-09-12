import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Plus, Shield } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { soundFx } from '../services/audio';
import CharacterSlotCard from '../components/CharacterSlotCard';
import EmptySlotCard from '../components/EmptySlotCard';
import ConfirmModal from '../components/ConfirmModal';
import EmberParticles from '../components/EmberParticles';

export default function CharacterSelectScreen() {
  const {
    getAllSlots,
    loadSlot,
    deleteSlot,
    setCurrentScreen,
    startNewGame
  } = useGame();

  const [slotToDelete, setSlotToDelete] = useState(null);

  const slots = getAllSlots();
  const maxSlots = 5;
  const showEmptyCard = slots.length < maxSlots;

  const handleSelectSlot = async (slotId) => {
    await loadSlot(slotId);
  };

  const handleCreateNew = () => {
    soundFx.playClick();
    startNewGame();
  };

  const handleDeleteConfirm = () => {
    if (slotToDelete) {
      deleteSlot(slotToDelete);
      setSlotToDelete(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
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

      {/* Top Header */}
      <div className="relative z-10 max-w-5xl mx-auto w-full mb-8">
        <div className="flex items-center justify-between pb-4">
          <button
            onClick={() => {
              soundFx.playClick();
              setCurrentScreen('title');
            }}
            className="flex items-center gap-2 text-xs font-cinzel font-bold text-tavern-gold/80 hover:text-tavern-glow transition-colors px-3 py-1.5 rounded-lg bg-black/40 border border-tavern-gold/20 hover:border-tavern-gold/50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Title Screen</span>
          </button>

          <span className="text-xs font-cinzel tracking-widest text-tavern-gold/60 uppercase">
            {slots.length} / {maxSlots} Chronicles
          </span>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-cinzel font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-tavern-glow via-tavern-gold to-tavern-amber">
            Choose Your Fate
          </h2>
          <p className="text-xs sm:text-sm font-sans text-tavern-parchment/70 max-w-md mx-auto">
            Select an adventurer to continue their journey, or forge a new soul for the hearth
          </p>
          <div className="w-40 mx-auto gradient-divider mt-4" />
        </div>
      </div>

      {/* Main Content: Character Slot Grid or Empty State */}
      <div className="relative z-10 max-w-5xl mx-auto w-full flex-1 flex flex-col justify-center">
        {slots.length === 0 ? (
          /* Empty State: No Characters Yet */
          <div className="text-center py-16 px-6 max-w-md mx-auto space-y-6 rounded-3xl bg-black/40 border border-tavern-gold/25 backdrop-blur-xl shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-tavern-wood/80 border-2 border-tavern-gold/40 mx-auto flex items-center justify-center text-tavern-gold shadow-[0_0_30px_rgba(212,165,116,0.2)]">
              <Shield className="w-10 h-10 text-tavern-glow" />
            </div>
            <div className="space-y-2">
              <h3 className="font-cinzel font-bold text-2xl text-tavern-glow">
                No Heroes Yet Walk These Halls
              </h3>
              <p className="text-xs sm:text-sm text-tavern-parchment/70 font-sans leading-relaxed">
                The Wayward Flagon stands quiet. Step into the Hero Forge, awaken your first adventurer, and let the dice tell your tale.
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-tavern-amber via-tavern-gold to-tavern-glow text-tavern-darkest font-cinzel font-bold text-sm tracking-wider shadow-candle hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2.5"
            >
              <Sparkles className="w-4 h-4 text-tavern-darkest" />
              <span>Forge Your First Hero</span>
            </button>
          </div>
        ) : (
          /* Character Cards Grid */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {slots.map((slot, index) => (
              <motion.div key={slot.slotId} variants={cardVariants} custom={index}>
                <CharacterSlotCard
                  slot={slot}
                  onSelect={handleSelectSlot}
                  onDelete={(id) => setSlotToDelete(id)}
                />
              </motion.div>
            ))}

            {showEmptyCard && (
              <motion.div variants={cardVariants} custom={slots.length}>
                <EmptySlotCard onClick={handleCreateNew} />
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Bottom Footer Note */}
      <div className="relative z-10 text-center text-[11px] text-tavern-parchment/40 font-sans pt-8">
        Each hero maintains an independent world, inventory, quest progress, and companion party.
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(slotToDelete)}
        title="Abandon Hero Forever?"
        message="This character and all their campaign chronicles, items, and companion bonds will be extinguished. This cannot be undone."
        confirmText="Abandon Hero"
        cancelText="Keep Hero"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setSlotToDelete(null)}
      />
    </div>
  );
}
