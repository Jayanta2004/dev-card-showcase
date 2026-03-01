import { CornerDownRight, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { useDocumentStore } from '../store/documentStore';
import type { SummaryResult } from '../types/schemas';

export function HistoryPanel() {
  const history = useDocumentStore((state) => state.history);
  const setSummary = useDocumentStore((state) => state.setSummary);
  const setStatus = useDocumentStore((state) => state.setStatus);

  const handleLoad = (item: SummaryResult) => {
    setSummary(item);
    setStatus('ready');
  };

  return (
    <section className="glass-panel p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="panel-kicker">History</p>
          <h2 className="panel-title mt-2 text-2xl">Recent summaries</h2>
        </div>
        <span className="panel-chip">{history.length} stored locally</span>
      </div>

      {history.length === 0 && (
        <p className="mt-6 rounded-3xl border border-dashed border-white/5 bg-white/5 px-5 py-6 text-sm text-slate-400">
          Generate your first summary to start building a personal archive.
        </p>
      )}

      {history.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {history.map((item) => (
            <motion.div
              whileHover={{ scale: 1.02 }}
              key={item.id}
              onClick={() => handleLoad(item)}
              className="group cursor-pointer rounded-2xl border border-white/5 bg-white/5 p-5 ring-1 ring-white/5 transition-all hover:bg-white/10 hover:ring-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10"
            >
              <div className="mb-3 flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-slate-500">
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                <span className="rounded bg-white/5 px-1.5 py-0.5 text-slate-400">{item.engine === 'abstractive' ? 'AI' : 'EXT'}</span>
              </div>
              
              <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-slate-200 transition-colors group-hover:text-white">
                {item.sourceTitle}
              </h3>
              
              <div className="mb-4 flex items-center gap-2 text-xs text-slate-400">
                <span>{item.stats.summaryWords} words</span>
                <span className="h-1 w-1 rounded-full bg-slate-600" />
                <span>{Math.round(item.stats.compression * 100)}% size</span>
              </div>

              <div className="flex flex-wrap gap-1.5 opacity-60 transition-opacity group-hover:opacity-100">
                {item.keywords.slice(0, 3).map((keyword) => (
                  <span key={keyword} className="rounded-md border border-white/5 bg-black/20 px-1.5 py-0.5 text-[10px] text-slate-400">
                    #{keyword}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <button
          onClick={() => {
            if (history[0]) {
              handleLoad(history[0]);
            }
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200"
        >
          <RotateCcw className="h-4 w-4" />
          Load most recent summary
        </button>
      )}
    </section>
  );
}
