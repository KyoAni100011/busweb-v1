import React, { useMemo } from 'react';
import type { SeatMapSeat, SeatMapSnapshot } from '@/types';

interface SeatMapProps {
  map: SeatMapSnapshot;
  selectedSeatIds: string[];
  onToggleSeat: (seat: SeatMapSeat) => void;
}

const seatClassNames = (seat: SeatMapSeat, isSelected: boolean) => {
  if (seat.status === 'BOOKED') {
    return 'bg-gray-200 text-gray-500 cursor-not-allowed';
  }

  if (seat.status === 'HELD') {
    return 'bg-amber-100 text-amber-600 cursor-not-allowed';
  }

  if (isSelected) {
    return 'bg-primary text-white';
  }

  return 'bg-white text-gray-700 hover:bg-primary/10';
};

const SeatButton: React.FC<{ seat: SeatMapSeat; isSelected: boolean; onToggle: (seat: SeatMapSeat) => void }> = ({
  seat,
  isSelected,
  onToggle,
}) => (
  <button
    type="button"
    disabled={seat.status !== 'AVAILABLE'}
    onClick={() => onToggle(seat)}
    className={`flex h-10 w-10 items-center justify-center rounded-md border text-sm font-semibold transition ${seatClassNames(
      seat,
      isSelected
    )}`}
  >
    {seat.seatNumber}
  </button>
);

export const SeatMap: React.FC<SeatMapProps> = ({ map, selectedSeatIds, onToggleSeat }) => {
  const parseSeatNumber = (value: string) => {
    const numeric = Number(value.replace(/\D/g, ''));

    return Number.isNaN(numeric) ? Number.MAX_SAFE_INTEGER : numeric;
  };

  const buildDefaultLayout = (seats: SeatMapSeat[]) => {
    const sorted = [...seats].sort((a, b) => {
      const aNum = parseSeatNumber(a.seatNumber);
      const bNum = parseSeatNumber(b.seatNumber);

      if (aNum !== bNum) {
        return aNum - bNum;
      }

      return a.seatNumber.localeCompare(b.seatNumber);
    });

    const arranged: SeatMapSeat[] = [];
    const patternCols = [0, 1, 3, 4];
    let cursor = 0;
    let row = 0;

    while (sorted.length - cursor > 5) {
      patternCols.forEach((column) => {
        if (cursor < sorted.length - 5) {
          arranged.push({ ...sorted[cursor], row, column });
          cursor += 1;
        }
      });
      row += 1;
    }

    const remaining = sorted.length - cursor;
    if (remaining > 0) {
      const lastRowCols = [0, 1, 2, 3, 4].slice(0, remaining);
      lastRowCols.forEach((column) => {
        arranged.push({ ...sorted[cursor], row, column });
        cursor += 1;
      });
      row += 1;
    }

    return {
      seats: arranged,
      totalRows: row || 1,
      totalColumns: 5,
      deckCount: 1,
    } as Partial<SeatMapSnapshot>;
  };

  const normalizedMap = useMemo(() => {
    const hasCoordinates = map.seats.some((seat) => seat.row !== undefined && seat.column !== undefined);

    if (hasCoordinates && map.totalRows && map.totalColumns) {
      return map;
    }

    const fallback = buildDefaultLayout(map.seats);

    return {
      ...fallback,
      ...map,
      seats: fallback.seats,
      totalRows: map.totalRows ?? fallback.totalRows,
      totalColumns: map.totalColumns ?? fallback.totalColumns,
      deckCount: map.deckCount ?? fallback.deckCount ?? 1,
    };
  }, [map]);

  const renderDeck = (deckIndex: number) => {
    const seatsOnDeck = (normalizedMap.seats ?? []).filter((seat) => (seat.deck ?? 0) === deckIndex);
    const rows = Array.from({ length: normalizedMap.totalRows }, (_, rowIndex) => rowIndex);
    const columns = Array.from({ length: normalizedMap.totalColumns }, (_, columnIndex) => columnIndex);

    return (
      <div key={deckIndex} className="space-y-2">
        {normalizedMap.deckCount > 1 && (
          <p className="text-sm font-medium text-muted-foreground">Deck {deckIndex + 1}</p>
        )}
        <div className="inline-grid gap-3" style={{ gridTemplateColumns: `repeat(${normalizedMap.totalColumns}, minmax(2.5rem, 1fr))` }}>
          {rows.map((row) =>
            columns.map((column) => {
              const seat = seatsOnDeck.find((item) => item.row === row && item.column === column);
              if (!seat) {
                return <span key={`${deckIndex}-${row}-${column}`} />;
              }

              const isSelected = selectedSeatIds.includes(seat.id);
              return (
                <SeatButton
                  key={seat.id}
                  seat={seat}
                  isSelected={isSelected}
                  onToggle={onToggleSeat}
                />
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {Array.from({ length: normalizedMap.deckCount || 1 }).map((_, deckIndex) => renderDeck(deckIndex))}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-sm border bg-white" /> Available
        </div>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-sm bg-primary" /> Selected
        </div>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-sm bg-amber-100" /> Held
        </div>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-sm bg-gray-200" /> Booked
        </div>
      </div>
    </div>
  );
};
