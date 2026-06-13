import React from 'react';
import { LayoutDashboard, Dumbbell, Calendar, BookOpen, Sparkles, Compass } from 'lucide-react';
import type { ActiveTab } from '../types';
import type { User } from '../utils/firebase';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isWorkoutActive: boolean;
  currentUser: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isWorkoutActive, currentUser }) => {
  const [imgError, setImgError] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Özet Panel', icon: LayoutDashboard },
    { id: 'programs', label: 'Programlarım', icon: Calendar },
    { id: 'exercises', label: 'Egzersizler', icon: BookOpen },
    { id: 'explore', label: 'Keşfet', icon: Compass }
  ] as const;

  return (
    <aside className="sidebar-container glass-panel">
      <div className="sidebar-logo">
        <Sparkles className="logo-icon" size={24} />
        <span className="logo-text gradient-text">AuraFit</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}

        {isWorkoutActive && (
          <button
            onClick={() => setActiveTab('active')}
            className={`nav-item active-workout-btn pulse-border ${activeTab === 'active' ? 'active' : ''}`}
          >
            <Dumbbell size={20} className="nav-icon spinning-icon" />
            <span className="nav-label">Aktif Antrenman</span>
          </button>
        )}
      </nav>

      <div 
        className={`sidebar-footer ${activeTab === 'profile' ? 'active-profile' : ''}`} 
        onClick={() => setActiveTab('profile')} 
        style={{ cursor: 'pointer' }}
      >
        {currentUser && !currentUser.isAnonymous && currentUser.photoURL && !imgError ? (
          <img 
            src={currentUser.photoURL} 
            alt="Avatar" 
            className="avatar" 
            style={{ objectFit: 'cover' }} 
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="avatar">
            {currentUser && !currentUser.isAnonymous && currentUser.displayName
              ? currentUser.displayName[0].toUpperCase()
              : 'M'
            }
          </div>
        )}
        <div className="user-info">
          <p className="username">
            {currentUser && !currentUser.isAnonymous
              ? (currentUser.displayName || 'Sporcu')
              : 'Misafir'
            }
          </p>
          <p className="user-rank" style={{ color: currentUser && !currentUser.isAnonymous ? 'var(--accent-mint)' : 'var(--accent-cyan)' }}>
            {currentUser && !currentUser.isAnonymous ? 'Bulut Senk. Aktif' : 'Misafir Girişi'}
          </p>
        </div>
      </div>

      <style>{`
        .sidebar-container {
          width: 260px;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          padding: 30px 20px;
          border-radius: 0;
          border-left: none;
          border-top: none;
          border-bottom: none;
          background: rgba(13, 15, 23, 0.7);
          z-index: 100;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 50px;
          padding-left: 10px;
        }

        .logo-icon {
          color: var(--accent-violet);
          filter: drop-shadow(0 0 8px var(--accent-violet-glow));
        }

        .logo-text {
          font-family: var(--font-headings);
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
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

        .nav-item:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.03);
          transform: translateX(4px);
        }

        .nav-item.active {
          color: #fff;
          background: var(--bg-accent-translucent);
          border-color: rgba(139, 92, 246, 0.2);
          box-shadow: inset 0 0 12px rgba(139, 92, 246, 0.05);
        }

        .nav-item.active .nav-icon {
          color: var(--accent-violet);
          filter: drop-shadow(0 0 5px var(--accent-violet-glow));
        }

        .nav-icon {
          transition: all var(--transition-fast);
        }

        .active-workout-btn {
          margin-top: 20px;
          background: linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
          border: 1px solid rgba(236, 72, 153, 0.3) !important;
          color: var(--accent-pink) !important;
        }

        .active-workout-btn.active {
          background: var(--gradient-primary) !important;
          color: #fff !important;
          box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3) !important;
        }

        .active-workout-btn.active .nav-icon {
          color: #fff !important;
          filter: none !important;
        }

        .pulse-border {
          animation: pulseBorder 2s infinite;
        }

        @keyframes pulseBorder {
          0% { border-color: rgba(236, 72, 153, 0.3); }
          50% { border-color: rgba(236, 72, 153, 0.8); }
          100% { border-color: rgba(236, 72, 153, 0.3); }
        }

        .spinning-icon {
          animation: spinDumbbell 3s linear infinite;
        }

        @keyframes spinDumbbell {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(180deg); }
          100% { transform: rotate(360deg); }
        }

        .sidebar-footer {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-top: 20px;
          border-top: 1px solid var(--border-light);
          cursor: pointer;
          transition: all var(--transition-fast);
          padding: 8px;
          border-radius: var(--radius-md);
          border: 1px solid transparent;
        }

        .sidebar-footer:hover {
          background: rgba(255, 255, 255, 0.04);
        }

        .sidebar-footer.active-profile {
          color: #fff;
          background: var(--bg-accent-translucent);
          border-color: rgba(139, 92, 246, 0.2);
          box-shadow: inset 0 0 12px rgba(139, 92, 246, 0.05);
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          background: var(--gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #fff;
          font-family: var(--font-headings);
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .username {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .user-rank {
          font-size: 11px;
          color: var(--accent-cyan);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        @media (max-width: 768px) {
          .sidebar-container {
            width: 100%;
            height: calc(70px + env(safe-area-inset-bottom, 0px));
            position: fixed;
            bottom: 0;
            top: auto;
            flex-direction: row;
            justify-content: space-between;
            padding: 10px 15px calc(10px + env(safe-area-inset-bottom, 0px)) 15px;
            border-right: none;
            border-top: 1px solid var(--border-light);
            background: rgba(9, 10, 15, 0.95);
            backdrop-filter: blur(20px);
            z-index: 100;
          }

          .sidebar-logo, .sidebar-footer, .nav-label {
            display: none;
          }

          .sidebar-nav {
            flex-direction: row;
            justify-content: space-around;
            width: 100%;
            gap: 5px;
          }

          .nav-item {
            padding: 10px;
            justify-content: center;
            flex: 1;
            border-radius: var(--radius-sm);
          }
          
          .nav-item:hover {
            transform: none;
          }

          .active-workout-btn {
            margin-top: 0;
          }
        }
      `}</style>
    </aside>
  );
};
