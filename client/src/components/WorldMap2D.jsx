import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Compass,
  MapPin,
  Flame,
  Shield,
  Skull,
  Sparkles,
  Lock,
  ArrowRight,
  Eye,
  Footprints
} from 'lucide-react';
import PortraitDisplay from './PortraitDisplay';
import { soundFx } from '../services/audio';

const NODE_TYPE_ICONS = {
  outpost: '🏰',
  shrine: '✨',
  dungeon: '⚔️',
  ruins: '🏛️',
  boss: '💀',
  trail: '🌲',
  cave: '🦇',
  wreck: '⚓'
};

export default function WorldMap2D({
  campaign,
  activeNode,
  onSelectNode,
  playerCharacter
}) {
  const [selectedNode, setSelectedNode] = useState(activeNode || campaign?.startingNodes?.[0]);

  const nodes = campaign?.startingNodes || [
    { id: 'start', name: campaign?.title || 'Starting Outpost', description: 'The threshold of your journey.', type: 'outpost', x: 20, y: 50, connectedTo: ['dungeon'], unlocked: true },
    { id: 'dungeon', name: 'Forgotten Depths', description: 'Caverns echoing with danger.', type: 'dungeon', x: 50, y: 30, connectedTo: ['start', 'boss'], unlocked: false },
    { id: 'boss', name: 'Boss Sanctum', description: 'The stronghold of the nemesis.', type: 'boss', x: 80, y: 60, connectedTo: ['dungeon'], unlocked: false }
  ];

  const handleNodeClick = (node) => {
    soundFx.playClick();
    setSelectedNode(node);
  };

  const handleTravel = (node) => {
    if (!node.unlocked && node.id !== activeNode?.id) return;
    soundFx.playClick();
    soundFx.triggerSting('secret_found');
    onSelectNode(node);
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* 2D World Canvas Map */}
      <div className="relative flex-1 w-full min-h-[300px] bg-stone-950/95 border-2 border-tavern-gold/60 rounded-2xl overflow-hidden shadow-candle">
        {/* Ambient Map Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 via-stone-950/90 to-stone-950 pointer-events-none" />
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f0c987_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        {/* SVG Roads / Connecting Pathways */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d4a574" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f0c987" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          {nodes.map((node) => {
            if (!node.connectedTo) return null;
            return node.connectedTo.map((targetId) => {
              const target = nodes.find((n) => n.id === targetId);
              if (!target) return null;
              // Avoid duplicate reverse lines
              if (node.id > target.id) return null;

              const isPathUnlocked = node.unlocked && target.unlocked;

              return (
                <line
                  key={`${node.id}-${target.id}`}
                  x1={`${node.x}%`}
                  y1={`${node.y}%`}
                  x2={`${target.x}%`}
                  y2={`${target.y}%`}
                  stroke={isPathUnlocked ? 'url(#pathGradient)' : '#443022'}
                  strokeWidth={isPathUnlocked ? '3' : '1.5'}
                  strokeDasharray={isPathUnlocked ? 'none' : '4,4'}
                  className="transition-all duration-700"
                />
              );
            });
          })}
        </svg>

        {/* Interactive Node Pins */}
        {nodes.map((node) => {
          const isCurrent = activeNode?.id === node.id;
          const isSelected = selectedNode?.id === node.id;
          const icon = NODE_TYPE_ICONS[node.type] || '⚔️';

          return (
            <div
              key={node.id}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group cursor-pointer"
              onClick={() => handleNodeClick(node)}
            >
              {/* Current Player Token Marker */}
              {isCurrent && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce z-20 pointer-events-none">
                  <span className="px-1.5 py-0.5 rounded bg-tavern-gold text-tavern-darkest text-[9px] font-cinzel font-bold shadow-md uppercase whitespace-nowrap">
                    Party Here
                  </span>
                  <div className="w-1.5 h-1.5 bg-tavern-gold rotate-45 -mt-0.5" />
                </div>
              )}

              {/* Node Icon Pin */}
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-lg sm:text-xl transition-all duration-300 shadow-candle relative ${
                  isCurrent
                    ? 'bg-gradient-to-br from-tavern-amber to-tavern-gold text-tavern-darkest border-2 border-tavern-glow ring-4 ring-tavern-gold/40 scale-110 animate-pulse'
                    : isSelected
                    ? 'bg-tavern-umber border-2 border-tavern-glow text-tavern-glow ring-2 ring-tavern-gold/60 scale-105'
                    : node.unlocked
                    ? 'bg-tavern-darkest/90 border-2 border-tavern-gold/60 text-tavern-parchment hover:border-tavern-glow hover:scale-105'
                    : 'bg-stone-900/80 border border-stone-700/60 text-stone-500 opacity-60'
                }`}
              >
                {node.unlocked ? icon : <Lock className="w-4 h-4 text-stone-500" />}

                {/* Pulsing indicator for Boss Nodes */}
                {node.type === 'boss' && node.unlocked && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`mt-1.5 px-2 py-0.5 rounded text-[10px] sm:text-xs font-cinzel font-bold transition-colors whitespace-nowrap max-w-[120px] truncate ${
                  isCurrent
                    ? 'bg-tavern-gold/90 text-tavern-darkest shadow-sm'
                    : isSelected
                    ? 'bg-tavern-umber text-tavern-glow'
                    : node.unlocked
                    ? 'bg-stone-950/80 text-tavern-parchment/90'
                    : 'bg-stone-950/60 text-stone-500'
                }`}
              >
                {node.name}
              </span>
            </div>
          );
        })}

        {/* Map Header Overlay */}
        <div className="absolute top-3 left-3 bg-tavern-darkest/90 border border-tavern-amber/40 rounded-xl px-3 py-1.5 text-xs shadow-md z-10 flex items-center gap-2">
          <Compass className="w-4 h-4 text-tavern-glow animate-spin" />
          <span className="font-cinzel font-bold text-tavern-glow">{campaign?.title || 'World Map'}</span>
        </div>

        {/* Map Legend Overlay */}
        <div className="absolute top-3 right-3 bg-tavern-darkest/90 border border-tavern-amber/40 rounded-xl px-2.5 py-1 text-[10px] font-cinzel text-tavern-gold/80 shadow-md z-10 flex items-center gap-2.5 hidden sm:flex">
          <span>🏰 Outpost</span>
          <span>✨ Shrine</span>
          <span>⚔️ Dungeon</span>
          <span>💀 Boss</span>
        </div>
      </div>

      {/* Selected Node Details & Fast Travel Bar */}
      {selectedNode && (
        <div className="p-3.5 rounded-xl bg-tavern-wood/90 border border-tavern-amber/50 shadow-candle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base">{NODE_TYPE_ICONS[selectedNode.type] || '⚔️'}</span>
              <span className="font-cinzel font-bold text-sm text-tavern-glow">{selectedNode.name}</span>
              <span className="px-2 py-0.5 rounded bg-tavern-darkest text-[10px] font-mono text-tavern-parchment uppercase">
                {selectedNode.type}
              </span>
              {activeNode?.id === selectedNode.id && (
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 text-[10px] font-bold">
                  Current Location
                </span>
              )}
            </div>
            <p className="text-xs text-tavern-parchment/80 font-sans">{selectedNode.description}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            {activeNode?.id !== selectedNode.id && (
              <button
                onClick={() => handleTravel(selectedNode)}
                disabled={!selectedNode.unlocked}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg font-cinzel font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all ${
                  selectedNode.unlocked
                    ? 'bg-gradient-to-r from-tavern-amber to-tavern-gold hover:brightness-110 text-tavern-darkest active:scale-95'
                    : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                }`}
              >
                <Footprints className="w-3.5 h-3.5" />
                <span>{selectedNode.unlocked ? 'Travel to Location' : 'Path Locked'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
