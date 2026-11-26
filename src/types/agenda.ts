export type DayKey = 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat';

export type FileCategory = 'image' | 'pdf' | 'word' | 'document';

export interface AgendaAttachment {
  name: string;
  size: string;
  type: string;
  category: FileCategory;
  dataUrl?: string;
  isSample?: boolean;
}

export interface AgendaItem {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  dayKey: DayKey;
  notes?: string;
  file: AgendaAttachment | null;
  createdAt: number;
}

export interface UniformTheme {
  key: DayKey;
  dayName: string;
  uniformTitle: string;
  shortLabel: string;
  description: string;
  primaryBg: string;
  primaryHover: string;
  swatchColor: string;
  swatchBorder: string;
  bannerBg: string;
  bannerBorder: string;
  bannerText: string;
  cardBg: string;
  cardBorder: string;
  accentText: string;
  dividerBorder: string;
}
