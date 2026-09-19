import React, { useState } from 'react';
import { Plus, Trash2, Calendar, TrendingUp, ChevronUp, Activity, Flame, Calculator } from 'lucide-react';
import type { WeightLog } from '../types';
import { ConfirmDialog } from './ConfirmDialog';

interface MetricsTrackerProps {
  weightLogs: WeightLog[];
  addWeightLog: (log: Omit<WeightLog, 'id'>) => void;
  deleteWeightLog: (id: string) => void;
}

type MetricType = 'weight' | 'bodyFat' | 'biceps' | 'waist' | 'chest' | 'thigh';

/** En son tarihli kilo kaydını metin olarak döner, kayıt yoksa null. */
const mostRecentWeight = (logs: WeightLog[]): string | null => {
  if (logs.length === 0) return null;
  const latest = [...logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];
  return latest.weight.toString();
};

/**
 * YMCA yöntemiyle yağ oranı tahmini. Girdiler eksikse veya sonuç makul
 * aralığın (%2-60) dışına düşerse boş metin döner.
 */
const estimateBodyFat = (
  weight: string,
  waist: string,
  gender: 'male' | 'female'
): string => {
  const w = parseFloat(weight);
  const bel = parseFloat(waist);
  if (!(w > 0) || !(bel > 0)) return '';

  const waistInches = bel / 2.54;
  const weightLbs = w * 2.20462;
  const baseline = gender === 'male' ? -98.42 : -76.76;
  const fatWeight = baseline + 4.15 * waistInches - 0.082 * weightLbs;
  const fatPercent = (fatWeight / weightLbs) * 100;

  return fatPercent > 2 && fatPercent < 60 ? fatPercent.toFixed(1) : '';
};
type CalcTabType = 'bmi' | 'tdee';

