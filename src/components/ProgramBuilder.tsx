import React, { useState } from 'react';
import { Plus, Trash2, Edit2, ChevronLeft, Save, Sparkles, BookOpen, AlertCircle, PlusCircle, X, Play, GripVertical } from 'lucide-react';
import type { WorkoutProgram, Exercise, WorkoutExercise, WorkoutSet, WorkoutSession } from '../types';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


interface SortableExCardProps {
  ex: WorkoutExercise;
  exIdx: number;
  onRemove: () => void;
  onRestChange: (v: number) => void;
  onMinRepsChange: (v: number | undefined) => void;
  onMaxRepsChange: (v: number | undefined) => void;
  onNotesChange: (v: string) => void;
  onSetChange: (setIdx: number, field: 'reps' | 'weight' | 'rir', value: number) => void;
  onAddSet: () => void;
  onRemoveSet: (setIdx: number) => void;
}

const SortableExerciseCard: React.FC<SortableExCardProps> = ({
  ex, onRemove, onRestChange, onMinRepsChange, onMaxRepsChange, onNotesChange, onSetChange, onAddSet, onRemoveSet
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ex.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className={`builder-exercise-card glass-panel ${isDragging ? 'dragging' : ''}`}>
      <div className="builder-card-top">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            className="drag-handle"
            style={{ cursor: 'grab', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', touchAction: 'none' }}
            title="Sürükle ve Bırak"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={18} />
          </div>
          <div>
            <h4 className="builder-ex-name" style={{ margin: 0 }}>{ex.name}</h4>
            <span className="badge badge-cyan" style={{ marginTop: '2px', display: 'inline-block' }}>{ex.category}</span>
          </div>
        </div>
        <button onClick={onRemove} className="btn-remove-ex">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="builder-card-settings" style={{ display: 'flex', gap: '15px', alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
        <div className="form-group inline-group" style={{ flexShrink: 0 }}>
          <label className="form-label">Dinlenme (sn)</label>
          <input type="number" min="10" max="300" step="10" value={ex.restTime}
            onChange={(e) => onRestChange(parseInt(e.target.value) || 60)} className="form-input mini-input" />
        </div>
        <div className="form-group inline-group" style={{ flexShrink: 0 }}>
          <label className="form-label">Min Tekrar</label>
          <input type="number" min="1" max="100" placeholder="Min" value={ex.minReps || ''}
            onChange={(e) => onMinRepsChange(parseInt(e.target.value) || undefined)} className="form-input mini-input" style={{ width: '65px' }} />
        </div>
        <div className="form-group inline-group" style={{ flexShrink: 0 }}>
          <label className="form-label">Max Tekrar</label>
          <input type="number" min="1" max="100" placeholder="Max" value={ex.maxReps || ''}
            onChange={(e) => onMaxRepsChange(parseInt(e.target.value) || undefined)} className="form-input mini-input" style={{ width: '65px' }} />
        </div>
        <div className="form-group inline-group" style={{ flexGrow: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label className="form-label" style={{ whiteSpace: 'nowrap' }}>Koçun Notu</label>
          <input type="text" placeholder="Örn: RIR 1 - duraksamalı tempo" value={ex.notes || ''}
            onChange={(e) => onNotesChange(e.target.value)} className="form-input" style={{ flexGrow: 1, minWidth: '150px' }} />
        </div>
      </div>

      <div className="builder-sets-list">
        <div className="sets-header-labels">
          <span>Set</span><span>Hedef Tekrar</span><span>Ağırlık (kg)</span><span>Hedef RIR</span><span></span>
        </div>
        {ex.sets.map((set, setIdx) => (
          <div key={set.id} className="builder-set-row">
            <span className="set-number-label">{setIdx + 1}</span>
            <input type="number" min="1" max="100" value={set.reps}
              onChange={(e) => onSetChange(setIdx, 'reps', parseInt(e.target.value) || 0)} className="form-input mini-input" />
            <input type="number" min="0" max="500" step="0.5" value={set.weight}
              onChange={(e) => onSetChange(setIdx, 'weight', parseFloat(e.target.value) || 0)} className="form-input mini-input" />
            <input type="number" min="0" max="10" placeholder="RIR" value={set.rir !== undefined ? set.rir : 2}
              onChange={(e) => onSetChange(setIdx, 'rir', parseInt(e.target.value) || 0)} className="form-input mini-input" />
            <button onClick={() => onRemoveSet(setIdx)} disabled={ex.sets.length <= 1} className="btn-delete-set">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <button onClick={onAddSet} className="btn-add-set-row">
        <PlusCircle size={14} /> Set Ekle
      </button>
    </div>
  );
};

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
    const updated = [...programSessions];
    if (updated[activeSessionIndex]) {
      updated[activeSessionIndex].name = name;
      setProgramSessions(updated);
    }
  };
  const handleAddExerciseToProgram = (exercise: Exercise) => {
    const newWorkoutExercise: WorkoutExercise = {
      id: `we-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      exerciseId: exercise.id,
      name: exercise.name,
      category: exercise.category,
      restTime: 60,
      minReps: 6,
      maxReps: 12,
      sets: [
        { id: `s-${Date.now()}-1`, reps: 10, weight: 20, rir: 2, completed: false }
      ]
    };

    if (isBundleProgram) {
      const updated = [...programSessions];
      if (updated[activeSessionIndex]) {
        updated[activeSessionIndex].exercises.push(newWorkoutExercise);
        setProgramSessions(updated);
      }
    } else {
      setProgramExercises([...programExercises, newWorkoutExercise]);
    }
    setShowExerciseSelector(false);
    setSearchTerm('');
  };

  const handleRemoveExercise = (index: number) => {
    if (isBundleProgram) {
      const updated = [...programSessions];
      if (updated[activeSessionIndex]) {
        updated[activeSessionIndex].exercises.splice(index, 1);
        setProgramSessions(updated);
      }
    } else {
      const updated = [...programExercises];
      updated.splice(index, 1);
      setProgramExercises(updated);
    }
  };

  const handleAddSet = (exerciseIndex: number) => {
    if (isBundleProgram) {
      const updated = [...programSessions];
      const targetEx = updated[activeSessionIndex]?.exercises[exerciseIndex];
      if (!targetEx) return;
      const lastSet = targetEx.sets[targetEx.sets.length - 1];
      
      const newSet: WorkoutSet = {
        id: `s-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        reps: lastSet ? lastSet.reps : 10,
        weight: lastSet ? lastSet.weight : 20,
        rir: lastSet ? (lastSet.rir !== undefined ? lastSet.rir : 2) : 2,
        completed: false
      };
      
      targetEx.sets.push(newSet);
      setProgramSessions(updated);
    } else {
      const updated = [...programExercises];
      const targetEx = updated[exerciseIndex];
      const lastSet = targetEx.sets[targetEx.sets.length - 1];
      
      const newSet: WorkoutSet = {
        id: `s-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        reps: lastSet ? lastSet.reps : 10,
        weight: lastSet ? lastSet.weight : 20,
        rir: lastSet ? (lastSet.rir !== undefined ? lastSet.rir : 2) : 2,
        completed: false
      };
      
      targetEx.sets.push(newSet);
      setProgramExercises(updated);
    }
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    if (isBundleProgram) {
      const updated = [...programSessions];
      const targetEx = updated[activeSessionIndex]?.exercises[exerciseIndex];
      if (!targetEx || targetEx.sets.length <= 1) return;
      targetEx.sets.splice(setIndex, 1);
      setProgramSessions(updated);
    } else {
      const updated = [...programExercises];
      const targetEx = updated[exerciseIndex];
      if (targetEx.sets.length <= 1) return;
      targetEx.sets.splice(setIndex, 1);
      setProgramExercises(updated);
    }
  };

  const handleSetChange = (
    exerciseIndex: number,
    setIndex: number,
    field: 'reps' | 'weight' | 'rir',
    value: number
  ) => {
    if (isBundleProgram) {
      const updated = [...programSessions];
      const targetEx = updated[activeSessionIndex]?.exercises[exerciseIndex];
      if (!targetEx) return;
      targetEx.sets[setIndex] = {
        ...targetEx.sets[setIndex],
        [field]: value
      };
      setProgramSessions(updated);
    } else {
      const updated = [...programExercises];
      updated[exerciseIndex].sets[setIndex] = {
        ...updated[exerciseIndex].sets[setIndex],
        [field]: value
      };
      setProgramExercises(updated);
    }
  };

  const handleRestChange = (exerciseIndex: number, value: number) => {
    if (isBundleProgram) {
      const updated = [...programSessions];
      const targetEx = updated[activeSessionIndex]?.exercises[exerciseIndex];
      if (!targetEx) return;
      targetEx.restTime = value;
      setProgramSessions(updated);
    } else {
      const updated = [...programExercises];
      updated[exerciseIndex].restTime = value;
      setProgramExercises(updated);
    }
  };

  const handleNotesChange = (exerciseIndex: number, value: string) => {
    if (isBundleProgram) {
      const updated = [...programSessions];
      const targetEx = updated[activeSessionIndex]?.exercises[exerciseIndex];
      if (!targetEx) return;
      targetEx.notes = value;
      setProgramSessions(updated);
    } else {
      const updated = [...programExercises];
      updated[exerciseIndex].notes = value;
      setProgramExercises(updated);
    }
  };

  const handleMinRepsChange = (exerciseIndex: number, value: number | undefined) => {
    if (isBundleProgram) {
      const updated = [...programSessions];
      const targetEx = updated[activeSessionIndex]?.exercises[exerciseIndex];
      if (!targetEx) return;
      targetEx.minReps = value;
      setProgramSessions(updated);
    } else {
      const updated = [...programExercises];
      if (updated[exerciseIndex]) {
        updated[exerciseIndex].minReps = value;
        setProgramExercises(updated);
      }
    }
  };

  const handleMaxRepsChange = (exerciseIndex: number, value: number | undefined) => {
    if (isBundleProgram) {
      const updated = [...programSessions];
      const targetEx = updated[activeSessionIndex]?.exercises[exerciseIndex];
      if (!targetEx) return;
      targetEx.maxReps = value;
      if (value !== undefined) targetEx.sets = targetEx.sets.map(s => ({ ...s, reps: value }));
      setProgramSessions(updated);
    } else {
      const updated = [...programExercises];
      if (updated[exerciseIndex]) {
        updated[exerciseIndex].maxReps = value;
        if (value !== undefined) updated[exerciseIndex].sets = updated[exerciseIndex].sets.map(s => ({ ...s, reps: value }));
        setProgramExercises(updated);
      }
    }
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
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isEditing) {
    const activeExList: WorkoutExercise[] = isBundleProgram
      ? (programSessions[activeSessionIndex]?.exercises || [])
      : programExercises;


    return (
      <div className="builder-container anim-slide-up">
        {/* Back and Title Header */}
        <header className="builder-header">
          <button onClick={() => setIsEditing(false)} className="btn btn-secondary btn-icon">
            <ChevronLeft size={20} />
          </button>
          <div className="header-titles">
            <h1 className="builder-title">
              {activeProgram ? 'Programı ' : 'Yeni Program '}
              <span className="gradient-text">{activeProgram ? 'Düzenle' : 'Oluştur'}</span>
            </h1>
            <p className="builder-subtitle">Kişisel hedeflerinize uygun egzersiz, set ve süreleri belirleyin.</p>
          </div>
          <button onClick={handleSave} className="btn btn-primary">
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
            <h3 className="section-title">Program Detayları</h3>
            
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
              <label className="form-label">Program Adı *</label>
              <input
                type="text"
                placeholder="Örn: Push Günü (İtiş), Hipertrofi Rutini"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                className="form-input"
                maxLength={40}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Açıklama</label>
              <textarea
                placeholder="Bu programın odaklandığı bölgeleri veya özel notları yazın..."
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
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
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
                  <label className="form-label">Seçili Günün Başlığı</label>
                  <input
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
                  style={{ padding: '10px', color: '#f87171' }}
                  title="Bu Günü Sil"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}

            <div className="section-header">
              <h3 className="section-title">
                {isBundleProgram && programSessions[activeSessionIndex]
                  ? `${programSessions[activeSessionIndex].name.split(' — ')[0]} Egzersizleri`
                  : 'Egzersizler'
                } ({activeExList.length})
              </h3>
              <button onClick={() => setShowExerciseSelector(true)} className="btn btn-outline btn-add-ex">
                <Plus size={16} /> Egzersiz Ekle
              </button>
            </div>

            <div className="builder-exercises-list">
              {activeExList.length === 0 ? (
                <div className="empty-builder-state glass-panel">
                  <BookOpen size={36} />
                  <p>Bu güne henüz hareket eklemediniz.</p>
                  <button onClick={() => setShowExerciseSelector(true)} className="btn btn-secondary btn-sm">
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

        {/* Exercise Selector Slide-In / Modal */}
        {showExerciseSelector && (
          <div className="modal-backdrop">
            <div className="modal-content glass-panel anim-slide-up selector-modal">
              <div className="modal-header">
                <h2 className="modal-title">Egzersiz Seçin</h2>
                <button onClick={() => setShowExerciseSelector(false)} className="modal-close-btn">
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

              <div className="selector-list">
                {filteredExercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => handleAddExerciseToProgram(ex)}
                    className="selector-item"
                  >
                    <div>
                      <p className="selector-item-name">{ex.name}</p>
                      <span className="badge badge-violet">{ex.category}</span>
                    </div>
                    <Plus size={16} className="selector-plus-icon" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <style>{`
          .builder-container {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }

          .builder-header {
            display: flex;
            align-items: center;
            gap: 20px;
          }

          .header-titles {
            flex: 1;
          }

          .builder-title {
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.03em;
            margin-bottom: 4px;
          }

          .builder-subtitle {
            color: var(--text-secondary);
            font-size: 14px;
          }

          .builder-error {
            margin-top: 10px;
          }

          .builder-form-grid {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 20px;
            align-items: start;
          }

          .builder-info-card {
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .section-title {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: -0.01em;
          }

          .builder-exercises-section {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .builder-exercises-section .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .builder-exercises-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .empty-builder-state {
            padding: 50px;
            text-align: center;
            color: var(--text-secondary);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 14px;
          }

          .builder-exercise-card {
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            transition: opacity 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
          }

          .builder-exercise-card.dragging {
            opacity: 0.45;
            transform: scale(0.985);
            border: 2px dashed var(--accent-violet) !important;
            background: rgba(139, 92, 246, 0.05) !important;
          }

          .builder-card-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }

          .builder-ex-name {
            font-size: 17px;
            font-weight: 700;
            margin-bottom: 4px;
          }

          .btn-remove-ex {
            background: transparent;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            padding: 6px;
            border-radius: var(--radius-sm);
            transition: all var(--transition-fast);
          }

          .btn-remove-ex:hover {
            color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
          }

          .builder-card-settings {
            display: flex;
            gap: 20px;
            border-bottom: 1px solid var(--border-light);
            padding-bottom: 14px;
          }

          .inline-group {
            flex-direction: row;
            align-items: center;
            gap: 12px;
            margin-bottom: 0;
          }

          .mini-input {
            width: 70px;
            padding: 6px 10px;
            text-align: center;
            font-size: 14px;
          }

          /* Sets editor formatting */
          .builder-sets-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .sets-header-labels {
            display: grid;
            grid-template-columns: 40px 1fr 1fr 1fr 40px;
            font-size: 11px;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding-left: 10px;
            text-align: center;
          }

          .sets-header-labels span:nth-child(2),
          .sets-header-labels span:nth-child(3),
          .sets-header-labels span:nth-child(4) {
            text-align: center;
          }

          .builder-set-row {
            display: grid;
            grid-template-columns: 40px 1fr 1fr 1fr 40px;
            align-items: center;
            gap: 10px;
            background: rgba(255, 255, 255, 0.01);
            padding: 4px 6px;
            border-radius: var(--radius-sm);
          }

          .set-number-label {
            font-weight: 700;
            color: var(--text-secondary);
            text-align: center;
          }

          .builder-set-row .mini-input {
            width: 100%;
          }

          .btn-delete-set {
            background: transparent;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all var(--transition-fast);
          }

          .btn-delete-set:hover:not(:disabled) {
            color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
          }

          .btn-delete-set:disabled {
            opacity: 0.3;
            cursor: not-allowed;
          }

          .btn-add-set-row {
            background: transparent;
            border: 1px dashed var(--border-medium);
            color: var(--text-secondary);
            font-weight: 600;
            cursor: pointer;
            padding: 8px;
            border-radius: var(--radius-sm);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            font-size: 13px;
            transition: all var(--transition-fast);
          }

          .btn-add-set-row:hover {
            color: var(--text-primary);
            border-color: var(--accent-violet);
            background: rgba(255, 255, 255, 0.02);
          }

          /* Selector Modal specific */
          .selector-modal {
            max-width: 420px;
          }

          .selector-search {
            margin-bottom: 16px;
          }

          .selector-list {
            max-height: 300px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding-right: 4px;
          }

          .selector-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 14px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--border-light);
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: all var(--transition-fast);
            text-align: left;
          }

          .selector-item:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: var(--border-medium);
          }

          .selector-item-name {
            font-weight: 600;
            margin-bottom: 2px;
            font-size: 14px;
          }

          .selector-plus-icon {
            color: var(--accent-violet);
          }

          @media (max-width: 900px) {
            .builder-form-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 768px) {
            .builder-card-settings {
              flex-direction: column;
              align-items: stretch !important;
              gap: 12px;
            }
            .builder-card-settings .inline-group {
              width: 100%;
            }
            .builder-card-settings .inline-group input {
              flex: 1;
              min-width: 0 !important;
            }
          }

          @media (max-width: 600px) {
            .builder-exercise-card {
              padding: 14px 10px;
            }
            .sets-header-labels {
              grid-template-columns: 30px 1fr 1fr 1fr 30px;
              gap: 6px;
              padding-left: 0;
            }
            .builder-set-row {
              grid-template-columns: 30px 1fr 1fr 1fr 30px;
              gap: 6px;
              padding: 4px;
            }
            .builder-set-row .mini-input {
              padding: 6px 4px;
              font-size: 13px;
              width: 100% !important;
              min-width: 0 !important;
            }
            .set-number-label {
              font-size: 13px;
            }
          }

          @media (max-width: 480px) {
            .builder-exercises-section .section-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 10px;
            }
            .builder-exercises-section .section-header .btn-add-ex {
              width: 100%;
            }
          }

          @media (max-width: 580px) {
            .builder-header {
              flex-wrap: wrap !important;
              gap: 12px !important;
            }
            .builder-header .header-titles {
              width: calc(100% - 60px) !important;
              flex: none !important;
            }
            .builder-header .builder-actions, 
            .builder-header .btn-primary {
              width: 100% !important;
              margin-top: 4px;
            }
            .builder-header .builder-actions button,
            .builder-header .btn-primary {
              flex: 1;
              justify-content: center;
            }
            .builder-title {
              font-size: 22px !important;
            }
          }
        `}</style>
      </div>
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
              style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.2)' }}
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
                    <div key={ex.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>{ex.name}</span>
                        <span className="badge badge-violet" style={{ fontSize: '9px', padding: '1px 6px' }}>{ex.category}</span>
                      </div>
                      
                      {ex.notes && (
                        <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.05)', padding: '4px 8px', borderRadius: '4px', borderLeft: '2px solid var(--accent-cyan)' }}>
                          <strong>Not:</strong> {ex.notes}
                        </div>
                      )}

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px', alignItems: 'center' }}>
                        {ex.sets.map((set, sIdx) => (
                          <div key={set.id} style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.03)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                            S{sIdx + 1}: {ex.minReps && ex.maxReps ? `${ex.minReps}-${ex.maxReps} tekrar` : `${set.reps} tekrar`} x {set.weight}kg {set.rir !== undefined && `[RIR ${set.rir}]`}
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
                <div key={ex.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>{ex.name}</span>
                    <span className="badge badge-violet" style={{ fontSize: '9px', padding: '1px 6px' }}>{ex.category}</span>
                  </div>

                  {ex.notes && (
                    <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.05)', padding: '4px 8px', borderRadius: '4px', borderLeft: '2px solid var(--accent-cyan)' }}>
                      <strong>Not:</strong> {ex.notes}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px', alignItems: 'center' }}>
                    {ex.sets.map((set, sIdx) => (
                      <div key={set.id} style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.03)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                        S{sIdx + 1}: {ex.minReps && ex.maxReps ? `${ex.minReps}-${ex.maxReps} tekrar` : `${set.reps} tekrar`} x {set.weight}kg {set.rir !== undefined && `[RIR ${set.rir}]`}
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
              <button className="btn btn-danger" style={{ flex: 1, padding: 14, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }} onClick={confirmModal.onConfirm}>Evet, devam et</button>
            </div>
          </div>
        </div>
      )}

      <style>{`.pb-modal-backdrop { position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);display:flex;align-items:flex-end;justify-content:center;z-index:2100; } .pb-modal-box { width:100%;max-width:400px;background:var(--bg-card-solid);border-top-left-radius:var(--radius-lg);border-top-right-radius:var(--radius-lg);padding:30px 24px calc(30px + env(safe-area-inset-bottom,0px)) 24px;box-shadow:0 -10px 40px rgba(0,0,0,0.5); }`}</style>
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
                  <h3 className="program-card-name">{program.name}</h3>
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
                    <button onClick={() => handleEdit(program)} className="btn-card-action">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => deleteProgram(program.id)} className="btn-card-action btn-delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      <style>{`
        .programs-list-container {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .programs-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .programs-title {
          font-size: 36px;
          font-weight: 800;
          letter-spacing: -0.04em;
          margin-bottom: 6px;
        }

        .programs-subtitle {
          color: var(--text-secondary);
          font-size: 16px;
        }

        /* Programs Grid */
        .programs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .program-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-height: 300px;
          height: 100%;
        }

        .program-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: var(--border-medium);
        }

        .program-card-top-bar {
          display: flex;
          gap: 10px;
          margin-bottom: 18px;
        }

        .program-card-info {
          margin-bottom: 18px;
          flex: 1;
        }

        .program-card-name {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
          line-height: 1.2;
        }

        .program-card-desc {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        /* Previews */
        .program-card-preview-list {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 24px;
        }

        .preview-item {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          font-weight: 600;
        }

        .preview-name {
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 180px;
        }

        .preview-detail {
          color: var(--text-secondary);
        }

        .preview-more {
          font-size: 11px;
          font-weight: 700;
          color: var(--accent-violet);
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        /* Actions */
        .program-card-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .btn-run-now {
          flex: 1;
          padding: 10px 16px;
          font-size: 14px;
        }

        .card-minor-actions {
          display: flex;
          gap: 6px;
        }

        .btn-card-action {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-light);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-card-action:hover {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-primary);
          border-color: var(--border-medium);
        }

        .btn-card-action.btn-delete:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          border-color: rgba(239, 68, 68, 0.2);
        }

        .empty-programs-prompt {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 40px;
          gap: 20px;
          text-align: center;
          color: var(--text-secondary);
        }

        .sparkles-prompt {
          color: var(--accent-violet);
          filter: drop-shadow(0 0 10px var(--accent-violet-glow));
        }

        .empty-programs-prompt h2 {
          color: var(--text-primary);
          font-size: 24px;
        }

        @media (max-width: 640px) {
          .programs-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          .programs-header .btn {
            width: 100%;
          }
        }
      `}</style>

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
              <button className="btn btn-danger" style={{ flex: 1, padding: 14, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }} onClick={confirmModal.onConfirm}>Evet, devam et</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
