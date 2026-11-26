import { UNIFORM_THEMES } from '../constants/uniformThemes';
import { AgendaItem, DayKey, FileCategory } from '../types/agenda';

const STORAGE_KEY = 'pns_agenda_rapat_v1';

const DAY_NAMES_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export function getTodayIsoDate(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getDayKeyFromDate(dateString: string): DayKey {
  if (!dateString) return 'senin';
  const dateObj = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(dateObj.getTime())) return 'senin';
  const dayIndex = dateObj.getDay();
  const map: Record<number, DayKey> = {
    1: 'senin',
    2: 'selasa',
    3: 'rabu',
    4: 'kamis',
    5: 'jumat',
  };
  return map[dayIndex] || 'senin';
}

export function getDetectedDaySummary(dateString: string): {
  dayName: string;
  isWeekend: boolean;
  dayKey: DayKey;
  uniformTitle: string;
} {
  if (!dateString) {
    return {
      dayName: 'Senin',
      isWeekend: false,
      dayKey: 'senin',
      uniformTitle: UNIFORM_THEMES.senin.uniformTitle,
    };
  }
  const dateObj = new Date(`${dateString}T00:00:00`);
  const dayIndex = Number.isNaN(dateObj.getTime()) ? 1 : dateObj.getDay();
  const dayKey = getDayKeyFromDate(dateString);
  return {
    dayName: DAY_NAMES_ID[dayIndex] || 'Senin',
    isWeekend: dayIndex === 0 || dayIndex === 6,
    dayKey,
    uniformTitle: UNIFORM_THEMES[dayKey].uniformTitle,
  };
}

export function formatIndonesianDate(dateStr: string): string {
  if (!dateStr) return '-';
  const dateObj = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(dateObj.getTime())) return dateStr;
  return dateObj.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function detectFileCategory(file: File): FileCategory {
  const lowerName = file.name.toLowerCase();
  if (file.type.startsWith('image/')) return 'image';
  if (file.type === 'application/pdf' || lowerName.endsWith('.pdf')) return 'pdf';
  if (lowerName.endsWith('.doc') || lowerName.endsWith('.docx')) return 'word';
  return 'document';
}

function getDateForWeekday(targetDay: number): string {
  const curr = new Date();
  const diff = targetDay - curr.getDay();
  const target = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() + diff);
  const yyyy = target.getFullYear();
  const mm = String(target.getMonth() + 1).padStart(2, '0');
  const dd = String(target.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getInitialAgendas(): AgendaItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fallback to initial schedule
  }

  return [
    {
      id: 'sample-1',
      name: 'Apel Pagi & Rapat Koordinasi Pimpinan (Rapim) Mingguan',
      date: getDateForWeekday(1),
      time: '08:30',
      location: 'Aula Utama Gedung Sekretariat Lt. 3',
      dayKey: 'senin',
      notes: 'Membahas target serapan anggaran triwulan berjalan dan kesiapan layanan publik.',
      file: {
        name: 'Undangan_Rapim_Senin.pdf',
        size: '420 KB',
        type: 'application/pdf',
        category: 'pdf',
        isSample: true,
      },
      createdAt: Date.now() - 300000,
    },
    {
      id: 'sample-2',
      name: 'Pembahasan Sinkronisasi Program Kerja & Anggaran (RKAKL)',
      date: getDateForWeekday(3),
      time: '10:00',
      location: 'Ruang Rapat Bappeda Lt. 2',
      dayKey: 'rabu',
      notes: 'Setiap bidang wajib membawa matriks usulan kegiatan beserta rincian kebutuhan.',
      file: {
        name: 'Draft_Paparan_Anggaran.docx',
        size: '1.4 MB',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        category: 'word',
        isSample: true,
      },
      createdAt: Date.now() - 200000,
    },
    {
      id: 'sample-3',
      name: 'Evaluasi Pelayanan Publik & Inovasi Daerah',
      date: getDateForWeekday(4),
      time: '13:30',
      location: 'Command Center / Ruang Rapat Garuda',
      dayKey: 'kamis',
      notes: 'Penilaian indeks kepuasan masyarakat dan tindak lanjut pengaduan layanan.',
      file: null,
      createdAt: Date.now() - 100000,
    },
  ];
}

export function saveAgendasToStorage(agendas: AgendaItem[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(agendas));
    return true;
  } catch {
    return false;
  }
}
