import React, { useState } from 'react';
import { Trash2, Calendar, Clock, Award, ChevronDown, ChevronUp, Share2, X } from 'lucide-react';
import type { CompletedWorkout } from '../types';

interface HistoryProps {
  history: CompletedWorkout[];
  deleteHistoryItem: (id: string) => void;
}

export const History: React.FC<HistoryProps> = ({ history, deleteHistoryItem }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete({ id, name });
  };

  const doDelete = () => {
    if (!confirmDelete) return;
    deleteHistoryItem(confirmDelete.id);
    if (expandedId === confirmDelete.id) setExpandedId(null);
    setConfirmDelete(null);
  };

  // Tek bir antrenmanı CSV olarak native paylaşım menüsüyle (veya masaüstünde indirerek) paylaşır.
  // navigator.share kullanır: <a download> blob'ları Capacitor'ın Android WebView'inde çalışmıyordu.
  const shareWorkoutCSV = async (workout: CompletedWorkout, e: React.MouseEvent) => {
    e.stopPropagation();

    const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = [
      ['Egzersiz', 'Set No', 'Hedef Ağırlık (kg)', 'Hedef Tekrar', 'Hedef RIR', 'Gerçekleşen Ağırlık (kg)', 'Gerçekleşen Tekrar', 'Gerçekleşen RIR', 'Durum'].map(escape).join(',')
    ];

    workout.exercises.forEach(ex => {
      ex.sets.forEach((set, idx) => {
        // Tamamlanan setlerde girilmemiş alanlar hedef değere düşer (hacim hesabıyla aynı mantık),
        // yapılmayan setlerde "-" kalır.
        const actual = (actualVal?: number, targetVal?: number) =>
          set.completed ? (actualVal ?? targetVal ?? '-') : (actualVal ?? '-');

        rows.push([
          ex.name,
          idx + 1,
          set.weight,
          set.reps,
          set.rir !== undefined ? set.rir : '-',
          actual(set.actualWeight, set.weight),
          actual(set.actualReps, set.reps),
          actual(set.actualRir, set.rir),
          set.completed ? 'Tamamlandı' : 'Yapılmadı'
        ].map(escape).join(','));
      });
    });

    const csvContent = '﻿' + rows.join('\r\n');
    // Dosya adı: tarih önce (kronolojik sıralanır), Türkçe karakterler ASCII'ye çevrilir.
    // Paylaşım hedefleri (e-posta, Drive, WhatsApp) boşluk ve aksanlı karakterlerde sorun çıkarabiliyor.
    const TR_MAP: Record<string, string> = {
      ğ: 'g', Ğ: 'G', ü: 'u', Ü: 'U', ş: 's', Ş: 'S',
      ı: 'i', İ: 'I', ö: 'o', Ö: 'O', ç: 'c', Ç: 'C'
    };
    const slug = workout.programName
      .replace(/[ğĞüÜşŞıİöÖçÇ]/g, ch => TR_MAP[ch])
      .replace(/[^a-zA-Z0-9]+/g, '-')   // harf/rakam dışındaki her şey tire
      .replace(/-+/g, '-')              // ardışık tireleri sadeleştir
      .replace(/^-|-$/g, '');           // baştaki/sondaki tireyi at
    const fileName = `AuraFit_${workout.date}_${slug || 'antrenman'}.csv`;
    const file = new File([csvContent], fileName, { type: 'text/csv' });
    const shareData = {
      title: `${workout.programName} - Antrenman Raporu`,
      text: `${new Date(workout.date).toLocaleDateString('tr-TR')} tarihli antrenman: ${workout.totalVolume.toLocaleString('tr-TR')} kg hacim, ${workout.duration} dk.`,
      files: [file]
    };

    if (navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return; // kullanıcı paylaşımı iptal etti
        // paylaşım başarısız oldu, indirmeye düş
      }
    }

    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
    <div className="history-page-container anim-slide-up">
      {/* Header */}
      <header className="history-header">
        <div>
          <h1 className="history-title">Antrenman <span className="gradient-text">Geçmişim</span></h1>
          <p className="history-subtitle">Tamamladığınız antrenmanların detaylı analizini ve istatistiklerini inceleyin. Bir antrenmanı paylaşmak için kartındaki <Share2 size={12} style={{ verticalAlign: 'middle' }} /> ikonunu kullanın.</p>
        </div>
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
            {[...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((workout) => {
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
                        onClick={(e) => shareWorkoutCSV(workout, e)}
                        className="btn-history-delete"
                        aria-label="Antrenmanı paylaş"
                        title="Antrenmanı paylaş (CSV)"
                      >
                        <Share2 size={16} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(workout.id, workout.programName, e)}
                        className="btn-history-delete"
                        aria-label="Antrenmanı sil"
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
                      {workout.notes && (
                        <div style={{ background: 'var(--accent-violet-bg)', border: '1px solid var(--accent-violet-border)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          <span style={{ fontWeight: 700, color: 'var(--accent-violet)', marginRight: '6px' }}>📝 Not:</span>{workout.notes}
                        </div>
                      )}
                      
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

        /* Ekran ortasında açılır; alta yapıştığında butonlar Android jest
           çubuğunun altında kalıp görünmüyordu. */
        .bottom-sheet-backdrop {
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100dvh;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
          overflow-y: auto;
          z-index: 2100;
        }
        .bottom-sheet-content {
          width: 100%;
          max-width: 500px;
          max-height: 88dvh;
          overflow-y: auto;
          margin: auto 0;
          background: var(--bg-card-solid);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          padding: 26px 22px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 50px rgba(0,0,0,0.6);
          animation: popInSheet 0.28s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        @keyframes popInSheet {
          from { transform: scale(0.94); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .bottom-sheet-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 16px;
        }
        .btn-close-sheet {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
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

    {/* Confirm delete modal — outside anim-slide-up to avoid CSS transform stacking context breaking position:fixed */}
    {confirmDelete && (
      <div className="bottom-sheet-backdrop" onClick={() => setConfirmDelete(null)}>
        <div className="bottom-sheet-content glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400, gap: 20 }}>
          <div className="bottom-sheet-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <div>
              <h3 style={{ fontSize: 16 }}>Emin misiniz?</h3>
              <p style={{ marginTop: 8, lineHeight: 1.5, color: 'var(--text-secondary)', fontSize: 14 }}>
                "{confirmDelete.name}" antrenman geçmişini silmek istediğinizden emin misiniz?
              </p>
            </div>
            <button className="btn-close-sheet" onClick={() => setConfirmDelete(null)}><X size={20} /></button>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-secondary" style={{ flex: 1, padding: 14 }} onClick={() => setConfirmDelete(null)}>İptal</button>
            <button
              className="btn btn-danger"
              style={{ flex: 1, padding: 14, background: 'var(--accent-red-bg)', border: '1px solid var(--accent-red-border)', color: 'var(--accent-red-text)' }}
              onClick={doDelete}
            >
              Evet, sil
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
