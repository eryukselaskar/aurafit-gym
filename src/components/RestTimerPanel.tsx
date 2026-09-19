import React from 'react';
import { Bell, FastForward, Dumbbell } from 'lucide-react';
import './ActiveWorkout.css';

interface RestTimerPanelProps {
  isResting: boolean;
  restSecondsLeft: number;
  restDuration: number;
  currentRestExercise: string;
  skipRest: () => void;
  changeRestDuration: (seconds: number) => void;
}

/**
 * Dinlenme sayacı paneli.
 *
 * Masaüstünde dairesel geri sayım, mobilde sabit alt çubuk olarak görünür.
 * İkisi de aynı state'i okur; yalnızca sunum farklıdır.
 */
export const RestTimerPanel: React.FC<RestTimerPanelProps> = ({
  isResting,
  restSecondsLeft,
  restDuration,
  currentRestExercise,
  skipRest,
  changeRestDuration
}) => (
  <div className={`rest-timer-pane ${isResting ? 'resting' : 'idle'}`}>
    <div className={`rest-timer-card glass-panel ${isResting ? 'active-rest' : 'inactive-rest'}`}>
      {isResting ? (
        <>
          {/* Desktop View (Circular visual countdown) */}
          <div className="desktop-only" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
            <div className="rest-card-header">
              <Bell className="bell-icon animated-bell" size={20} />
              <span>DİNLENME SÜRESİ</span>
            </div>

            <p className="rest-next-ex">Sıradaki: {currentRestExercise}</p>

            <div className="timer-circle-container">
              <svg className="timer-circle-svg">
                <defs>
                  <linearGradient id="timerGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--accent-cyan)" />
                    <stop offset="100%" stopColor="var(--accent-violet)" />
                  </linearGradient>
                </defs>
                <circle className="timer-circle-bg" cx="80" cy="80" r="70" />
                <circle
                  className="timer-circle-progress"
                  cx="80"
                  cy="80"
                  r="70"
                  strokeDasharray={440}
                  strokeDashoffset={restDuration > 0 ? (restSecondsLeft / restDuration) * 440 : 0}
                />
              </svg>
              <div className="timer-text-container">
                <span className="timer-time">{restSecondsLeft}</span>
                <span className="timer-label">saniye</span>
              </div>
            </div>

            <div className="rest-timer-actions" style={{ flexWrap: 'wrap', gap: '8px' }}>
              {[60, 90, 120, 180].map(sec => (
                <button
                  key={sec}
                  onClick={() => changeRestDuration(sec)}
                  className="btn btn-secondary btn-sm"
                  style={{ minWidth: 44, padding: '4px 8px', fontSize: 12 }}
                >
                  {sec < 60 ? `${sec}s` : sec === 60 ? '1dk' : sec === 90 ? '1.5dk' : sec === 120 ? '2dk' : '3dk'}
                </button>
              ))}
              <button id="skip-rest-btn-desktop" onClick={skipRest} className="btn btn-primary btn-sm btn-icon">
                <FastForward size={16} />
              </button>
            </div>
          </div>

          {/* Mobile View (Sleek Horizontal Player Bar) */}
          <div className="mobile-only mobile-horizontal-rest" style={{ width: '100%' }}>
            {/* Kalan süreyi tek bakışta okunur kılan ilerleme şeridi.
                Masaüstünde dairesel sayaç vardı, mobilde yalnızca rakam
                kalıyordu. transform kullanılıyor (layout tetiklemez). */}
            <div
              className="rest-progress-track"
              role="progressbar"
              aria-label="Kalan dinlenme süresi"
              aria-valuemin={0}
              aria-valuemax={restDuration}
              aria-valuenow={restSecondsLeft}
              aria-valuetext={`${restSecondsLeft} saniye kaldı`}
            >
              <div
                className="rest-progress-fill"
                style={{ transform: `scaleX(${restDuration > 0 ? restSecondsLeft / restDuration : 0})` }}
              />
            </div>

            <div className="rest-info-group">
              <Bell className="bell-icon animated-bell" size={18} />
              <div className="rest-details">
                <span className="rest-title-lbl">DİNLENME SÜRESİ</span>
                <span className="rest-next-lbl">Sıradaki: {currentRestExercise}</span>
              </div>
            </div>

            <div className="rest-counter-val">
              {restSecondsLeft} <span className="sec-lbl">sn</span>
            </div>

            <div className="rest-actions-group">
              {[90, 120, 180].map(sec => (
                <button
                  key={sec}
                  onClick={() => changeRestDuration(sec)}
                  className="btn btn-secondary btn-sm compact-btn"
                  style={{ fontSize: 11 }}
                >
                  {sec === 90 ? '1.5dk' : sec === 120 ? '2dk' : '3dk'}
                </button>
              ))}
              <button id="skip-rest-btn-mobile" aria-label="skip-rest-btn-mobile" onClick={skipRest} className="btn btn-primary btn-sm compact-btn">
                <FastForward size={14} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="resting-idle-state">
          <Dumbbell size={36} className="idle-dumbell" />
          <h3>Hazır</h3>
          <p className="idle-sub">Bir seti tamamladığınızda dinlenme sayacı otomatik olarak başlayacaktır.</p>
        </div>
      )}
    </div>
  </div>
);
