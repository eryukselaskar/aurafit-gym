import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Plus, X, BookOpen, AlertCircle } from 'lucide-react';
import type { Exercise, PersonalRecord, CompletedWorkout } from '../types';

interface ExerciseLibraryProps {
  exercises: Exercise[];
  addExercise: (exercise: Omit<Exercise, 'id'>) => void;
  personalRecords: PersonalRecord[];
  history: CompletedWorkout[];
}

export const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ 
  exercises, 
  addExercise,
  personalRecords = [],
  history = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'popularity'>('name');
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState<Exercise | null>(null);
  
  // Custom exercise form state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Göğüs');
  const [newDescription, setNewDescription] = useState('');
  const [formError, setFormError] = useState('');

  const categories = ['All', 'Göğüs', 'Sırt', 'Bacak', 'Omuz', 'Kol', 'Karın', 'Kardiyo'];

  // Kullanım sayıları geçmiş üzerinde TEK geçişte hesaplanır. Eskiden her kart
  // için ayrı ayrı (1500 kez) ve ayrıca sıralama karşılaştırıcısının içinde
  // (n log n kez) geçmiş baştan sona taranıyordu.
  const usageCounts = useMemo(() => {
    const counts = new Map<string, number>();
    history.forEach(workout => {
      const seen = new Set<string>();
      workout.exercises.forEach(ex => {
        if (seen.has(ex.exerciseId)) return;
        seen.add(ex.exerciseId);
        counts.set(ex.exerciseId, (counts.get(ex.exerciseId) ?? 0) + 1);
      });
    });
    return counts;
  }, [history]);

  const maxWeights = useMemo(() => {
    const weights = new Map<string, number>();
    personalRecords.forEach(pr => weights.set(pr.exerciseId, pr.maxWeight));
    return weights;
  }, [personalRecords]);

  const filteredExercises = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    return exercises
      .filter((ex) => {
        const matchesSearch = !needle
          || ex.name.toLowerCase().includes(needle)
          || (ex.description?.toLowerCase().includes(needle) ?? false);
        const matchesCategory = selectedCategory === 'All' || ex.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'popularity') {
          const diff = (usageCounts.get(b.id) ?? 0) - (usageCounts.get(a.id) ?? 0);
          if (diff !== 0) return diff;
        }
        return a.name.localeCompare(b.name, 'tr-TR');
      });
  }, [exercises, searchTerm, selectedCategory, sortBy, usageCounts]);

  // Kademeli render: 1524 kartın tamamı DOM'a basılıyordu (~13.700 düğüm,
  // 353.000px sayfa yüksekliği). Listenin sonundaki gözcü görünür olunca bir
  // sonraki parça ekleniyor.
  const PAGE_SIZE = 40;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Filtre/arama değişince baştan başla. React'in "render sırasında state
  // ayarlama" deseni; effect içinde setState cascading render yaratıyordu.
  const filterKey = `${searchTerm}|${selectedCategory}|${sortBy}`;
  const [appliedFilterKey, setAppliedFilterKey] = useState(filterKey);
  if (filterKey !== appliedFilterKey) {
    setAppliedFilterKey(filterKey);
    setVisibleCount(PAGE_SIZE);
  }

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) {
        setVisibleCount(current => Math.min(current + PAGE_SIZE, filteredExercises.length));
      }
    }, { rootMargin: '600px' });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredExercises.length]);

  const visibleExercises = filteredExercises.slice(0, visibleCount);
  const hasMore = visibleCount < filteredExercises.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setFormError('Lütfen egzersiz adını girin.');
      return;
    }
    
    // Check if name already exists
    if (exercises.some(ex => ex.name.toLowerCase() === newName.trim().toLowerCase())) {
      setFormError('Bu isimde bir egzersiz zaten mevcut.');
      return;
    }

    addExercise({
      name: newName.trim(),
      category: newCategory,
      description: newDescription.trim() || undefined,
      isCustom: true
    });

    // Reset and Close
    setNewName('');
    setNewDescription('');
    setFormError('');
    setIsModalOpen(false);
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Göğüs': return 'badge-violet';
      case 'Sırt': return 'badge-cyan';
      case 'Bacak': return 'badge-mint';
      case 'Omuz': return 'badge-amber';
      case 'Kol': return 'badge-pink';
      case 'Karın': return 'badge-violet';
      case 'Kardiyo': return 'badge-mint';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="exercise-library-container anim-slide-up">
      {/* Header */}
      <header className="library-header">
        <div>
          <h1 className="library-title">Egzersiz <span className="gradient-text">Kütüphanesi</span></h1>
          <p className="library-subtitle">Antrenmanlarına eklemek için yüzlerce hareketi incele veya yenisini oluştur.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={18} /> Yeni Egzersiz Ekle
        </button>
      </header>

      {/* Search and Filters */}
      <section className="search-filter-section glass-panel">
        <div className="search-bar-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="search"
            aria-label="Egzersiz ara"
            placeholder="Egzersiz adı veya açıklama ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="search-clear-btn" aria-label="Aramayı temizle">
              <X size={16} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginTop: '12px' }}>
          <div className="category-filters">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`filter-badge ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat === 'All' ? 'Tümü' : cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label
              htmlFor="library-sort"
              style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}
            >
              Sırala:
            </label>
            <select
              id="library-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'popularity')}
              className="form-select"
              style={{
                padding: '6px 28px 6px 12px',
                fontSize: '12px',
                width: 'auto',
                backgroundPosition: 'right 8px center',
                margin: 0
              }}
            >
              <option value="name">Alfabetik (A-Z)</option>
              <option value="popularity">Popülerlik (En Çok Yapılanlar)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Grid of Exercises */}
      <section className="exercise-grid">
        {filteredExercises.length === 0 ? (
          <div className="no-results-panel glass-panel">
            <BookOpen size={48} className="no-results-icon" />
            <h3>Sonuç Bulunamadı</h3>
            <p>Aradığınız kriterlere uygun bir egzersiz bulamadık. Yeni bir egzersiz eklemeyi deneyin!</p>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-outline">
              <Plus size={16} /> Özel Egzersiz Oluştur
            </button>
          </div>
        ) : (
          visibleExercises.map((ex) => {
            const usageCount = usageCounts.get(ex.id) ?? 0;
            const maxWeight = maxWeights.get(ex.id) ?? 0;
            
            return (
              <div 
                key={ex.id} 
                className="exercise-card glass-panel" 
                onClick={() => setSelectedExerciseDetail(ex)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <div className="exercise-card-header" style={{ marginBottom: '6px' }}>
                    <span className={`badge ${getCategoryBadgeClass(ex.category)}`}>{ex.category}</span>
                    {ex.isCustom && <span className="custom-indicator-badge">Özel</span>}
                  </div>
                  <h2 className="exercise-name" style={{ marginBottom: '4px' }}>{ex.name}</h2>
                  <p className="exercise-desc clamp-2">
                    {ex.description || 'Bu egzersiz için henüz bir açıklama eklenmemiş.'}
                  </p>
                </div>
                
                {(usageCount > 0 || maxWeight > 0) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--surface-3)' }}>
                    {usageCount > 0 && (
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        Yapılma: <strong>{usageCount}</strong> seans
                      </span>
                    )}
                    {maxWeight > 0 && (
                      <span className="badge badge-amber" style={{ fontSize: '11px', fontWeight: '800', marginLeft: 'auto' }}>
                        Max: {maxWeight} kg
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

      {/* Kademeli yüklemenin gözcüsü: görünür olunca sonraki parça eklenir. */}
      {hasMore && (
        <div ref={sentinelRef} className="library-sentinel" aria-hidden="true">
          <span className="library-sentinel-text">
            {visibleCount} / {filteredExercises.length} hareket
          </span>
        </div>
      )}

      {/* Detailed Exercise Modal */}
      {selectedExerciseDetail && (
        <div className="modal-backdrop" onClick={() => setSelectedExerciseDetail(null)}>
          <div className="modal-content glass-panel anim-slide-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className={`badge ${getCategoryBadgeClass(selectedExerciseDetail.category)}`} style={{ alignSelf: 'flex-start' }}>
                  {selectedExerciseDetail.category}
                </span>
                <h2 className="modal-title" style={{ marginTop: '4px' }}>{selectedExerciseDetail.name}</h2>
              </div>
              <button onClick={() => setSelectedExerciseDetail(null)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '4px' }}>
              <div className="detail-section">
                <h4 style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 700 }}>Açıklama</h4>
                <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6', background: 'var(--surface-2)', padding: '12px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                  {selectedExerciseDetail.description || 'Bu egzersiz için henüz bir açıklama eklenmemiş.'}
                </p>
              </div>

              {/* Personal Record Section */}
              <div className="detail-section">
                <h4 style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 700 }}>Kişisel Rekor (Maksimum Ağırlık)</h4>
                {(() => {
                  const pr = personalRecords.find(p => p.exerciseId === selectedExerciseDetail.id);
                  if (pr) {
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--accent-cyan-bg)', border: '1px solid var(--accent-cyan-bg-soft)', borderRadius: 'var(--radius-md)' }}>
                        <div>
                          <p style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-cyan)' }}>{pr.maxWeight} kg</p>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{pr.maxReps} Tekrar</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className="badge badge-cyan" style={{ fontSize: '10px' }}>Tahmini 1RM: {pr.oneRepMax} kg</span>
                          {pr.date && (
                            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>Tarih: {new Date(pr.date.replace(/-/g, '/')).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          )}
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '12px', background: 'var(--surface-1)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                        Henüz bu hareket için rekor kaydı bulunmuyor.
                      </p>
                    );
                  }
                })()}
              </div>

              {/* Exercise History Section */}
              <div className="detail-section">
                <h4 style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 700 }}>Geçmiş Performans (Son 5 Seans)</h4>
                {(() => {
                  const exHistory = history
                    .map(workout => {
                      const ex = workout.exercises.find(e => e.exerciseId === selectedExerciseDetail.id);
                      if (!ex) return null;
                      return {
                        date: workout.date,
                        programName: workout.programName,
                        sets: ex.sets.filter(s => s.completed)
                      };
                    })
                    .filter(Boolean) as { date: string; programName: string; sets: { weight: number; reps: number; actualWeight?: number; actualReps?: number }[] }[];

                  if (exHistory.length > 0) {
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {exHistory.slice(0, 5).map((session, sIdx) => (
                          <div key={sIdx} style={{ padding: '12px', background: 'var(--surface-1)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>{session.programName}</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                {new Date(session.date.replace(/-/g, '/')).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {session.sets.map((set, setIdx) => {
                                const w = set.actualWeight ?? set.weight;
                                const r = set.actualReps ?? set.reps;
                                return (
                                  <span key={setIdx} className="badge badge-secondary" style={{ fontSize: '10px', padding: '3px 8px' }}>
                                    Set {setIdx + 1}: {w} kg x {r}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  } else {
                    return (
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '12px', background: 'var(--surface-1)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                        Bu egzersizle henüz tamamlanmış bir antrenman bulunmuyor.
                      </p>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Exercise Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel anim-slide-up">
            <div className="modal-header">
              <h2 className="modal-title">Özel Egzersiz Oluştur</h2>
              <button onClick={() => { setIsModalOpen(false); setFormError(''); }} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {formError && (
                <div className="form-error-alert">
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Egzersiz Adı *</label>
                <input
                  type="text"
                  placeholder="Örn: Incline Bench Press"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="form-input"
                  maxLength={50}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Hedef Kas Grubu / Kategori *</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="form-select"
                >
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Açıklama (İsteğe Bağlı)</label>
                <textarea
                  placeholder="Egzersiz formu, ipuçları veya püf noktaları hakkında not yazın..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="form-textarea"
                  rows={4}
                  maxLength={200}
                />
              </div>

              <div className="modal-footer-actions">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setFormError(''); }}
                  className="btn btn-secondary"
                >
                  İptal
                </button>
                <button type="submit" className="btn btn-primary">
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        /* Açıklama iki satıra kısılıyor: kartlar eskiden 190px sabit minimum
           yükseklikteydi ve bir hareket bulmak için sonsuz kaydırma gerekiyordu. */
        .exercise-desc.clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          overflow-wrap: anywhere;
        }

        .library-sentinel {
          display: flex;
          justify-content: center;
          padding: 24px 0 8px;
        }

        .library-sentinel-text {
          font-size: 12px;
          color: var(--text-muted);
          font-variant-numeric: tabular-nums;
        }

        .exercise-library-container {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .library-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .library-title {
          font-size: 36px;
          font-weight: 800;
          letter-spacing: -0.04em;
          margin-bottom: 6px;
        }

        .library-subtitle {
          color: var(--text-secondary);
          font-size: 16px;
        }

        .category-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        /* Exercise Grid */
        .exercise-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 12px;
        }

        /* height: 180px sabitti; açıklaması kısa hareketlerde kartın yarısı boş
           kalıyor, bir hareket bulmak uzun kaydırma gerektiriyordu. Kart artık
           içeriği kadar yer kaplıyor. */
        .exercise-card {
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .exercise-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-lg);
          border-color: var(--border-medium);
        }

        .exercise-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .custom-indicator-badge {
          font-size: 10px;
          background: rgba(6, 182, 212, 0.1);
          color: var(--accent-cyan);
          border: 1px solid rgba(6, 182, 212, 0.2);
          padding: 2px 8px;
          border-radius: var(--radius-full);
          font-weight: 600;
          text-transform: uppercase;
        }

        .badge-pink {
          background: rgba(236, 72, 153, 0.15);
          color: #f472b6;
          border: 1px solid rgba(236, 72, 153, 0.2);
        }

        .exercise-name {
          font-size: 18px;
          font-weight: 700;
          line-height: 1.3;
          letter-spacing: -0.01em;
        }

        .exercise-desc {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }

        .no-results-panel {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 15px;
          padding: 60px 40px;
          text-align: center;
          color: var(--text-secondary);
        }

        .no-results-icon {
          color: var(--border-medium);
        }

        .no-results-panel h3 {
          color: var(--text-primary);
          font-size: 20px;
        }

        /* Modal styling */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(5, 6, 9, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          width: 100%;
          max-width: 480px;
          background: var(--bg-card-solid);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          padding: 30px;
          box-shadow: var(--shadow-lg);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .modal-title {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .modal-close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: color var(--transition-fast);
        }

        .modal-close-btn:hover {
          color: var(--text-primary);
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-error-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #f87171;
          padding: 12px;
          border-radius: var(--radius-md);
          font-size: 13px;
          font-weight: 600;
        }

        .modal-footer-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 10px;
        }

        @media (max-width: 640px) {
          .library-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          .library-header .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
