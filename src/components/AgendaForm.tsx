import React, { useEffect, useRef, useState } from 'react';
import {
  File,
  FileText,
  FileType2,
  Image as ImageIcon,
  MapPin,
  PlusCircle,
  Save,
  UploadCloud,
  X,
} from 'lucide-react';
import { UNIFORM_THEMES } from '../constants/uniformThemes';
import { AgendaAttachment, AgendaItem, DayKey, UniformTheme } from '../types/agenda';
import {
  detectFileCategory,
  formatBytes,
  getDayKeyFromDate,
  getDetectedDaySummary,
  getTodayIsoDate,
} from '../utils/agendaHelpers';

interface AgendaFormProps {
  activeTheme: UniformTheme;
  editingAgenda: AgendaItem | null;
  onDateThemeChange: (dayKey: DayKey) => void;
  onSaveAgenda: (
    payload: Omit<AgendaItem, 'id' | 'createdAt' | 'dayKey'>,
    editingId?: string
  ) => void;
  onCancelEdit: () => void;
  onNotify: (message: string, variant?: 'success' | 'error') => void;
  nameInputRef: React.RefObject<HTMLInputElement | null>;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const AgendaForm: React.FC<AgendaFormProps> = ({
  activeTheme,
  editingAgenda,
  onDateThemeChange,
  onSaveAgenda,
  onCancelEdit,
  onNotify,
  nameInputRef,
}) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState(getTodayIsoDate);
  const [time, setTime] = useState('09:00');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<AgendaAttachment | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editingAgenda) {
      setName(editingAgenda.name);
      setDate(editingAgenda.date);
      setTime(editingAgenda.time);
      setLocation(editingAgenda.location);
      setNotes(editingAgenda.notes ?? '');
      setSelectedFile(editingAgenda.file);
      onDateThemeChange(editingAgenda.dayKey);
    }
  }, [editingAgenda, onDateThemeChange]);

  const detectedSummary = getDetectedDaySummary(date);

  const handleDateChange = (nextDate: string) => {
    setDate(nextDate);
    if (nextDate) {
      onDateThemeChange(getDayKeyFromDate(nextDate));
    }
  };

  const processSelectedFile = (file: File | undefined) => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      onNotify('Ukuran file terlalu besar. Maksimal 10 MB.', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = typeof ev.target?.result === 'string' ? ev.target.result : undefined;
      const category = detectFileCategory(file);
      setSelectedFile({
        name: file.name,
        size: formatBytes(file.size),
        type: file.type,
        category,
        dataUrl: result,
      });
    };
    reader.onerror = () => {
      onNotify('Gagal membaca file lampiran.', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedLocation = location.trim();

    if (!trimmedName || !date || !time || !trimmedLocation) {
      onNotify('Mohon lengkapi seluruh kolom wajib agenda rapat.', 'error');
      return;
    }

    onSaveAgenda(
      {
        name: trimmedName,
        date,
        time,
        location: trimmedLocation,
        notes: notes.trim() || undefined,
        file: selectedFile,
      },
      editingAgenda?.id
    );

    setName('');
    setTime('09:00');
    setLocation('');
    setNotes('');
    handleClearFile();
  };

  const handleCancel = () => {
    setName('');
    setDate(getTodayIsoDate());
    setTime('09:00');
    setLocation('');
    setNotes('');
    handleClearFile();
    onCancelEdit();
  };

  const renderFileIcon = (file: AgendaAttachment) => {
    if (file.category === 'image') return <ImageIcon className="w-5 h-5 text-emerald-700" />;
    if (file.category === 'pdf') return <FileText className="w-5 h-5 text-red-700" />;
    if (file.category === 'word') return <FileType2 className="w-5 h-5 text-blue-700" />;
    return <File className="w-5 h-5 text-slate-600" />;
  };

  const detectedTheme = UNIFORM_THEMES[detectedSummary.dayKey];

  return (
    <section
      aria-labelledby="form-agenda-heading"
      className="bg-white rounded-xl border border-slate-200 overflow-hidden lg:sticky lg:top-6"
    >
      <div
        className="px-6 py-4 text-white flex items-center justify-between gap-4 transition-colors duration-200"
        style={{ backgroundColor: activeTheme.primaryBg }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <PlusCircle className="w-5 h-5 shrink-0" />
          <h2 id="form-agenda-heading" className="font-semibold text-base sm:text-lg truncate">
            {editingAgenda ? 'Ubah Agenda Rapat' : 'Tambah Agenda Rapat'}
          </h2>
        </div>
        <span className="text-xs font-medium text-white/85 whitespace-nowrap shrink-0">
          Form Kedinasan
        </span>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label htmlFor="agendaName" className="block text-sm font-semibold text-slate-800 mb-1.5">
            Nama Agenda Rapat <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <FileText className="w-4 h-4" />
            </div>
            <input
              ref={nameInputRef}
              id="agendaName"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Rapat Koordinasi Evaluasi Anggaran Triwulan IV"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="agendaDate" className="block text-sm font-semibold text-slate-800 mb-1.5">
              Tanggal Rapat <span className="text-red-600">*</span>
            </label>
            <input
              id="agendaDate"
              type="date"
              required
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono tabular-nums text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-colors"
            />
            <p className="text-xs text-slate-600 mt-1.5 leading-snug">
              {detectedSummary.isWeekend ? (
                <>
                  Hari <strong className="text-amber-800">{detectedSummary.dayName}</strong> (Akhir
                  pekan · memakai tema Senin Khaki)
                </>
              ) : (
                <>
                  <strong className="text-slate-900">{detectedSummary.dayName}</strong>
                  <span aria-hidden="true"> · </span>
                  <span style={{ color: detectedTheme.accentText }} className="font-medium">
                    {detectedSummary.uniformTitle}
                  </span>
                </>
              )}
            </p>
          </div>

          <div>
            <label htmlFor="agendaTime" className="block text-sm font-semibold text-slate-800 mb-1.5">
              Jam / Waktu <span className="text-red-600">*</span>
            </label>
            <input
              id="agendaTime"
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono tabular-nums text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-colors"
            />
            <p className="text-xs text-slate-500 mt-1.5">Waktu Indonesia Barat (WIB)</p>
          </div>
        </div>

        <div>
          <label
            htmlFor="agendaLocation"
            className="block text-sm font-semibold text-slate-800 mb-1.5"
          >
            Tempat / Ruang Rapat <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              id="agendaLocation"
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Contoh: Ruang Rapat Utama Lt. 2 / Zoom Meeting"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        <div>
          <label htmlFor="agendaNotes" className="block text-sm font-semibold text-slate-800 mb-1.5">
            Catatan / Poin Pembahasan{' '}
            <span className="text-xs font-normal text-slate-500">(Opsional)</span>
          </label>
          <textarea
            id="agendaNotes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan singkat peserta, perangkat yang perlu disiapkan, atau tautan daring."
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-colors resize-y"
          />
        </div>

        <div>
          <label htmlFor="agendaFile" className="block text-sm font-semibold text-slate-800 mb-1.5">
            Lampiran Dokumen / Undangan{' '}
            <span className="text-xs font-normal text-slate-500">(Foto, Word, PDF)</span>
          </label>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              processSelectedFile(e.dataTransfer.files?.[0]);
            }}
            className={`relative border border-dashed rounded-lg p-4 transition-colors ${
              isDragging
                ? 'border-slate-800 bg-slate-100'
                : 'border-slate-300 bg-slate-50/70 hover:bg-slate-50'
            }`}
          >
            {!selectedFile ? (
              <label
                htmlFor="agendaFile"
                className="flex flex-col items-center justify-center text-center py-2 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 mb-2">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-800">
                  Pilih atau seret file ke area ini
                </span>
                <span className="text-xs text-slate-500 mt-0.5">
                  JPG, PNG, PDF, DOC, DOCX · Maksimal 10 MB
                </span>
              </label>
            ) : (
              <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg p-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-md bg-slate-50 border border-slate-200 shrink-0">
                    {renderFileIcon(selectedFile)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-500 font-mono tabular-nums">
                      {selectedFile.size} · {selectedFile.category.toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearFile}
                  aria-label="Hapus lampiran terpilih"
                  className="p-2 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              id="agendaFile"
              type="file"
              accept="image/*,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => processSelectedFile(e.target.files?.[0])}
              className="sr-only"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center gap-2.5">
          <button
            type="submit"
            className="flex-1 py-2.5 px-4 text-white font-semibold rounded-lg transition-opacity hover:opacity-95 active:scale-[0.99] flex items-center justify-center gap-2 text-sm whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 cursor-pointer"
            style={{ backgroundColor: activeTheme.primaryBg }}
          >
            <Save className="w-4 h-4 shrink-0" />
            <span>{editingAgenda ? 'Perbarui Agenda' : 'Simpan Agenda Rapat'}</span>
          </button>

          {editingAgenda && (
            <button
              type="button"
              onClick={handleCancel}
              className="py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-sm whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 cursor-pointer"
            >
              Batal
            </button>
          )}
        </div>
      </form>
    </section>
  );
};
