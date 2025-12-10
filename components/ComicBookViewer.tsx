import React, { useState, useEffect, useRef } from 'react';
import { ComicPanel } from '../types';
import { ChevronLeft, ChevronRight, Loader2, RefreshCw, Send, Sparkles } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';

interface ComicBookViewerProps {
  panels: ComicPanel[];
  title: string;
  artStyle: string;
  onRegenerateImage: (panelId: number) => void;
  onContinue: (prompt: string) => void;
  isGeneratingMore: boolean;
}

const ComicBookViewer: React.FC<ComicBookViewerProps> = ({ 
  panels, 
  title, 
  artStyle, 
  onRegenerateImage,
  onContinue,
  isGeneratingMore
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [continuationPrompt, setContinuationPrompt] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // We add 1 virtual slide for the "Continue" screen if panels exist
  const hasPanels = panels.length > 0;
  const totalSlides = hasPanels ? panels.length + 1 : 0;
  const isContinueSlide = currentIndex === panels.length;
  const currentPanel = !isContinueSlide ? panels[currentIndex] : null;

  // Sync index when panels update (e.g. new chapter added)
  // If we were on the continue slide, move to the first new panel
  const prevPanelsLength = useRef(panels.length);
  useEffect(() => {
    if (panels.length > prevPanelsLength.current) {
        // New panels added, move to the first new panel (which was the old length)
        setCurrentIndex(prevPanelsLength.current);
        setDirection(1);
    }
    prevPanelsLength.current = panels.length;
  }, [panels.length]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys if typing in textarea
      if (document.activeElement === inputRef.current) return;

      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, totalSlides]);

  const handleNext = () => {
    if (currentIndex < totalSlides - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleContinueSubmit = () => {
    if (continuationPrompt.trim() && !isGeneratingMore) {
        onContinue(continuationPrompt);
        setContinuationPrompt(""); // Clear after submitting
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      rotateY: direction > 0 ? 25 : -25,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      rotateY: 0,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      rotateY: direction < 0 ? 25 : -25,
      scale: 0.95
    })
  };

  if (!hasPanels) return null;

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Header / Pagination */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-6 px-4 text-slate-400 text-sm font-medium">
        <div className="flex flex-col">
          <span className="text-white font-bold text-lg md:text-2xl line-clamp-1 bg-gradient-to-r from-cyan-200 to-slate-400 bg-clip-text text-transparent">{title}</span>
          <span className="text-xs text-cyan-400 uppercase tracking-widest">{artStyle}</span>
        </div>
        <div className="flex items-center gap-4 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">
           <span>Page {currentIndex + 1} of {totalSlides}</span>
        </div>
      </div>

      {/* Main Viewer Area */}
      <div className="relative w-full max-w-5xl px-4 perspective-1000">
        
        {/* Navigation Buttons (Desktop) */}
        <button 
            onClick={handlePrev} 
            disabled={currentIndex === 0}
            className="hidden md:block absolute -left-4 lg:-left-12 top-1/2 -translate-y-1/2 z-20 p-2 text-slate-500 hover:text-cyan-400 disabled:opacity-20 transition-all hover:scale-110"
        >
            <ChevronLeft className="w-10 h-10" />
        </button>

        <button 
            onClick={handleNext} 
            disabled={currentIndex === totalSlides - 1}
            className="hidden md:block absolute -right-4 lg:-right-12 top-1/2 -translate-y-1/2 z-20 p-2 text-slate-500 hover:text-cyan-400 disabled:opacity-20 transition-all hover:scale-110"
        >
            <ChevronRight className="w-10 h-10" />
        </button>

        {/* Content Container (Card) */}
        {/* We use a container that adapts to height but prioritizes the square image */}
        <div className="relative w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden min-h-[400px] md:min-h-[500px]">
             
             <AnimatePresence initial={false} custom={direction} mode="wait">
                {!isContinueSlide && currentPanel ? (
                     <motion.div
                        key={currentPanel.id}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="w-full h-full flex flex-col md:flex-row"
                     >
                        {/* Image Side - Strictly SQUARE aspect ratio on desktop to match generation */}
                        <div className="w-full md:w-1/2 aspect-square relative bg-black group border-b md:border-b-0 md:border-r border-slate-800">
                             {currentPanel.isLoadingImage ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                                    <Loader2 className="w-10 h-10 animate-spin mb-3 text-cyan-500" />
                                    <span className="text-xs font-medium tracking-widest uppercase">Rendering Scene...</span>
                                </div>
                             ) : currentPanel.imageData ? (
                                <>
                                    <img 
                                        src={currentPanel.imageData} 
                                        alt={currentPanel.description} 
                                        className="w-full h-full object-cover" 
                                    />
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                        onClick={() => onRegenerateImage(currentPanel.id)}
                                        className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-cyan-600 transition-colors"
                                        title="Regenerate this panel"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                             ) : (
                                <div className="flex items-center justify-center h-full text-slate-700 italic">
                                    No Image Available
                                </div>
                             )}
                        </div>

                        {/* Text Side */}
                        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center bg-slate-900 relative">
                            <div className="absolute top-0 left-0 w-full md:w-1 h-1 md:h-full bg-gradient-to-r md:bg-gradient-to-b from-cyan-500 to-blue-500 opacity-20"></div>
                            
                            <div className="flex-1 flex flex-col justify-center">
                                <div className="mb-8">
                                    <span className="inline-block px-2 py-1 bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-wider rounded mb-2 border border-slate-700">
                                        Panel #{currentPanel.id}
                                    </span>
                                </div>

                                {currentPanel.dialogue && (
                                    <div className="relative bg-white text-black p-6 rounded-3xl rounded-tl-none mb-8 shadow-lg border-2 border-slate-200">
                                        <div className="absolute -top-3 left-0 bg-cyan-600 text-white text-[10px] px-3 py-1 rounded-r-full uppercase tracking-wider font-bold shadow-sm">
                                            {currentPanel.character}
                                        </div>
                                        <p className="font-comic text-lg md:text-xl leading-snug">
                                            {currentPanel.dialogue}
                                        </p>
                                    </div>
                                )}
                            
                                <div className="text-slate-400 text-sm md:text-base italic pl-4 border-l-2 border-slate-800">
                                    {currentPanel.description}
                                </div>
                            </div>
                        </div>
                     </motion.div>
                ) : (
                    <motion.div
                        key="continue"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-950 p-8 text-center"
                    >
                        <div className="max-w-md w-full">
                            <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-900 border border-slate-800 shadow-xl">
                                <Sparkles className="w-10 h-10 text-cyan-400 animate-pulse-slow" />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-2">To Be Continued...</h3>
                            <p className="text-slate-400 mb-8">
                                The story doesn't have to end here. What happens next?
                            </p>

                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                                <div className="relative bg-slate-900 rounded-lg p-1 flex items-center">
                                    <textarea
                                        ref={inputRef}
                                        value={continuationPrompt}
                                        onChange={(e) => setContinuationPrompt(e.target.value)}
                                        placeholder="Suddenly, a portal opens..."
                                        className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-600 resize-none h-14 py-3 px-3"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleContinueSubmit();
                                            }
                                        }}
                                        disabled={isGeneratingMore}
                                    />
                                    <button
                                        onClick={handleContinueSubmit}
                                        disabled={!continuationPrompt.trim() || isGeneratingMore}
                                        className="ml-2 p-3 rounded-md bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isGeneratingMore ? (
                                            <Loader2 className="w-5 h-5 animate-spin text-cyan-500" />
                                        ) : (
                                            <Send className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-slate-600 mt-4">
                                Press <span className="text-slate-500 font-mono bg-slate-900 px-1 rounded">Enter</span> to continue the magic
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
      
      {/* Mobile Nav Controls */}
      <div className="mt-6 flex md:hidden gap-8">
         <button onClick={handlePrev} disabled={currentIndex === 0} className="p-3 bg-slate-900 rounded-full text-slate-200 disabled:opacity-30"><ChevronLeft/></button>
         <button onClick={handleNext} disabled={currentIndex === totalSlides - 1} className="p-3 bg-slate-900 rounded-full text-slate-200 disabled:opacity-30"><ChevronRight/></button>
      </div>

    </div>
  );
};

export default ComicBookViewer;