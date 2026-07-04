import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { CompletedWorkout, PersonalRecord } from '../../types';

interface Props {
  completedWorkoutData: CompletedWorkout;
  newPRs: PersonalRecord[];
  onFinish: (workout: CompletedWorkout, prs: PersonalRecord[]) => void;
}

const CONFETTI_COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'];

export const PRCelebration: React.FC<Props> = ({ completedWorkoutData, newPRs, onFinish }) => (
  <div className="celebration-backdrop">
    <div className="confetti-container">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            left: `${(i * 3.3) % 100}%`,
            animationDelay: `${(i * 0.15) % 3}s`,
            animationDuration: `${2.5 + (i * 0.05) % 1.5}s`,
          }}
        />
      ))}
    </div>

    <div className="celebration-card glass-panel anim-slide-up">
      <span className="pr-trophy">🏆</span>
      <h2 className="pr-congrats-title">Yeni Kişisel Rekor!</h2>
      <p className="welcome-subtitle">Bu antrenmanda sınırlarınızı zorlayarak yeni zirvelere ulaştınız!</p>

      <div className="pr-broken-list">
        {newPRs.map((pr, idx) => (
          <div key={idx} className="pr-broken-item">
            <span className="pr-item-name">{pr.exerciseName}</span>
            <span className="pr-item-stats">
              En Yüksek: {pr.maxWeight} kg x {pr.maxReps} tekrar | Tahmini 1RM: {pr.oneRepMax} kg
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={() => onFinish(completedWorkoutData, newPRs)}
        className="btn btn-primary"
        style={{ width: '100%', marginTop: 10 }}
      >
        Kaydet ve Devam Et <ArrowRight size={16} />
      </button>
    </div>
  </div>
);
