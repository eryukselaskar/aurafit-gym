import React, { useState } from 'react';
import { Trash2, PlusCircle, X, GripVertical, ChevronDown, Lock } from 'lucide-react';
import type { WorkoutExercise } from '../types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatRepTarget } from '../utils/repTarget';

/**
 * Program düzenleyicideki tek bir hareket kartı.
 *
 * Kart kapalı başlar ve tek satırlık özet gösterir; bir günde altı hareket
 * varken hepsinin tüm alanlarını açık göstermek ekranı kullanılamaz hale
 * getiriyordu. Sık kullanılmayan alanlar ayrıca "Gelişmiş" altında.
 */

interface SortableExCardProps {
  ex: WorkoutExercise;
  exIdx: number;
  onRemove: () => void;
  onRestChange: (v: number) => void;
  onMinRepsChange: (v: number | undefined) => void;
  onMaxRepsChange: (v: number | undefined) => void;
  onWeightChange: (v: number | undefined) => void;
  onRirChange: (v: number | undefined) => void;
  onNotesChange: (v: string) => void;
  onSetChange: (setIdx: number, field: 'reps' | 'weight' | 'rir', value: number) => void;
  onAddSet: () => void;
  onRemoveSet: (setIdx: number) => void;
}

export const SortableExerciseCard: React.FC<SortableExCardProps> = ({
  ex, onRemove, onRestChange, onMinRepsChange, onMaxRepsChange, onWeightChange, onRirChange, onNotesChange, onSetChange, onAddSet, onRemoveSet
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ex.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  // Kart varsayılan olarak kapalı: bir günde 6 hareket varken hepsinin tüm
  // alanlarını açık göstermek ekranı kullanılamaz hale getiriyordu.
  const [expanded, setExpanded] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(
    ex.weight !== undefined || ex.rir !== undefined || Boolean(ex.notes)
  );

  const setCount = ex.sets.length;
  const repTarget = formatRepTarget(ex, ex.sets[0] ?? { reps: 0 });
  const summary = `${setCount} set · ${repTarget} tekrar · ${ex.restTime} sn`;
  const hasLockedColumn =
    (ex.minReps !== undefined && ex.maxReps !== undefined) ||
    ex.weight !== undefined ||
    ex.rir !== undefined;

  return (
    <div ref={setNodeRef} style={style} className={`builder-exercise-card glass-panel ${isDragging ? 'dragging' : ''} ${expanded ? 'expanded' : ''}`}>
      <div className="builder-card-top">
        <div className="builder-card-title-row">
          <div
            className="drag-handle"
            aria-label="Sürükleyerek sırala"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={18} />
          </div>
          <button
            type="button"
            className="builder-ex-toggle"
            onClick={() => setExpanded(v => !v)}
            aria-expanded={expanded}
          >
            <span className="builder-ex-toggle-text">
              <span className="builder-ex-name">{ex.name}</span>
              <span className="builder-ex-summary">{summary}</span>
            </span>
            <ChevronDown size={18} className="builder-ex-chevron" aria-hidden="true" />
          </button>
        </div>
        <button onClick={onRemove} className="btn-remove-ex" aria-label={`${ex.name} hareketini sil`}>
          <Trash2 size={16} />
        </button>
      </div>

      {expanded && (
      <>
      <div className="builder-card-settings">
        <div className="form-group inline-group">
          <label className="form-label">Dinlenme (sn)</label>
          <input type="number" min="10" max="300" step="10" value={ex.restTime}
            onChange={(e) => onRestChange(parseInt(e.target.value) || 60)} className="form-input mini-input" />
        </div>
        <div className="form-group inline-group">
          <label className="form-label">Min Tekrar</label>
          <input type="number" min="1" max="100" placeholder="—" value={ex.minReps || ''}
            onChange={(e) => onMinRepsChange(parseInt(e.target.value) || undefined)} className="form-input mini-input" />
        </div>
        <div className="form-group inline-group">
          <label className="form-label">Max Tekrar</label>
          <input type="number" min="1" max="100" placeholder="—" value={ex.maxReps || ''}
            onChange={(e) => onMaxRepsChange(parseInt(e.target.value) || undefined)} className="form-input mini-input" />
        </div>
      </div>

      <button
        type="button"
        className="builder-advanced-toggle"
        onClick={() => setShowAdvanced(v => !v)}
        aria-expanded={showAdvanced}
      >
        <ChevronDown size={14} className={showAdvanced ? 'rotated' : ''} aria-hidden="true" />
        Gelişmiş
      </button>

      {showAdvanced && (
        <div className="builder-card-settings advanced">
          <p className="builder-advanced-hint">
            Buradaki değerler <strong>tüm setlere</strong> uygulanır ve set tablosundaki
            ilgili sütunu kilitler. Set başına farklı değer girmek için boş bırakın.
          </p>
          <div className="form-group inline-group">
            <label className="form-label">Hedef Kilo (kg)</label>
            <input type="number" min="0" max="500" step="0.5" placeholder="—" value={ex.weight !== undefined ? ex.weight : ''}
              onChange={(e) => onWeightChange(e.target.value !== '' ? parseFloat(e.target.value) : undefined)} className="form-input mini-input" />
          </div>
          <div className="form-group inline-group">
            <label className="form-label">Hedef RIR</label>
            <input type="number" min="0" max="10" placeholder="—" value={ex.rir !== undefined ? ex.rir : ''}
              onChange={(e) => onRirChange(e.target.value !== '' ? parseInt(e.target.value) : undefined)} className="form-input mini-input" />
          </div>
          <div className="form-group inline-group note-group">
            <label className="form-label">Koçun Notu</label>
            <input type="text" placeholder="Örn: duraksamalı tempo" value={ex.notes || ''}
              onChange={(e) => onNotesChange(e.target.value)} className="form-input" />
          </div>
        </div>
      )}

      <div className="builder-sets-list">
        <div className="sets-header-labels">
          <span>Set</span><span>Hedef Tekrar</span><span>Ağırlık (kg)</span><span>Hedef RIR</span><span></span>
        </div>
        {ex.sets.map((set, setIdx) => (
          <div key={set.id} className="builder-set-row">
            <span className="set-number-label">{setIdx + 1}</span>
            {ex.minReps !== undefined && ex.maxReps !== undefined ? (
              <span className="set-readonly-badge">
                <Lock size={11} aria-hidden="true" />
                {formatRepTarget(ex, set)}
              </span>
            ) : (
              <input type="number" min="1" max="100" value={set.reps}
                onChange={(e) => onSetChange(setIdx, 'reps', parseInt(e.target.value) || 0)} className="form-input mini-input" />
            )}
            {ex.weight !== undefined ? (
              <span className="set-readonly-badge">
                <Lock size={11} aria-hidden="true" />
                {ex.weight} kg
              </span>
            ) : (
              <input type="number" min="0" max="500" step="0.5" value={set.weight}
                onChange={(e) => onSetChange(setIdx, 'weight', parseFloat(e.target.value) || 0)} className="form-input mini-input" />
            )}
            {ex.rir !== undefined ? (
              <span className="set-readonly-badge">
                <Lock size={11} aria-hidden="true" />
                RIR {ex.rir}
              </span>
            ) : (
              <input type="number" min="0" max="10" placeholder="RIR" value={set.rir !== undefined ? set.rir : 2}
                onChange={(e) => onSetChange(setIdx, 'rir', parseInt(e.target.value) || 0)} className="form-input mini-input" />
            )}
            <button
              onClick={() => onRemoveSet(setIdx)}
              disabled={ex.sets.length <= 1}
              className="btn-delete-set"
              aria-label={`${setIdx + 1}. seti sil`}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      {hasLockedColumn && (
        <p className="builder-lock-hint">
          <Lock size={11} aria-hidden="true" />
          Kilitli sütunlar "Gelişmiş" bölümünden tüm setler için ayarlanmıştır.
        </p>
      )}

      <button onClick={onAddSet} className="btn-add-set-row">
        <PlusCircle size={14} /> Set Ekle
      </button>
      </>
      )}
    </div>
  );
};
