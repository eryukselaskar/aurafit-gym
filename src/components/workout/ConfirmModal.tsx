import React from 'react';
import { X } from 'lucide-react';

interface Props {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<Props> = ({ message, onConfirm, onCancel }) => (
  <div className="bottom-sheet-backdrop" onClick={onCancel}>
    <div
      className="bottom-sheet-content glass-panel"
      onClick={(e) => e.stopPropagation()}
      style={{ maxWidth: 400, gap: 20 }}
    >
      <div className="bottom-sheet-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <div>
          <h3 style={{ fontSize: 16 }}>Emin misiniz?</h3>
          <p style={{ marginTop: 8, lineHeight: 1.5, color: 'var(--text-secondary)', fontSize: 14 }}>{message}</p>
        </div>
        <button className="btn-close-sheet" onClick={onCancel}><X size={20} /></button>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-secondary" style={{ flex: 1, padding: 14 }} onClick={onCancel}>İptal</button>
        <button
          className="btn btn-danger"
          style={{ flex: 1, padding: 14, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
          onClick={onConfirm}
        >
          Evet, devam et
        </button>
      </div>
    </div>
  </div>
);
