import React from 'react';

export default function EmberParticles({ count = 8, className = '' }) {
  const particles = [
    { top: '15%', left: '10%', size: 'w-2 h-2', bg: 'bg-tavern-glow', delay: '0s', duration: '4.5s' },
    { top: '65%', left: '18%', size: 'w-3 h-3', bg: 'bg-tavern-amber', delay: '1.2s', duration: '5.2s' },
    { top: '25%', right: '15%', size: 'w-2.5 h-2.5', bg: 'bg-tavern-gold', delay: '2.1s', duration: '4.8s' },
    { top: '75%', right: '20%', size: 'w-2 h-2', bg: 'bg-tavern-glow', delay: '0.7s', duration: '6s' },
    { top: '45%', left: '5%', size: 'w-1.5 h-1.5', bg: 'bg-tavern-amber', delay: '3s', duration: '4s' },
    { top: '85%', left: '45%', size: 'w-2 h-2', bg: 'bg-tavern-gold', delay: '1.8s', duration: '5.5s' },
    { top: '12%', left: '60%', size: 'w-1.5 h-1.5', bg: 'bg-tavern-glow', delay: '2.5s', duration: '4.2s' },
    { top: '55%', right: '8%', size: 'w-2 h-2', bg: 'bg-tavern-amber', delay: '3.4s', duration: '5.8s' }
  ].slice(0, count);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}>
      {particles.map((p, idx) => (
        <div
          key={idx}
          className={`absolute rounded-full ${p.size} ${p.bg} opacity-50 blur-[0.5px] animate-float`}
          style={{
            top: p.top,
            left: p.left,
            right: p.right,
            animationDelay: p.delay,
            animationDuration: p.duration
          }}
        />
      ))}
    </div>
  );
}
