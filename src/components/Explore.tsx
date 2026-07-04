import React, { useState, useEffect, useCallback } from 'react';
import { Compass, Heart, Download, Share2, Search, X, Check, User, Calendar, Dumbbell, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { PublicProgram, WorkoutProgram, WorkoutSession } from '../types';

interface ExploreProps {
  publicPrograms: PublicProgram[];
  personalPrograms: WorkoutProgram[];
  userId: string | null;
  publishProgram: (program: WorkoutProgram, creatorName: string) => Promise<void>;
  upvoteProgram: (programId: string) => Promise<void>;
  importProgram: (program: PublicProgram) => void;
}

type SortOption = 'popular' | 'newest';

export const Explore: React.FC<ExploreProps> = ({
  publicPrograms,
  personalPrograms,
  userId,
  publishProgram,
  upvoteProgram,
  importProgram
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedProgToShare, setSelectedProgToShare] = useState<WorkoutProgram | null>(null);
  const [creatorName, setCreatorName] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Track which programs the user has already imported in this session to show checkmark
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Reset selected program to share when modal closes
  useEffect(() => {
    if (personalPrograms.length > 0 && !selectedProgToShare) {
      setSelectedProgToShare(personalPrograms[0]);
    }
  }, [personalPrograms, selectedProgToShare]);

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgToShare) return;
    if (!creatorName.trim()) {
      showToast('Lütfen paylaşım için bir kullanıcı adı girin.', 'error');
      return;
    }

    setIsPublishing(true);
    try {
      await publishProgram(selectedProgToShare, creatorName.trim());
      localStorage.setItem('aurafit_creator_name', creatorName.trim());
      setIsShareModalOpen(false);
      showToast('Programınız toplulukla başarıyla paylaşıldı! 🎉', 'success');
    } catch (err) {
      console.error(err);
      showToast('Paylaşım başarısız oldu. Tekrar deneyin.', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Open modal and pre-fill name from cache
  const openShareModal = () => {
    const cachedName = localStorage.getItem('aurafit_creator_name') || '';
    setCreatorName(cachedName);
    setIsShareModalOpen(true);
  };

  const handleImport = (prog: PublicProgram) => {
    importProgram(prog);
    setImportedIds(prev => new Set([...prev, prog.id]));
    showToast(`"${prog.name}" programlar listenize eklendi!`, 'success');
  };

  const handleUpvote = (progId: string) => {
    if (!userId) {
      showToast('Oylama için bulut bağlantısı gerekiyor.', 'error');
      return;
    }
    upvoteProgram(progId);
  };

  // Filter and Sort Programs
  const filteredPrograms = publicPrograms
    .filter(prog => 
      prog.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (prog.description && prog.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      prog.creatorName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return b.upvotes - a.upvotes;
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  return (
    <>
    {/* Toast Notification */}
    {toast && (
      <div className={`explore-toast ${toast.type}`}>
        {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
        <span>{toast.message}</span>
      </div>
    )}
    <div className="explore-container anim-slide-up">
      {/* Header */}
      <header className="explore-header">
        <div>
          <h1 className="explore-title">Topluluk <span className="gradient-text">Keşfet</span></h1>
          <p className="explore-subtitle">Diğer sporcuların antrenman rutinlerini inceleyin, oylayın ve kendi listenize ekleyin.</p>
        </div>
        <button 
          onClick={openShareModal} 
          disabled={personalPrograms.length === 0}
          className="btn btn-primary"
        >
          <Share2 size={18} /> Programını Paylaş
        </button>
      </header>

      {/* Search and Filters */}
      <section className="search-filter-section glass-panel">
        <div className="search-bar-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Program adı, açıklama veya sporcu ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="search-clear-btn">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="sort-filters">
          <button 
            onClick={() => setSortBy('popular')}
            className={`filter-badge ${sortBy === 'popular' ? 'active' : ''}`}
          >
            En Popülerler
          </button>
          <button 
            onClick={() => setSortBy('newest')}
            className={`filter-badge ${sortBy === 'newest' ? 'active' : ''}`}
          >
            En Yeniler
          </button>
        </div>
      </section>

      {/* Public Programs list */}
      <section className="explore-programs-grid">
        {filteredPrograms.length === 0 ? (
          <div className="no-explore-results glass-panel">
            <Compass size={48} className="empty-compass" />
            <h3>Keşfedecek Rutin Bulunamadı</h3>
            <p>Aradığınız kriterlere uygun bir antrenman programı bulunmamaktadır. İlk paylaşımı siz yapın!</p>
          </div>
        ) : (
          filteredPrograms.map((prog) => {
            const hasUpvoted = userId ? (prog.upvotedBy || []).includes(userId) : false;
            const alreadyImported = importedIds.has(prog.id);
            const isExpanded = expandedCard === prog.id;

            const isMultiDay = prog.sessions && prog.sessions.length > 0;
            const totalExercises = isMultiDay
              ? prog.sessions!.reduce((sum, s) => sum + s.exercises.length, 0)
              : prog.exercises.length;
            const totalSets = isMultiDay
              ? prog.sessions!.reduce((sum, s) => sum + s.exercises.reduce((acc, e) => acc + e.sets.length, 0), 0)
              : prog.exercises.reduce((sum, e) => sum + e.sets.length, 0);

            const allItems = isMultiDay ? prog.sessions! : prog.exercises;
            const previewItems = isExpanded ? allItems : allItems.slice(0, 3);
            const hasMore = !isExpanded && allItems.length > 3;

            return (
              <div
                key={prog.id}
                className="explore-program-card glass-panel"
                style={{
                  border: prog.upvotes > 0 ? '1px solid rgba(139, 92, 246, 0.25)' : '1px solid var(--border-light)',
                  boxShadow: prog.upvotes > 0 ? '0 8px 30px rgba(139, 92, 246, 0.08)' : 'var(--shadow-md)'
                }}
              >
                <div className="explore-card-top-row">
                  <div className="creator-details">
                    <User size={14} className="creator-avatar" />
                    <span className="creator-name">{prog.creatorName}</span>
                  </div>
                  <button
                    onClick={() => handleUpvote(prog.id)}
                    className={`btn-upvote ${hasUpvoted ? 'active-voted' : ''}`}
                  >
                    <Heart size={16} fill={hasUpvoted ? 'currentColor' : 'none'} />
                    <span>{prog.upvotes}</span>
                  </button>
                </div>

                <div className="explore-card-info">
                  <h3 className="explore-prog-name">{prog.name}</h3>
                  {prog.description && (
                    <p className="explore-prog-desc">{prog.description}</p>
                  )}

                  <div className="explore-card-stats">
                    {isMultiDay ? (
                      <span className="badge badge-violet" style={{ fontSize: '10px', padding: '3px 8px' }}>
                        {prog.sessions!.length} Günlük Program
                      </span>
                    ) : (
                      <span className="badge badge-violet" style={{ fontSize: '10px', padding: '3px 8px' }}>
                        Tek Seans
                      </span>
                    )}
                    <span className="badge badge-cyan" style={{ fontSize: '10px', padding: '3px 8px' }}>
                      {totalExercises} Egzersiz
                    </span>
                    <span className="badge badge-amber" style={{ fontSize: '10px', padding: '3px 8px' }}>
                      {totalSets} Set
                    </span>
                  </div>
                </div>

                {/* Exercises/Sessions preview panel */}
                <div className="explore-prog-exercises">
                  {isMultiDay ? (
                    (previewItems as WorkoutSession[]).map((sess, idx) => (
                      <div key={idx} className="explore-ex-item" style={{ borderBottom: idx < previewItems.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                        <div className="ex-item-left">
                          <Calendar size={13} className="ex-item-icon-violet" />
                          <span className="ex-item-name">{sess.name}</span>
                        </div>
                        <span className="ex-item-sets-highlight-cyan">{sess.exercises.length} Hareket</span>
                      </div>
                    ))
                  ) : (
                    (previewItems as typeof prog.exercises).map((ex, idx) => (
                      <div key={idx} className="explore-ex-item" style={{ borderBottom: idx < previewItems.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                        <div className="ex-item-left">
                          <Dumbbell size={13} className="ex-item-icon-cyan" />
                          <span className="ex-item-name">{ex.name}</span>
                        </div>
                        <span className="ex-item-sets-highlight-amber">{ex.sets.length} Set</span>
                      </div>
                    ))
                  )}
                  {(hasMore || isExpanded) && allItems.length > 3 && (
                    <button
                      className="btn-expand-card"
                      onClick={() => setExpandedCard(isExpanded ? null : prog.id)}
                    >
                      {isExpanded ? (
                        <><ChevronUp size={13} /> Daha Az Göster</>
                      ) : (
                        <><ChevronDown size={13} /> +{allItems.length - 3} {isMultiDay ? 'GÜN' : 'HAREKET'} DAHA</>
                      )}
                    </button>
                  )}
                </div>

                {/* Import action */}
                <div className="explore-card-footer">
                  <span className="date-badge">
                    {new Date(prog.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                  </span>

                  <button
                    onClick={() => handleImport(prog)}
                    disabled={alreadyImported}
                    className={`btn btn-sm btn-import-routine ${alreadyImported ? 'imported' : 'btn-outline'}`}
                  >
                    {alreadyImported ? (
                      <><Check size={14} /> Eklendi</>
                    ) : (
                      <><Download size={14} /> Kütüphaneme Ekle</>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Share Program Modal */}
      {isShareModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel anim-slide-up share-modal">
            <div className="modal-header">
              <h2 className="modal-title">Programını Toplulukla Paylaş</h2>
              <button onClick={() => setIsShareModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleShareSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Paylaşılacak Program Seçin</label>
                <select
                  value={selectedProgToShare?.id || ''}
                  onChange={(e) => {
                    const found = personalPrograms.find(p => p.id === e.target.value);
                    if (found) setSelectedProgToShare(found);
                  }}
                  className="form-select"
                >
                  {personalPrograms.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Kullanıcı Adınız / Takma Adınız *</label>
                <input
                  type="text"
                  placeholder="Örn: MasterLifter, EfeSpor"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  className="form-input"
                  maxLength={20}
                  required
                />
              </div>

              <div className="modal-footer-actions">
                <button 
                  type="button" 
                  onClick={() => setIsShareModalOpen(false)} 
                  className="btn btn-secondary"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  disabled={isPublishing}
                  className="btn btn-primary"
                >
                  {isPublishing ? 'Paylaşılıyor...' : 'Paylaş'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .explore-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .explore-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .explore-title {
          font-size: 36px;
          font-weight: 800;
          letter-spacing: -0.04em;
          margin-bottom: 6px;
        }

        .explore-subtitle {
          color: var(--text-secondary);
          font-size: 16px;
        }

        /* Sort and Search filters */
        .search-filter-section {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .sort-filters {
          display: flex;
          gap: 8px;
        }

        .explore-programs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
          gap: 24px;
        }

        .explore-program-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-height: 280px;
          height: 100%;
        }

        .explore-program-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: var(--border-medium);
        }

        .explore-card-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .creator-details {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          color: var(--accent-cyan);
        }

        .creator-avatar {
          color: var(--accent-cyan);
        }

        .btn-upvote {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-light);
          padding: 6px 12px;
          border-radius: var(--radius-full);
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          transition: all var(--transition-fast);
        }

        .btn-upvote:hover {
          color: var(--accent-pink);
          border-color: rgba(236, 72, 153, 0.3);
          background: rgba(236, 72, 153, 0.05);
        }

        .btn-upvote.active-voted {
          color: #fff;
          background: var(--gradient-primary);
          border-color: transparent;
          box-shadow: 0 0 10px rgba(236, 72, 153, 0.25);
        }

        .explore-card-info {
          margin-bottom: 12px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .explore-prog-name {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.01em;
          margin-bottom: 8px;
          color: #ffffff;
        }

        .explore-prog-desc {
          font-size: 14px;
          color: #e2e8f0;
          line-height: 1.65;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          margin-bottom: 12px;
        }

        .explore-card-stats {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: auto;
        }

        .explore-prog-exercises {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 16px;
        }

        .explore-ex-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          font-weight: 600;
          padding-bottom: 8px;
        }

        .ex-item-left {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;
        }

        .ex-item-icon-violet {
          color: var(--accent-violet);
          flex-shrink: 0;
        }

        .ex-item-icon-cyan {
          color: var(--accent-cyan);
          flex-shrink: 0;
        }

        .ex-item-name {
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ex-item-sets-highlight-cyan {
          color: var(--accent-cyan);
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .ex-item-sets-highlight-amber {
          color: var(--accent-amber);
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .preview-more {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          text-align: center;
          letter-spacing: 0.05em;
          margin-top: 4px;
        }

        .explore-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .date-badge {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 600;
        }

        .btn-import-routine {
          padding: 8px 12px;
          font-size: 12px;
          gap: 6px;
        }

        .btn-import-routine.imported {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: var(--accent-mint);
          cursor: not-allowed;
        }

        .no-explore-results {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 15px;
          padding: 80px 40px;
          text-align: center;
          color: var(--text-secondary);
        }

        .empty-compass {
          color: var(--border-medium);
        }

        .no-explore-results h3 {
          color: var(--text-primary);
          font-size: 22px;
        }

        .share-modal {
          max-width: 440px;
        }

        .btn-expand-card {
          display: flex;
          align-items: center;
          gap: 5px;
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          cursor: pointer;
          padding: 4px 0;
          text-transform: uppercase;
          transition: color 0.2s;
          margin-top: 4px;
        }

        .btn-expand-card:hover {
          color: var(--accent-violet);
        }

        /* Toast notification */
        .explore-toast {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          border-radius: var(--radius-full);
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          animation: toast-in 0.3s ease;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          backdrop-filter: blur(16px);
          max-width: calc(100vw - 32px);
          white-space: normal;
          text-align: center;
        }

        .explore-toast.success {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
        }

        .explore-toast.error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        @keyframes toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        @media (max-width: 768px) {
          .explore-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          .explore-header .btn {
            width: 100%;
          }
          .explore-programs-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
    </>
  );
};
