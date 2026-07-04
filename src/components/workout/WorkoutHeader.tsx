import React from 'react';
import { Clock, Pause, Play, X } from 'lucide-react';
import type { WorkoutProgram } from '../../types';

interface Props {
  activeProgram: WorkoutProgram;
  elapsedSeconds: number;
  isTimerRunning: boolean;
  toggleTimer: () => void;
  onCancel: () => void;
  onFinish: () => void;
}

const formatTime = (totalSeconds: number) => {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${hrs > 0 ? `${hrs}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const WorkoutHeader: React.FC<Props> = ({
  activeProgram, elapsedSeconds, isTimerRunning, toggleTimer, onCancel, onFinish
}) => (
  <header className="active-workout-header glass-panel">
    <div className="header-info">
      <div className="active-badge pulse-glowing-mint"><span>● CANLI SEANS</span></div>
      <h1 className="active-program-title">{activeProgram.name}</h1>
    </div>

    <div className="header-timer" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Clock size={20} className="timer-icon" />
      <span className="duration-clock" style={{ color: isTimerRunning ? 'var(--text-primary)' : 'var(--text-muted)' }}>
        {formatTime(elapsedSeconds)}
      </span>
      <button
        onClick={toggleTimer}
        className={`btn-timer-toggle ${isTimerRunning ? 'running' : 'paused'}`}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '50%',
          width: 28, height: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isTimerRunning ? 'var(--accent-mint)' : 'var(--text-primary)',
          cursor: 'pointer',
          marginLeft: 6,
          transition: 'all 0.2s ease',
        }}
        aria-label={isTimerRunning ? 'Antrenmanı Duraklat' : 'Antrenmana Devam Et'}
      >
        {isTimerRunning ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: 1 }} />}
      </button>
    </div>

    <div className="header-actions">
      <button onClick={onCancel} className="btn btn-danger btn-sm btn-cancel">
        <X size={16} /> İptal
      </button>
      <button onClick={onFinish} className="btn btn-primary btn-sm btn-finish">
        Antrenmanı Bitir
      </button>
    </div>
  </header>
);
