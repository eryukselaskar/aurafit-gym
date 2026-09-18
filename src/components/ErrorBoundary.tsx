import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Render sırasında bir hata oluşursa beyaz ekran yerine kurtarma ekranı gösterir.
 *
 * Devam eden antrenman localStorage'da tutulduğu için sayfayı yenilemek veri
 * kaybettirmez; kullanıcıya bunu açıkça söyleyip yenileme seçeneği sunuyoruz.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Beklenmeyen arayüz hatası:', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="error-boundary-screen">
        <div className="glass-panel error-boundary-card">
          <AlertTriangle size={44} className="error-boundary-icon" />
          <h2>Bir şeyler ters gitti</h2>
          <p>
            Uygulama beklenmedik bir hatayla karşılaştı. Devam eden antrenmanınız
            cihazınızda kayıtlı; sayfayı yenilediğinizde kaldığınız yerden devam
            edebilirsiniz.
          </p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Yeniden Yükle
          </button>
          <details className="error-boundary-details">
            <summary>Teknik ayrıntı</summary>
            <pre>{error.message}</pre>
          </details>
        </div>
        <style>{`
          .error-boundary-screen {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 24px;
            background: var(--bg-primary, #0b0b0f);
          }
          .error-boundary-card {
            max-width: 420px;
            padding: 32px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            text-align: center;
          }
          .error-boundary-icon {
            color: var(--accent-amber, #f59e0b);
          }
          .error-boundary-card h2 {
            font-size: 20px;
            font-weight: 800;
          }
          .error-boundary-card p {
            font-size: 14px;
            line-height: 1.6;
            color: var(--text-secondary, #9ca3af);
          }
          .error-boundary-details {
            width: 100%;
            text-align: left;
            font-size: 12px;
            color: var(--text-muted, #6b7280);
          }
          .error-boundary-details pre {
            white-space: pre-wrap;
            word-break: break-word;
            margin-top: 8px;
          }
        `}</style>
      </div>
    );
  }
}
