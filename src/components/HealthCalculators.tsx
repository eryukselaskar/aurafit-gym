import React from 'react';
import { Calculator, Flame } from 'lucide-react';
import './MetricsTracker.css';

type CalcTabType = 'bmi' | 'tdee';

interface HealthCalculatorsProps {
  calcTab: CalcTabType;
  setCalcTab: (tab: CalcTabType) => void;
  userGender: 'male' | 'female';
  setUserGender: (g: 'male' | 'female') => void;
  userHeight: string;
  setUserHeight: (v: string) => void;
  userAge: string;
  setUserAge: (v: string) => void;
  calcWeight: string;
  setCalcWeight: (v: string) => void;
  activityLevel: string;
  setActivityLevel: (v: string) => void;
  bmi: number;
  bmiCat: { label: string; color: string };
  bmr: number;
  tdee: number;
}

/**
 * VKİ ve günlük kalori (TDEE) hesaplayıcıları.
 *
 * Ölçüm takibinden bağımsız bir araç; MetricsTracker'ın içinde ~160 satır
 * yer kaplıyordu. Tüm değerler ve hesap sonuçları prop olarak geliyor.
 */
export const HealthCalculators: React.FC<HealthCalculatorsProps> = ({
  calcTab,
  setCalcTab,
  userGender,
  setUserGender,
  userHeight,
  setUserHeight,
  userAge,
  setUserAge,
  calcWeight,
  setCalcWeight,
  activityLevel,
  setActivityLevel,
  bmi,
  bmiCat,
  bmr,
  tdee
}) => (
  <section className="metrics-side-panel glass-panel anim-slide-up">
    <div className="panel-tabs">
      <button 
        onClick={() => setCalcTab('bmi')} 
        className={`panel-tab-btn ${calcTab === 'bmi' ? 'active' : ''}`}
      >
        <Calculator size={14} />
        Vücut Kitle İndeksi (VKİ)
      </button>
      <button 
        onClick={() => setCalcTab('tdee')} 
        className={`panel-tab-btn ${calcTab === 'tdee' ? 'active' : ''}`}
      >
        <Flame size={14} />
        Günlük Kalori (TDEE)
      </button>
    </div>

    <div className="panel-content">
      {calcTab === 'bmi' && (
        <div className="calculator-view anim-slide-up">
          <h4>Vücut Kitle İndeksi (VKİ)</h4>

          <div className="calc-inputs-row">
            <div className="calc-input-group">
              <label>Boy (cm)</label>
              <input 
                type="number" 
                value={userHeight} 
                onChange={(e) => setUserHeight(e.target.value)} 
                className="calc-input"
              />
            </div>
            <div className="calc-input-group">
              <label>Ağırlık (kg)</label>
              <input 
                type="number" 
                value={calcWeight} 
                onChange={(e) => setCalcWeight(e.target.value)} 
                className="calc-input"
              />
            </div>
          </div>

          {bmi > 0 ? (
            <div className="calc-result-box">
              <div className="result-main-value">
                <span className="result-number">{bmi.toFixed(1)}</span>
                <span className="result-label">kg/m²</span>
              </div>
              <div className="result-status" style={{ color: bmiCat.color }}>
                {bmiCat.label}
              </div>

              {/* Gauge range bar */}
              <div className="bmi-gauge-bar">
                <div 
                  className="bmi-indicator-dot" 
                  style={{ left: `${Math.min(100, Math.max(0, ((bmi - 15) / 25) * 100))}%` }}
                ></div>
              </div>
              <div className="bmi-gauge-labels">
                <span>15</span>
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>40</span>
              </div>
            </div>
          ) : (
            <p className="calc-notice">Lütfen boy ve kilo değerlerini girin.</p>
          )}
        </div>
      )}

      {calcTab === 'tdee' && (
        <div className="calculator-view anim-slide-up">
          <h4>Günlük Kalori İhtiyacı (TDEE)</h4>

          <div className="calc-inputs-grid">
            <div className="calc-input-group">
              <label>Cinsiyet</label>
              <select 
                value={userGender} 
                onChange={(e) => setUserGender(e.target.value as 'male' | 'female')}
                className="calc-input select"
              >
                <option value="male">Erkek</option>
                <option value="female">Kadın</option>
              </select>
            </div>
            <div className="calc-input-group">
              <label>Yaş</label>
              <input 
                type="number" 
                value={userAge} 
                onChange={(e) => setUserAge(e.target.value)} 
                className="calc-input"
              />
            </div>
            <div className="calc-input-group">
              <label>Boy (cm)</label>
              <input 
                type="number" 
                value={userHeight} 
                onChange={(e) => setUserHeight(e.target.value)} 
                className="calc-input"
              />
            </div>
            <div className="calc-input-group">
              <label>Kilo (kg)</label>
              <input 
                type="number" 
                value={calcWeight} 
                onChange={(e) => setCalcWeight(e.target.value)} 
                className="calc-input"
              />
            </div>
          </div>

          <div className="calc-input-group full-width">
            <label>Aktivite Seviyesi</label>
            <select 
              value={activityLevel} 
              onChange={(e) => setActivityLevel(e.target.value)}
              className="calc-input select"
            >
              <option value="1.2">Sedanter (Hareketsiz yaşam)</option>
              <option value="1.375">Hafif Aktif (Haftada 1-3 gün spor)</option>
              <option value="1.55">Orta Aktif (Haftada 3-5 gün spor)</option>
              <option value="1.725">Çok Aktif (Haftada 6-7 gün ağır spor)</option>
              <option value="1.9">Ekstra Aktif (Ağır spor + fiziksel iş)</option>
            </select>
          </div>

          {bmr > 0 ? (
            <div className="calc-result-box calorie-results">
              <div className="calorie-metric">
                <span className="calorie-lbl">BMR (Bazal Metabolizma):</span>
                <span className="calorie-val font-accent-cyan">{Math.round(bmr)} kcal</span>
              </div>
              <div className="calorie-metric main-tdee border-top">
                <span className="calorie-lbl">TDEE (Kilo Koruma):</span>
                <span className="calorie-val font-accent-violet">{Math.round(tdee)} kcal</span>
              </div>
              <div className="calorie-metric">
                <span className="calorie-lbl">Kilo Verme (Yağ Yakımı):</span>
                <span className="calorie-val font-accent-mint">{Math.round(tdee - 500)} kcal</span>
              </div>
              <div className="calorie-metric">
                <span className="calorie-lbl">Kilo Alma (Bulking):</span>
                <span className="calorie-val font-accent-amber">{Math.round(tdee + 300)} kcal</span>
              </div>
            </div>
          ) : (
            <p className="calc-notice">Lütfen gerekli değerleri eksiksiz doldurun.</p>
          )}
        </div>
      )}
    </div>
  </section>
);
