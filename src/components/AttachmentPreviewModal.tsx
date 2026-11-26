import React, { useEffect } from 'react';
import { Download, FileCheck, FileType2, Paperclip, X } from 'lucide-react';
import { AgendaItem } from '../types/agenda';

interface AttachmentPreviewModalProps {
  agenda: AgendaItem | null;
  onClose: () => void;
}

export const AttachmentPreviewModal: React.FC<AttachmentPreviewModalProps> = ({
  agenda,
  onClose,
}) => {
  useEffect(() => {
    if (!agenda) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [agenda, onClose]);

  if (!agenda || !agenda.file) return null;

  const { file } = agenda;

  return (
    <div
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-attachment-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50">
          <div className="flex items-center gap-2.5 min-w-0">
            <Paperclip className="w-5 h-5 text-slate-600 shrink-0" />
            <h3
              id="modal-attachment-title"
              className="font-semibold text-slate-900 truncate text-sm sm:text-base"
            >
              {file.name}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!file.isSample && file.dataUrl && (
              <a
                href={file.dataUrl}
                download={file.name}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>Unduh</span>
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup pratinjau dokumen"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-grow flex items-center justify-center bg-slate-100 min-h-[320px]">
          {file.isSample ? (
            <div className="text-center max-w-md space-y-3 bg-white p-7 rounded-xl border border-slate-200">
              <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 mx-auto flex items-center justify-center">
                <FileCheck className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-slate-900 text-base">{file.name}</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Ini adalah contoh lampiran bawaan ({file.size}). Unggah file Foto, PDF, atau Word
                (.doc/.docx) melalui formulir agenda untuk melihat pratinjau langsung dan
                mengunduhnya.
              </p>
            </div>
          ) : file.category === 'image' && file.dataUrl ? (
            <img
              src={file.dataUrl}
              alt={file.name}
              referrerPolicy="no-referrer"
              className="max-h-[65vh] w-auto rounded-lg border border-slate-200 object-contain bg-white"
            />
          ) : file.category === 'pdf' && file.dataUrl ? (
            <iframe
              src={file.dataUrl}
              title={`Pratinjau ${file.name}`}
              className="w-full h-[65vh] rounded-lg border border-slate-300 bg-white"
            />
          ) : (
            <div className="text-center max-w-md space-y-3 bg-white p-8 rounded-xl border border-slate-200">
              <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 mx-auto flex items-center justify-center">
                <FileType2 className="w-7 h-7" />
              </div>
              <h4 className="font-semibold text-slate-900 text-base">{file.name}</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Dokumen Microsoft Word ({file.size}) siap diunduh. Klik tombol{' '}
                <strong>Unduh</strong> di kanan atas untuk membuka dokumen.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
