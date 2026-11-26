import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarCheck2,
  CalendarX,
  CheckCircle2,
  AlertCircle,
  Search,
  Shirt,
  X,
} from 'lucide-react';
import { AgendaCard } from './components/AgendaCard';
import { AgendaForm } from './components/AgendaForm';
import { AttachmentPreviewModal } from './components/AttachmentPreviewModal';
import { UniformGuideStrip } from './components/UniformGuideStrip';
import { DAY_ORDER, UNIFORM_THEMES } from './constants/uniformThemes';
import { AgendaItem, DayKey } from './types/agenda';
import {
  getDayKeyFromDate,
  getInitialAgendas,
  getTodayIsoDate,
  saveAgendasToStorage,
} from './utils/agendaHelpers';

interface ToastState {
  message: string;
  variant: 'success' | 'error';
}

export default function App() {
  const [agendas, setAgendas] = useState<AgendaItem[]>(() => getInitialAgendas());
  const [activeThemeKey, setActiveThemeKey] = useState<DayKey>(() =>
    getDayKeyFromDate(getTodayIsoDate())
  );
  const [filterDay, setFilterDay] = useState<'all' | DayKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingAgenda, setEditingAgenda] = useState<AgendaItem | null>(null);
  const [previewAgenda, setPreviewAgenda] = useState<AgendaItem | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [clockText, setClockText] = useState('');

  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const activeTheme = UNIFORM_THEMES[activeThemeKey];

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const formatted = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setClockText(`${formatted} WIB`);
    };

    updateClock();
    const intervalId = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const showToast = useCallback((message: string, variant: 'success' | 'error' = 'success') => {
    setToast({ message, variant });
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const persistAgendas = useCallback(
    (nextAgendas: AgendaItem[]) => {
      setAgendas(nextAgendas);
      const ok = saveAgendasToStorage(nextAgendas);
      if (!ok) {
        showToast(
          'Penyimpanan browser penuh untuk lampiran besar; data tetap aktif pada sesi ini.',
          'error'
        );
      }
    },
    [showToast]
  );

  const handleSaveAgenda = useCallback(
    (payload: Omit<AgendaItem, 'id' | 'createdAt' | 'dayKey'>, editingId?: string) => {
      const computedDayKey = getDayKeyFromDate(payload.date);

      if (editingId) {
        const updated = agendas.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...payload,
                dayKey: computedDayKey,
              }
            : item
        );
        persistAgendas(updated);
        setEditingAgenda(null);
        setActiveThemeKey(computedDayKey);
        showToast('Agenda rapat kedinasan berhasil diperbarui.');
        return;
      }

      const newAgenda: AgendaItem = {
        id: `agenda-${Date.now()}`,
        ...payload,
        dayKey: computedDayKey,
        createdAt: Date.now(),
      };

      persistAgendas([newAgenda, ...agendas]);
      setActiveThemeKey(computedDayKey);
      showToast('Agenda rapat kedinasan berhasil ditambahkan.');
    },
    [agendas, persistAgendas, showToast]
  );

  const handleDeleteAgenda = useCallback(
    (id: string) => {
      const next = agendas.filter((item) => item.id !== id);
      persistAgendas(next);
      if (editingAgenda?.id === id) {
        setEditingAgenda(null);
      }
      showToast('Agenda rapat telah dihapus.');
    },
    [agendas, editingAgenda, persistAgendas, showToast]
  );

  const handleEditAgenda = useCallback((agenda: AgendaItem) => {
    setEditingAgenda(agenda);
    setActiveThemeKey(agenda.dayKey);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.setTimeout(() => {
      nameInputRef.current?.focus();
    }, 180);
  }, []);

  const handleFocusCreateForm = () => {
    setEditingAgenda(null);
    nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => {
      nameInputRef.current?.focus();
    }, 180);
  };

  const handleSelectDayTheme = (dayKey: DayKey) => {
    setActiveThemeKey(dayKey);
  };

  const handleGuideDayToggle = (dayKey: DayKey) => {
    setActiveThemeKey(dayKey);
    setFilterDay((prev) => (prev === dayKey ? 'all' : dayKey));
  };

  const countsByDay = useMemo(() => {
    const counts: Record<DayKey, number> = {
      senin: 0,
      selasa: 0,
      rabu: 0,
      kamis: 0,
      jumat: 0,
    };
    for (const item of agendas) {
      if (counts[item.dayKey] !== undefined) {
        counts[item.dayKey] += 1;
      }
    }
    return counts;
  }, [agendas]);

  const filteredAgendas = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return agendas.filter((item) => {
      const matchesDay = filterDay === 'all' || item.dayKey === filterDay;
      if (!matchesDay) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q))
      );
    });
  }, [agendas, filterDay, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Contract: 3 clean zones separated by gap-8 */}
      <header
        className="text-white transition-colors duration-200"
        style={{ backgroundColor: activeTheme.primaryBg }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-8">
          <a
            href="#top"
            className="flex items-center gap-2.5 text-lg sm:text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-md"
          >
            <CalendarCheck2 className="w-6 h-6 shrink-0" />
            <span>DINAS CKTR KAB PASURUAN</span>
          </a>

          <nav
            aria-label="Navigasi utama"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-white/90"
          >
            <a
              href="#daftar-jadwal"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Jadwal Rapat
            </a>
            <a
              href="#panduan-seragam"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Panduan Seragam
            </a>
            <button
              type="button"
              onClick={() => {
                setFilterDay('all');
                setSearchQuery('');
              }}
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Semua Hari
            </button>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleFocusCreateForm}
              className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
            >
              Tambah Agenda
            </button>
          </div>
        </div>
      </header>

      {/* Workspace Toolbar: Uniform Day Theme Switcher & Live WIB Clock */}
      <div
        className="border-b transition-colors duration-200"
        style={{
          backgroundColor: activeTheme.bannerBg,
          borderColor: activeTheme.bannerBorder,
          color: activeTheme.bannerText,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 min-w-0">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
              <Shirt className="w-4 h-4 shrink-0" />
              <span>{activeTheme.dayName}</span>
              <span aria-hidden="true" className="opacity-50">
                ·
              </span>
              <span className="font-medium truncate">{activeTheme.description}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3">
            <div
              role="group"
              aria-label="Pemilih tema seragam harian"
              className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-black/10"
            >
              {DAY_ORDER.map((dayKey) => {
                const dayTheme = UNIFORM_THEMES[dayKey];
                const isActive = activeThemeKey === dayKey;
                return (
                  <button
                    key={dayKey}
                    type="button"
                    onClick={() => handleSelectDayTheme(dayKey)}
                    aria-pressed={isActive}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'hover:bg-white/60 text-slate-800'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-sm border shrink-0"
                      style={{
                        backgroundColor: dayTheme.swatchColor,
                        borderColor: dayTheme.swatchBorder,
                      }}
                      aria-hidden="true"
                    />
                    <span>{dayTheme.dayName}</span>
                  </button>
                );
              })}
            </div>

            {clockText && (
              <div className="text-xs font-mono tabular-nums font-medium opacity-85 whitespace-nowrap">
                {clockText}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main id="top" className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Agenda Entry Form */}
          <div className="lg:col-span-5">
            <AgendaForm
              activeTheme={activeTheme}
              editingAgenda={editingAgenda}
              onDateThemeChange={setActiveThemeKey}
              onSaveAgenda={handleSaveAgenda}
              onCancelEdit={() => setEditingAgenda(null)}
              onNotify={showToast}
              nameInputRef={nameInputRef}
            />
          </div>

          {/* Right Column: Schedule Directory & Uniform Guide */}
          <div id="daftar-jadwal" className="lg:col-span-7 space-y-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
                    <span>Daftar Jadwal Rapat</span>
                    <span className="text-sm font-mono tabular-nums font-semibold text-slate-500">
                      ({filteredAgendas.length})
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Tampilan kartu otomatis menyesuaikan seragam hari pelaksanaan rapat
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <label htmlFor="filterDay" className="text-xs font-semibold text-slate-600">
                    Filter Hari:
                  </label>
                  <select
                    id="filterDay"
                    value={filterDay}
                    onChange={(e) => {
                      const val = e.target.value as 'all' | DayKey;
                      setFilterDay(val);
                      if (val !== 'all') setActiveThemeKey(val);
                    }}
                    className="bg-slate-50 border border-slate-300 text-slate-800 text-xs sm:text-sm rounded-lg px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-slate-800"
                  >
                    <option value="all">Semua Hari (Senin - Jumat)</option>
                    <option value="senin">Senin (PDH Khaki)</option>
                    <option value="selasa">Selasa (PDH Khaki)</option>
                    <option value="rabu">Rabu (Hitam Putih)</option>
                    <option value="kamis">Kamis (Batik / Adat)</option>
                    <option value="jumat">Jumat (Batik / Korpri)</option>
                  </select>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama agenda, ruang rapat, atau catatan..."
                  aria-label="Cari jadwal rapat"
                  className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Bersihkan pencarian"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Uniform Guide Strip (Senin - Jumat) */}
            <UniformGuideStrip
              selectedFilter={filterDay}
              activeHeaderTheme={activeThemeKey}
              countsByDay={countsByDay}
              onSelectDay={handleGuideDayToggle}
            />

            {/* Agenda Cards List / Empty State */}
            {filteredAgendas.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
                <div className="w-12 h-12 rounded-lg bg-slate-100 mx-auto flex items-center justify-center text-slate-500 mb-3">
                  <CalendarX className="w-6 h-6" />
                </div>
                <h2 className="text-base font-semibold text-slate-900">
                  Tidak Ada Agenda Ditemukan
                </h2>
                <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                  {filterDay !== 'all' || searchQuery
                    ? 'Tidak ada jadwal rapat yang cocok dengan filter hari atau kata kunci pencarian saat ini.'
                    : 'Belum ada jadwal rapat kedinasan tersimpan. Tambahkan jadwal pertama melalui formulir di samping.'}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                  {(filterDay !== 'all' || searchQuery) && (
                    <button
                      type="button"
                      onClick={() => {
                        setFilterDay('all');
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Tampilkan Semua Hari
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleFocusCreateForm}
                    className="px-4 py-2 rounded-lg text-white text-xs sm:text-sm font-semibold transition-opacity hover:opacity-95 cursor-pointer"
                    style={{ backgroundColor: activeTheme.primaryBg }}
                  >
                    Tambah Agenda Baru
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAgendas.map((item) => (
                  <AgendaCard
                    key={item.id}
                    agenda={item}
                    onEdit={handleEditAgenda}
                    onDelete={handleDeleteAgenda}
                    onPreviewAttachment={setPreviewAgenda}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Attachment Preview Modal */}
      <AttachmentPreviewModal agenda={previewAgenda} onClose={() => setPreviewAgenda(null)} />

      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-medium border border-slate-700"
        >
          {toast.variant === 'error' ? (
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-5 px-4 text-center text-xs text-slate-500">
        <p>
          DINAS CKTR KAB PASURUAN · Standar Warna Pakaian Dinas Harian Pemerintah (Senin – Jumat)
        </p>
      </footer>
    </div>
  );
}
