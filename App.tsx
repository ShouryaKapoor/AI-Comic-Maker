import React, { useState, useRef } from 'react';
import { generateComicScript, generatePanelImage } from './services/geminiService';
import { ComicScript, ComicPanel } from './types';
import ComicBookViewer from './components/ComicBookViewer';
import LandingPage from './components/LandingPage';
import { Sparkles, ImageIcon, Send, Loader2, AlertCircle } from './components/Icons';

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isScriptLoading, setIsScriptLoading] = useState(false);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [comicScript, setComicScript] = useState<ComicScript | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File is too large. Please select an image under 5MB.");
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError(null);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  // Initial Generation
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsScriptLoading(true);
    setError(null);
    setComicScript(null);

    try {
      let base64Image = undefined;
      let mimeType = undefined;

      if (selectedFile) {
        base64Image = await convertFileToBase64(selectedFile);
        mimeType = selectedFile.type;
      }

      // 1. Generate Script
      const script = await generateComicScript(prompt, base64Image, mimeType);
      
      // Initialize panels with loading state for images
      const initialPanels = script.panels.map(p => ({
        ...p,
        isLoadingImage: true, 
        imageData: undefined
      }));

      const fullScript = { ...script, panels: initialPanels };
      setComicScript(fullScript);
      setIsScriptLoading(false);

      // 2. Trigger Image Generation for all panels in parallel
      generateImagesForPanels(initialPanels, script.artStyle, script.characterDefinitions);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
      setIsScriptLoading(false);
    }
  };

  // Continue Story
  const handleContinue = async (nextPrompt: string) => {
    if (!comicScript) return;
    setIsGeneratingMore(true);

    try {
        // 1. Prepare Context from last few panels
        const lastPanels = comicScript.panels.slice(-3);
        const context = lastPanels.map(p => `[${p.character}]: ${p.dialogue} (${p.description})`).join('\n');

        // 2. Generate Continuation Script
        const newScript = await generateComicScript(
            nextPrompt, 
            undefined, 
            undefined, 
            context, 
            comicScript.artStyle
        );

        // 3. Adjust IDs to ensure uniqueness and order
        const lastId = Math.max(...comicScript.panels.map(p => p.id));
        const newPanels = newScript.panels.map((p, idx) => ({
            ...p,
            id: lastId + idx + 1,
            isLoadingImage: true,
            imageData: undefined
        }));

        // 4. Update State
        setComicScript(prev => {
             if (!prev) return null;
             // Merge new character definitions if they exist, or keep old ones
             const updatedDefs = prev.characterDefinitions + (newScript.characterDefinitions ? `\n${newScript.characterDefinitions}` : "");
             
             return {
                ...prev,
                // We keep the original art style and definitions mostly, but could append details
                panels: [...prev.panels, ...newPanels]
             }
        });

        // 5. Generate Images for NEW panels only
        // Use the ORIGINAL character definitions to ensure consistency with the start of the story
        await generateImagesForPanels(newPanels, comicScript.artStyle, comicScript.characterDefinitions);

    } catch (e: any) {
        console.error("Failed to continue story", e);
        setError("Could not continue the story. Please try again.");
    } finally {
        setIsGeneratingMore(false);
    }
  };

  const generateImagesForPanels = async (panels: ComicPanel[], style: string, charDefs: string) => {
    const panelPromises = panels.map(async (panel) => {
      try {
        // Pass character definitions to image generator
        const base64Img = await generatePanelImage(panel, style, charDefs);
        
        setComicScript(prev => {
          if (!prev) return null;
          return {
            ...prev,
            panels: prev.panels.map(p => 
              p.id === panel.id 
                ? { ...p, imageData: base64Img, isLoadingImage: false } 
                : p
            )
          };
        });
      } catch (e) {
        console.error(`Failed to generate image for panel ${panel.id}`, e);
        setComicScript(prev => {
            if (!prev) return null;
            return {
              ...prev,
              panels: prev.panels.map(p => 
                p.id === panel.id 
                  ? { ...p, isLoadingImage: false } 
                  : p
              )
            };
          });
      }
    });

    await Promise.allSettled(panelPromises);
  };

  const handleRegeneratePanelImage = async (panelId: number) => {
    if (!comicScript) return;
    const panelToUpdate = comicScript.panels.find(p => p.id === panelId);
    if (!panelToUpdate) return;

    // Set loading state
    setComicScript(prev => {
        if (!prev) return null;
        return {
            ...prev,
            panels: prev.panels.map(p => p.id === panelId ? { ...p, isLoadingImage: true } : p)
        }
    });

    try {
        const base64Img = await generatePanelImage(panelToUpdate, comicScript.artStyle, comicScript.characterDefinitions);
        setComicScript(prev => {
            if (!prev) return null;
            return {
                ...prev,
                panels: prev.panels.map(p => 
                  p.id === panelId 
                    ? { ...p, imageData: base64Img, isLoadingImage: false } 
                    : p
                )
              };
        });
    } catch (error) {
         setComicScript(prev => {
            if (!prev) return null;
            return {
                ...prev,
                panels: prev.panels.map(p => p.id === panelId ? { ...p, isLoadingImage: false } : p)
            }
        });
    }
  };

  if (!hasStarted) {
    return <LandingPage onStart={() => setHasStarted(true)} />;
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      
      {/* Header */}
      <header className="p-6 md:p-8 flex items-center justify-between border-b border-slate-900 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setHasStarted(false)}>
          <div className="p-1.5 rounded-lg bg-slate-900 group-hover:bg-slate-800 transition-colors border border-slate-800">
             <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 group-hover:text-cyan-400 transition-colors">
            One-Shot
          </h1>
        </div>
        <div className="flex items-center gap-4">
            {comicScript && (
                <button 
                onClick={() => setComicScript(null)} 
                className="text-xs text-slate-500 hover:text-white transition-colors"
                >
                New Story
                </button>
            )}
            <div className="text-xs text-slate-500 font-medium border border-slate-800 px-3 py-1 rounded-full hidden md:block">
                Gemini 2.5
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col items-center">
        
        {/* Input Section - Hidden when viewing comic */}
        <div className={`w-full max-w-2xl transition-all duration-700 ${comicScript ? 'mb-8 opacity-0 h-0 overflow-hidden hidden' : 'flex-1 flex flex-col justify-center mb-0'}`}>
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative bg-slate-900 ring-1 ring-slate-800 rounded-2xl p-4 shadow-2xl">
              <div className="flex flex-col gap-4">
                {/* Text Input */}
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your comic idea... (e.g., 'A cyberpunk detective finds a flower in a digital wasteland')"
                  className="w-full bg-transparent border-none focus:ring-0 text-lg md:text-xl text-slate-200 placeholder:text-slate-600 resize-none h-24 md:h-20"
                  disabled={isScriptLoading}
                />

                {/* Controls */}
                <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                  <div className="flex items-center gap-2">
                    {/* File Upload Trigger */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-2 rounded-full transition-all ${
                        selectedFile 
                          ? 'bg-cyan-900/30 text-cyan-400 ring-1 ring-cyan-500/50' 
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                      disabled={isScriptLoading}
                      title="Add reference image"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    {selectedFile && (
                        <div className="flex items-center gap-2 bg-slate-800/50 pr-2 rounded-full overflow-hidden">
                             {previewUrl && <img src={previewUrl} alt="Preview" className="w-8 h-8 object-cover" />}
                             <span className="text-xs text-slate-400 max-w-[100px] truncate">{selectedFile.name}</span>
                             <button onClick={handleClearFile} className="text-slate-500 hover:text-red-400 ml-1">×</button>
                        </div>
                    )}
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isScriptLoading}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition-all shadow-lg ${
                      !prompt.trim() || isScriptLoading
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:scale-105 active:scale-95'
                    }`}
                  >
                    {isScriptLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Dreaming...</span>
                      </>
                    ) : (
                      <>
                        <span>Create</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-900/50 rounded-lg flex items-start gap-3 text-red-400 animate-in fade-in slide-in-from-top-4">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Results Section - Comic Book Viewer */}
        {comicScript && (
          <div className="w-full h-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <ComicBookViewer 
              panels={comicScript.panels}
              title={comicScript.title}
              artStyle={comicScript.artStyle}
              onRegenerateImage={handleRegeneratePanelImage}
              onContinue={handleContinue}
              isGeneratingMore={isGeneratingMore}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;