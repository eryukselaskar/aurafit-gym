import React, { useState } from 'react';
import { Trash2, Calendar, Clock, Award, ChevronDown, ChevronUp, Download } from 'lucide-react';
import type { CompletedWorkout } from '../types';

interface HistoryProps {
  history: CompletedWorkout[];
  deleteHistoryItem: (id: string) => void;
}

export const History: React.FC<HistoryProps> = ({ history, deleteHistoryItem }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering expand toggle
    const confirm = window.confirm(`"${name}" antrenman geçmişini silmek istediğinizden emin misiniz?`);
    if (confirm) {
      deleteHistoryItem(id);
      if (expandedId === id) setExpandedId(null);
    }
  };

  const exportWeeklyCSV = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Sort chronologically
    const weeklyWorkouts = history
      .filter(w => new Date(w.date) >= sevenDaysAgo)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (weeklyWorkouts.length === 0) {
      alert("Son 7 güne ait tamamlanmış antrenman kaydı bulunamadı.");
      return;
    }
    
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += "Tarih,Antrenman Adı,Egzersiz,Set No,Hedef Ağırlık (kg),Hedef Tekrar,Hedef RIR,Gerçekleşen Ağırlık (kg),Gerçekleşen Tekrar,Gerçekleşen RIR,Durum\n";
    
    weeklyWorkouts.forEach(workout => {
      const formattedDate = new Date(workout.date).toLocaleDateString('tr-TR');
      const workoutName = workout.programName.replace(/"/g, '""');
      
      workout.exercises.forEach(ex => {
        const exName = ex.name.replace(/"/g, '""');
        
        ex.sets.forEach((set, idx) => {
          const targetWeight = set.weight;
          const targetReps = set.reps;
          const targetRir = set.rir !== undefined ? set.rir : "";
          
          const actualWeight = set.actualWeight !== undefined ? set.actualWeight : "";
          const actualReps = set.actualReps !== undefined ? set.actualReps : "";
          const actualRir = set.actualRir !== undefined ? set.actualRir : "";
          const status = set.completed ? "Tamamlandı" : "Yapılmadı";
          
          csvContent += `"${formattedDate}","${workoutName}","${exName}",${idx + 1},${targetWeight},${targetReps},${targetRir},${actualWeight},${actualReps},${actualRir},"${status}"\n`;
        });
      });
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `AuraFit_Haftalik_Rapor_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="history-page-container anim-slide-up">
      {/* Header */}
      <header className="history-header">
        <div>
          <h1 className="history-title">Antrenman <span className="gradient-text">Geçmişim</span></h1>
          <p className="history-subtitle">Tamamladığınız antrenmanların detaylı analizini ve istatistiklerini inceleyin.</p>
        </div>
        {history.length > 0 && (
          <button 
            onClick={exportWeeklyCSV}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Download size={18} /> Haftalık Rapor Aktar (Excel)
          </button>
        )}
      </header>

      {/* History List */}
      <section className="history-list-section">
        {history.length === 0 ? (
          <div className="empty-history-prompt glass-panel">
            <Calendar size={48} className="calendar-prompt-icon" />
            <h2>Henüz Antrenman Kaydınız Yok</h2>
            <p>Tamamladığınız antrenmanlar burada listelenecektir. Hemen bir antrenman başlatın ve kaydedin!</p>
          </div>
        ) : (
          <div className="history-items-container">
            {[...history].reverse().map((workout) => {
              const isExpanded = expandedId === workout.id;
              const completedDate = new Date(workout.date).toLocaleDateString('tr-TR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });

              return (
                <div 
                  key={workout.id} 
                  className={`history-card glass-panel ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => toggleExpand(workout.id)}
                >
                  <div className="history-card-summary">
                    <div className="card-left-info">
                      <div className="workout-date-badge">
                        <Calendar size={16} />
                        <span>{completedDate}</span>
                      </div>
                      <h3 className="history-workout-name">{workout.programName}</h3>
                    </div>

                    <div className="card-right-stats">
                      <div className="stat-pill">
                        <Clock size={14} className="stat-pill-icon purple" />
                        <span>{workout.duration} dk</span>
                      </div>
                      <div className="stat-pill">
                        <Award size={14} className="stat-pill-icon mint" />
                        <span>{workout.totalVolume.toLocaleString('tr-TR')} kg</span>
                      </div>
                      <button 
                        onClick={(e) => handleDelete(workout.id, workout.programName, e)} 
                        className="btn-history-delete"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="expand-chevron">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="history-expanded-details anim-slide-up" onClick={(e) => e.stopPropagation()}>
                      <h4 className="detail-title">Antrenman Detayları</h4>
                      
                      {workout.exercises.length === 0 ? (
                        <p className="no-detail-msg">Bu antrenman için kaydedilmiş set detayı bulunmuyor.</p>
                      ) : (
                        <div className="history-exercises-details-list">
                          {workout.exercises.map((ex) => (
                            <div key={ex.id} className="history-ex-detail-row">
                              <div className="ex-detail-header">
                                <h5 className="ex-detail-name">{ex.name}</h5>
                                <span className="badge badge-cyan">{ex.category}</span>
                              </div>

                              <div className="ex-sets-detail-grid">
                                {ex.sets.map((set, setIdx) => {
                                  const reps = set.actualReps ?? set.reps;
                                  const weight = set.actualWeight ?? set.weight;
                                  return (
                                    <div 
                                      key={set.id} 
                                      className={`ex-set-detail-pill ${set.completed ? 'set-completed' : 'set-skipped'}`}
                                    >
                                      <span className="pill-number">{setIdx + 1}</span>
                                      <span className="pill-vals">
                                        {weight}kg x {reps}
                                        {set.actualRir !== undefined ? ` @RIR ${set.actualRir}` : (set.rir !== undefined ? ` @RIR ${set.rir}` : '')}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <style>{`
        .history-page-container {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .history-title {
          font-size: 36px;
          font-weight: 800;
          letter-spacing: -0.04em;
          margin-bottom: 6px;
        }

        .history-subtitle {
          color: var(--text-secondary);
          font-size: 16px;
        }

        /* History Items List */
        .history-items-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .history-card {
          padding: 20px 24px;
          cursor: pointer;
          transition: all var(--transition-normal);
          overflow: hidden;
        }

        .history-card:hover {
          border-color: var(--border-medium);
          background: var(--bg-card-hover);
        }

        .history-card.expanded {
          background: rgba(18, 20, 29, 0.7);
          border-color: rgba(139, 92, 246, 0.2);
        }

        .history-card-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .card-left-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .workout-date-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 600;
        }

        .history-workout-name {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .card-right-stats {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-full);
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .stat-pill-icon.purple { color: var(--accent-violet); }
        .stat-pill-icon.mint { color: var(--accent-mint); }

        .btn-history-delete {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 8px;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-history-delete:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .expand-chevron {
          color: var(--text-muted);
          margin-left: 8px;
          display: flex;
          align-items: center;
        }

        /* Expanded area */
        .history-expanded-details {
          margin-top: 24px;
          border-top: 1px solid var(--border-light);
          padding-top: 20px;
          cursor: default;
        }

        .detail-title {
          font-size: 15px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
          margin-bottom: 16px;
        }

        .no-detail-msg {
          color: var(--text-muted);
          font-size: 14px;
        }

        .history-exercises-details-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .history-ex-detail-row {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: 16px;
        }

        .ex-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .ex-detail-name {
          font-size: 16px;
          font-weight: 700;
        }

        .ex-sets-detail-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .ex-set-detail-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          font-size: 12px;
          font-weight: 600;
        }

        .ex-set-detail-pill.set-completed {
          background: rgba(16, 185, 129, 0.08);
          color: var(--accent-mint);
          border: 1px solid rgba(16, 185, 129, 0.15);
        }

        .ex-set-detail-pill.set-skipped {
          background: rgba(239, 68, 68, 0.08);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.15);
        }

        .pill-number {
          background: rgba(255, 255, 255, 0.05);
          width: 18px;
          height: 18px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
        }

        .pill-vals {
          font-family: var(--font-headings);
        }

        .empty-history-prompt {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 40px;
          gap: 20px;
          text-align: center;
          color: var(--text-secondary);
        }

        .calendar-prompt-icon {
          color: var(--border-medium);
        }

        .empty-history-prompt h2 {
          color: var(--text-primary);
          font-size: 24px;
        }

        @media (max-width: 768px) {
          .history-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          .history-header button {
            width: 100%;
          }
          .history-card-summary {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          .card-right-stats {
            width: 100%;
            justify-content: space-between;
            border-top: 1px solid var(--border-light);
            padding-top: 12px;
          }
          .stat-pill {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};
