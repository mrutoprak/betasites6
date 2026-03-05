import { useState, useEffect, useRef, useCallback } from 'react';
import Reel from './components/Reel';
import { PhraseBlock, generatePhrases } from './services/gemini';
import { Loader2, Play } from 'lucide-react';

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [phrases, setPhrases] = useState<PhraseBlock[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadMorePhrases = useCallback(async () => {
    try {
      setIsLoading(true);
      const lastPhrase = phrases.length > 0 ? phrases[phrases.length - 1] : undefined;
      const newPhrases = await generatePhrases(lastPhrase);
      if (newPhrases && newPhrases.length > 0) {
        setPhrases(prev => [...prev, ...newPhrases]);
      }
    } catch (err) {
      console.error(err);
      setError("Bağlantı hatası oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  }, [phrases]);

  // Initial load
  useEffect(() => {
    if (phrases.length === 0) {
      loadMorePhrases();
    }
  }, [loadMorePhrases, phrases.length]);

  // Intersection Observer for active reel
  useEffect(() => {
    if (!hasStarted) return;
    
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setActiveIndex(index);
            
            // Load more if we are near the end
            if (index >= phrases.length - 2 && !isLoading) {
              loadMorePhrases();
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.6, // Trigger when 60% of the reel is visible
      }
    );

    const elements = container.querySelectorAll('.reel-container');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [phrases.length, isLoading, loadMorePhrases, hasStarted]);

  if (!hasStarted) {
    return (
      <div 
        className="h-screen w-full bg-black flex flex-col items-center justify-center text-white cursor-pointer"
        onClick={() => setHasStarted(true)}
      >
        <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-8 animate-pulse">
          <Play className="w-10 h-10 ml-2 text-white" fill="currentColor" />
        </div>
        <h1 className="text-4xl font-bold mb-3 tracking-tight">Ar-Reels</h1>
        <p className="text-white/50 font-medium tracking-wide">Başlamak için dokun</p>
      </div>
    );
  }

  if (isLoading && phrases.length === 0) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mb-6" />
        <p className="text-lg font-medium animate-pulse tracking-wide">Yapay Zeka İçerik Üretiyor...</p>
      </div>
    );
  }

  if (error && phrases.length === 0) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center text-white p-6 text-center">
        <p className="text-red-400 mb-6 text-lg">{error}</p>
        <button 
          onClick={() => { setIsLoading(true); setError(null); loadMorePhrases(); }}
          className="px-8 py-4 bg-white/10 rounded-full hover:bg-white/20 transition font-medium tracking-wide"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-black"
      style={{ scrollBehavior: 'smooth' }}
    >
      {phrases.map((phrase, index) => (
        <div 
          key={`${index}-${phrase.functionAr}`} 
          data-index={index}
          className="reel-container h-screen w-full snap-start snap-always relative"
        >
          <Reel phrase={phrase} isActive={index === activeIndex} />
        </div>
      ))}
      
      {isLoading && phrases.length > 0 && (
        <div className="h-screen w-full snap-start snap-always relative flex items-center justify-center bg-black">
           <Loader2 className="w-10 h-10 animate-spin text-white/50" />
        </div>
      )}
    </div>
  );
}
