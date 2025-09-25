"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';
import { useTheme } from '@/contexts/theme-context';

const ThemeToggle = () => {
  const { theme, setTheme, effectiveTheme } = useTheme();

  const themes = [
    { value: 'light', icon: FiSun, label: 'Light' },
    { value: 'dark', icon: FiMoon, label: 'Dark' },
    { value: 'system', icon: FiMonitor, label: 'System' },
  ] as const;

  const currentThemeIndex = themes.findIndex(t => t.value === theme);

  const cycleTheme = () => {
    const nextIndex = (currentThemeIndex + 1) % themes.length;
    setTheme(themes[nextIndex].value);
  };

  const CurrentIcon = themes[currentThemeIndex]?.icon || FiSun;

  return (
    <div className="relative">
      <motion.button
        onClick={cycleTheme}
        className={`
          relative p-2 rounded-lg transition-all duration-200 
          ${effectiveTheme === 'dark' 
            ? 'bg-gray-800 text-gray-200 hover:bg-gray-700 border border-gray-700' 
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
          }
        `}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        aria-label={`Switch to ${themes[(currentThemeIndex + 1) % themes.length].label.toLowerCase()} theme`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 180, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-5 h-5"
          >
            <CurrentIcon className="w-5 h-5" />
          </motion.div>
        </AnimatePresence>
        
        {/* Tooltip */}
        <div className={`
          absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 
          text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
          ${effectiveTheme === 'dark' 
            ? 'bg-gray-900 text-gray-200 border border-gray-700' 
            : 'bg-gray-900 text-white'
          }
        `}>
          {themes[currentThemeIndex]?.label}
          <div className={`
            absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent
            ${effectiveTheme === 'dark' ? 'border-t-gray-900' : 'border-t-gray-900'}
          `} />
        </div>
      </motion.button>
    </div>
  );
};

export default ThemeToggle;