import { Toaster } from 'sonner';
import { AppHeader } from './components/AppHeader';
import { DocumentInput } from './components/DocumentInput';
import { ControlPanel } from './components/ControlPanel';
import { SummaryPanel } from './components/SummaryPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { InsightStrip } from './components/InsightStrip';
import { AmbientBackground } from './components/AmbientBackground';

export default function App() {
  return (
    <>
      <Toaster richColors position="top-center" closeButton />
      <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
        <AmbientBackground />
        <div className="relative z-10">
          <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 md:px-6 lg:px-8">
            <AppHeader />
            <div className="grid gap-6 lg:grid-cols-12">
              <section className="space-y-6 lg:col-span-7 xl:col-span-8">
                <DocumentInput />
                <ControlPanel />
              </section>
              <section className="lg:col-span-5 xl:col-span-4">
                <SummaryPanel />
              </section>
            </div>
            <InsightStrip />
            <HistoryPanel />
          </div>
        </div>
      </div>
    </>
  );
}
