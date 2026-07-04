import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface LoginScreenProps {
  onGoogleSignIn: () => void;
  onGuestContinue: () => void;
  isLoading: boolean;
  isWaitingForBrowser?: boolean;
  onCancelWaiting?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ 
  onGoogleSignIn, 
  onGuestContinue, 
  isLoading,
  isWaitingForBrowser = false,
  onCancelWaiting
}) => {
  return (
    <div className="login-screen-container">
      <div className="login-card glass-panel anim-slide-up">
        <div className="login-logo-section">
          <div className="logo-glow-wrapper">
            <Sparkles className="login-logo-icon" size={48} />
          </div>
          <h1 className="login-title gradient-text">AuraFit</h1>
          <p className="login-tagline">Sınırlarını Aş, Potansiyelini Keşfet</p>
        </div>

        <div className="login-intro-text">
          <p>
            Kişiselleştirilmiş antrenman programları oluşturun, gelişim istatistiklerinizi takip edin ve tüm verilerinizi bulutta güvenle saklayın.
          </p>
        </div>

        <div className="login-actions">
          <button 
            onClick={onGoogleSignIn} 
            className="btn btn-primary login-btn"
            disabled={isLoading}
            style={{ width: '100%', padding: '14px 20px', fontSize: '15px' }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '4px' }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#ffffff"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#ffffff" fillOpacity="0.85"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#ffffff" fillOpacity="0.75"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.54l3.66 2.83c.87-2.6 3.3-4.53 6.16-4.53z" fill="#ffffff" fillOpacity="0.95"/>
            </svg>
            Google ile Giriş Yap
          </button>

          <button 
            onClick={onGuestContinue} 
            className="btn btn-secondary login-btn"
            style={{ width: '100%', padding: '14px 20px', fontSize: '14px' }}
          >
            Misafir Olarak Devam Et
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="login-footer">
          <p>⚡ Çevrimdışı desteği aktiftir. İnternetiniz olmasa bile antrenman yapmaya devam edebilirsiniz.</p>
        </div>
      </div>

      {isWaitingForBrowser && (
        <div className="waiting-browser-overlay">
          <div className="waiting-browser-card glass-panel anim-scale-up">
            <div className="browser-icon-wrapper">
              <Sparkles className="browser-pulsing-icon" size={36} />
            </div>
            <h2>AuraFit Tarayıcıda Açıldı</h2>
            <p>
              Giriş işlemi için tarayıcınızda yeni bir sekme açıldı. 
              Giriş yaptıktan sonra AuraFit'i tarayıcınız üzerinden kullanmaya devam edebilirsiniz. 
              Bu masaüstü uygulamasını kapatabilirsiniz.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={onCancelWaiting} 
                className="btn btn-secondary cancel-waiting-btn"
                style={{ width: '100%' }}
              >
                Geri Dön
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .login-screen-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          width: 100vw;
          background: radial-gradient(circle at center, rgba(139, 92, 246, 0.15) 0%, #090a0f 70%);
          padding: 20px;
          overflow: hidden;
          position: relative;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          padding: 40px 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 28px;
          border-radius: var(--radius-lg);
          background: rgba(13, 15, 23, 0.7);
          border: 1px solid var(--border-medium);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), var(--shadow-glow);
        }

        .login-logo-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .logo-glow-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(139, 92, 246, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(139, 92, 246, 0.2);
          margin-bottom: 8px;
          animation: logoPulse 2.5s infinite ease-in-out;
        }

        .login-logo-icon {
          color: var(--accent-violet);
          filter: drop-shadow(0 0 10px var(--accent-violet-glow));
        }

        .login-title {
          font-size: 36px;
          font-weight: 900;
          letter-spacing: -0.04em;
        }

        .login-tagline {
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .login-intro-text {
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-secondary);
          padding: 0 10px;
        }

        .login-actions {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .login-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all var(--transition-fast);
        }

        .login-footer {
          font-size: 11px;
          color: var(--text-muted);
          line-height: 1.5;
          border-top: 1px solid var(--border-light);
          padding-top: 20px;
          width: 100%;
        }

        .waiting-browser-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(9, 10, 15, 0.95);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .waiting-browser-card {
          width: 100%;
          max-width: 380px;
          padding: 40px 30px;
          border-radius: var(--radius-lg);
          background: rgba(13, 15, 23, 0.9);
          border: 1px solid var(--border-medium);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), var(--shadow-glow);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 20px;
        }

        .browser-icon-wrapper {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: rgba(139, 92, 246, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(139, 92, 246, 0.3);
          margin-bottom: 8px;
        }

        .browser-pulsing-icon {
          color: var(--accent-pink);
          filter: drop-shadow(0 0 10px var(--accent-pink));
          animation: pulseIcon 2.5s infinite ease-in-out;
        }

        .pulse-loader {
          width: 48px;
          height: 48px;
          border: 3px solid rgba(139, 92, 246, 0.1);
          border-radius: 50%;
          border-top-color: var(--accent-violet);
          animation: spin 1s ease-in-out infinite;
          margin: 10px 0;
        }

        .cancel-waiting-btn {
          margin-top: 10px;
          width: 100%;
          padding: 12px 20px;
        }

        @keyframes logoPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.2); }
          50% { transform: scale(1.05); box-shadow: 0 0 20px 5px rgba(139, 92, 246, 0.1); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.2); }
        }

        @keyframes pulseIcon {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); filter: drop-shadow(0 0 15px var(--accent-pink)); }
          100% { transform: scale(1); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 30px 20px;
            gap: 24px;
          }
          .login-title {
            font-size: 32px;
          }
        }
      `}</style>
    </div>
  );
};
