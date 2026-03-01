import { ClipboardCheck, Download, FileText, Loader2, PercentCircle, Sparkles, TimerReset } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useDocumentStore } from '../store/documentStore';
import { downloadAsPdf, downloadAsTxt } from '../lib/download';
import { toast } from 'sonner';

export function SummaryPanel() {
  const status = useDocumentStore((state) => state.status);
  const summary = useDocumentStore((state) => state.summary);
  const stats = useDocumentStore((state) => state.stats);
  const error = useDocumentStore((state) => state.error);

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!summary?.summary) return;
    try {
      await navigator.clipboard.writeText(summary.summary);
      setCopied(true);
      toast.success('Summary copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (clipError) {
      console.error(clipError);
      toast.error('Clipboard permissions blocked');
    }
  };

  const handleDownload = (format: 'txt' | 'pdf') => {
    if (!summary) return;
    if (format === 'txt') {
      downloadAsTxt(summary.summary, summary.sourceTitle);
    } else {
      downloadAsPdf(summary.summary, summary.sourceTitle);
    }
    toast.success(`Summary exported as ${format.toUpperCase()}`);
  };

  return (
    <aside className="glass-panel flex h-full flex-col p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="panel-kicker">Output</p>
          <h2 className="panel-title mt-2 text-2xl">Summary digest</h2>
          <p className="panel-subtitle text-sm">
            Compression, highlights, keywords and exports refresh when a run completes.
          </p>
        </div>
        <span className="panel-chip capitalize">{summary ? summary.engine.replace(/-/g, ' ') : 'Awaiting run'}</span>
      </div>

      <div className="panel-divider" />

      <div className="flex-1 overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 relative">
        <div className="absolute inset-0 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {status === 'processing' && (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-slate-300">
              <Loader2 className="h-8 w-8 animate-spin text-purple-300" />
              <p className="text-base font-medium">Summarizer is distilling your document…</p>
              <p className="text-xs text-slate-500">Large PDFs can take a little longer as we chunk and paraphrase using local AI.</p>
            </div>
          )}
          {status !== 'processing' && !summary && !error && (
            <Placeholder />
          )}
          {status !== 'processing' && error && !summary && (
            <div className="flex h-full items-center justify-center text-sm text-rose-300 px-4 text-center">
              {error}
            </div>
          )}
          {summary && status !== 'processing' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 border-b border-white/5 pb-3">
                <span>{new Date(summary.createdAt).toLocaleTimeString()}</span>
                <span className="font-medium text-slate-300 truncate max-w-[200px]" title={summary.sourceTitle}>{summary.sourceTitle}</span>
              </div>
              
              <div className="space-y-4 text-sm leading-relaxed text-slate-200">
                {summary.summary.split('\n').filter(Boolean).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

             {/* Highlights inline */}
             {summary.highlights && summary.highlights.length > 0 && (
                <div className="mt-6 border-t border-purple-500/20 pt-4">
                  <div className="mb-3 flex items-center gap-2 text-purple-300">
                    <Sparkles className="h-4 w-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wide">Key Highlights</h4>
                  </div>
                  <ul className="space-y-3">
                    {summary.highlights.map((h, i) => (
                      <li key={i} className="relative rounded-lg bg-purple-500/5 px-4 py-3 text-sm text-purple-100 ring-1 ring-purple-500/20">
                         {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
        <ActionButton icon={<FileText className="h-4 w-4" />} onClick={() => handleDownload('txt')} disabled={!summary}>
          TXT
        </ActionButton>
        <ActionButton icon={<Download className="h-4 w-4" />} onClick={() => handleDownload('pdf')} disabled={!summary}>
          PDF
        </ActionButton>
        <ActionButton icon={<ClipboardCheck className="h-4 w-4" />} onClick={handleCopy} disabled={!summary}>
          {copied ? 'Copied' : 'Copy'}
        </ActionButton>
      </div>

      <div className="mt-6 border-t border-white/5 pt-4">
        {summary && summary.keywords.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-wider text-slate-500">Keywords</p>
            <div className="flex flex-wrap gap-2">
              {summary.keywords.slice(0, 10).map((keyword) => (
                <span key={keyword} className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium text-slate-300">
                  #{keyword}
                </span>
              ))}
              {summary.keywords.length > 10 && (
                <span className="text-[10px] text-slate-500 self-center">+{summary.keywords.length - 10} more</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <MetricCard
          label="Compression"
          value={`${summary ? Math.round(summary.stats.compression * 100) : 0}%`}
          icon={<PercentCircle className="h-5 w-5" />}
        />
        <MetricCard
          label="Time saved"
          value={summary ? `~${summary.stats.readingMinutesSaved} min` : `${Math.max(stats.readingMinutes - 2, 0)} min`}
          icon={<TimerReset className="h-5 w-5" />}
        />
      </div>
    </aside>
  );
}

function Placeholder() {
  return (
    <div className="h-full text-sm leading-relaxed text-slate-400">
      <p className="rounded-3xl border border-white/5 bg-white/5 px-4 py-3">
        Summaries will appear here. Configure the controls and press Generate once your document meets the
        minimum length.
      </p>
      <p className="mt-4 rounded-3xl border border-white/5 bg-white/5 px-4 py-3">
        Try mixing extractive and abstractive passes to compare fidelity versus readability.
      </p>
    </div>
  );
}

function ActionButton({
  children,
  icon,
  disabled,
  onClick
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {icon}
      {children}
    </button>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-3xl border border-white/5 bg-white/5 px-4 py-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-lg font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}
