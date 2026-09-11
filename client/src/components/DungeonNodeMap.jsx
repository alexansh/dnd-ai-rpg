import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Lock, CheckCircle2, Skull, Sparkles, Compass, Shield, Footprints } from 'lucide-react';
import { soundFx } from '../services/audio';

export default function DungeonNodeMap({
  nodes = [],
  currentNodeId = null,
  onSelectNode,
  locationName = 'Active Dungeon',
  environmentType = 'crypt'
}) {
  const defaultDungeonNodes = [
    { id: 'node_entry', name: 'Crypt Antechamber', type: 'entry', x: 15, y: 50, unlocked: true, visited: true, description: 'Heavy iron-reinforced stone archway draped in cobwebs.' },
    { id: 'node_hall', name: 'Flooded Sepulcher', type: 'corridor', x: 40, y: 35, unlocked: true, visited: true, description: 'Ankle-deep murky water hiding submerged traps and sarcophagi.' },
    { id: 'node_secret', name: 'Altar of the Eclipse', type: 'shrine', x: 45, y: 75, unlocked: false, visited: false, isSecret: true, description: 'Hidden chamber pulsing with occult violet light.' },
    { id: 'node_vault', name: 'Sanctum of the Lich Sovereign', type: 'boss', x: 80, y: 50, unlocked: false, visited: false, description: 'The inner vault where the ancient horror slumbers.' }
  ];

  const displayNodes = nodes && nodes.length > 0 ? nodes : defaultDungeonNodes;
  const activeNode = displayNodes.find(n => n.id === currentNodeId) || displayNodes[0];

  const handleNodeClick = (node) => {
    if (!node.unlocked && !node.visited) {
      soundFx.playFailure();
      return;
    }
    soundFx.playClick();
    soundFx.triggerSting('secret_found');
    if (onSelectNode) onSelectNode(node);
  };

  return (
    <div className="w-full bg-stone-950/95 border-2 border-tavern-amber/60 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden flex flex-col space-y-3">
      {/* Background Ambience Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#d4a574_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

      {/* Map Header */}
      <div className="flex items-center justify-between border-b border-tavern-amber/30 pb-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-tavern-wood border border-tavern-gold/50 shadow-sm">
            <Compass className="w-4 h-4 text-tavern-glow animate-spin-slow" />
          </div>
          <div>
            <h3 className="font-cinzel font-bold text-sm text-tavern-glow flex items-center gap-2">
              <span>{locationName}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-tavern-amber/30 text-tavern-gold border border-tavern-amber/40 uppercase font-sans">
                Topological Map
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-cinzel text-tavern-parchment/70">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Current</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Cleared</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-stone-600" /> Fog of War</span>
        </div>
      </div>

      {/* Map Canvas Area */}
      <div className="relative w-full h-56 sm:h-64 bg-tavern-darkest/90 rounded-xl border border-tavern-amber/30 overflow-hidden shadow-inner flex items-center justify-center p-4">
        {/* Connecting SVG Path Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {displayNodes.map((node, i) => {
            if (i === 0) return null;
            const prev = displayNodes[i - 1];
            const isSecret = node.isSecret || false;

            return (
              <line
                key={`line-${prev.id}-${node.id}`}
                x1={`${prev.x}%`}
                y1={`${prev.y}%`}
                x2={`${node.x}%`}
                y2={`${node.y}%`}
                stroke={node.unlocked || node.visited ? (isSecret ? '#a855f7' : '#d4a574') : '#44403c'}
                strokeWidth={isSecret ? '2' : '3'}
                strokeDasharray={isSecret ? '4 4' : 'none'}
                className={node.unlocked ? 'transition-all duration-500' : ''}
              />
            );
          })}
        </svg>

        {/* Render Node Waypoints */}
        {displayNodes.map((node) => {
          const isCurrent = node.id === activeNode?.id;
          const isVisited = node.visited;
          const isUnlocked = node.unlocked;
          const isBoss = node.type === 'boss';

          return (
            <div
              key={node.id}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
            >
              <button
                onClick={() => handleNodeClick(node)}
                className={`relative group flex flex-col items-center focus:outline-none transition-transform active:scale-95 ${
                  isCurrent ? 'scale-110' : 'hover:scale-105'
                }`}
              >
                {/* Outer pulsing ring if current */}
                {isCurrent && (
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 -m-2 rounded-full border-2 border-tavern-gold pointer-events-none"
                  />
                )}

                {/* Node Icon Badge */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 shadow-candle-md transition-all ${
                    isCurrent
                      ? 'bg-tavern-gold text-tavern-darkest border-tavern-glow ring-2 ring-tavern-gold/50'
                      : isVisited
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                      : isUnlocked
                      ? 'bg-tavern-wood text-tavern-gold border-tavern-amber'
                      : 'bg-stone-900 text-stone-600 border-stone-800'
                  }`}
                >
                  {isCurrent ? (
                    <Footprints className="w-5 h-5 animate-bounce" />
                  ) : isBoss ? (
                    <Skull className="w-5 h-5 text-red-400" />
                  ) : isVisited ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isUnlocked ? (
                    <MapPin className="w-4 h-4" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                </div>

                {/* Node Name Label */}
                <div className={`mt-1.5 px-2 py-0.5 rounded text-[10px] font-cinzel font-bold whitespace-nowrap shadow-md border ${
                  isCurrent
                    ? 'bg-tavern-darkest text-tavern-glow border-tavern-gold'
                    : isUnlocked || isVisited
                    ? 'bg-stone-950/90 text-tavern-parchment border-stone-700'
                    : 'bg-stone-950/70 text-stone-500 border-stone-800'
                }`}>
                  {isUnlocked || isVisited ? node.name : '??? [Locked]'}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Selected Node Summary Footer */}
      <div className="p-3 bg-tavern-wood/70 border border-tavern-amber/30 rounded-xl flex items-center justify-between">
        <div className="min-w-0 flex-1 pr-3">
          <span className="text-[10px] font-cinzel uppercase font-bold text-tavern-gold block">
            Current Position: {activeNode?.name || 'Sanctum Entrance'}
          </span>
          <p className="text-xs text-tavern-parchment/80 font-sans truncate">
            {activeNode?.description || 'Your party is established at this waypoint.'}
          </p>
        </div>
        <div className="shrink-0">
          <span className="text-[11px] font-cinzel px-2.5 py-1 rounded bg-tavern-umber border border-tavern-amber/40 text-tavern-gold font-bold">
            Stage {activeNode?.type?.toUpperCase() || 'DELVE'}
          </span>
        </div>
      </div>
    </div>
  );
}
