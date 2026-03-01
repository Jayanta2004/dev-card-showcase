import { BookOpen, History, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { useDocumentStore } from '../store/documentStore';

export function InsightStrip() {
  const stats = useDocumentStore((state) => state.stats);
  const history = useDocumentStore((state) => state.history);

  const bestCompression = history.reduce((acc, summary) => Math.max(acc, summary.stats.compression), 0);

  const cards = [
    {
      label: 'Current manuscript',
      value: `${stats.words.toLocaleString()} words · ${stats.sentences} sentences`,
      helper: stats.words >= 1000 ? 'Ready for premium summaries' : 'Add more context for best accuracy',
      icon: <BookOpen className="h-5 w-5" />
    },
    {
      label: 'Summaries archived',
      value: `${history.length} saved`,
      helper: 'Stored locally for quick recall',
      icon: <History className="h-5 w-5" />
    },
    {
      label: 'Best compression run',
      value: bestCompression ? `${Math.round(bestCompression * 100)}%` : '—',
      helper: bestCompression ? 'Achieved on a past run' : 'Generate a summary to unlock metrics',
      icon: <Target className="h-5 w-5" />
    }
  ];

  return (
    <section className="glass-panel p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
        <div>
          <p className="panel-kicker">Session pulse</p>
          <h3 className="panel-title text-xl">Live stats</h3>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <motion.div
            key={card.label}
            whileHover={{ y: -2 }}
            className="stat-pill"
          >
            <div className="flex items-center gap-3 text-slate-200">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
                {card.icon}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">{card.label}</p>
                <p className="text-lg font-semibold text-white">{card.value}</p>
                <p className="text-xs text-slate-400">{card.helper}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
