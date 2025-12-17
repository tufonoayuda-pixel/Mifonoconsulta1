"use client";

import React from 'react';
import { Ear, Mic, Speech, Brain, BookOpenText, MessageSquare, HeartPulse } from 'lucide-react';
import { cn } from '@/lib/utils';

const icons = [
  { icon: Ear, color: 'text-white' },
  { icon: Mic, color: 'text-white' },
  { icon: Speech, color: 'text-white' },
  { icon: Brain, color: 'text-white' },
  { icon: BookOpenText, color: 'text-white' },
  { icon: MessageSquare, color: 'text-white' },
  { icon: HeartPulse, color: 'text-white' },
];

const FallingIconsBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => {
        const randomIcon = icons[Math.floor(Math.random() * icons.length)];
        const IconComponent = randomIcon.icon;
        const delay = Math.random() * 10; // 0-10 seconds delay
        const duration = 10 + Math.random() * 10; // 10-20 seconds duration
        const left = Math.random() * 100; // 0-100% horizontal position
        const size = 20 + Math.random() * 30; // 20-50px size

        return (
          <IconComponent
            key={i}
            className={cn(
              "absolute animate-fall opacity-0",
              randomIcon.color
            )}
            style={{
              left: `${left}%`,
              fontSize: `${size}px`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear',
              '--start-y': '-10%',
              '--end-y': '110%',
              '--start-opacity': '0',
              '--end-opacity': '0.2',
            } as React.CSSProperties} // Type assertion for custom CSS properties
          />
        );
      })}
    </div>
  );
};

export default FallingIconsBackground;