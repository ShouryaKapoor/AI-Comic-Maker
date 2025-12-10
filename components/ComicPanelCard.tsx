import React from 'react';
import { ComicPanel } from '../types';
import { Loader2, RefreshCw } from './Icons';

interface ComicPanelCardProps {
  panel: ComicPanel;
  onRegenerateImage: (panelId: number) => void;
}

const ComicPanelCard: React.FC<ComicPanelCardProps> = ({ panel, onRegenerateImage }) => {
  return (
    <div className="relative group flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-[1.01] duration-300">
      
      {/* Image Area */}
      <div className="relative aspect-square w-full bg-zinc-950 flex items-center justify-center overflow-hidden">
        {panel.isLoadingImage ? (
          <div className="flex flex-col items-center justify-center text-zinc-500 animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-purple-500" />
            <span className="text-xs font-medium tracking-wider">DRAWING...</span>
          </div>
        ) : panel.imageData ? (
          <img 
            src={panel.imageData} 
            alt={panel.description} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="p-6 text-center text-zinc-600 text-sm">
            <p className="italic mb-2">"{panel.visualPrompt}"</p>
            <p className="text-xs uppercase tracking-widest opacity-50">Waiting to render</p>
          </div>
        )}

        {/* Action Overlay */}
        {!panel.isLoadingImage && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onRegenerateImage(panel.id)}
              className="p-2 bg-zinc-900/80 backdrop-blur-sm rounded-full text-zinc-300 hover:text-white hover:bg-purple-600 transition-colors"
              title="Regenerate Image"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Text Area */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-zinc-900">
        <div className="mb-3">
          {/* Dialogue Bubble Style */}
          {panel.dialogue && (
             <div className="relative bg-white text-black p-3 rounded-2xl rounded-bl-none mb-3 font-comic text-sm leading-snug shadow-sm max-w-[90%] border-2 border-zinc-200">
              <span className="font-bold text-xs uppercase text-zinc-500 block mb-1">{panel.character}</span>
              "{panel.dialogue}"
            </div>
          )}
        </div>
        
        <p className="text-zinc-500 text-xs italic border-t border-zinc-800 pt-3">
          {panel.description}
        </p>
      </div>
      
      <div className="absolute top-0 left-0 bg-zinc-900/90 text-zinc-400 text-[10px] font-bold px-2 py-1 rounded-br-lg border-b border-r border-zinc-800">
        #{panel.id}
      </div>
    </div>
  );
};

export default ComicPanelCard;
