import React from 'react';
import { Award, Flame, Dumbbell, Clock, ArrowRight, Play, Calendar, Trophy } from 'lucide-react';
import type { CompletedWorkout, WorkoutProgram, PersonalRecord, WeightLog } from '../types';

interface DashboardProps {
  history: CompletedWorkout[];
  programs: WorkoutProgram[];
  personalRecords: PersonalRecord[];
  weightLogs: WeightLog[];
  startWorkout: (program: WorkoutProgram) => void;
  setActiveTab: (tab: string) => void;
  setProfileSubTab?: (tab: 'account' | 'history' | 'metrics') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  history, 
  programs, 
  personalRecords, 
  weightLogs, 
  startWorkout, 
  setActiveTab,
  setProfileSubTab
}) => {
  // Compute analytics
  const totalWorkouts = history.length;
  const totalVolume = history.reduce((sum, w) => sum + w.totalVolume, 0);
  const totalDuration = history.reduce((sum, w) => sum + w.duration, 0);
  
  // Calculate a real streak based on consecutive workout days
  const calculateStreak = () => {
    if (history.length === 0) return 0;
    
    // Sort unique dates descending
    const dates = Array.from(new Set(history.map(h => h.date))).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
    
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // If latest workout is older than yesterday, streak is broken
    if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
      return 0;
    }
    
    let streak = 1;
    let currentDate = new Date(dates[0]);
    
    for (let i = 1; i < dates.length; i++) {
      const nextDate = new Date(dates[i]);
      const diffTime = Math.abs(currentDate.getTime() - nextDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
        currentDate = nextDate;
      } else if (diffDays > 1) {
        break; // Streak broken
      }
    }
    return streak;
  };
  const activeStreak = calculateStreak();

  const latestWeightLog = weightLogs && weightLogs.length > 0
    ? [...weightLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;

  // Fallback: If personalRecords is empty, calculate them dynamically from history based on max weight
  const displayPRs = personalRecords.length > 0 ? personalRecords : (() => {
    const computedMap = new Map<string, PersonalRecord>();
    history.forEach(workout => {
      workout.exercises.forEach(ex => {
        const completedSets = ex.sets.filter(s => s.completed);
        if (completedSets.length === 0) return;
        
        let bestWeight = 0;
        let bestReps = 0;
        
        completedSets.forEach(s => {
          const weight = s.actualWeight ?? s.weight;
          const reps = s.actualReps ?? s.reps;
          if (weight > bestWeight || (weight === bestWeight && reps > bestReps)) {
            bestWeight = weight;
            bestReps = reps;
          }
        });
        
        const bestOneRepMax = Math.round((bestReps === 1 ? bestWeight : bestWeight * (1 + bestReps / 30)) * 10) / 10;
        
        const existing = computedMap.get(ex.exerciseId);
        if (!existing || bestWeight > existing.maxWeight || (bestWeight === existing.maxWeight && bestReps > existing.maxReps)) {
          computedMap.set(ex.exerciseId, {
            exerciseId: ex.exerciseId,
            exerciseName: ex.name,
            maxWeight: bestWeight,
            maxReps: bestReps,
            oneRepMax: bestOneRepMax,
            date: workout.date
          });
        }
      });
    });
    return Array.from(computedMap.values());
  })();

  // Safely parse date and include day of the week
  const formatDateWithDay = (dateStr: string) => {
    try {
      const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(/-/g, '/');
      return new Date(normalized).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="dashboard-container anim-slide-up">
      {/* Welcome header */}
      <header className="dashboard-header">
        <div>
          <h1 className="welcome-title">Hoş Geldin, <span className="gradient-text">Şampiyon</span></h1>
          <p className="welcome-subtitle">
            {latestWeightLog 
              ? `Son Ölçüm: ${latestWeightLog.weight} kg ${latestWeightLog.bodyFat ? `(Vücut Yağı: %${latestWeightLog.bodyFat})` : ''}` 
              : 'Bugün sınırlarını zorlamaya hazır mısın?'
            }
          </p>
        </div>
        <div className="header-date">
          <Calendar size={18} />
          <span>{new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>
      </header>

      {/* Quick Launch Panel */}
      <div className="glass-panel quick-launch-card">
        <div className="card-header">
          <h2 className="card-title">Hızlı Antrenman Başlat</h2>
          <span className="card-description">Programlarından birini seçerek hemen başla</span>
        </div>

        <div className="quick-programs-list">
          {programs.length === 0 ? (
            <div className="no-programs-prompt">
              <p>Kayıtlı bir program bulunamadı.</p>
              <button onClick={() => setActiveTab('programs')} className="btn btn-outline">
                İlk Programını Oluştur <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            programs.map((program) => {
              const isBundle = program.sessions && program.sessions.length > 0;
              const totalEx = isBundle
                ? program.sessions!.reduce((sum, s) => sum + s.exercises.length, 0)
                : program.exercises.length;
              const totalSets = isBundle
                ? program.sessions!.reduce((sum, s) => sum + s.exercises.reduce((acc, e) => acc + e.sets.length, 0), 0)
                : program.exercises.reduce((sum, e) => sum + e.sets.length, 0);

              return (
                <div key={program.id} className="quick-program-item">
                  <div className="program-item-details">
                    <h3 className="quick-program-name">{program.name}</h3>
                    <p className="quick-program-meta">
                      {isBundle
                        ? `${program.sessions!.length} Antrenman Günü | ${totalEx} Hareket`
                        : `${totalEx} Egzersiz | ${totalSets} Set`
                      }
                    </p>
                  </div>
                  <button id="quick-play-btn" aria-label="quick-play-btn" onClick={() => startWorkout(program)} className="btn-quick-play">
                    <Play size={14} fill="currentColor" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Stats Row */}
      <section className="stats-row">
        <div className="stat-card-compact glass-panel">
          <div className="stat-icon-wrapper-compact purple">
            <Flame size={18} />
          </div>
          <div className="stat-text">
            <p className="stat-label">Aktif Seri</p>
            <p className="stat-value">{activeStreak} Gün</p>
          </div>
        </div>

        <div className="stat-card-compact glass-panel">
          <div className="stat-icon-wrapper-compact cyan">
            <Dumbbell size={18} />
          </div>
          <div className="stat-text">
            <p className="stat-label">Toplam Antrenman</p>
            <p className="stat-value">{totalWorkouts}</p>
          </div>
        </div>

        <div className="stat-card-compact glass-panel">
          <div className="stat-icon-wrapper-compact mint">
            <Award size={18} />
          </div>
          <div className="stat-text">
            <p className="stat-label">Toplam Hacim</p>
            <p className="stat-value">{totalVolume.toLocaleString('tr-TR')} <span className="unit">kg</span></p>
          </div>
        </div>

        <div className="stat-card-compact glass-panel">
          <div className="stat-icon-wrapper-compact amber">
            <Clock size={18} />
          </div>
          <div className="stat-text">
            <p className="stat-label">Aktif Süre</p>
            <p className="stat-value">{totalDuration} <span className="unit">dk</span></p>
          </div>
        </div>
      </section>

      {/* Lower Dashboard Grid (Son Aktivite & Kişisel Rekorlar) */}
      <div className="dashboard-lower-grid">
        {/* Recent Activity List */}
        <section className="recent-activity-section glass-panel">
          <div className="card-header-row">
            <div className="card-header">
              <h2 className="card-title">Son Aktivite</h2>
              <span className="card-description">Son yaptığınız antrenman seansları</span>
            </div>
            <button onClick={() => {
              setActiveTab('profile');
              setProfileSubTab?.('history');
            }} className="btn-text-action">
              Tümünü Gör <ArrowRight size={16} />
            </button>
          </div>

          <div className="recent-workouts-list">
            {history.length === 0 ? (
              <p className="no-history-msg">Henüz tamamlanan antrenman bulunmuyor. İlk antrenmanını tamamla!</p>
            ) : (
              [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3).map((workout) => (
                <div key={workout.id} className="recent-workout-row">
                  <div className="recent-workout-left">
                    <div className="recent-workout-icon">
                      <Dumbbell size={18} />
                    </div>
                    <div className="recent-workout-info">
                      <h3 className="recent-workout-name">{workout.programName}</h3>
                      <p className="recent-workout-date">
                        {formatDateWithDay(workout.date)}
                      </p>
                    </div>
                  </div>
                  <div className="recent-workout-stats">
                    <div className="recent-stat">
                      <span className="recent-stat-val">{workout.duration} dk</span>
                      <span className="recent-stat-lbl">Süre</span>
                    </div>
                    <div className="recent-stat">
                      <span className="recent-stat-val">{workout.totalVolume} kg</span>
                      <span className="recent-stat-lbl">Hacim</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Personal Records Panel */}
        <div className="personal-records-card glass-panel">
          <div className="card-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="card-title">Kişisel Rekorlar (PR)</h2>
              <Trophy size={18} style={{ color: 'var(--accent-amber)', filter: 'drop-shadow(0 0 4px var(--accent-amber-border))' }} />
            </div>
            <span className="card-description">Antrenmanlarda kırdığınız en yüksek rekorlar</span>
          </div>

          <div className="quick-pr-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '235px', overflowY: 'auto', paddingRight: '4px', marginTop: '16px' }}>
            {displayPRs.length === 0 ? (
              <div className="no-pr-prompt" style={{ textAlign: 'center', padding: '20px 10px', color: 'var(--text-secondary)' }}>
                <p style={{ fontSize: '13px', lineHeight: '1.5' }}>Henüz rekor kaydı bulunmuyor. Seanslarınızı tamamladıkça rekorlarınız burada listelenecektir!</p>
              </div>
            ) : (
              [...displayPRs].slice(0, 3).map((pr, idx) => (
                <div key={idx} className="quick-pr-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--surface-2)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', transition: 'all var(--transition-fast)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                    <Award size={16} style={{ color: 'var(--accent-pink)', flexShrink: 0 }} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pr.exerciseName}</h3>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{pr.maxReps} Tekrar</p>
                    </div>
                  </div>
                  <div style={{ marginLeft: '10px', flexShrink: 0 }}>
                    <span className="badge badge-cyan" style={{ fontSize: '12px', fontWeight: '800', padding: '4px 8px' }}>{pr.maxWeight} kg</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .welcome-title {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.04em;
          margin-bottom: 4px;
        }

        .welcome-subtitle {
          color: var(--text-secondary);
          font-size: 14px;
        }

        .header-date {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 13px;
          color: var(--text-primary);
        }

        /* Stats Row */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .stat-card-compact {
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
        }

        .stat-icon-wrapper-compact {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-icon-wrapper-compact.purple { background: rgba(139, 92, 246, 0.12); color: var(--accent-violet); }
        .stat-icon-wrapper-compact.cyan { background: rgba(6, 182, 212, 0.12); color: var(--accent-cyan); }
        .stat-icon-wrapper-compact.mint { background: rgba(16, 185, 129, 0.12); color: var(--accent-mint); }
        .stat-icon-wrapper-compact.amber { background: rgba(245, 158, 11, 0.12); color: var(--accent-amber); }

        .stat-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stat-value {
          font-size: 18px;
          font-weight: 800;
          font-family: var(--font-headings);
          line-height: 1.2;
        }

        .stat-value .unit {
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .stat-label {
          font-size: 11px;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        /* Quick Launch */
        .quick-launch-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .card-header {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .card-title {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .card-description {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .quick-programs-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 12px;
          max-height: 240px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .quick-program-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .quick-program-item:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: var(--border-medium);
          transform: translateX(3px);
        }

        .quick-program-name {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 2px;
        }

        .quick-program-meta {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .btn-quick-play {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          background: var(--gradient-primary);
          color: #fff;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(236, 72, 153, 0.2);
          transition: all var(--transition-fast);
        }

        .btn-quick-play:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 15px rgba(236, 72, 153, 0.4);
        }

        .no-programs-prompt {
          text-align: center;
          padding: 20px;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          grid-column: 1 / -1;
        }

        /* Lower Dashboard Grid */
        .dashboard-lower-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 20px;
          min-width: 0;
        }

        .recent-activity-section {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-width: 0;
        }

        .card-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .personal-records-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .btn-text-action {
          background: transparent;
          border: none;
          color: var(--accent-violet);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: color var(--transition-fast);
          font-size: 13px;
        }

        .btn-text-action:hover {
          color: var(--accent-pink);
        }

        .recent-workouts-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .recent-workout-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
          width: 100%;
          min-width: 0;
        }

        .recent-workout-row:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: var(--border-medium);
        }

        .recent-workout-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          flex: 1;
        }

        .recent-workout-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-light);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-violet);
          flex-shrink: 0;
        }

        .recent-workout-info {
          min-width: 0;
          flex: 1;
        }

        .recent-workout-name {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .recent-workout-date {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .recent-workout-stats {
          display: flex;
          gap: 16px;
          flex-shrink: 0;
          margin-left: 12px;
        }

        .recent-stat {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .recent-stat-val {
          font-size: 13px;
          font-weight: 700;
          font-family: var(--font-headings);
          color: var(--text-primary);
        }

        .recent-stat-lbl {
          font-size: 10px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .no-history-msg {
          color: var(--text-secondary);
          text-align: center;
          padding: 30px;
          font-size: 13px;
        }

        @media (max-width: 1024px) {
          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
          .dashboard-lower-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .stats-row {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
          .stat-card-compact {
            padding: 10px 12px;
            gap: 8px;
          }
          .stat-icon-wrapper-compact {
            width: 32px;
            height: 32px;
          }
          .stat-value {
            font-size: 15px;
          }
          .stat-label {
            font-size: 10px;
          }
          .welcome-title {
            font-size: 26px;
          }
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .recent-activity-section {
            padding: 16px;
          }
          .personal-records-card {
            padding: 16px;
          }
          .recent-workout-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            width: 100%;
            min-width: 0;
          }
          .recent-workout-left {
            width: 100%;
            min-width: 0;
          }
          .recent-workout-stats {
            width: 100%;
            justify-content: space-between;
            padding-top: 8px;
            border-top: 1px solid var(--border-light);
            margin-left: 0;
          }
          .recent-stat {
            align-items: flex-start;
          }
        }

        @media (max-width: 480px) {
          .stats-row {
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
          }
        }
      `}</style>
    </div>
  );
};
