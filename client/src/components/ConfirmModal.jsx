import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import OrnatePanel from './OrnatePanel';
import { soundFx } from '../services/audio';

export default function ConfirmModal({
  isOpen,
  title = 'Are You Certain?',
  message = 'This action cannot be undone. Will you proceed?',
  confirmText = 'Confirm',
  cancelText = 'Keep',
  isDestructive = true,
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <OrnatePanel glow={true} className="p-6 text-center space-y-5 bg-stone-950/95 border-tavern-gold/40">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.25)]">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-cinzel font-bold text-xl text-tavern-glow tracking-wider">
                {title}
              </h3>
              <p className="text-sm text-tavern-parchment/80 font-sans leading-relaxed">
                {message}
              </p>
            </div>

            <div className="gradient-divider my-2" />

            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                onClick={() => {
                  soundFx.playClick();
                  onCancel();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-tavern-wood hover:bg-tavern-umber text-tavern-parchment border border-tavern-gold/30 font-cinzel font-bold text-xs tracking-wider transition-all active:scale-95"
              >
                {cancelText}
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  onConfirm();
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl font-cinzel font-bold text-xs tracking-wider transition-all active:scale-95 shadow-lg flex items-center justify-center gap-1.5 ${
                  isDestructive
                    ? 'bg-red-950/90 hover:bg-red-900 border border-red-500/70 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                    : 'bg-gradient-to-r from-tavern-amber via-tavern-gold to-tavern-glow text-tavern-darkest hover:brightness-110'
                }`}
              >
                {isDestructive && <Trash2 className="w-3.5 h-3.5" />}
                <span>{confirmText}</span>
              </button>
            </div>
          </OrnatePanel>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
