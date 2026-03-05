import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PhraseBlock } from '../services/gemini';

interface ReelProps {
  phrase: PhraseBlock;
  isActive: boolean;
}

export default function Reel({ phrase, isActive }: ReelProps) {
  const [showInfo, setShowInfo] = useState(false);

  // Play audio using device TTS when active
  useEffect(() => {
    if (isActive) {
      const fullArabic = `${phrase.functionAr} ${phrase.verbAr} ${phrase.timeAr}`;
      const utterance = new SpeechSynthesisUtterance(fullArabic);
      utterance.lang = 'ar-SA';
      
      // Try to find a native Arabic voice if available
      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }
      
      window.speechSynthesis.cancel(); // Stop any currently playing audio
      window.speechSynthesis.speak(utterance);
    } else {
      window.speechSynthesis.cancel();
    }
    
    if (!isActive) {
      setShowInfo(false); // Reset info panel when scrolling away
    }
  }, [isActive, phrase]);

  const bgUrl = `https://picsum.photos/seed/${phrase.imageKeyword}/1080/1920?blur=4`;

  return (
    <div 
      className="relative w-full h-full bg-black text-white overflow-hidden cursor-pointer"
      onClick={() => setShowInfo(!showInfo)}
    >
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 transition-opacity duration-1000"
        style={{ backgroundImage: `url(${bgUrl})` }}
      />

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4" dir="rtl">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-4 text-6xl md:text-7xl font-bold leading-tight drop-shadow-2xl">
          <span className="text-rose-400">{phrase.functionAr}</span>
          <span className="text-emerald-400">{phrase.verbAr}</span>
          <span className="text-sky-400">{phrase.timeAr}</span>
        </div>
      </div>

      {/* Bottom Panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div 
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-xl p-8 rounded-t-3xl border-t border-white/10"
            onClick={(e) => e.stopPropagation()} // Prevent closing when tapping panel
          >
            <div className="max-w-md mx-auto space-y-6">
              <div className="text-center">
                <p className="text-xs text-white/50 uppercase tracking-[0.2em] mb-2 font-medium">Okunuşu</p>
                <p className="text-xl font-medium text-white/90">{phrase.transliteration}</p>
              </div>
              
              <div className="h-px w-full bg-white/10" />
              
              <div className="text-center">
                <p className="text-xs text-white/50 uppercase tracking-[0.2em] mb-2 font-medium">Anlamı</p>
                <p className="text-2xl font-semibold text-white">{phrase.turkish}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Hint to tap */}
      {!showInfo && (
        <div className="absolute bottom-12 left-0 right-0 text-center animate-pulse opacity-50">
          <p className="text-sm font-medium tracking-wide">Çeviri için dokun</p>
        </div>
      )}
    </div>
  );
}
