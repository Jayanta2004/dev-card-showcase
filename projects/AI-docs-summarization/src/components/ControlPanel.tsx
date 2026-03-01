import { useMemo, useState } from 'react';
import { BrainCircuit, Sparkles, Zap } from 'lucide-react';
import { useDocumentStore } from '../store/documentStore';
import { useSummarizer } from '../hooks/useSummarizer';
import type { SummaryConfig, SummaryLength, SummaryMode } from '../types/schemas';

const PRESETS: SummaryLength[] = ['short', 'medium', 'detailed', 'custom'];
const LANGUAGES = ['english', 'spanish', 'french', 'german'];

const EngineButtons = ({ mode, setMode }: { mode: 'extractive' | 'abstractive'; setMode: (m: 'extractive' | 'abstractive') => void }) => (
  <div className="flex w-full gap-2 rounded-xl bg-white/5 p-1">
    {(['extractive', 'abstractive'] as const).map((m) => (
      <button
        key={m}
        onClick={() => setMode(m)}
        className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize transition-all ${
          mode === m ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        {m}
      </button>
    ))}
  </div>
);

const ToneGrid = ({ tone, setTone }: { tone: string; setTone: (t: any) => void }) => (
  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
    {(['neutral', 'exec.', 'bullet'] as const).map((t, idx) => {
      const fullLabel = ['Neutral', 'Executive', 'Bullet'][idx];
      const val = ['neutral', 'executive', 'bullet'][idx];
      return (
        <button
          key={val}
          onClick={() => setTone(val)}
          title={fullLabel}
          className={`rounded-xl border px-2 py-2 text-sm font-medium transition-all ${
            tone === val
              ? 'border-purple-500/50 bg-purple-500/10 text-purple-200'
              : 'border-white/10 text-slate-400 hover:bg-white/5 hover:text-slate-200'
          }`}
        >
          {fullLabel}
        </button>
      );
    })}
  </div>
);

export function ControlPanel() {
  const stats = useDocumentStore((state) => state.stats);
  const status = useDocumentStore((state) => state.status);
  const summary = useDocumentStore((state) => state.summary);
  const { runSummarization } = useSummarizer();

  const [length, setLength] = useState<SummaryLength>('medium');
  const [mode, setMode] = useState<SummaryMode>('extractive');
  const [tone, setTone] = useState<SummaryConfig['tone']>('neutral');
  const [language, setLanguage] = useState('english');
  const [highlight, setHighlight] = useState(true);
  const [customPercentage, setCustomPercentage] = useState(0.18);

  // ... (keep existing summaryPercentage logic) 
  const summaryPercentage = useMemo(() => {
    if (length !== 'custom') {
      return length === 'short' ? 0.12 : length === 'medium' ? 0.2 : 0.35;
    }
    return customPercentage;
  }, [length, customPercentage]);
  
  const disabled = status === 'processing' || stats.words < 200;

  const handleGenerate = () => {
    // ... (keep logic)
    const config: SummaryConfig = {
      length,
      summaryPercentage,
      mode,
      tone,
      language,
      highlight
    };
    void runSummarization(config);
  };

  return (
    <div className="glass-panel p-6">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 border-b border-white/5 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-purple-300">
              <Zap className="h-3 w-3" />
            </span>
            <p className="font-mono text-xs font-medium uppercase tracking-wider text-purple-300">Orchestration</p>
          </div>
          <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">Summary Controls</h2>
        </div>
        
        {/* Engine Status Badge */}
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2">
          <div className={`h-2 w-2 rounded-full ${status === 'processing' ? 'animate-pulse bg-yellow-400' : 'bg-emerald-400'}`} />
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Current Engine</p>
            <p className="text-xs font-medium text-slate-200">
              {summary?.engine === 'abstractive' ? 'DistilBART' : 'TextRank++'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Card 1: Length */}
        <div className="flex flex-col gap-4 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
          <div className="flex items-center gap-3 text-slate-200">
            <Sparkles className="h-5 w-5 text-sky-400" />
            <h3 className="font-medium">Length</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-2">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => setLength(preset)}
                className={`rounded-lg px-3 py-2 text-sm capitalize transition-all ${
                  length === preset
                    ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/50'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          
          {length === 'custom' && (
            <div className="mt-auto pt-4">
               <div className="mb-2 flex justify-between text-xs text-slate-400">
                 <span>Compact</span>
                 <span>Detailed</span>
               </div>
               <input
                type="range"
                min={0.1}
                max={0.5}
                step={0.05}
                value={customPercentage}
                onChange={(e) => setCustomPercentage(parseFloat(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-sky-400"
              />
               <div className="mt-2 text-center text-xs font-medium text-sky-400">
                 Target: ~{Math.round(stats.words * summaryPercentage)} words
               </div>
            </div>
          )}
        </div>

        {/* Card 2: Engine */}
        <div className="flex flex-col gap-4 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
          <div className="flex items-center gap-3 text-slate-200">
            <BrainCircuit className="h-5 w-5 text-purple-400" />
            <h3 className="font-medium">Model</h3>
          </div>
          
          <EngineButtons mode={mode} setMode={setMode} />
          
          <p className="text-xs leading-relaxed text-slate-400">
            {mode === 'extractive' 
              ? 'Selects the most statistically significant sentences from the text verbatim.'
              : 'Generates new sentences to capture the essence of the text (Experimental).'}
          </p>
        </div>

        {/* Card 3: Output */}
        <div className="flex flex-col gap-4 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
          <div className="flex items-center gap-3 text-slate-200">
            <Zap className="h-5 w-5 text-amber-400" />
            <h3 className="font-medium">Output Style</h3>
          </div>
          
          <ToneGrid tone={tone} setTone={setTone} />

          <div className="mt-auto space-y-3 pt-2">
            <label className="flex cursor-pointer items-center justify-between rounded-lg bg-white/5 px-3 py-2 transition hover:bg-white/10">
              <span className="text-sm text-slate-300">Highlight Key Points</span>
              <input
                type="checkbox"
                checked={highlight}
                onChange={(e) => setHighlight(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-black/20 text-purple-500 focus:ring-purple-500/20"
              />
            </label>
            
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-lg border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-300 focus:border-purple-500/50 focus:ring-purple-500/20"
            >
              {LANGUAGES.map(l => (
                <option key={l} value={l} className="bg-slate-900">{l.charAt(0).toUpperCase() + l.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={disabled}
        className="group relative mt-6 w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[1px] shadow-lg transition-all hover:shadow-purple-500/25 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <div className="relative flex items-center justify-center gap-2 rounded-xl bg-slate-950/50 px-6 py-4 transition-all group-hover:bg-transparent">
          <Sparkles className="h-5 w-5 text-white" />
          <span className="font-semibold text-white">
            {status === 'processing' ? 'Generating Summary...' : 'Generate New Summary'}
          </span>
        </div>
      </button>
    </div>
  );
}
