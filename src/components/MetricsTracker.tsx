import React, { useState } from 'react';
import { Plus, Trash2, Calendar, TrendingUp, ChevronUp, Calculator } from 'lucide-react';
import type { WeightLog } from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import { HealthCalculators } from './HealthCalculators';
import './MetricsTracker.css';

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
        {/* Sayfa başlığı Profil sekmesinde zaten gösteriliyor; burada tekrar
            etmek içeriğe gelmeden ~350px yer harcıyordu. */}
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
              <div className="form-calculated-info" style={{ marginTop: '4px', fontSize: '13px', color: 'var(--accent-cyan)', background: 'var(--accent-cyan-bg)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--accent-cyan-border)', textAlign: 'left' }}>
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
          className="btn btn-secondary metrics-calc-toggle"
          aria-expanded={isCalcExpanded}
        >
          <Calculator size={18} />
          {isCalcExpanded ? 'Hesaplayıcıları Gizle' : 'Sağlık Hesaplayıcıları (VKİ, Kalori)'}
        </button>
      </div>

      {isCalcExpanded && (
        <HealthCalculators
          calcTab={calcTab}
          setCalcTab={setCalcTab}
          userGender={userGender}
          setUserGender={setUserGender}
          userHeight={userHeight}
          setUserHeight={setUserHeight}
          userAge={userAge}
          setUserAge={setUserAge}
          calcWeight={calcWeight}
          setCalcWeight={setCalcWeight}
          activityLevel={activityLevel}
          setActivityLevel={setActivityLevel}
          bmi={bmi}
          bmiCat={bmiCat}
          bmr={bmr}
          tdee={tdee}
        />
      )}

      {/* History logs table */}
      <section className="metrics-history glass-panel">
        <h2 className="section-title">Geçmiş Ölçüm Kayıtları</h2>

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
