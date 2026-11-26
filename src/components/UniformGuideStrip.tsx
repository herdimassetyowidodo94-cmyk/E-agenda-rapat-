import React from 'react';
import { DAY_ORDER, UNIFORM_THEMES } from '../constants/uniformThemes';
import { DayKey } from '../types/agenda';

interface UniformGuideStripProps {
  selectedFilter: 'all' | DayKey;
  activeHeaderTheme: DayKey;
  countsByDay: Record<DayKey, number>;
  onSelectDay: (day: DayKey) => void;
}

export const UniformGuideStrip: React.FC<UniformGuideStripProps> = ({
  selectedFilter,
  activeHeaderTheme,
  countsByDay,
  onSelectDay,
}) => {
  return (
    <section id="panduan-seragam" aria-label="Panduan warna seragam harian ASN">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {DAY_ORDER.map((dayKey) => {
          const theme = UNIFORM_THEMES[dayKey];
          const isFiltered = selectedFilter === dayKey;
          const isHeaderTheme = activeHeaderTheme === dayKey;
          const count = countsByDay[dayKey] || 0;

          return (
            <button
              key={dayKey}
              type="button"
              onClick={() => onSelectDay(dayKey)}
              className={`text-left p-3 rounded-xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                isFiltered ? 'ring-2 ring-slate-900 ring-offset-1' : 'hover:opacity-90'
              }`}
              style={{
                backgroundColor: theme.bannerBg,
                borderColor: isHeaderTheme ? theme.primaryBg : theme.bannerBorder,
              }}
              title={`Filter dan pratinjau tema ${theme.dayName} (${theme.uniformTitle})`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3 h-3 rounded-sm border shrink-0"
                    style={{
                      backgroundColor: theme.swatchColor,
                      borderColor: theme.swatchBorder,
                    }}
                    aria-hidden="true"
                  />
                  <span
                    className="text-xs font-bold truncate"
                    style={{ color: theme.bannerText }}
                  >
                    {theme.dayName}
                  </span>
                </div>
                <span
                  className="text-xs font-mono tabular-nums font-semibold opacity-75"
                  style={{ color: theme.bannerText }}
                >
                  {count}
                </span>
              </div>
              <p
                className="text-xs font-medium truncate opacity-90"
                style={{ color: theme.accentText }}
              >
                {theme.shortLabel}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
};