export const MetricsTracker: React.FC<MetricsTrackerProps> = ({
  weightLogs,
  addWeightLog,
  deleteWeightLog
}) => {
  const [activeMetric, setActiveMetric] = useState<MetricType>('weight');
  // window.confirm / alert yerine uygulama içi pencere.
  const [logToDelete, setLogToDelete] = useState<string | null>(null);
  const [formAlert, setFormAlert] = useState<string | null>(null);
  
  // Form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [biceps, setBiceps] = useState('');
  const [waist, setWaist] = useState('');
  const [chest, setChest] = useState('');
  const [thigh, setThigh] = useState('');
  
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [isCalcExpanded, setIsCalcExpanded] = useState(false);

  // Health Calculator States
  const [calcTab, setCalcTab] = useState<CalcTabType>('bmi');
  const [userGender, setUserGender] = useState<'male' | 'female'>('male');
  const [userHeight, setUserHeight] = useState('175');
  const [userAge, setUserAge] = useState('25');
  const [activityLevel, setActivityLevel] = useState('1.55'); // moderately active
  const latestLoggedWeight = mostRecentWeight(weightLogs);
  const [calcWeight, setCalcWeight] = useState(latestLoggedWeight ?? '75');
  const [syncedWeight, setSyncedWeight] = useState(latestLoggedWeight);

  // Yeni bir kilo kaydı eklenince hesaplayıcı alanını tazele; kullanıcının
  // aradaki düzenlemesi korunur.
  if (latestLoggedWeight !== syncedWeight) {
    setSyncedWeight(latestLoggedWeight);
    if (latestLoggedWeight) setCalcWeight(latestLoggedWeight);
  }

  // Yağ oranı yalnızca kilo/bel/cinsiyetten hesaplanır ve kullanıcı tarafından
  // düzenlenmez; bu yüzden state değil, render sırasında türetilen bir değer.
  const bodyFat = estimateBodyFat(weight, waist, userGender);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || parseFloat(weight) <= 0) {
      setFormAlert('Lütfen geçerli bir kilo girin.');
      return;
    }

    addWeightLog({
      date,
      weight: parseFloat(weight),
      bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
      biceps: biceps ? parseFloat(biceps) : undefined,
      waist: waist ? parseFloat(waist) : undefined,
      chest: chest ? parseFloat(chest) : undefined,
      thigh: thigh ? parseFloat(thigh) : undefined,
    });

    // Reset inputs
    setWeight('');
    setBiceps('');
    setWaist('');
    setChest('');
    setThigh('');
    setIsFormExpanded(false);
  };



  // Calculators logic
  const heightM = parseFloat(userHeight) / 100;
  const weightKg = parseFloat(calcWeight);
  const bmi = heightM > 0 && weightKg > 0 ? (weightKg / (heightM * heightM)) : 0;
  
  const getBmiCategory = (bmiVal: number) => {
    if (bmiVal < 18.5) return { label: 'Zayıf', color: 'var(--accent-cyan)' };
    if (bmiVal < 25) return { label: 'Normal', color: 'var(--accent-mint)' };
    if (bmiVal < 30) return { label: 'Fazla Kilolu', color: 'var(--accent-amber)' };
    return { label: 'Obez', color: '#ef4444' };
  };

  const bmiCat = getBmiCategory(bmi);

  // Calories Calculation (Mifflin-St Jeor)
  const ageVal = parseInt(userAge);
  let bmr = 0;
  if (heightM > 0 && weightKg > 0 && ageVal > 0) {
    if (userGender === 'male') {
      bmr = 10 * weightKg + 6.25 * (heightM * 100) - 5 * ageVal + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * (heightM * 100) - 5 * ageVal - 161;
    }
  }
  const tdee = bmr * parseFloat(activityLevel);

  // Build trend chart coordinates
  const renderTrendChart = () => {
    const sortedLogs = [...weightLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const validLogs = sortedLogs.filter(log => {
      if (activeMetric === 'weight') return log.weight > 0;
      return log[activeMetric] !== undefined && (log[activeMetric] as number) > 0;
    });

    if (validLogs.length === 0) {
      return (
        <div className="empty-metrics-chart">
          <TrendingUp size={36} className="empty-icon" />
          <p>Seçilen ölçüm için henüz veri kaydı yok. Grafik çizilmesi için yeni ölçüm ekleyin.</p>
        </div>
      );
    }

    const values = validLogs.map(log => log[activeMetric] as number);
    const minVal = Math.min(...values) * 0.98;
    const maxVal = Math.max(...values) * 1.02;
    const range = maxVal - minVal || 1;

    const width = 500;
    const height = 200;
    const padding = 30;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = validLogs.map((log, index) => {
      const val = log[activeMetric] as number;
      const x = padding + (index / (validLogs.length - 1 || 1)) * chartWidth;
      const y = padding + chartHeight - ((val - minVal) / range) * chartHeight;
      return { x, y, value: val, date: log.date };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    const getMetricLabel = (type: MetricType) => {
      switch (type) {
        case 'weight': return 'Kilo (kg)';
        case 'bodyFat': return 'Yağ Oranı (%)';
        case 'biceps': return 'Kol (cm)';
        case 'waist': return 'Bel (cm)';
        case 'chest': return 'Göğüs (cm)';
        case 'thigh': return 'Bacak (cm)';
      }
    };

    return (
      <div className="metrics-chart-wrapper">
        <h3 className="chart-title-lbl">{getMetricLabel(activeMetric)} Trendi</h3>
        
        <svg viewBox={`0 0 ${width} ${height}`} className="metrics-svg-chart">
          <defs>
            <linearGradient id="metricsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--border-light)" strokeDasharray="4 4" />
          <line x1={padding} y1={padding + chartHeight / 2} x2={width - padding} y2={padding + chartHeight / 2} stroke="var(--border-light)" strokeDasharray="4 4" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border-light)" />

          <path d={areaPath} fill="url(#metricsGradient)" />

          <path
            d={linePath}
            fill="none"
            stroke="var(--accent-cyan)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((p, i) => (
            <g key={i} className="metrics-dot-group">
              <circle
                cx={p.x}
                cy={p.y}
                r="5"
                fill="var(--bg-primary)"
                stroke="var(--accent-cyan)"
                strokeWidth="3"
                className="metrics-dot"
              />
              <text x={p.x} y={p.y - 12} textAnchor="middle" className="chart-tooltip-text">
                {p.value}
              </text>
            </g>
          ))}

          {points.map((p, i) => {
            if (points.length > 8 && i % 2 !== 0) return null;
            const dateObj = new Date(p.date);
            const label = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
            return (
              <text key={i} x={p.x} y={height - 10} textAnchor="middle" className="chart-axis-text">
                {label}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  const getMetricHeaderLabel = (type: MetricType) => {
    switch (type) {
      case 'weight': return 'Ağırlık';
      case 'bodyFat': return 'Yağ %';
      case 'biceps': return 'Kol';
      case 'waist': return 'Bel';
      case 'chest': return 'Göğüs';
      case 'thigh': return 'Bacak';
    }
  };



  return (
    <div className="metrics-container anim-slide-up">
      {/* Header */}
      <header className="metrics-header">
        <div>
          <h1 className="metrics-title">Vücut <span className="cyan-gradient-text">Ölçülerim</span></h1>
          <p className="metrics-subtitle">Kilonuzu, yağ oranınızı ve bölgesel ölçülerinizi düzenli kaydederek gelişimi izleyin.</p>
        </div>
        <button 
          onClick={() => setIsFormExpanded(!isFormExpanded)} 
          className="btn btn-primary"
        >
          {isFormExpanded ? <ChevronUp size={18} /> : <Plus size={18} />} Ölçüm Ekle
        </button>
      </header>

      {/* Expandable Log Form */}
      {isFormExpanded && (
        <section className="metrics-form-card glass-panel anim-slide-up">
          <form onSubmit={handleSubmit} className="metrics-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tarih</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Kilo (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Örn: 78.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="form-input"
                  required
                />
                <span className="input-helper-text" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
                  Sabah aç karnına ve kıyafetsiz tartılın.
                </span>
              </div>
              <div className="form-group">
                <label className="form-label">Cinsiyet (Yağ Oranı İçi)</label>
                <select 
                  value={userGender} 
                  onChange={(e) => setUserGender(e.target.value as 'male' | 'female')}
                  className="form-input select"
                >
                  <option value="male">Erkek</option>
                  <option value="female">Kadın</option>
                </select>
                <span className="input-helper-text" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
                  YMCA yağ hesaplaması için cinsiyet seçin.
                </span>
              </div>
            </div>

            <div className="form-row border-top">
              <div className="form-group">
                <label className="form-label">Biceps (Kol - cm)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Örn: 38.5"
                  value={biceps}
                  onChange={(e) => setBiceps(e.target.value)}
                  className="form-input"
                />
                <span className="input-helper-text" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
                  Sıkarak biceps bölgesinin en tepe noktasından ölçün.
                </span>
              </div>
              <div className="form-group">
                <label className="form-label">Bel (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Örn: 82"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  className="form-input"
                />
                <span className="input-helper-text" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
                  Göbek deliğinin 1-2 cm üzerinden karnı kasmadan sarın.
                </span>
              </div>
              <div className="form-group">
                <label className="form-label">Göğüs (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Örn: 104"
                  value={chest}
                  onChange={(e) => setChest(e.target.value)}
                  className="form-input"
                />
                <span className="input-helper-text" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
                  Sırtı da sararak göğsün en geniş yerinden ölçün.
                </span>
              </div>
              <div className="form-group">
                <label className="form-label">Bacak (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Örn: 58.5"
                  value={thigh}
                  onChange={(e) => setThigh(e.target.value)}
                  className="form-input"
                />
                <span className="input-helper-text" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
                  Uyluğun kalçaya en yakın en kalın yerinden ölçün.
                </span>
              </div>
            </div>

            {/* Auto-Calculated Body Fat Display */}
            {bodyFat && (
              <div className="form-calculated-info" style={{ marginTop: '4px', fontSize: '13px', color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.05)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px dashed rgba(6, 182, 212, 0.2)', textAlign: 'left' }}>
                Otomatik Hesaplanan Yağ Oranı: <strong>%{bodyFat}</strong> (YMCA Yöntemi ile Kilo ve Bel ölçümünüze göre)
              </div>
            )}

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => setIsFormExpanded(false)} 
                className="btn btn-secondary btn-sm"
              >
                İptal
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                Kaydet
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Main Grid: Selector Tabs + SVG Line Chart & Interactive Side Guide/Calc */}
      <section className="metrics-analytics-layout">
        <div className="metrics-dashboard glass-panel">
          <div className="metrics-selector-tabs">
            {(['weight', 'bodyFat', 'biceps', 'waist', 'chest', 'thigh'] as MetricType[]).map(type => (
              <button
                key={type}
                onClick={() => setActiveMetric(type)}
                className={`metric-tab-btn ${activeMetric === type ? 'active' : ''}`}
              >
                <Activity size={16} />
                <span>{getMetricHeaderLabel(type)}</span>
              </button>
            ))}
          </div>

          <div className="chart-container-area">
            <div className="chart-canvas">
              {renderTrendChart()}
            </div>
            

          </div>
        </div>
      </section>

      {/* Collapsible Health Calculators Panel */}
      <div className="calculators-toggle-section">
        <button
          type="button"
          onClick={() => setIsCalcExpanded(!isCalcExpanded)}
          className={`btn ${isCalcExpanded ? 'btn-secondary' : 'btn-primary'}`}
          style={{ width: '100%', gap: '10px', padding: '14px', borderRadius: 'var(--radius-md)' }}
        >
          <Calculator size={18} />
          {isCalcExpanded ? 'Hesaplayıcıları Gizle' : 'Sağlık Hesaplayıcıları (VKİ, Kalori)'}
        </button>
      </div>

      {isCalcExpanded && (
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
      )}

      {/* History logs table */}
      <section className="metrics-history glass-panel">
        <h3 className="section-title">Geçmiş Ölçüm Kayıtları</h3>

        <div className="metrics-logs-list">
          {weightLogs.length === 0 ? (
            <p className="no-logs-msg">Henüz kaydedilmiş ölçüm bulunmuyor. İlk ölçümünüzü ekleyin!</p>
          ) : (
            <div className="logs-table">
              <div className="table-header-row desktop-only">
                <span>Tarih</span>
                <span>Kilo</span>
                <span>Yağ %</span>
                <span>Kol</span>
                <span>Bel</span>
                <span>Göğüs</span>
                <span>Bacak</span>
                <span>Aksiyon</span>
              </div>

              {[...weightLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
                <React.Fragment key={log.id}>
                  {/* Desktop Row */}
                  <div className="table-data-row desktop-only">
                    <span className="log-date-lbl">
                      <Calendar size={14} />
                      {new Date(log.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="log-val">{log.weight} kg</span>
                    <span className="log-val">{log.bodyFat ? `${log.bodyFat}%` : '-'}</span>
                    <span className="log-val">{log.biceps ? `${log.biceps} cm` : '-'}</span>
                    <span className="log-val">{log.waist ? `${log.waist} cm` : '-'}</span>
                    <span className="log-val">{log.chest ? `${log.chest} cm` : '-'}</span>
                    <span className="log-val">{log.thigh ? `${log.thigh} cm` : '-'}</span>
                    <button 
                      onClick={() => {
                        setLogToDelete(log.id);
                      }} 
                      className="btn-delete-log"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Mobile Card */}
                  <div className="mobile-metric-card mobile-only glass-panel">
                    <div className="card-top-info">
                      <span className="card-date-lbl">
                        <Calendar size={13} />
                        {new Date(log.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <button 
                        onClick={() => {
                        setLogToDelete(log.id);
                        }} 
                        className="btn-delete-log-mobile"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <div className="card-metrics-grid">
                      <div className="metric-box">
                        <span className="box-lbl">Kilo</span>
                        <span className="box-val highlight-cyan">{log.weight} kg</span>
                      </div>
                      <div className="metric-box">
                        <span className="box-lbl">Yağ Oranı</span>
                        <span className="box-val highlight-pink">{log.bodyFat ? `%${log.bodyFat}` : '-'}</span>
                      </div>
                      <div className="metric-box">
                        <span className="box-lbl">Kol</span>
                        <span className="box-val">{log.biceps ? `${log.biceps} cm` : '-'}</span>
                      </div>
                      <div className="metric-box">
                        <span className="box-lbl">Bel</span>
                        <span className="box-val">{log.waist ? `${log.waist} cm` : '-'}</span>
                      </div>
                      <div className="metric-box">
                        <span className="box-lbl">Göğüs</span>
                        <span className="box-val">{log.chest ? `${log.chest} cm` : '-'}</span>
                      </div>
                      <div className="metric-box">
                        <span className="box-lbl">Bacak</span>
                        <span className="box-val">{log.thigh ? `${log.thigh} cm` : '-'}</span>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </section>

      <style>{`
        .metrics-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .metrics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .metrics-title {
          font-size: 36px;
          font-weight: 800;
          letter-spacing: -0.04em;
          margin-bottom: 6px;
        }

        .metrics-subtitle {
          color: var(--text-secondary);
          font-size: 16px;
        }

        /* Form styling */
        .metrics-form-card {
          padding: 24px;
        }

        .metrics-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 16px;
        }

        .form-row.border-top {
          border-top: 1px solid var(--border-light);
          padding-top: 20px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        /* Analytics Grid layout */
        .metrics-analytics-layout {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .metrics-dashboard {
          display: grid;
          grid-template-columns: 180px 1fr;
          min-height: 280px;
          padding: 20px;
          gap: 20px;
        }

        .metrics-selector-tabs {
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-right: 1px solid var(--border-light);
          padding-right: 12px;
        }

        .metric-tab-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-secondary);
          cursor: pointer;
          font-weight: 600;
          font-family: var(--font-headings);
          transition: all var(--transition-fast);
          text-align: left;
        }

        .metric-tab-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.02);
        }

        .metric-tab-btn.active {
          color: #fff;
          background: rgba(6, 182, 212, 0.1);
          border-color: rgba(6, 182, 212, 0.25);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.1);
        }

        .metric-tab-btn.active svg {
          color: var(--accent-cyan);
        }

        /* Chart container & Quick guide styles */
        .chart-container-area {
          display: flex;
          flex-direction: column;
          gap: 16px;
          flex: 1;
        }

        .chart-canvas {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          min-height: 180px;
        }

        .quick-guide-line {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(6, 182, 212, 0.04);
          border: 1px solid rgba(6, 182, 212, 0.15);
          border-radius: var(--radius-md);
          font-size: 13px;
          line-height: 1.55;
          color: var(--text-secondary);
        }

        .quick-guide-icon {
          color: var(--accent-cyan);
          margin-top: 2px;
          flex-shrink: 0;
        }

        .quick-guide-text {
          margin: 0;
        }

        .quick-guide-tip {
          display: inline;
          color: var(--text-muted);
          margin-left: 6px;
        }

        /* Side Panel Calculators (Stacked layout when expanded) */
        .metrics-side-panel {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-height: 300px;
        }

        .panel-tabs {
          display: flex;
          gap: 6px;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 10px;
        }

        .panel-tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 10px 4px;
          font-size: 13px;
          font-weight: 700;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .panel-tab-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.02);
        }

        .panel-tab-btn.active {
          color: #fff;
          background: var(--gradient-primary);
          box-shadow: 0 4px 10px rgba(139, 92, 246, 0.2);
        }

        .panel-content {
          flex: 1;
        }

        /* Calculator View Formatting */
        .calculator-view {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .calculator-view h4 {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .calc-inputs-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .calc-inputs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
          gap: 12px;
        }

        .calc-input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .calc-input-group.full-width {
          grid-column: 1 / -1;
        }

        .calc-input-group label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
        }

        .calc-input {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          padding: 8px 12px;
          font-size: 13px;
          color: var(--text-primary);
          width: 100%;
          outline: none;
          transition: all var(--transition-fast);
        }

        .calc-input:focus {
          border-color: var(--border-focus);
          background: rgba(255, 255, 255, 0.05);
        }

        .calc-input.select {
          cursor: pointer;
        }

        .calc-input.select option {
          background: var(--bg-card-solid);
          color: var(--text-primary);
        }

        .calc-result-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: 16px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .result-main-value {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .result-number {
          font-size: 32px;
          font-weight: 800;
          color: var(--text-primary);
          font-family: var(--font-headings);
        }

        .result-label {
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 600;
        }

        .result-status {
          font-size: 14px;
          font-weight: 700;
          margin-top: 2px;
        }

        .bmi-gauge-bar {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: linear-gradient(to right, #3b82f6 0%, #10b981 35%, #f59e0b 65%, #ef4444 100%);
          margin-top: 15px;
          position: relative;
        }

        .bmi-indicator-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid var(--bg-primary);
          position: absolute;
          top: -3px;
          transform: translateX(-50%);
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          transition: left var(--transition-normal);
        }

        .bmi-gauge-labels {
          display: flex;
          justify-content: space-between;
          width: 100%;
          font-size: 9px;
          color: var(--text-muted);
          margin-top: 6px;
          font-weight: 700;
        }

        .calorie-results {
          align-items: stretch;
          text-align: left;
          gap: 10px;
        }

        .calorie-metric {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }

        .calorie-lbl {
          color: var(--text-secondary);
          font-weight: 600;
        }

        .calorie-val {
          font-weight: 700;
        }

        .calorie-metric.main-tdee {
          font-size: 14px;
          padding-top: 8px;
        }

        .calorie-metric.border-top {
          border-top: 1px solid var(--border-light);
        }

        .font-accent-cyan { color: var(--accent-cyan); }
        .font-accent-violet { color: var(--accent-violet); }
        .font-accent-mint { color: var(--accent-mint); }
        .font-accent-amber { color: var(--accent-amber); }

        .calc-notice {
          font-size: 11px;
          color: var(--text-muted);
          text-align: center;
          padding: 20px 0;
          line-height: 1.5;
        }

        /* SVG Trend Chart formatting */
        .metrics-chart-wrapper {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chart-title-lbl {
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .metrics-svg-chart {
          width: 100%;
          max-height: 200px;
          overflow: visible;
        }

        .metrics-dot {
          transition: all var(--transition-fast);
          cursor: pointer;
        }

        .metrics-dot-group:hover .metrics-dot {
          r: 7px;
          fill: var(--accent-cyan);
          stroke: #fff;
        }

        .metrics-dot-group:hover .chart-tooltip-text {
          opacity: 1;
        }

        .empty-metrics-chart {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: var(--text-muted);
          text-align: center;
          padding: 40px;
        }

        .empty-icon {
          color: var(--border-medium);
        }

        /* History log table styling */
        .metrics-history {
          padding: 24px;
        }

        .metrics-history .section-title {
          margin-bottom: 20px;
        }

        .metrics-logs-list {
          overflow-x: auto;
        }

        .logs-table {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 700px;
        }

        .table-header-row, .table-data-row {
          display: grid;
          grid-template-columns: 1.5fr repeat(6, 1fr) 50px;
          padding: 12px 16px;
          align-items: center;
          border-radius: var(--radius-sm);
        }

        .table-header-row {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-light);
          font-size: 11px;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-align: center;
        }

        .table-header-row span:first-child {
          text-align: left;
        }

        .table-data-row {
          border: 1px solid var(--border-light);
          background: rgba(255, 255, 255, 0.01);
          text-align: center;
          transition: all var(--transition-fast);
        }

        .table-data-row:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: var(--border-medium);
        }

        .log-date-lbl {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          color: var(--text-secondary);
          text-align: left !important;
        }

        .log-val {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .btn-delete-log {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 6px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }

        .btn-delete-log:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .no-logs-msg {
          color: var(--text-muted);
          text-align: center;
          padding: 30px;
        }

        /* Anim Utilities */
        .anim-slide-up {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideUp {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .mobile-metric-card {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          text-align: left;
        }

        .card-top-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          padding-bottom: 8px;
        }

        .card-date-lbl {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .btn-delete-log-mobile {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }

        .btn-delete-log-mobile:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 4px;
        }

        .card-metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .metric-box {
          display: flex;
          flex-direction: column;
          gap: 4px;
          background: rgba(255, 255, 255, 0.01);
          padding: 10px 8px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
          text-align: left;
        }

        .box-lbl {
          font-size: 9px;
          color: var(--text-muted);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .box-val {
          font-size: 13px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .box-val.highlight-cyan {
          color: var(--accent-cyan);
        }

        .box-val.highlight-pink {
          color: var(--accent-pink);
        }

        @media (max-width: 768px) {
          .metrics-dashboard {
            grid-template-columns: 1fr;
          }
          .metrics-selector-tabs {
            flex-direction: row;
            flex-wrap: wrap;
            border-right: none;
            border-bottom: 1px solid var(--border-light);
            padding-right: 0;
            padding-bottom: 12px;
          }
          .metric-tab-btn {
            flex: 1;
            min-width: 90px;
            justify-content: center;
          }
          .metrics-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          .metrics-header .btn {
            width: 100%;
          }
          .metrics-logs-list {
            overflow-x: visible;
          }
          .logs-table {
            min-width: 0 !important;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
        }

        @media (max-width: 480px) {
          .card-metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      <ConfirmDialog
        open={logToDelete !== null}
        destructive
        title="Ölçüm kaydını sil"
        message="Bu ölçüm kaydı kalıcı olarak silinecek. Devam etmek istiyor musunuz?"
        confirmLabel="Sil"
        onConfirm={() => {
          if (logToDelete) deleteWeightLog(logToDelete);
          setLogToDelete(null);
        }}
        onCancel={() => setLogToDelete(null)}
      />

      <ConfirmDialog
        open={formAlert !== null}
        alertOnly
        title="Eksik bilgi"
        message={formAlert ?? ''}
        onConfirm={() => setFormAlert(null)}
        onCancel={() => setFormAlert(null)}
      />
    </div>
  );
};
