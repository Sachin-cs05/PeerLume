import React, { useState } from 'react';
import type { LearningSessionDto } from '@peerlume/shared';
import { ChevronLeft, ChevronRight, Video, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../ui/Button.js';
import { SessionCard } from './SessionCard.js';

interface CalendarViewProps {
  sessions: LearningSessionDto[];
  onAccept?: (sessionId: string) => void;
  onDecline?: (sessionId: string) => void;
  onCancel?: (sessionId: string) => void;
  onOpenReschedule?: (session: LearningSessionDto) => void;
  onComplete?: (sessionId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  sessions,
  onAccept,
  onDecline,
  onCancel,
  onOpenReschedule,
  onComplete,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDaySessions, setSelectedDaySessions] = useState<LearningSessionDto[] | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDaySessions(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDaySessions(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDaySessions(null);
  };

  // Map sessions to day numbers
  const sessionsByDay: Record<number, LearningSessionDto[]> = {};
  for (const s of sessions) {
    const sDate = new Date(s.startTime);
    if (sDate.getFullYear() === year && sDate.getMonth() === month) {
      const day = sDate.getDate();
      if (!sessionsByDay[day]) sessionsByDay[day] = [];
      sessionsByDay[day].push(s);
    }
  }

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyPaddingArray = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const handleDayClick = (day: number) => {
    const daySessions = sessionsByDay[day] || [];
    setSelectedDaySessions(daySessions);
    const d = new Date(year, month, day);
    setSelectedDateStr(
      d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-surface border border-border text-foreground">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{monthName}</h2>
            <p className="text-xs text-foreground-muted">
              {sessions.length} total session{sessions.length === 1 ? '' : 's'} scheduled
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <div className="flex items-center border border-border rounded-lg overflow-hidden bg-surface">
            <button
              onClick={prevMonth}
              aria-label="Previous month"
              className="p-2 text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              aria-label="Next month"
              className="p-2 text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-border bg-surface text-center text-xs font-semibold text-foreground-secondary py-2.5">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 auto-rows-fr gap-px bg-border">
          {emptyPaddingArray.map((i) => (
            <div key={`empty-${i}`} className="min-h-[80px] sm:min-h-[100px] bg-surface/50 p-2" />
          ))}

          {daysArray.map((day) => {
            const daySessions = sessionsByDay[day] || [];
            const isToday =
              new Date().getFullYear() === year &&
              new Date().getMonth() === month &&
              new Date().getDate() === day;

            return (
              <div
                key={day}
                onClick={() => handleDayClick(day)}
                className={`min-h-[80px] sm:min-h-[100px] p-2 bg-card hover:bg-surface-hover transition-colors cursor-pointer flex flex-col justify-between ${
                  isToday ? 'ring-1 ring-inset ring-foreground font-bold' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs ${
                      isToday
                        ? 'w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-[11px]'
                        : 'text-foreground-secondary'
                    }`}
                  >
                    {day}
                  </span>
                  {daySessions.length > 0 && (
                    <span className="text-[10px] text-foreground-muted font-medium">
                      {daySessions.length} sess
                    </span>
                  )}
                </div>

                {/* Session pills */}
                <div className="space-y-1 overflow-hidden">
                  {daySessions.slice(0, 2).map((s) => (
                    <div
                      key={s.id}
                      className="text-[10px] truncate px-1.5 py-0.5 rounded font-medium flex items-center gap-1 border bg-surface border-border text-foreground-secondary"
                      title={`${s.title} (${new Date(s.startTime).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })})`}
                    >
                      {s.mode === 'ONLINE' ? (
                        <Video className="w-2.5 h-2.5 shrink-0 text-foreground-muted" />
                      ) : (
                        <MapPin className="w-2.5 h-2.5 shrink-0 text-foreground-muted" />
                      )}
                      <span className="truncate">{s.title}</span>
                    </div>
                  ))}
                  {daySessions.length > 2 && (
                    <div className="text-[10px] text-foreground-muted text-center font-medium">
                      +{daySessions.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Sessions Drawer / Section */}
      {selectedDaySessions && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-base font-bold text-foreground">Sessions on {selectedDateStr}</h3>
              <p className="text-xs text-foreground-muted">
                {selectedDaySessions.length} session{selectedDaySessions.length === 1 ? '' : 's'} on this day
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedDaySessions(null)}>
              Close
            </Button>
          </div>

          {selectedDaySessions.length === 0 ? (
            <div className="py-6 text-center text-xs text-foreground-muted">
              No learning sessions scheduled on this day.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedDaySessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onAccept={onAccept}
                  onDecline={onDecline}
                  onCancel={onCancel}
                  onOpenReschedule={onOpenReschedule}
                  onComplete={onComplete}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
