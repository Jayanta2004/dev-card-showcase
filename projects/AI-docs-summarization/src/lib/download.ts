import { jsPDF } from 'jspdf';
import fileDownload from 'js-file-download';

export function downloadAsTxt(content: string, filename: string) {
  const safeName = sanitizeFilename(filename);
  fileDownload(content, `${safeName}.txt`);
}

export function downloadAsPdf(content: string, filename: string) {
  const safeName = sanitizeFilename(filename);
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margins = { x: 48, y: 60 };
  const maxWidth = 515;
  const lines = doc.splitTextToSize(content, maxWidth);
  let cursorY = margins.y;

  lines.forEach((line) => {
    if (cursorY > 770) {
      doc.addPage();
      cursorY = margins.y;
    }
    doc.text(line, margins.x, cursorY);
    cursorY += 18;
  });

  doc.save(`${safeName}.pdf`);
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-z0-9-_]/gi, '-').substring(0, 60) || 'summary';
}
