import React from 'react';
import type { CompletedWorkout } from '../types';

interface HeatmapProps {
  history: CompletedWorkout[];
}

export const Heatmap: React.FC<HeatmapProps> = ({ history }) => {
  // Generate days for the last 52 weeks (364 days) plus remaining days to end on today
  const today = new Date();
  const daysToShow = 364; // 52 weeks
  const startDate = new Date();
  startDate.setDate(today.getDate() - daysToShow + 1);

  // Group completed workouts by date (YYYY-MM-DD)
  const workoutCountsByDate = history.reduce((acc, w) => {
    if (!w.date) return acc;
    // Normalize date format to YYYY-MM-DD
    const dateStr = w.date.includes('T') ? w.date.split('T')[0] : w.date;
    acc[dateStr] = (acc[dateStr] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Build grid data
  const gridCells = [];
  const tempDate = new Date(startDate);
  
  while (tempDate <= today) {
    const dateStr = tempDate.toISOString().split('T')[0];
    const count = workoutCountsByDate[dateStr] || 0;
    
    gridCells.push({
      date: dateStr,
      displayDate: tempDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }),
      count,
      dayOfWeek: tempDate.getDay() // 0 = Sunday, 1 = Monday, etc.
    });
    
    tempDate.setDate(tempDate.getDate() + 1);
  }

  // Group cells by week (array of 7-cell columns)
  const weeks: typeof gridCells[] = [];
  let currentWeek: typeof gridCells = [];
  
  // Align grid to start on Monday or Sunday (standard is Sunday/Monday)
  // Let's just push padding cells if the first day is not Sunday/Monday
  // For simplicity, we just partition the array into chunks of 7
  gridCells.forEach((cell, idx) => {
    currentWeek.push(cell);
    if (currentWeek.length === 7 || idx === gridCells.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'intensity-none';
    if (count === 1) return 'intensity-low';
    return 'intensity-high';
  };

  const weekdays = ['Pz', 'Pt', 'Sa', 'Çr', 'Pe', 'Cu', 'Ct'];

  return (
    <div className="heatmap-container glass-panel">
      <div className="heatmap-header-row">
        <h3 className="heatmap-title">Antrenman Katkı Grafiği</h3>
        <div className="heatmap-legend">
          <span>Az</span>
          <div className="legend-cell intensity-none"></div>
          <div className="legend-cell intensity-low"></div>
          <div className="legend-cell intensity-high"></div>
          <span>Çok</span>
        </div>
      </div>

      <div className="heatmap-grid-scroll">
        <div className="heatmap-grid-layout">
          {/* Weekday labels */}
          <div className="weekday-labels">
            {weekdays.map((day, i) => (
              <span key={i} className="weekday-label">{day}</span>
            ))}
          </div>

          {/* Week columns */}
          <div className="weeks-container">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="week-column">
                {week.map((day) => (
                  <div
                    key={day.date}
                    className={`day-cell ${getIntensityClass(day.count)}`}
                  >
                    <span className="tooltip-text">
                      {day.count > 0 ? `${day.count} Antrenman` : 'Antrenman yok'} - {day.displayDate}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .heatmap-container {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow: hidden;
          background: rgba(18, 20, 29, 0.35);
        }

        .heatmap-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .heatmap-title {
          font-size: 15px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
        }

        .heatmap-legend {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 600;
        }

        .legend-cell {
          width: 11px;
          height: 11px;
          border-radius: 2px;
        }

        .heatmap-grid-scroll {
          overflow-x: auto;
          padding-bottom: 6px;
        }

        .heatmap-grid-layout {
          display: flex;
          gap: 10px;
          min-width: 680px; /* Force minimum width to prevent squishing */
        }

        .weekday-labels {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding-top: 4px;
          height: 98px; /* 11px * 7 + 3px * 6 gap = 77 + 18 = 95px */
        }

        .weekday-label {
          font-size: 10px;
          color: var(--text-muted);
          font-weight: 600;
          line-height: 11px;
          text-align: right;
          width: 20px;
        }

        .weeks-container {
          display: flex;
          gap: 3px;
        }

        .week-column {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .day-cell {
          width: 11px;
          height: 11px;
          border-radius: 2px;
          position: relative;
          transition: all var(--transition-fast);
          cursor: pointer;
        }

        .day-cell:hover {
          transform: scale(1.2);
          z-index: 10;
        }

        /* Tooltip style */
        .day-cell .tooltip-text {
          visibility: hidden;
          width: 140px;
          background-color: var(--bg-card-solid);
          border: 1px solid var(--border-medium);
          color: #fff;
          text-align: center;
          padding: 6px 8px;
          border-radius: var(--radius-sm);
          position: absolute;
          z-index: 20;
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          transition: opacity 0.2s;
          font-size: 10px;
          font-weight: 600;
          pointer-events: none;
          box-shadow: var(--shadow-md);
          white-space: normal;
        }

        .day-cell:hover .tooltip-text {
          visibility: visible;
          opacity: 1;
        }

        /* Color Intensities matching dark mode */
        .intensity-none {
          background-color: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.02);
        }

        .intensity-low {
          background-color: rgba(139, 92, 246, 0.35);
          box-shadow: 0 0 4px rgba(139, 92, 246, 0.1);
        }

        .intensity-high {
          background-color: var(--accent-violet);
          box-shadow: 0 0 8px var(--accent-violet-glow);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};
