import React from 'react';
import {
  Calendar,
  Clock,
  Eye,
  File,
  FileText,
  FileType2,
  Image as ImageIcon,
  MapPin,
  Pencil,
  Shirt,
  Trash2,
} from 'lucide-react';
import { UNIFORM_THEMES } from '../constants/uniformThemes';
import { AgendaAttachment, AgendaItem } from '../types/agenda';
import { formatIndonesianDate } from '../utils/agendaHelpers';

interface AgendaCardProps {
  agenda: AgendaItem;
  onEdit: (agenda: AgendaItem) => void;
  onDelete: (id: string) => void;
  onPreviewAttachment: (agenda: AgendaItem) => void;
}

export const AgendaCard: React.FC<AgendaCardProps> = ({
  agenda,
  onEdit,
  onDelete,
  onPreviewAttachment,
}) => {
  const theme = UNIFORM_THEMES[agenda.dayKey] || UNIFORM_THEMES.senin;
  const formattedDate = formatIndonesianDate(agenda.date);

  const renderAttachmentIcon = (file: AgendaAttachment) => {
    if (file.category === 'image') return <ImageIcon className="w-4 h-4 text-emerald-700 shrink-0" />;
    if (file.category === 'pdf') return <FileText className="w-4 h-4 text-red-700 shrink-0" />;
    if (file.category === 'word') return <FileType2 className="w-4 h-4 text-blue-700 shrink-0" />;
    return <File className="w-4 h-4 text-slate-600 shrink-0" />;
  };

  return (
    <article
      className="rounded-xl border p-5 transition-colors duration-150"
      style={{
        backgroundColor: theme.cardBg,
        borderColor: theme.cardBorder,
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <div
          className="flex flex-wrap items-center gap-2 text-xs font-semibold"
          style={{ color: theme.accentText }}
        >
          <span
            className="inline-block w-2.5 h-2.5 rounded-sm border shrink-0"
            style={{
              backgroundColor: theme.swatchColor,
              borderColor: theme.swatchBorder,
            }}
            aria-hidden="true"
          />
          <span>{theme.dayName}</span>
          <span aria-hidden="true" className="opacity-50">
            ·
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Shirt className="w-3.5 h-3.5 shrink-0" />
            {theme.uniformTitle}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 -mt-1 -mr-1">
          <button
            type="button"
            onClick={() => onEdit(agenda)}
            aria-label={`Ubah agenda ${agenda.name}`}
            title="Ubah Agenda"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white/80 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 cursor-pointer"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(agenda.id)}
            aria-label={`Hapus agenda ${agenda.name}`}
            title="Hapus Agenda"
            className="p-2 text-slate-600 hover:text-red-700 hover:bg-white/80 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug mb-2">
        {agenda.name}
      </h3>

      {agenda.notes && (
        <p className="text-sm text-slate-600 leading-relaxed mb-3.5 max-w-[70ch]">{agenda.notes}</p>
      )}

      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t text-xs sm:text-sm text-slate-700"
        style={{ borderColor: theme.dividerBorder }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="w-4 h-4 shrink-0" style={{ color: theme.accentText }} />
          <span className="font-mono tabular-nums font-medium truncate">{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <Clock className="w-4 h-4 shrink-0" style={{ color: theme.accentText }} />
          <span className="font-mono tabular-nums font-semibold whitespace-nowrap">
            {agenda.time} WIB
          </span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="w-4 h-4 shrink-0" style={{ color: theme.accentText }} />
          <span className="font-medium truncate" title={agenda.location}>
            {agenda.location}
          </span>
        </div>
      </div>

      {agenda.file && (
        <div
          className="mt-3.5 pt-3 border-t flex flex-wrap items-center justify-between gap-3"
          style={{ borderColor: theme.dividerBorder }}
        >
          <div className="flex items-center gap-2 text-xs text-slate-700 min-w-0">
            {renderAttachmentIcon(agenda.file)}
            <span className="font-medium truncate max-w-[200px] sm:max-w-[280px]">
              {agenda.file.name}
            </span>
            <span aria-hidden="true" className="text-slate-400">
              ·
            </span>
            <span className="text-slate-500 font-mono tabular-nums shrink-0">
              {agenda.file.size}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onPreviewAttachment(agenda)}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Lihat Dokumen</span>
          </button>
        </div>
      )}
    </article>
  );
};
