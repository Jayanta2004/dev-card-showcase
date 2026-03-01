import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { FileText, FileType2, Loader2, UploadCloud } from 'lucide-react';
import { useDocumentStore } from '../store/documentStore';
import { extractPdfText } from '../lib/pdf';
import { extractDocxText } from '../lib/docx';

const MIN_WORDS = 1000;

export function DocumentInput() {
  const rawText = useDocumentStore((state) => state.rawText);
  const stats = useDocumentStore((state) => state.stats);
  const status = useDocumentStore((state) => state.status);
  const updateDocument = useDocumentStore((state) => state.updateDocument);

  const [isDragging, setIsDragging] = useState(false);
  const [processingFile, setProcessingFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (value: string) => {
    updateDocument({ text: value });
  };

  const handleFiles = useCallback(
    async (file?: File) => {
      if (!file) return;
      setProcessingFile(file.name);
      try {
        const extension = file.name.split('.').pop()?.toLowerCase();
        let textContent = '';

        if (extension === 'pdf') {
          textContent = await extractPdfText(file);
        } else if (extension === 'docx') {
          textContent = await extractDocxText(file);
        } else if (extension === 'doc') {
          toast.error('Legacy .doc files are not supported. Please convert to DOCX first.');
          return;
        } else if (extension === 'txt' || extension === 'md') {
          textContent = await file.text();
        } else {
          toast.error('Unsupported file type. Please upload PDF, DOCX, or TXT.');
          return;
        }

        if (!textContent) {
          toast.error('No readable text found in the document.');
          return;
        }

        updateDocument({ text: textContent, title: file.name });
        toast.success(`Imported ${file.name}`);
      } catch (error) {
        console.error(error);
        toast.error('Unable to parse the uploaded file');
      } finally {
        setProcessingFile(null);
      }
    },
    [updateDocument]
  );

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    void handleFiles(file);
  };

  const progress = Math.min((stats.words / MIN_WORDS) * 100, 100);
  const requirementMet = stats.words >= MIN_WORDS;

  return (
    <div className="glass-panel p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="panel-kicker">Intake</p>
          <h2 className="panel-title mt-2 text-2xl">Paste or drop your source material</h2>
          <p className="panel-subtitle mt-1 text-sm">
            Long-form reports (1k+ words) yield the most faithful summaries. Drop research decks, financials or
            legal documents right here.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-slate-400">Word count</p>
          <p className={`text-3xl font-semibold ${requirementMet ? 'text-emerald-300' : 'text-amber-300'}`}>
            {stats.words.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500">Target 1,000+ words</p>
        </div>
      </div>

      <div className="panel-divider" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-4">
          <textarea
            value={rawText}
            onChange={(event) => handleTextChange(event.target.value)}
            placeholder="Paste raw text, research notes, financial reports, transcripts..."
            className="w-full min-h-[220px] rounded-2xl border border-white/5 bg-white/5 px-5 py-4 text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
          />
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Progress to 1,000 words</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${requirementMet ? 'bg-emerald-400' : 'bg-amber-400'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex h-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 px-4 text-center transition-colors ${
            isDragging ? 'bg-white/10' : 'bg-white/5'
          }`}
        >
          {processingFile ? (
            <div className="flex flex-col items-center gap-3 text-slate-300">
              <Loader2 className="h-6 w-6 animate-spin text-purple-300" />
              <p className="text-sm">Parsing {processingFile}...</p>
            </div>
          ) : (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-purple-200">
                <UploadCloud className="h-7 w-7" />
              </div>
              <p className="mt-3 text-base font-medium text-white">Drop file here</p>
              <p className="text-sm text-slate-400">PDF, DOCX, TXT</p>
            </>
          )}
          <div className="mt-6 flex w-full flex-col gap-2">
            <Badge icon={<FileText className="h-3 w-3" />}>Up to 200 pages</Badge>
            <Badge icon={<FileType2 className="h-3 w-3" />}>Max 25 MB (PDF/DOCX)</Badge>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt,.md"
          className="hidden" 
          onChange={(event) => {
            if (event.target.files?.[0]) {
               handleFiles(event.target.files[0]);
               event.target.value = ''; // Reset
            }
          }}
        />
      </div>{/* End grid */}

      <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Sentences" value={stats.sentences} />
        <Stat label="Characters" value={stats.characters.toLocaleString()} />
        <Stat label="Read Time" value={`~${Math.ceil(stats.readingMinutes)} min`} />
        <Stat label="System Status" value={status === 'processing' ? 'Processing' : 'Ready'} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-white/5 py-3 text-center ring-1 ring-white/5 transition hover:bg-white/10 sm:items-start sm:px-4 sm:text-left">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="font-mono text-lg font-medium text-slate-200">{value}</p>
    </div>
  );
}

function Badge({ children, icon }: { children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/5 bg-white/5 py-2 text-[10px] text-slate-400">
      {icon}
      <span>{children}</span>
    </div>
  );
}
