import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from './context/GameContext';
import AudioPlayer from './components/AudioPlayer';
import TitleScreen from './screens/TitleScreen';
import CharacterSelectScreen from './screens/CharacterSelectScreen';
import CharacterCreationScreen from './screens/CharacterCreationScreen';
import CampaignSelectScreen from './screens/CampaignSelectScreen';
import WorldSelectionScreen from './screens/WorldSelectionScreen';
import TavernHubScreen from './screens/TavernHubScreen';
import AdventureScreen from './screens/AdventureScreen';
import { checkServerHealth } from './services/api';

export default function App() {
  const { currentScreen, setServerStatus } = useGame();

  useEffect(() => {
    checkServerHealth().then(status => {
      setServerStatus(status);
      console.log('⚔️ [The Wayward Flagon] Server status:', status);
    });
  }, []);

  const screenVariants = {
    initial: { opacity: 0, y: 15, scale: 0.99 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.25 } }
  };

  return (
    <div className="min-h-screen bg-[#0a0704] text-tavern-parchment font-body relative select-none overflow-x-hidden">
      {/* Global Ambient Tavern Audio & SFX Controller */}
      <AudioPlayer />

      {/* Screen Router with Animated Crossfades */}
      <AnimatePresence mode="wait">
        {currentScreen === 'title' && (
          <motion.div
            key="title"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <TitleScreen />
          </motion.div>
        )}
        {currentScreen === 'character_select' && (
          <motion.div
            key="character_select"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <CharacterSelectScreen />
          </motion.div>
        )}
        {currentScreen === 'create' && (
          <motion.div
            key="create"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <CharacterCreationScreen />
          </motion.div>
        )}
        {currentScreen === 'campaign_select' && (
          <motion.div
            key="campaign_select"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <CampaignSelectScreen />
          </motion.div>
        )}
        {currentScreen === 'world_select' && (
          <motion.div
            key="world_select"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <WorldSelectionScreen />
          </motion.div>
        )}
        {currentScreen === 'tavern' && (
          <motion.div
            key="tavern"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <TavernHubScreen />
          </motion.div>
        )}
        {currentScreen === 'adventure' && (
          <motion.div
            key="adventure"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <AdventureScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
