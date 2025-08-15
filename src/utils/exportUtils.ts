// utils/exportUtils.ts
import { saveAs } from 'file-saver';

export const exportAsText = (content: string, filename = 'lyrics.txt') => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, filename);
};

export const exportAsDoc = (content: string, filename = 'lyrics.doc') => {
  const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
      <head><meta charset='utf-8'><title>Export</title></head>
      <body>${content.replace(/\n/g, '<br/>')}</body>
    </html>`;
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  saveAs(blob, filename);
};

export const exportAsPdf = (content: string, filename = 'lyrics.pdf') => {
  const blob = new Blob([content], { type: 'application/pdf' });
  saveAs(blob, filename);
};