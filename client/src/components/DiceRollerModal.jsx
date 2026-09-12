import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, Sparkles, CheckCircle2, XCircle, Flame, Shield, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { soundFx } from '../services/audio';
import { getStatModifier } from '../constants/archetypes';
import { rollAuthoritativeDice } from '../services/api';

export default function DiceRollerModal({ check, character, tacticalBonus, onRollComplete, onCancel }) {
  const [rollMode, setRollMode] = useState('normal'); // 'normal' | 'advantage' | 'disadvantage'
  const [isRolling, setIsRolling] = useState(false);
  const [d20ResultA, setD20ResultA] = useState(null);
  const [d20ResultB, setD20ResultB] = useState(null);
  const [hasRolled, setHasRolled] = useState(false);

  const ability = check?.ability || 'STR';
  const dc = check?.dc || 12;
  const reason = check?.reason || 'Skill Check';

  const charScore = character?.stats?.[ability] || 10;
  const modNum = Math.floor((charScore - 10) / 2);
  const bonusNum = tacticalBonus ? (tacticalBonus.bonus || 0) : 0;

  // Selected final die based on Advantage / Disadvantage
  const effectiveD20 = (() => {
    if (d20ResultA === null) return null;
    if (rollMode === 'normal') return d20ResultA;
    if (rollMode === 'advantage') return Math.max(d20ResultA, d20ResultB || d20ResultA);
    if (rollMode === 'disadvantage') return Math.min(d20ResultA, d20ResultB || d20ResultA);
    return d20ResultA;
  })();

  const totalScore = effectiveD20 !== null ? effectiveD20 + modNum + bonusNum : null;
  const isSuccess = totalScore !== null ? totalScore >= dc : false;
  const isCritSuccess = effectiveD20 === 20;
  const isCritFail = effectiveD20 === 1;

  // 20 particles radiating outward on Crit 20
  const particles = Array.from({ length: 20 }).map((_, i) => {
    const angle = (i / 20) * Math.PI * 2;
    const distance = 90 + Math.random() * 40;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      size: 4 + Math.random() * 6,
      delay: i * 0.02
    };
  });

  const handleRoll = async () => {
    if (isRolling) return;
    setIsRolling(true);
    soundFx.playDiceRoll();

    let notation = '1d20';
    if (rollMode === 'advantage') notation = '2d20kh1';
    if (rollMode === 'disadvantage') notation = '2d20kl1';

    // Request authoritative roll from server
    const serverRollPromise = rollAuthoritativeDice(notation, { modifier: modNum + bonusNum });

    let iterations = 0;
    const interval = setInterval(async () => {
      setD20ResultA(Math.floor(Math.random() * 20) + 1);
      if (rollMode !== 'normal') {
        setD20ResultB(Math.floor(Math.random() * 20) + 1);
      }
      iterations++;
      if (iterations > 12) {
        clearInterval(interval);
        try {
          const serverResult = await serverRollPromise;
          const finalA = serverResult.rolls?.[0] || Math.floor(Math.random() * 20) + 1;
          const finalB = serverResult.rolls?.[1] || Math.floor(Math.random() * 20) + 1;
          setD20ResultA(finalA);
          setD20ResultB(finalB);
          setIsRolling(false);
          setHasRolled(true);

          const chosen = rollMode === 'advantage' ? Math.max(finalA, finalB) : rollMode === 'disadvantage' ? Math.min(finalA, finalB) : finalA;
          const total = chosen + modNum + bonusNum;

          if (chosen === 20 || total >= dc) {
            soundFx.playSuccess(chosen === 20);
            if (chosen === 20) soundFx.triggerSting('victory_fanfare');
          } else {
            soundFx.playFailure();
            if (chosen === 1) soundFx.triggerSting('sword_clash');
          }
        } catch {
          setIsRolling(false);
          setHasRolled(true);
        }
      }
    }, 80);
  };

  const handleConfirm = () => {
    soundFx.playClick();
    onRollComplete({
      ability,
      d20: effectiveD20,
      d20A: d20ResultA,
      d20B: rollMode !== 'normal' ? d20ResultB : null,
      rollMode,
      mod: modNum,
      bonus: bonusNum,
      total: totalScore,
      dc,
      isSuccess,
      isCritSuccess,
      isCritFail
    });
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-all duration-300 ${
      hasRolled && isCritFail ? 'ring-8 ring-red-900 bg-red-950/40' : ''
    }`}>
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 25 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg bg-tavern-wood border-2 border-tavern-gold rounded-2xl p-6 shadow-candle-lg text-tavern-parchment relative overflow-hidden"
      >
        {/* Glow background accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-24 bg-tavern-glow/15 blur-2xl pointer-events-none rounded-full" />

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tavern-umber/80 border border-tavern-amber text-xs font-cinzel text-tavern-gold uppercase tracking-wider mb-2">
            <Dices className="w-3.5 h-3.5" />
            <span>Tabletop 5e Check</span>
          </div>
          <h3 className="text-xl font-cinzel font-bold text-tavern-glow">{reason}</h3>
          <p className="text-xs text-tavern-parchment/70 mt-1">
            Target Difficulty: <span className="text-tavern-gold font-bold">DC {dc}</span> ({ability} Check)
          </p>
        </div>

        {/* Advantage / Disadvantage Toggle */}
        {!hasRolled && (
          <div className="flex items-center justify-center gap-1.5 mb-4">
            <button
              onClick={() => { soundFx.playClick(); setRollMode('normal'); }}
              disabled={isRolling}
              className={`px-3 py-1 rounded-lg text-xs font-cinzel font-bold border transition-all ${
                rollMode === 'normal'
                  ? 'bg-tavern-gold text-stone-950 border-tavern-glow shadow-sm'
                  : 'bg-tavern-darkest text-tavern-parchment/70 border-tavern-amber/40 hover:text-tavern-glow'
              }`}
            >
              Normal (1d20)
            </button>
            <button
              onClick={() => { soundFx.playClick(); setRollMode('advantage'); }}
              disabled={isRolling}
              className={`px-3 py-1 rounded-lg text-xs font-cinzel font-bold border flex items-center gap-1 transition-all ${
                rollMode === 'advantage'
                  ? 'bg-emerald-600 text-stone-950 border-emerald-400 shadow-sm'
                  : 'bg-tavern-darkest text-emerald-400/80 border-emerald-800 hover:text-emerald-300'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Advantage (Take High)</span>
            </button>
            <button
              onClick={() => { soundFx.playClick(); setRollMode('disadvantage'); }}
              disabled={isRolling}
              className={`px-3 py-1 rounded-lg text-xs font-cinzel font-bold border flex items-center gap-1 transition-all ${
                rollMode === 'disadvantage'
                  ? 'bg-red-700 text-stone-950 border-red-400 shadow-sm'
                  : 'bg-tavern-darkest text-red-400/80 border-red-900 hover:text-red-300'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Disadvantage (Take Low)</span>
            </button>
          </div>
        )}

        {/* Tumbling Dice Stage */}
        <div className="flex items-center justify-center gap-4 my-4 relative">
          {/* Critical 20 Particle Burst */}
          {hasRolled && isCritSuccess && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
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
                  transition={{ duration: 1, delay: p.delay, ease: 'easeOut' }}
                  style={{ width: p.size, height: p.size }}
                  className="absolute rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-tavern-glow shadow-[0_0_12px_#fde047]"
                />
              ))}
            </div>
          )}

          {/* Primary Die A */}
          <div className="flex flex-col items-center">
            {rollMode !== 'normal' && (
              <span className="text-[10px] font-cinzel font-bold text-tavern-gold/80 mb-1">Die 1</span>
            )}
            <div
              className={`relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center rounded-2xl border-2 transition-all duration-300 ${
                isRolling
                  ? 'animate-dice-shake border-tavern-glow bg-tavern-amber/30'
                  : hasRolled
                  ? d20ResultA === effectiveD20
                    ? isSuccess
                      ? 'border-emerald-400 bg-emerald-950/50 shadow-[0_0_20px_rgba(52,211,153,0.4)]'
                      : 'border-red-500 bg-red-950/50 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                    : 'border-stone-700 bg-stone-900/60 opacity-40'
                  : 'border-tavern-gold/60 bg-tavern-darkest/70'
              }`}
            >
              <span className="text-3xl sm:text-4xl font-cinzel font-black">
                {d20ResultA !== null ? d20ResultA : '?'}
              </span>
            </div>
          </div>

          {/* Secondary Die B (Advantage / Disadvantage) */}
          {rollMode !== 'normal' && (
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-cinzel font-bold text-tavern-gold/80 mb-1">Die 2</span>
              <div
                className={`relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center rounded-2xl border-2 transition-all duration-300 ${
                  isRolling
                    ? 'animate-dice-shake border-tavern-glow bg-tavern-amber/30'
                    : hasRolled
                    ? d20ResultB === effectiveD20
                      ? isSuccess
                        ? 'border-emerald-400 bg-emerald-950/50 shadow-[0_0_20px_rgba(52,211,153,0.4)]'
                        : 'border-red-500 bg-red-950/50 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                      : 'border-stone-700 bg-stone-900/60 opacity-40'
                    : 'border-tavern-gold/60 bg-tavern-darkest/70'
                }`}
              >
                <span className="text-3xl sm:text-4xl font-cinzel font-black">
                  {d20ResultB !== null ? d20ResultB : '?'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modifier & Math Breakdown */}
        <div className="bg-tavern-darkest/90 border border-tavern-amber/40 rounded-xl p-3 mb-5">
          <div className="flex items-center justify-around text-center text-xs font-cinzel">
            <div>
              <span className="text-tavern-parchment/60 block text-[10px]">Chosen Die</span>
              <span className="font-bold text-tavern-gold text-base">{effectiveD20 !== null ? effectiveD20 : '—'}</span>
            </div>
            <span className="text-tavern-gold/50 text-base">+</span>
            <div>
              <span className="text-tavern-parchment/60 block text-[10px]">{ability} Mod</span>
              <span className="font-bold text-tavern-parchment text-base">{modNum >= 0 ? `+${modNum}` : modNum}</span>
            </div>
            {bonusNum > 0 && (
              <>
                <span className="text-tavern-gold/50 text-base">+</span>
                <div>
                  <span className="text-tavern-parchment/60 block text-[10px]">Assist</span>
                  <span className="font-bold text-tavern-glow text-base">+{bonusNum}</span>
                </div>
              </>
            )}
            <span className="text-tavern-gold/50 text-base">=</span>
            <div>
              <span className="text-tavern-parchment/60 block text-[10px]">Total Score</span>
              <span className={`font-bold text-lg ${
                hasRolled
                  ? isSuccess ? 'text-emerald-400' : 'text-red-400'
                  : 'text-tavern-parchment'
              }`}>
                {totalScore !== null ? totalScore : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Outcome Banner */}
        {hasRolled && (
          <div className={`p-3 rounded-xl mb-4 text-center font-cinzel font-bold border ${
            isCritSuccess
              ? 'bg-yellow-950/80 border-yellow-400 text-yellow-300'
              : isCritFail
              ? 'bg-red-950/90 border-red-500 text-red-300'
              : isSuccess
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
              : 'bg-red-950/80 border-red-600 text-red-300'
          }`}>
            {isCritSuccess
              ? '🌟 NATURAL 20! CRITICAL SUCCESS!'
              : isCritFail
              ? '💀 NATURAL 1! CRITICAL DISASTER!'
              : isSuccess
              ? `⚔️ SUCCESS! (Rolled ${totalScore} vs DC ${dc})`
              : `🛡️ FAILURE! (Rolled ${totalScore} vs DC ${dc})`}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {!hasRolled ? (
            <button
              onClick={handleRoll}
              disabled={isRolling}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-tavern-amber to-tavern-gold text-tavern-darkest font-cinzel font-bold text-sm shadow-candle hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Dices className="w-4 h-4" />
              <span>{isRolling ? 'Rolling D20s...' : `Roll ${rollMode.toUpperCase()} Check`}</span>
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-tavern-amber to-tavern-gold text-tavern-darkest font-cinzel font-bold text-sm shadow-candle hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Advance Tale</span>
            </button>
          )}

          {onCancel && !isRolling && !hasRolled && (
            <button
              onClick={onCancel}
              className="px-4 py-3 rounded-xl bg-stone-900 border border-tavern-amber/30 text-stone-300 hover:text-stone-100 font-cinzel text-xs"
            >
              Cancel
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
