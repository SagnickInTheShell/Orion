import React, { useState } from 'react';
import { RecommendationItem, FeedbackResponse } from '../../types';
import { api } from '../../services/api';

interface FeedbackModalProps {
  item: RecommendationItem | null;
  onClose: () => void;
  onFeedbackRecorded: (response: FeedbackResponse) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  item,
  onClose,
  onFeedbackRecorded
}) => {
  const [rating, setRating] = useState<number>(4);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<FeedbackResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!item) return null;

  const ratingOptions = [
    { val: 1, label: 'Not helpful', emoji: '👎', color: '#EF7070', bg: '#FEF0F0' },
    { val: 2, label: 'Slightly helpful', emoji: '🤔', color: '#F5C842', bg: '#FEFAE8' },
    { val: 3, label: 'Helpful', emoji: '👍', color: '#5B9BD5', bg: '#EDF4FC' },
    { val: 4, label: 'Very helpful', emoji: '⭐', color: '#4CAF8A', bg: '#E8F5EE' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.recommendation_id) {
      setError('No recommendation ID found. Please try again.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const resp = await api.submitFeedback({
        recommendation_id: item.recommendation_id,
        rating,
        comment: comment || undefined
      });
      setResult(resp);
      onFeedbackRecorded(resp);
    } catch (err: any) {
      setError(err.message || 'Failed to record feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box animate-in">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green-primary)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
              ✨ Rate This Strategy
            </div>
            <div className="modal-title">{item.intervention}</div>
          </div>
          <button
            onClick={onClose}
            style={{ padding: '6px', borderRadius: 8, border: 'none', background: 'var(--bg-main)', cursor: 'pointer', fontSize: 18, lineHeight: 1, color: 'var(--text-muted)', flexShrink: 0, marginTop: -2 }}
          >
            ×
          </button>
        </div>
        <div className="modal-sub">{item.description}</div>

        {result ? (
          /* Success */
          <div>
            <div style={{
              padding: '16px',
              background: '#E8F5EE',
              borderRadius: 12,
              border: '1.5px solid #C3E8D6',
              marginBottom: 16
            }}>
              <div style={{ fontWeight: 700, color: 'var(--green-dark)', marginBottom: 4, fontSize: 14 }}>
                ✅ Personal Model Updated!
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{result.message}</p>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
              marginBottom: 16,
              padding: 14,
              background: 'var(--bg-main)',
              borderRadius: 10,
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Previous</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
                  {Math.round(result.previous_score * 100)}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Updated</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green-dark)' }}>
                  {Math.round(result.updated_score * 100)}%
                </div>
              </div>
            </div>
            <button className="btn-primary" style={{ width: '100%' }} onClick={onClose}>
              Close & View Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: '10px 14px',
                background: '#FEF0F0',
                border: '1.5px solid #F5C4C4',
                borderRadius: 10,
                fontSize: 13,
                color: '#C0392B',
                marginBottom: 14
              }}>
                {error}
              </div>
            )}

            {/* Rating */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
                How helpful was this for you?
              </label>
              <div className="rating-group">
                {ratingOptions.map(opt => (
                  <button
                    type="button"
                    key={opt.val}
                    id={`rating-${opt.val}`}
                    onClick={() => setRating(opt.val)}
                    className={`rating-option${rating === opt.val ? ' selected' : ''}`}
                    style={rating === opt.val ? {
                      borderColor: opt.color,
                      background: opt.bg,
                      color: opt.color
                    } : {}}
                  >
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{opt.emoji}</div>
                    <div style={{ fontSize: 11, fontWeight: 700 }}>{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Add a note (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g. Hallway break helped decompress acoustic overload..."
                style={{ height: 72, resize: 'none' }}
              />
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14, fontStyle: 'italic' }}>
              Formula: new_score = old × 0.8 + rating × 0.2
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                id="submit-feedback-btn"
                className="btn-primary"
                disabled={isSubmitting}
                style={{ opacity: isSubmitting ? 0.6 : 1 }}
              >
                {isSubmitting ? 'Updating...' : 'Submit & Update Model'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
