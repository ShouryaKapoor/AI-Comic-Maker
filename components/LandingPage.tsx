import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Zap, Layers, Infinity, Wand2 } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 overflow-x-hidden font-sans relative">
      
      {/* --- BACKGROUND (Comic Grid) --- */}
      <ComicGridBackground />

      {/* Navigation (Overlay) */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold tracking-tighter text-xl backdrop-blur-md bg-slate-950/80 px-4 py-2 rounded-full border border-slate-800/50 shadow-lg">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>One-Shot</span>
        </div>
        <button 
          onClick={onStart}
          className="text-sm font-medium text-slate-300 hover:text-white transition-colors backdrop-blur-md bg-slate-950/80 px-5 py-2 rounded-full border border-slate-800/50 hover:bg-slate-800/80"
        >
          Launch Editor
        </button>
      </nav>

      {/* --- SECTION 1: HERO --- */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-32 z-10">
        
        <div className="text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8 flex justify-center"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-cyan-300 text-xs font-medium tracking-wider uppercase shadow-xl backdrop-blur-md">
              <Zap className="w-3 h-3" />
              Powered by Gemini 2.5
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white mb-8 leading-[0.9] drop-shadow-2xl"
          >
            Visual Stories, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-500 to-cyan-400 animate-shimmer bg-[length:200%_auto]">
              Unfolded.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-slate-300 text-lg md:text-2xl max-w-2xl mx-auto mb-12 leading-relaxed font-light"
          >
            Turn a single thought into a fully illustrated comic strip.
            <br className="hidden md:block" /> No drawing skills. No complex prompts. Just magic.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <button
              onClick={onStart}
              className="group relative inline-flex items-center gap-3 px-10 py-5 bg-cyan-400 text-slate-950 text-lg font-bold rounded-full hover:bg-cyan-300 hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_50px_-10px_rgba(34,211,238,0.4)]"
            >
              Start Creating
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 text-xs tracking-widest uppercase"
        >
          <span>Scroll to Read</span>
          <div className="w-px h-12 bg-gradient-to-b from-slate-500 to-transparent"></div>
        </motion.div>
      </section>

      {/* --- SECTION 2: SHOWCASE --- */}
      <section className="py-32 px-4 relative bg-slate-950/80 backdrop-blur-sm z-10 border-y border-slate-900/50">
        <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="mb-16 md:mb-24"
            >
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-white uppercase italic">Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Universe</span></h2>
                <p className="text-xl text-slate-400 max-w-xl">From neon-soaked alleys to dusty saloons. The AI adapts the art style to match your narrative.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Cyberpunk - Cyborg with Sword */}
                <ShowcaseCard 
                   delay={0}
                   image="https://images.unsplash.com/photo-1542779283-429940ce8aa8?q=80&w=1000&auto=format&fit=crop"
                   style="Cyberpunk"
                   caption="Protocol Omega activated. The unit unsheathes its carbon-fiber blade."
                />
                {/* Noir */}
                <ShowcaseCard 
                   delay={0.2}
                   image="https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=800&auto=format&fit=crop"
                   style="Noir"
                   caption="Rain washed away the clues, but the shadows still whispered the truth."
                />
                 {/* Fantasy */}
                 <ShowcaseCard 
                   delay={0.4}
                   image="https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=800&auto=format&fit=crop"
                   style="Dark Fantasy"
                   caption="The ancient runes began to glow. The gate to the Netherworld was open."
                />
            </div>
        </div>
      </section>

      {/* --- SECTION 3: HOW IT WORKS --- */}
      <section className="py-32 px-4 bg-slate-900/40 z-10 relative">
        <div className="max-w-7xl mx-auto">
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-24"
             >
                <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 text-white">The Creative Engine</h2>
                <p className="text-slate-400 text-xl">Zero friction. Infinite possibilities.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24 relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-12 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent z-0"></div>

                <FeatureStep 
                    icon={<Sparkles className="w-6 h-6" />}
                    title="1. Spark"
                    desc="Input a single idea. 'A time-traveling barista saves the world.'"
                    delay={0}
                />
                 <FeatureStep 
                    icon={<Layers className="w-6 h-6" />}
                    title="2. Direct"
                    desc="Our AI generates the script, panel layout, and consistent character art in seconds."
                    delay={0.2}
                />
                 <FeatureStep 
                    icon={<Infinity className="w-6 h-6" />}
                    title="3. Expand"
                    desc="Don't stop at one page. Continue the story panel by panel, forever."
                    delay={0.4}
                />
            </div>
        </div>
      </section>

      {/* --- SECTION 4: FINAL CTA --- */}
      <section className="min-h-[80vh] flex flex-col items-center justify-center px-4 relative overflow-hidden z-10">
        
         <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none"
         >
             <Wand2 className="w-[40vw] h-[40vw] text-cyan-500" />
         </motion.div>

         <div className="z-10 text-center max-w-4xl">
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-tight text-white">
                Your Story <br />
                <span className="text-cyan-400">Starts Now.</span>
            </h2>
            <button
              onClick={onStart}
              className="px-12 py-6 bg-slate-100 text-slate-950 text-xl font-bold rounded-full hover:bg-white transition-colors shadow-2xl hover:scale-105 active:scale-95 duration-200"
            >
              Launch App
            </button>
         </div>
      </section>

      <footer className="py-8 text-center text-slate-600 text-sm border-t border-slate-900 bg-slate-950 z-10 relative">
        <p>&copy; {new Date().getFullYear()} One-Shot Comic Maker. Powered by Google Gemini.</p>
      </footer>

    </div>
  );
};

// --- Subcomponents ---

const ShowcaseCard = ({ image, style, caption, delay }: { image: string, style: string, caption: string, delay: number }) => (
    <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay }}
        className="group relative bg-slate-900 border-[6px] border-white rounded-sm overflow-hidden shadow-2xl hover:-translate-y-2 transition-transform duration-500"
    >
        <div className="aspect-[2/3] overflow-hidden relative">
            <img src={image} alt={style} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
            
            {/* Comic Style Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />
            
            <div className="absolute bottom-0 left-0 w-full p-6">
                 <div className="inline-block px-3 py-1 bg-white text-black text-xs font-black uppercase tracking-widest mb-3 transform -skew-x-12">
                    {style}
                </div>
                <p className="text-white font-comic text-lg leading-snug drop-shadow-md">"{caption}"</p>
            </div>
        </div>
    </motion.div>
);

const FeatureStep = ({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay }}
        className="relative z-10 flex flex-col items-center text-center p-8 bg-slate-950 rounded-xl border border-slate-800 shadow-xl"
    >
        <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center text-cyan-400 mb-6 shadow-inner ring-1 ring-white/10">
            {icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 leading-relaxed font-light">
            {desc}
        </p>
    </motion.div>
);

const ComicGridBackground = () => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
             <svg width="100%" height="100%" className="absolute inset-0">
                <defs>
                    <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                        <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-700"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            
            {/* Large Panels Layout Overlay */}
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 gap-4 p-4 md:p-12">
                 {/* Decorative Panel Lines */}
                 <div className="col-span-12 row-span-2 border-b-2 border-slate-800/50"></div>
                 <div className="col-span-4 row-span-4 border-r-2 border-slate-800/50 hidden md:block"></div>
                 <div className="col-span-8 row-span-4"></div>
            </div>
        </div>
    );
};

export default LandingPage;