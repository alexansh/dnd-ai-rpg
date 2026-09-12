import React from 'react';

export default function OrnatePanel({
  children,
  className = '',
  cornerSize = 'w-3 h-3',
  title = null,
  headerAction = null,
  glow = false
}) {
  return (
    <div
      className={`relative rounded-2xl bg-black/45 backdrop-blur-xl border border-tavern-gold/25 hover:border-tavern-gold/50 shadow-2xl transition-all duration-300 ${
        glow ? 'shadow-[0_0_35px_rgba(212,165,116,0.15)]' : ''
      } ${className}`}
    >
      {/* 4 Ornate L-shaped Gold Corner Brackets */}
      <div className={`absolute top-0 left-0 ${cornerSize} border-t-2 border-l-2 border-tavern-glow pointer-events-none rounded-tl-sm`} />
      <div className={`absolute top-0 right-0 ${cornerSize} border-t-2 border-r-2 border-tavern-glow pointer-events-none rounded-tr-sm`} />
      <div className={`absolute bottom-0 left-0 ${cornerSize} border-b-2 border-l-2 border-tavern-glow pointer-events-none rounded-bl-sm`} />
      <div className={`absolute bottom-0 right-0 ${cornerSize} border-b-2 border-r-2 border-tavern-glow pointer-events-none rounded-br-sm`} />

      {/* Optional Ornate Header */}
      {title && (
        <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-tavern-gold/20">
          <h3 className="font-cinzel font-bold text-base text-tavern-glow tracking-wider uppercase">
            {title}
          </h3>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
