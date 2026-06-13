import React, { useState } from 'react';
import type { User } from '../utils/firebase';
import { LogOut, User as UserIcon, History as HistoryIcon, Activity } from 'lucide-react';
import { History } from './History';
import { MetricsTracker } from './MetricsTracker';
import type { CompletedWorkout, WeightLog } from '../types';

interface ProfileProps {
  currentUser: User | null;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
  isLoading: boolean;
  history: CompletedWorkout[];
  deleteHistoryItem: (id: string) => void;
  weightLogs: WeightLog[];
  addWeightLog: (log: Omit<WeightLog, 'id'>) => void;
  deleteWeightLog: (id: string) => void;
  activeSubTab: 'account' | 'history' | 'metrics';
  setActiveSubTab: (subTab: 'account' | 'history' | 'metrics') => void;
}

export const Profile: React.FC<ProfileProps> = ({
  currentUser,
  onGoogleSignIn,
  onSignOut,
  isLoading,
  history,
  deleteHistoryItem,
  weightLogs,
  addWeightLog,
  deleteWeightLog,
  activeSubTab,
  setActiveSubTab
}) => {
  const [avatarError, setAvatarError] = useState(false);
  const [isAvatarZoomed, setIsAvatarZoomed] = useState(false);
  
  const isAnonymous = !currentUser || currentUser.isAnonymous;

  const getHeaderInfo = () => {
    switch (activeSubTab) {
      case 'history':
        return {
          title: 'Antrenman Geçmişi',
          subtitle: 'Tamamladığınız antrenmanların detayları ve özetleri'
        };
      case 'metrics':
        return {
          title: 'Vücut Ölçülerim',
          subtitle: 'Kilo ve vücut ölçülerinizi düzenli takip edin'
        };
      case 'account':
      default:
        return {
          title: 'Hesabım',
          subtitle: 'Veri eşitleme ve hesap ayarlarınız'
        };
    }
  };

  const header = getHeaderInfo();

  return (
    <div className={`profile-container anim-slide-up ${activeSubTab !== 'account' ? 'wide' : ''}`}>
      <div className="profile-header-section">
        <h1 className="profile-title-text gradient-text">{header.title}</h1>
        <p className="profile-subtitle-text">{header.subtitle}</p>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="profile-subtabs-nav glass-panel">
        <button 
          onClick={() => setActiveSubTab('account')} 
          className={`profile-subtab-btn ${activeSubTab === 'account' ? 'active' : ''}`}
        >
          <UserIcon size={16} />
          Profil
        </button>
        <button 
          onClick={() => setActiveSubTab('history')} 
          className={`profile-subtab-btn ${activeSubTab === 'history' ? 'active' : ''}`}
        >
          <HistoryIcon size={16} />
          Geçmiş
        </button>
        <button 
          onClick={() => setActiveSubTab('metrics')} 
          className={`profile-subtab-btn ${activeSubTab === 'metrics' ? 'active' : ''}`}
        >
          <Activity size={16} />
          Ölçümler
        </button>
      </div>

      {activeSubTab === 'account' && (
        <div className="profile-main-card glass-panel">
          <div 
            className="profile-avatar-wrapper" 
            onClick={() => {
              if (currentUser && !isAnonymous && currentUser.photoURL && !avatarError) {
                setIsAvatarZoomed(true);
              }
            }} 
            style={{ cursor: currentUser && !isAnonymous && currentUser.photoURL && !avatarError ? 'pointer' : 'default' }}
          >
            {currentUser && !isAnonymous && currentUser.photoURL && !avatarError ? (
              <img 
                src={currentUser.photoURL} 
                alt="Profil" 
                className="profile-large-avatar" 
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className="profile-large-avatar-placeholder">
                {currentUser && !isAnonymous && currentUser.displayName 
                  ? currentUser.displayName[0].toUpperCase() 
                  : 'M'
                }
              </div>
            )}
            {!isAnonymous && (
              <span className="profile-status-badge badge-mint">Bulut Eşitlendi</span>
            )}
          </div>

          <div className="profile-user-details">
            <h2>{currentUser && !isAnonymous ? (currentUser.displayName || 'Sporcu') : 'Misafir Kullanıcı'}</h2>
            <p className="profile-email-text">{currentUser && !isAnonymous ? currentUser.email : 'Veriler yerel cihazınızda saklanıyor'}</p>
          </div>

          <div className="profile-status-card">
            {isAnonymous ? (
              <div className="status-info-box warning">
                <span className="status-icon">⚠️</span>
                <div>
                  <h4>Bulut Eşitlemesi Kapalı</h4>
                  <p>Verileriniz yalnızca bu tarayıcıda/cihazda saklanır. Tarayıcı önbelleği silinirse veya cihazınız bozulursa verileriniz kaybolabilir.</p>
                </div>
              </div>
            ) : (
              <div className="status-info-box success">
                <span className="status-icon">🟢</span>
                <div>
                  <h4>Bulut Eşitlemesi Aktif</h4>
                  <p>Antrenman programlarınız, geçmişiniz, ölçümleriniz ve kişisel rekorlarınız güvenli bir şekilde Google hesabınızla anlık eşitlenmektedir.</p>
                </div>
              </div>
            )}
          </div>

          <div className="profile-actions-section">
            {isAnonymous ? (
              <button
                onClick={onGoogleSignIn}
                className="btn btn-primary google-login-btn"
                disabled={isLoading}
                style={{ width: '100%', padding: '14px 20px', fontSize: '15px' }}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#ffffff"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#ffffff" fillOpacity="0.85"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#ffffff" fillOpacity="0.75"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.54l3.66 2.83c.87-2.6 3.3-4.53 6.16-4.53z" fill="#ffffff" fillOpacity="0.95"/>
                </svg>
                Google Hesabını Bağla
              </button>
            ) : (
              <button 
                onClick={onSignOut} 
                className="btn btn-danger signout-btn"
                disabled={isLoading}
                style={{ width: '100%', padding: '14px 20px', fontSize: '15px' }}
              >
                <LogOut size={18} />
                Oturumu Kapat
              </button>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'history' && (
        <div className="profile-content-tab anim-slide-up">
          <History history={history} deleteHistoryItem={deleteHistoryItem} />
        </div>
      )}

      {activeSubTab === 'metrics' && (
        <div className="profile-content-tab anim-slide-up">
          <MetricsTracker weightLogs={weightLogs} addWeightLog={addWeightLog} deleteWeightLog={deleteWeightLog} />
        </div>
      )}

      {isAvatarZoomed && currentUser && !isAnonymous && currentUser.photoURL && (
        <div className="profile-avatar-zoom-overlay" onClick={() => setIsAvatarZoomed(false)}>
          <div className="profile-avatar-zoom-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={currentUser.photoURL} 
              alt="Profil Yakınlaştırılmış" 
              className="profile-zoomed-avatar"
              referrerPolicy="no-referrer"
            />
            <button className="profile-avatar-zoom-close" onClick={() => setIsAvatarZoomed(false)}>&times;</button>
          </div>
        </div>
      )}

      <style>{`
        /* Zoom Modal */
        .profile-avatar-zoom-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(10, 11, 18, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: profile-fade-in 0.25s ease-out;
        }

        .profile-avatar-zoom-content {
          position: relative;
          max-width: 90%;
          max-height: 90%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: profile-zoom-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .profile-zoomed-avatar {
          max-width: 320px;
          max-height: 320px;
          width: 80vw;
          height: 80vw;
          border-radius: var(--radius-lg);
          border: 3px solid var(--accent-violet);
          box-shadow: 0 10px 40px rgba(139, 92, 246, 0.4);
          object-fit: cover;
        }

        .profile-avatar-zoom-close {
          position: absolute;
          top: -45px;
          right: 0;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          font-size: 24px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .profile-avatar-zoom-close:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }

        @keyframes profile-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes profile-zoom-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .profile-container {
          max-width: 560px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
          transition: max-width var(--transition-normal) ease;
        }

        .profile-container.wide {
          max-width: 900px;
        }

        .profile-header-section {
          text-align: center;
          margin-bottom: 4px;
        }

        .profile-title-text {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .profile-subtitle-text {
          font-size: 14px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        /* Subtabs Styling */
        .profile-subtabs-nav {
          display: flex;
          padding: 6px;
          border-radius: var(--radius-md);
          background: rgba(13, 15, 23, 0.45);
          border: 1px solid var(--border-light);
          gap: 6px;
        }

        .profile-subtab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          font-weight: 700;
          font-family: var(--font-headings);
          font-size: 14px;
          cursor: pointer;
          transition: all var(--transition-fast) ease;
        }

        .profile-subtab-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.03);
        }

        .profile-subtab-btn.active {
          color: #fff;
          background: var(--gradient-primary);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
        }

        .profile-main-card {
          padding: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 28px;
          border-radius: var(--radius-lg);
          background: rgba(13, 15, 23, 0.5);
        }

        .profile-avatar-wrapper {
          position: relative;
          display: flex;
          justify-content: center;
        }

        .profile-large-avatar {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid var(--accent-violet);
          box-shadow: 0 0 20px var(--accent-violet-glow);
        }

        .profile-large-avatar-placeholder {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: var(--gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 800;
          color: #fff;
          border: 3px solid var(--accent-violet);
          box-shadow: 0 0 20px var(--accent-violet-glow);
        }

        .profile-status-badge {
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          font-size: 9px;
          padding: 3px 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          pointer-events: none;
        }

        .profile-user-details {
          text-align: center;
        }

        .profile-user-details h2 {
          font-size: 22px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .profile-email-text {
          font-size: 14px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .profile-status-card {
          width: 100%;
        }

        .status-info-box {
          display: flex;
          gap: 16px;
          padding: 16px 20px;
          border-radius: var(--radius-md);
          font-size: 13px;
          line-height: 1.5;
          text-align: left;
        }

        .status-info-box.warning {
          background: rgba(245, 158, 11, 0.04);
          border: 1px solid rgba(245, 158, 11, 0.15);
          color: var(--text-secondary);
        }

        .status-info-box.warning h4 {
          color: var(--accent-amber);
          margin-bottom: 2px;
          font-weight: 700;
        }

        .status-info-box.success {
          background: rgba(16, 185, 129, 0.04);
          border: 1px solid rgba(16, 185, 129, 0.15);
          color: var(--text-secondary);
        }

        .status-info-box.success h4 {
          color: var(--accent-mint);
          margin-bottom: 2px;
          font-weight: 700;
        }

        .status-icon {
          font-size: 20px;
          display: flex;
          align-items: flex-start;
          margin-top: 2px;
        }

        .profile-actions-section {
          width: 100%;
        }

        .google-login-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-family: var(--font-headings);
          font-weight: 700;
        }

        .signout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-family: var(--font-headings);
          font-weight: 700;
        }

        .profile-content-tab {
          width: 100%;
        }

        @media (max-width: 768px) {
          .profile-subtab-btn {
            font-size: 13px;
            padding: 10px 8px;
            gap: 6px;
          }
        }

        @media (max-width: 480px) {
          .profile-main-card {
            padding: 30px 20px;
          }
        }
      `}</style>
    </div>
  );
};
