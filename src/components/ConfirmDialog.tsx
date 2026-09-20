import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  /** Yalnızca bilgi veriyorsa true: tek bir "Tamam" düğmesi gösterilir. */
  alertOnly?: boolean;
  /** Onay düğmesini tehlikeli eylem olarak renklendirir. */
  destructive?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Uygulama içi onay/bilgi penceresi.
 *
 * window.confirm ve alert yerine kullanılır: mobil WebView'da bu native
 * diyaloglar tüm JavaScript'i bloke ediyor, uygulamanın görsel diliyle
 * uyuşmuyor ve Electron'da pencerenin arkasında kalabiliyordu.
 *
 * Esc ile kapanır, açılışta onay düğmesine odaklanır ve odağı pencere içinde
 * tutar.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  alertOnly = false,
  destructive = false,
  confirmLabel,
  cancelLabel = 'Vazgeç',
  onConfirm,
  onCancel
}) => {
  const confirmRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    confirmRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
        return;
      }

      if (event.key !== 'Tab') return;

      // Odağı pencere içinde tut.
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button');
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const Icon = destructive ? AlertTriangle : Info;

  return (
    <div className="confirm-backdrop" onClick={onCancel}>
      <div
        ref={dialogRef}
        className="confirm-dialog glass-panel"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        onClick={(e) => e.stopPropagation()}
      >
        <Icon
          size={28}
          className={destructive ? 'confirm-icon destructive' : 'confirm-icon'}
          aria-hidden="true"
        />
        <h2 id="confirm-dialog-title" className="confirm-title">{title}</h2>
        <p id="confirm-dialog-message" className="confirm-message">{message}</p>

        <div className="confirm-actions">
          {!alertOnly && (
            <button className="btn btn-secondary confirm-btn" onClick={onCancel}>
              {cancelLabel}
            </button>
          )}
          <button
            ref={confirmRef}
            className={`btn confirm-btn ${destructive ? 'confirm-btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel ?? (alertOnly ? 'Tamam' : 'Onayla')}
          </button>
        </div>
      </div>
    </div>
  );
};
