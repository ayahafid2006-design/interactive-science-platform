/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { Dashboard } from './components/Dashboard';
import { ChapterView } from './components/ChapterView';
import { Chapter } from './types';
import { soundManager } from './utils/sound';

export default function App() {
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  useEffect(() => {
    // Initialize audio context on first interaction
    const initAudio = () => {
      soundManager.init();
      window.removeEventListener('click', initAudio);
      window.removeEventListener('touchstart', initAudio);
    };
    
    window.addEventListener('click', initAudio);
    window.addEventListener('touchstart', initAudio);
    
    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('touchstart', initAudio);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 selection:bg-purple-500/30">
      <AnimatePresence mode="wait">
        {selectedChapter ? (
          <ChapterView 
            key="chapter-view" 
            chapter={selectedChapter} 
            onBack={() => setSelectedChapter(null)} 
          />
        ) : (
          <Dashboard 
            key="dashboard" 
            onSelectChapter={setSelectedChapter} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
