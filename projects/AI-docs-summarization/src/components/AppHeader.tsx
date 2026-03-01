import { Brain, Sparkles, UploadCloud } from 'lucide-react';
import { motion } from 'motion/react';

export function AppHeader() {
  return (
    <header className="glass-panel relative overflow-hidden px-6 py-8 sm:px-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        <div className="panel-kicker flex items-center gap-3 text-xs text-slate-300">
          <Sparkles className="h-4 w-4 text-purple-300" />
          <span>Day 148</span>
          <span className="text-slate-500">/</span>
          <span>AI Document Summarizer</span>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-purple-200">
            <Brain className="h-10 w-10" />
          </div>
          <div>
            <h1 className="panel-title text-3xl sm:text-4xl">
              Summaries designed for dense, long-form content.
            </h1>
            <p className="panel-subtitle mt-3 max-w-3xl text-base">
              Paste text or drop in PDF/DOCX files. The dual engine extracts critical context and delivers
              clean briefs, highlights, and export-ready files in one workflow.
            </p>
          </div>
        </div>
        <div className="grid gap-4 text-sm text-slate-300 md:grid-cols-3">
          <StatPill label="Inputs" value="Paste • PDF • DOCX" icon={<UploadCloud className="h-5 w-5" />} />
          <StatPill label="Engines" value="TextRank++ / DistilBART" icon={<Sparkles className="h-5 w-5" />} />
          <StatPill label="Outputs" value="Briefs • Highlights • Exports" icon={<Brain className="h-5 w-5" />} />
        </div>
      </motion.div>
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-72 opacity-40 lg:block">
        <div className="h-full w-full bg-gradient-to-br from-purple-500/40 via-sky-400/20 to-transparent blur-3xl" />
      </div>
    </header>
  );
}

function StatPill({
  label,
  value,
  icon
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-sm font-medium text-white">{value}</p>
      </div>
    </div>
  );
}
