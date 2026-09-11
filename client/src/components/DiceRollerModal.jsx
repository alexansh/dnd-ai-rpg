import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, Sparkles, AlertCircle, CheckCircle2, XCircle, Flame } from 'lucide-react';
import { soundFx } from '../services/audio';
import { getStatModifier } from '../constants/archetypes';

export default function DiceRollerModal({ check, character, tacticalBonus, onRollComplete, onCancel }) {
  const [isRolling, setIsRolling] = useState(false);
  const [d20Result, setD20Result] = useState(null);
  const [hasRolled, setHasRolled] = useState(false);

  const ability = check?.ability || 'STR';
  const dc = check?.dc || 12;
  const reason = check?.reason || 'Skill Check';

  const charScore = character?.stats?.[ability] || 10;
  const modNum = Math.floor((charScore - 10) / 2);
  const modStr = getStatModifier(charScore);
  const bonusNum = tacticalBonus ? (tacticalBonus.bonus || 0) : 0;

  const totalScore = d20Result !== null ? d20Result + modNum + bonusNum : null;
  const isSuccess = totalScore !== null ? totalScore >= dc : false;
  const isCritSuccess = d20Result === 20;
  const isCritFail = d20Result === 1;

  // 12 particles radiating outward on Crit 20
  const particles = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const distance = 80 + Math.random() * 30;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      size: 4 + Math.random() * 6,
      delay: i * 0.03
    };
  });

  const handleRoll = () => {
    if (isRolling) return;
    setIsRolling(true);
    soundFx.playDiceRoll();

    let iterations = 0;
    const interval = setInterval(() => {
      setD20Result(Math.floor(Math.random() * 20) + 1);
      iterations++;
      if (iterations > 14) {
        clearInterval(interval);
        const finalD20 = Math.floor(Math.random() * 20) + 1;
        setD20Result(finalD20);
        setIsRolling(false);
        setHasRolled(true);

        const total = finalD20 + modNum;
        if (finalD20 === 20 || total >= dc) {
          soundFx.playSuccess(finalD20 === 20);
        } else {
          soundFx.playFailure();
        }
      }
    }, 80);
  };

  const handleConfirm = () => {
    soundFx.playClick();
    onRollComplete({
      ability,
      d20: d20Result,
      mod: modNum,
      total: totalScore,
      dc,
      isSuccess,
      isCritSuccess,
      isCritFail
    });
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-all duration-300 ${
      hasRolled && isCritFail ? 'screen-red-flash' : ''
    }`}>
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 25 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-tavern-wood border-2 border-tavern-gold rounded-2xl p-6 shadow-candle-lg text-tavern-parchment relative overflow-hidden"
      >
        {/* Glow background accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-tavern-glow/15 blur-2xl pointer-events-none rounded-full" />

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tavern-umber/80 border border-tavern-amber text-xs font-cinzel text-tavern-gold uppercase tracking-wider mb-2">
            <Dices className="w-3.5 h-3.5" />
            <span>Tabletop Ability Check</span>
          </div>
          <h3 className="text-xl font-cinzel font-bold text-tavern-glow">{reason}</h3>
          <p className="text-xs text-tavern-parchment/70 mt-1">
            Target Difficulty: <span className="text-tavern-gold font-bold">DC {dc}</span> ({ability} Check)
          </p>
        </div>

        {/* Tumbling D20 Die Display with Shake Animation */}
        <div className="flex flex-col items-center justify-center my-6 relative">
          {/* Critical 20 Golden Particle Burst */}
          {hasRolled && isCritSuccess && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {particles.map((p, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [1, 1, 0],
                    scale: [0, 1.4, 0.6],
                    x: p.x,
                    y: p.y
                  }}
                  transition={{ duration: 0.9, delay: p.delay, ease: 'easeOut' }}
                  style={{ width: p.size, height: p.size }}
                  className="absolute rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-tavern-glow shadow-[0_0_12px_#fde047]"
                />
              ))}
            </div>
          )}

          <div
            className={`relative w-28 h-28 flex items-center justify-center rounded-2xl border-2 transition-all duration-300 ${
              isRolling
                ? 'animate-dice-shake border-tavern-glow shadow-candle bg-tavern-amber/30 scale-105'
                : hasRolled
                ? isSuccess
                  ? 'border-emerald-500 bg-emerald-950/40 shadow-[0_0_25px_rgba(16,185,129,0.35)]'
                  : 'border-tavern-crimson bg-red-950/40 shadow-[0_0_25px_rgba(220,38,38,0.35)]'
                : 'border-tavern-gold/60 bg-tavern-darkest/70 hover:border-tavern-gold'
            }`}
          >
            {/* D20 Polygon SVG Background */}
            <svg className="absolute inset-0 w-full h-full p-2 opacity-30 pointer-events-none" viewBox="0 0 100 100">
              <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="none" stroke="#d4a574" strokeWidth="2" />
              <polygon points="50,5 50,95" fill="none" stroke="#d4a574" strokeWidth="1" />
              <polygon points="5,25 95,75" fill="none" stroke="#d4a574" strokeWidth="1" />
              <polygon points="5,75 95,25" fill="none" stroke="#d4a574" strokeWidth="1" />
            </svg>

            <span className={`text-4xl font-cinzel font-black tracking-tighter ${
              hasRolled
                ? isCritSuccess
                  ? 'text-yellow-300 drop-shadow-[0_0_12px_rgba(253,224,71,0.8)] animate-pulse'
                  : isCritFail
                  ? 'text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse'
                  : isSuccess
                  ? 'text-emerald-400'
                  : 'text-red-400'
                : 'text-tavern-gold'
            }`}>
              {d20Result !== null ? d20Result : '?'}
            </span>
          </div>

          {/* Math Breakdown */}
          {hasRolled && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center"
            >
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-sm font-mono text-tavern-parchment/90">
                <span className="text-tavern-gold font-bold">{d20Result} (D20)</span>
                <span>+</span>
                <span className="text-tavern-glow font-bold">{modStr} ({ability})</span>
                {bonusNum > 0 && (
                  <>
                    <span>+</span>
                    <span className="text-amber-300 font-bold">+{bonusNum} ({tacticalBonus.companionName.split(' ')[0]}'s {tacticalBonus.skillName})</span>
                  </>
                )}
                <span>=</span>
                <span className="text-lg font-cinzel font-black text-tavern-parchment underline decoration-tavern-gold">
                  {totalScore}
                </span>
                <span className="text-xs text-tavern-parchment/60 font-sans">vs DC {dc}</span>
              </div>

              {/* Outcome Badge */}
              <div className="mt-2 flex items-center justify-center gap-1.5 font-cinzel text-sm font-bold">
                {isCritSuccess ? (
                  <span className="text-yellow-300 flex items-center gap-1">
                    <Sparkles className="w-4 h-4" /> Natural 20! Critical Triumph!
                  </span>
                ) : isCritFail ? (
                  <span className="text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Natural 1! Critical Fumble!
                  </span>
                ) : isSuccess ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Success! (DC {dc} Beaten)
                  </span>
                ) : (
                  <span className="text-red-400 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> Check Failed (Needed {dc})
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-tavern-amber/40">
          {!hasRolled ? (
            <button
              onClick={handleRoll}
              disabled={isRolling}
              className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-tavern-amber via-tavern-gold to-tavern-glow text-tavern-darkest font-cinzel font-bold text-base shadow-candle hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Dices className="w-5 h-5" />
              <span>{isRolling ? 'Tumbling the Dice...' : 'Roll the D20'}</span>
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              className="w-full py-3 px-6 rounded-lg bg-tavern-gold text-tavern-darkest font-cinzel font-bold text-base shadow-candle hover:bg-tavern-glow active:scale-95 transition-all"
            >
              Continue Narration →
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
