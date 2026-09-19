import React, { useState } from 'react';
import { Plus, Trash2, Edit2, ChevronLeft, Save, Sparkles, BookOpen, AlertCircle, X, Play, Check } from 'lucide-react';
import type { WorkoutProgram, Exercise, WorkoutExercise, WorkoutSession } from '../types';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { formatRepTarget, validateRepRange } from '../utils/repTarget';
import { createId } from '../utils/id';
import { SortableExerciseCard } from './ProgramExerciseCard';
import './ProgramBuilder.css';



// Egzersiz kütüphanesindeki filtrelerle aynı liste.
const SELECTOR_CATEGORIES = ['All', 'Göğüs', 'Sırt', 'Bacak', 'Omuz', 'Kol', 'Karın', 'Kardiyo'];

interface ProgramBuilderProps {
  programs: WorkoutProgram[];
  exercises: Exercise[];
  saveProgram: (program: WorkoutProgram) => void;
  deleteProgram: (programId: string) => void;
  startWorkout: (program: WorkoutProgram, session?: WorkoutSession) => void;
}


export const ProgramBuilder: React.FC<ProgramBuilderProps> = ({
  programs,
  exercises,
  saveProgram,
  deleteProgram,
  startWorkout
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeProgram, setActiveProgram] = useState<WorkoutProgram | null>(null);
  
  // Program Details view state
  const [selectedProgramDetail, setSelectedProgramDetail] = useState<WorkoutProgram | null>(null);

  // Builder form states
  const [programName, setProgramName] = useState('');
  const [programDesc, setProgramDesc] = useState('');
  const [programExercises, setProgramExercises] = useState<WorkoutExercise[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // Seçici bu oturumda hangi hareketleri ekledi: listede ✓ göstermek için.
  const [justAddedIds, setJustAddedIds] = useState<string[]>([]);

  const openExerciseSelector = () => {
    setJustAddedIds([]);
    setShowExerciseSelector(true);
  };

  const closeExerciseSelector = () => {
    setShowExerciseSelector(false);
    setSearchTerm('');
    setJustAddedIds([]);
  };
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [formError, setFormError] = useState('');

  // Bundle program states in builder form
  const [isBundleProgram, setIsBundleProgram] = useState(false);
  const [programSessions, setProgramSessions] = useState<WorkoutSession[]>([]);
  const [activeSessionIndex, setActiveSessionIndex] = useState(0);

  // DnD kit reordering
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const handleDndEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    if (isBundleProgram) {
      const updated = [...programSessions];
      const session = updated[activeSessionIndex];
      if (session) {
        const ids = session.exercises.map(ex => ex.id);
        const oldIndex = ids.indexOf(active.id as string);
        const newIndex = ids.indexOf(over.id as string);
        if (oldIndex !== -1 && newIndex !== -1) {
          session.exercises = arrayMove(session.exercises, oldIndex, newIndex);
          setProgramSessions(updated);
        }
      }
    } else {
      const ids = programExercises.map(ex => ex.id);
      const oldIndex = ids.indexOf(active.id as string);
      const newIndex = ids.indexOf(over.id as string);
      if (oldIndex !== -1 && newIndex !== -1) {
        setProgramExercises(arrayMove(programExercises, oldIndex, newIndex));
      }
    }
  };

  const handleCreateNew = () => {
    setProgramName('');
    setProgramDesc('');
    setProgramExercises([]);
    setIsBundleProgram(false);
    setProgramSessions([]);
    setActiveSessionIndex(0);
    setFormError('');
    setIsEditing(true);
    setActiveProgram(null);
  };

  const handleEdit = (program: WorkoutProgram) => {
    setActiveProgram(program);
    setProgramName(program.name);
    setProgramDesc(program.description || '');
    if (program.sessions && program.sessions.length > 0) {
      setIsBundleProgram(true);
      setProgramSessions(program.sessions.map(s => ({
        ...s,
        exercises: s.exercises.map(ex => ({
          ...ex,
          sets: ex.sets.map(set => ({ ...set }))
        }))
      })));
      setActiveSessionIndex(0);
      setProgramExercises([]);
    } else {
      setIsBundleProgram(false);
      setProgramSessions([]);
      setProgramExercises(program.exercises.map(ex => ({
        ...ex,
        sets: ex.sets.map(set => ({ ...set }))
      })));
    }
    setFormError('');
    setIsEditing(true);
  };

  // Düzenleyicide kaydedilmemiş içerik var mı? Geri çıkışta uyarmak için kullanılır.
  const hasUnsavedContent = () => {
    if (programName.trim() || programDesc.trim()) return true;
    return isBundleProgram
      ? programSessions.some(s => s.exercises.length > 0)
      : programExercises.length > 0;
  };

  const handleExitEditor = () => {
    if (!hasUnsavedContent()) {
      setIsEditing(false);
      return;
    }
    setConfirmModal({
      message: 'Kaydedilmemiş değişiklikleriniz var. Çıkarsanız bu program kaybolacak.',
      onConfirm: () => {
        setConfirmModal(null);
        setIsEditing(false);
      }
    });
  };

  const handleAddSession = () => {
    const newSession: WorkoutSession = {
      id: `sess-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: `Antrenman Günü ${programSessions.length + 1}`,
      exercises: []
    };
    const updated = [...programSessions, newSession];
    setProgramSessions(updated);
    setActiveSessionIndex(updated.length - 1);
  };

  const handleRemoveSession = (index: number) => {
    if (programSessions.length <= 1) return; // Keep at least 1
    const updated = programSessions.filter((_, i) => i !== index);
    setProgramSessions(updated);
    setActiveSessionIndex(Math.max(0, index - 1));
  };

  const handleSessionNameChange = (name: string) => {
    setProgramSessions(prev => prev.map((sess, i) =>
      i === activeSessionIndex ? { ...sess, name } : sess
    ));
  };
  const handleAddExerciseToProgram = (exercise: Exercise) => {
    const newWorkoutExercise: WorkoutExercise = {
      id: createId('we'),
      exerciseId: exercise.id,
      name: exercise.name,
      category: exercise.category,
      restTime: 60,
      minReps: 6,
      maxReps: 12,
      sets: [
        { id: createId('s'), reps: 10, weight: 20, rir: 2, completed: false }
      ]
    };

    updateExercises(list => [...list, newWorkoutExercise]);
    // Seçici açık kalır ve arama korunur: bir günü kurarken arka arkaya birkaç
    // hareket eklemek normaldir, her eklemede modalı kapatmak o akışı kırıyordu.
    setJustAddedIds(prev => [...prev, exercise.id]);
  };

  // Split ve tek-seans programlar aynı egzersiz listesi mantığını paylaşır; tek fark
  // listenin nerede durduğu. Bu yardımcı o dallanmayı tek yere toplar ve güncellemeyi
  // immutable yapar (önceki sürüm state nesnelerini doğrudan mutasyona uğratıyordu).
  const updateExercises = (
    mutate: (list: WorkoutExercise[]) => WorkoutExercise[] | void
  ) => {
    if (isBundleProgram) {
      setProgramSessions(prev => prev.map((sess, i) => {
        if (i !== activeSessionIndex) return sess;
        const copy = sess.exercises.map(ex => ({ ...ex, sets: ex.sets.map(s => ({ ...s })) }));
        return { ...sess, exercises: mutate(copy) || copy };
      }));
    } else {
      setProgramExercises(prev => {
        const copy = prev.map(ex => ({ ...ex, sets: ex.sets.map(s => ({ ...s })) }));
        return mutate(copy) || copy;
      });
    }
  };

  // Tek bir egzersizi güvenle güncellemek için kısayol.
  const updateExercise = (index: number, mutate: (ex: WorkoutExercise) => void) => {
    updateExercises(list => {
      const target = list[index];
      if (target) mutate(target);
    });
  };

  const handleRemoveExercise = (index: number) => {
    updateExercises(list => list.filter((_, i) => i !== index));
  };

  const handleAddSet = (exerciseIndex: number) => {
    updateExercise(exerciseIndex, target => {
      const lastSet = target.sets[target.sets.length - 1];
      target.sets.push({
        id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        reps: target.maxReps !== undefined ? target.maxReps : (lastSet ? lastSet.reps : 10),
        weight: target.weight !== undefined ? target.weight : (lastSet ? lastSet.weight : 20),
        rir: target.rir !== undefined ? target.rir : (lastSet ? (lastSet.rir !== undefined ? lastSet.rir : 2) : 2),
        completed: false
      });
    });
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    updateExercise(exerciseIndex, target => {
      if (target.sets.length <= 1) return;
      target.sets.splice(setIndex, 1);
    });
  };

  const handleSetChange = (
    exerciseIndex: number,
    setIndex: number,
    field: 'reps' | 'weight' | 'rir',
    value: number
  ) => {
    updateExercise(exerciseIndex, target => {
      if (!target.sets[setIndex]) return;
      target.sets[setIndex] = { ...target.sets[setIndex], [field]: value };
    });
  };

  const handleRestChange = (exerciseIndex: number, value: number) => {
    updateExercise(exerciseIndex, target => { target.restTime = value; });
  };

  const handleNotesChange = (exerciseIndex: number, value: string) => {
    updateExercise(exerciseIndex, target => { target.notes = value; });
  };

  const handleMinRepsChange = (exerciseIndex: number, value: number | undefined) => {
    updateExercise(exerciseIndex, target => { target.minReps = value; });
  };

  // Egzersiz seviyesindeki hedef girildiğinde set satırları salt-okunur rozete dönüşür,
  // bu yüzden değeri setlere de yazıyoruz (UI'daki "sabitlenmiştir" davranışı).
  const handleMaxRepsChange = (exerciseIndex: number, value: number | undefined) => {
    updateExercise(exerciseIndex, target => {
      target.maxReps = value;
      if (value !== undefined) target.sets = target.sets.map(s => ({ ...s, reps: value }));
    });
  };

  const handleWeightChange = (exerciseIndex: number, value: number | undefined) => {
    updateExercise(exerciseIndex, target => {
      target.weight = value;
      if (value !== undefined) target.sets = target.sets.map(s => ({ ...s, weight: value }));
    });
  };

  const handleRirChange = (exerciseIndex: number, value: number | undefined) => {
    updateExercise(exerciseIndex, target => {
      target.rir = value;
      if (value !== undefined) target.sets = target.sets.map(s => ({ ...s, rir: value }));
    });
  };

  const handleSave = () => {
    if (!programName.trim()) {
      setFormError('Lütfen program adını girin.');
      return;
    }

    if (isBundleProgram) {
      if (programSessions.length === 0) {
        setFormError('Lütfen programa en az bir gün ekleyin.');
        return;
      }
      const hasEmptySession = programSessions.some(s => s.exercises.length === 0);
      if (hasEmptySession) {
        setFormError('Lütfen oluşturduğunuz tüm günlere en az bir egzersiz ekleyin.');
        return;
      }
    } else {
      if (programExercises.length === 0) {
        setFormError('Lütfen programa en az bir egzersiz ekleyin.');
        return;
      }
    }

    // Min > Max gibi tutarsız hedef aralıkları sessizce kaydediliyordu ("20-5 tekrar").
    const allExercises = isBundleProgram
      ? programSessions.flatMap(s => s.exercises)
      : programExercises;
    const rangeError = allExercises.map(validateRepRange).find(Boolean);
    if (rangeError) {
      setFormError(rangeError);
      return;
    }

    const saved: WorkoutProgram = {
      id: activeProgram ? activeProgram.id : `prog-${Date.now()}`,
      name: programName.trim(),
      description: programDesc.trim() || undefined,
      exercises: isBundleProgram ? [] : programExercises,
      sessions: isBundleProgram ? programSessions : undefined,
      createdAt: activeProgram ? activeProgram.createdAt : new Date().toISOString()
    };

    saveProgram(saved);
    setIsEditing(false);
    setActiveProgram(null);
    setSelectedProgramDetail(null);
  };

  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === 'All' || ex.category === selectedCategory)
  );

  if (isEditing) {
    const activeExList: WorkoutExercise[] = isBundleProgram
      ? (programSessions[activeSessionIndex]?.exercises || [])
      : programExercises;


    return (
      <>
      <div className="builder-container anim-slide-up">
        {/* Back and Title Header */}
        <header className="builder-header">
          <button onClick={handleExitEditor} className="btn btn-secondary btn-icon" aria-label="Geri dön">
            <ChevronLeft size={20} />
          </button>
          <div className="header-titles">
            <h1 className="builder-title">
              {activeProgram ? 'Programı ' : 'Yeni Program '}
              <span className="gradient-text">{activeProgram ? 'Düzenle' : 'Oluştur'}</span>
            </h1>
            <p className="builder-subtitle">Kişisel hedeflerinize uygun egzersiz, set ve süreleri belirleyin.</p>
          </div>
          {/* Ad girilmeden kaydetmek zaten hata veriyordu; o hâldeyken butonu
              ikincil göstermek ekrandaki tek birincil eylemi "Egzersiz Ekle"
              bırakıyor ve boş formda yanlış yönlendirme yapmıyor. */}
          <button
            onClick={handleSave}
            className={`btn ${programName.trim() ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Save size={18} /> Kaydet
          </button>
        </header>

        {formError && (
          <div className="form-error-alert builder-error">
            <AlertCircle size={16} />
            <span>{formError}</span>
          </div>
        )}

        <div className="builder-form-grid">
          {/* Main Info */}
          <section className="builder-info-card glass-panel">
            <h2 className="section-title">Program Detayları</h2>
            
            {!activeProgram ? (
              <div className="form-group">
                <label className="form-label">Program Türü</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsBundleProgram(false);
                      setProgramExercises([]);
                    }}
                    className={`btn btn-sm ${!isBundleProgram ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                  >
                    Tek Seanslık
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsBundleProgram(true);
                      if (programSessions.length === 0) {
                        setProgramSessions([
                          { id: `sess-${Date.now()}`, name: 'PAZARTESİ — Push', exercises: [] }
                        ]);
                        setActiveSessionIndex(0);
                      }
                    }}
                    className={`btn btn-sm ${isBundleProgram ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                  >
                    Çok Günlük (Split)
                  </button>
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Program Türü</label>
                <span className="badge badge-violet" style={{ display: 'inline-block', marginTop: '6px' }}>
                  {isBundleProgram ? 'Çok Günlük (Split) Programı' : 'Tek Seanslık Program'}
                </span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="program-name">Program Adı *</label>
              <input
                id="program-name"
                type="text"
                placeholder="Örn: Push Günü"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                className="form-input"
                maxLength={40}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="program-desc">Açıklama</label>
              <textarea
                id="program-desc"
                placeholder="Odak bölgeler veya notlar (isteğe bağlı)"
                value={programDesc}
                onChange={(e) => setProgramDesc(e.target.value)}
                className="form-textarea"
                rows={3}
                maxLength={120}
              />
            </div>
          </section>

          {/* Exercises Builder */}
          <section className="builder-exercises-section">
            {isBundleProgram && (
              <div className="session-tabs-wrapper" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '10px' }}>
                <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Program Günleri / Seanslar</label>
                <div className="session-tabs-container">
                  {programSessions.map((sess, idx) => (
                    <button
                      key={sess.id}
                      type="button"
                      onClick={() => setActiveSessionIndex(idx)}
                      className={`btn btn-sm ${activeSessionIndex === idx ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ textTransform: 'none', padding: '6px 12px' }}
                    >
                      {sess.name.split(' — ')[0] || `Gün ${idx + 1}`}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddSession}
                    className="btn btn-sm btn-outline"
                    style={{ padding: '6px 12px' }}
                  >
                    + Gün Ekle
                  </button>
                </div>
              </div>
            )}

            {isBundleProgram && programSessions[activeSessionIndex] && (
              <div className="session-day-name-editor glass-panel" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                  <label className="form-label" htmlFor="session-name">Seçili Günün Başlığı</label>
                  <input
                    id="session-name"
                    type="text"
                    value={programSessions[activeSessionIndex].name}
                    onChange={(e) => handleSessionNameChange(e.target.value)}
                    className="form-input"
                    placeholder="Örn: PAZARTESİ — Push (Göğüs & Triceps)"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSession(activeSessionIndex)}
                  disabled={programSessions.length <= 1}
                  className="btn btn-secondary btn-icon"
                  style={{ padding: '10px', color: 'var(--accent-red-text)' }}
                  title="Bu Günü Sil"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}

            <div className="section-header">
              <h2 className="section-title">
                {isBundleProgram && programSessions[activeSessionIndex]
                  ? `${programSessions[activeSessionIndex].name.split(' — ')[0]} Egzersizleri`
                  : 'Egzersizler'
                } ({activeExList.length})
              </h2>
              <button onClick={() => openExerciseSelector()} className="btn btn-outline btn-add-ex">
                <Plus size={16} /> Egzersiz Ekle
              </button>
            </div>

            <div className="builder-exercises-list">
              {activeExList.length === 0 ? (
                <div className="empty-builder-state glass-panel">
                  <BookOpen size={36} />
                  <p>Bu güne henüz hareket eklemediniz.</p>
                  <button onClick={() => openExerciseSelector()} className="btn btn-secondary btn-sm">
                    Kütüphaneden Seç
                  </button>
                </div>
              ) : (
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDndEnd}>
                  <SortableContext items={activeExList.map(ex => ex.id)} strategy={verticalListSortingStrategy}>
                    {activeExList.map((ex, exIdx) => (
                      <SortableExerciseCard
                        key={ex.id}
                        ex={ex}
                        exIdx={exIdx}
                        onRemove={() => handleRemoveExercise(exIdx)}
                        onRestChange={(v) => handleRestChange(exIdx, v)}
                        onMinRepsChange={(v) => handleMinRepsChange(exIdx, v)}
                        onMaxRepsChange={(v) => handleMaxRepsChange(exIdx, v)}
                        onWeightChange={(v) => handleWeightChange(exIdx, v)}
                        onRirChange={(v) => handleRirChange(exIdx, v)}
                        onNotesChange={(v) => handleNotesChange(exIdx, v)}
                        onSetChange={(setIdx, field, value) => handleSetChange(exIdx, setIdx, field, value)}
                        onAddSet={() => handleAddSet(exIdx)}
                        onRemoveSet={(setIdx) => handleRemoveSet(exIdx, setIdx)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Exercise Selector Slide-In / Modal */}
      {showExerciseSelector && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel anim-slide-up selector-modal">
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Egzersiz Seçin</h2>
                <p className="selector-subtitle">
                  {justAddedIds.length > 0
                    ? `${justAddedIds.length} hareket eklendi`
                    : 'Birden fazla hareket seçebilirsiniz'}
                </p>
              </div>
              <button
                onClick={closeExerciseSelector}
                className="modal-close-btn"
                aria-label="Egzersiz seçimini kapat"
              >
                <X size={20} />
              </button>
            </div>

            <div className="form-group selector-search">
              <input
                type="text"
                placeholder="Egzersiz adı ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="selector-filters">
              {SELECTOR_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`filter-badge ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat === 'All' ? 'Tümü' : cat}
                </button>
              ))}
            </div>

            <p className="selector-result-count" aria-live="polite">
              {filteredExercises.length} sonuç
            </p>

            <div className="selector-list">
              {filteredExercises.length === 0 && (
                <p className="selector-empty">Bu filtreye uyan egzersiz bulunamadı.</p>
              )}
              {filteredExercises.map((ex) => {
                const addedCount = justAddedIds.filter(id => id === ex.id).length;
                return (
                  <button
                    key={ex.id}
                    onClick={() => handleAddExerciseToProgram(ex)}
                    className={`selector-item ${addedCount > 0 ? 'added' : ''}`}
                  >
                    <div className="selector-item-text">
                      <p className="selector-item-name">{ex.name}</p>
                      {selectedCategory === 'All' && (
                        <span className="badge badge-violet">{ex.category}</span>
                      )}
                    </div>
                    {addedCount > 0 ? (
                      <span className="selector-added-mark" aria-label={`${ex.name} eklendi`}>
                        <Check size={16} />
                        {addedCount > 1 && <span className="selector-added-count">{addedCount}</span>}
                      </span>
                    ) : (
                      <Plus size={18} className="selector-plus-icon" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="selector-footer">
              <button onClick={closeExerciseSelector} className="btn btn-primary selector-done-btn">
                {justAddedIds.length > 0 ? `Bitti (${justAddedIds.length})` : 'Bitti'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmModal && (
        <div className="pb-modal-backdrop" onClick={() => setConfirmModal(null)}>
          <div className="pb-modal-box glass-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16 }}>Emin misiniz?</h3>
                <p style={{ marginTop: 8, lineHeight: 1.5, color: 'var(--text-secondary)', fontSize: 14 }}>{confirmModal.message}</p>
              </div>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }} onClick={() => setConfirmModal(null)}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" style={{ flex: 1, padding: 14 }} onClick={() => setConfirmModal(null)}>Vazgeç</button>
              <button
                className="btn btn-danger"
                style={{ flex: 1, padding: 14, background: 'var(--accent-red-bg)', border: '1px solid var(--accent-red-border)', color: 'var(--accent-red-text)' }}
                onClick={confirmModal.onConfirm}
              >
                Evet, çık
              </button>
            </div>
          </div>
        </div>
      )}

      </>
    );
  }

  if (selectedProgramDetail) {
    const isBundle = selectedProgramDetail.sessions && selectedProgramDetail.sessions.length > 0;
    const totalEx = isBundle 
      ? selectedProgramDetail.sessions!.reduce((sum, s) => sum + s.exercises.length, 0)
      : selectedProgramDetail.exercises.length;
    const totalSets = isBundle 
      ? selectedProgramDetail.sessions!.reduce((sum, s) => sum + s.exercises.reduce((acc, e) => acc + e.sets.length, 0), 0)
      : selectedProgramDetail.exercises.reduce((sum, e) => sum + e.sets.length, 0);

    return (
      <>
      <div className="program-detail-view anim-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <header className="builder-header" style={{ gap: '20px' }}>
          <button onClick={() => setSelectedProgramDetail(null)} className="btn btn-secondary btn-icon">
            <ChevronLeft size={20} />
          </button>
          <div className="header-titles" style={{ flex: 1 }}>
            <h1 className="builder-title" style={{ fontSize: '28px', fontWeight: '800' }}>{selectedProgramDetail.name}</h1>
            <p className="builder-subtitle">{selectedProgramDetail.description || 'Bu program için henüz açıklama eklenmemiş.'}</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <span className="badge badge-violet">
                {isBundle ? `${selectedProgramDetail.sessions!.length} Gün (Split)` : 'Tek Seans'}
              </span>
              <span className="badge badge-cyan">
                {totalEx} Egzersiz
              </span>
              <span className="badge badge-mint">
                {totalSets} Toplam Set
              </span>
            </div>
          </div>
          <div className="builder-actions" style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => handleEdit(selectedProgramDetail)} className="btn btn-secondary">
              <Edit2 size={16} style={{ marginRight: '6px' }} /> Düzenle
            </button>
            <button
              onClick={() => setConfirmModal({
                message: 'Bu programı silmek istediğinize emin misiniz?',
                onConfirm: () => { setConfirmModal(null); deleteProgram(selectedProgramDetail.id); setSelectedProgramDetail(null); }
              })}
              className="btn btn-secondary btn-delete"
              style={{ color: 'var(--accent-red-text)', borderColor: 'var(--accent-red-bg-soft)' }}
            >
              <Trash2 size={16} style={{ marginRight: '6px' }} /> Sil
            </button>
          </div>
        </header>

        {isBundle ? (
          <div className="sessions-detail-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
            {selectedProgramDetail.sessions!.map((sess) => (
              <div key={sess.id} className="session-detail-card glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{sess.name}</h3>
                  <button
                    onClick={() => startWorkout(selectedProgramDetail, sess)}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Play size={12} fill="currentColor" /> Başlat
                  </button>
                </div>

                <div className="session-ex-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {sess.exercises.map((ex) => (
                    <div key={ex.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px', background: 'var(--surface-1)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>{ex.name}</span>
                        <span className="badge badge-violet" style={{ fontSize: '9px', padding: '1px 6px' }}>{ex.category}</span>
                      </div>
                      
                      {ex.notes && (
                        <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', background: 'var(--accent-cyan-bg)', padding: '4px 8px', borderRadius: '4px', borderLeft: '2px solid var(--accent-cyan)' }}>
                          <strong>Not:</strong> {ex.notes}
                        </div>
                      )}

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px', alignItems: 'center' }}>
                        {ex.sets.map((set, sIdx) => (
                          <div key={set.id} style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-secondary)', background: 'var(--surface-3)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                            S{sIdx + 1}: {formatRepTarget(ex, set)} tekrar x {set.weight}kg {set.rir !== undefined && `[RIR ${set.rir}]`}
                          </div>
                        ))}
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                          Rest: {ex.restTime}s
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="single-program-detail-card glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Egzersiz Listesi</h3>
              <button
                onClick={() => startWorkout(selectedProgramDetail)}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Play size={16} fill="currentColor" /> Antrenmanı Başlat
              </button>
            </div>

            <div className="session-ex-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedProgramDetail.exercises.map((ex) => (
                <div key={ex.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px', background: 'var(--surface-1)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>{ex.name}</span>
                    <span className="badge badge-violet" style={{ fontSize: '9px', padding: '1px 6px' }}>{ex.category}</span>
                  </div>

                  {ex.notes && (
                    <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', background: 'var(--accent-cyan-bg)', padding: '4px 8px', borderRadius: '4px', borderLeft: '2px solid var(--accent-cyan)' }}>
                      <strong>Not:</strong> {ex.notes}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px', alignItems: 'center' }}>
                    {ex.sets.map((set, sIdx) => (
                      <div key={set.id} style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-secondary)', background: 'var(--surface-3)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                        S{sIdx + 1}: {formatRepTarget(ex, set)} tekrar x {set.weight}kg {set.rir !== undefined && `[RIR ${set.rir}]`}
                      </div>
                    ))}
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                      Rest: {ex.restTime}s
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {confirmModal && (
        <div className="pb-modal-backdrop" onClick={() => setConfirmModal(null)}>
          <div className="pb-modal-box glass-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16 }}>Emin misiniz?</h3>
                <p style={{ marginTop: 8, lineHeight: 1.5, color: 'var(--text-secondary)', fontSize: 14 }}>{confirmModal.message}</p>
              </div>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }} onClick={() => setConfirmModal(null)}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" style={{ flex: 1, padding: 14 }} onClick={() => setConfirmModal(null)}>İptal</button>
              <button className="btn btn-danger" style={{ flex: 1, padding: 14, background: 'var(--accent-red-bg)', border: '1px solid var(--accent-red-border)', color: 'var(--accent-red-text)' }} onClick={confirmModal.onConfirm}>Evet, devam et</button>
            </div>
          </div>
        </div>
      )}

      {/* pb-modal stilleri index.css'te tanımlı (ekran ortasında açılır). */}
      </>
    );
  }

  return (
    <div className="programs-list-container anim-slide-up">
      {/* Header */}
      <header className="programs-header">
        <div>
          <h1 className="programs-title">Antrenman <span className="gradient-text">Programlarım</span></h1>
          <p className="programs-subtitle">Mevcut programlarınızı inceleyin, yönetin veya yeni bir rutin hazırlayın.</p>
        </div>
        <button onClick={handleCreateNew} className="btn btn-primary">
          <Plus size={18} /> Yeni Program Oluştur
        </button>
      </header>

      {/* Program Cards Grid */}
      <section className="programs-grid">
        {programs.length === 0 ? (
          <div className="empty-programs-prompt glass-panel">
            <Sparkles size={48} className="sparkles-prompt" />
            <h2>Henüz Programınız Yok</h2>
            <p>Antrenman hedeflerinize uygun ilk programı oluşturarak hemen serüveninize başlayın!</p>
            <button onClick={handleCreateNew} className="btn btn-primary">
              <Plus size={16} /> İlk Programımı Oluştur
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
              <div
                key={program.id}
                className="program-card glass-panel"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedProgramDetail(program)}
              >
                <div className="program-card-top-bar">
                  <span className="badge badge-violet">
                    {isBundle ? `${program.sessions!.length} Antrenman Günü` : `${totalEx} Egzersiz`}
                  </span>
                  <span className="badge badge-cyan">
                    {isBundle ? `${totalEx} Toplam Egzersiz` : `${totalSets} Set`}
                  </span>
                </div>

                <div className="program-card-info">
                  <h2 className="program-card-name">{program.name}</h2>
                  <p className="program-card-desc">
                    {program.description || 'Bu program için henüz açıklama eklenmemiş.'}
                  </p>
                </div>

                <div className="program-card-preview-list">
                  {isBundle ? (
                    program.sessions!.slice(0, 3).map((sess) => (
                      <div key={sess.id} className="preview-item">
                        <span className="preview-name">{sess.name}</span>
                        <span className="preview-detail">{sess.exercises.length} Har.</span>
                      </div>
                    ))
                  ) : (
                    program.exercises.slice(0, 3).map((ex) => (
                      <div key={ex.id} className="preview-item">
                        <span className="preview-name">{ex.name}</span>
                        <span className="preview-detail">{ex.sets.length} Set</span>
                      </div>
                    ))
                  )}
                  {isBundle && program.sessions!.length > 3 && (
                    <div className="preview-more">+{program.sessions!.length - 3} gün daha</div>
                  )}
                  {!isBundle && program.exercises.length > 3 && (
                    <div className="preview-more">+{program.exercises.length - 3} hareket daha</div>
                  )}
                </div>

                <div className="program-card-actions" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => startWorkout(program)} className="btn btn-primary btn-run-now">
                    Antrenmanı Başlat
                  </button>
                  <div className="card-minor-actions">
                    <button
                      onClick={() => handleEdit(program)}
                      className="btn-card-action"
                      aria-label={`${program.name} programını düzenle`}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteProgram(program.id)}
                      className="btn-card-action btn-delete"
                      aria-label={`${program.name} programını sil`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>


      {confirmModal && (
        <div className="pb-modal-backdrop" onClick={() => setConfirmModal(null)}>
          <div className="pb-modal-box glass-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16 }}>Emin misiniz?</h3>
                <p style={{ marginTop: 8, lineHeight: 1.5, color: 'var(--text-secondary)', fontSize: 14 }}>{confirmModal.message}</p>
              </div>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }} onClick={() => setConfirmModal(null)}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" style={{ flex: 1, padding: 14 }} onClick={() => setConfirmModal(null)}>İptal</button>
              <button className="btn btn-danger" style={{ flex: 1, padding: 14, background: 'var(--accent-red-bg)', border: '1px solid var(--accent-red-border)', color: 'var(--accent-red-text)' }} onClick={confirmModal.onConfirm}>Evet, devam et</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
