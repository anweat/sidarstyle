import { useState } from 'react';
import type { RecommendationRequest, RecommendationResponse, Outfit } from '@sidarstyle/shared';

function QuickOutfit() {
  const [formData, setFormData] = useState<RecommendationRequest>({
    occasion: '',
    style: '',
    formality: 'casual',
    comfort: 5,
    budget: 'any',
    constraints: [],
  });
  const [constraintInput, setConstraintInput] = useState('');
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }
      
      const data = await response.json();
      setRecommendations(data);
    } catch (err: any) {
      setError(err.message || 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  const addConstraint = () => {
    if (constraintInput.trim()) {
      setFormData({
        ...formData,
        constraints: [...(formData.constraints || []), constraintInput.trim()],
      });
      setConstraintInput('');
    }
  };

  const removeConstraint = (index: number) => {
    setFormData({
      ...formData,
      constraints: formData.constraints?.filter((_, i) => i !== index) || [],
    });
  };

  const submitFeedback = async (outfitId: string, rating: number, selected: boolean) => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: recommendations?.requestId,
          outfitId,
          rating,
          selected,
          comment: '',
        }),
      });
      alert('Feedback submitted! Check the History page to see all your feedback.');
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  return (
    <div>
      <h1 className="page-title">Quick Outfit Recommendation</h1>
      
      {error && <div className="error">{error}</div>}
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Occasion *</label>
            <input
              type="text"
              value={formData.occasion}
              onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
              placeholder="e.g., Office meeting, Date night, Casual outing"
              required
            />
          </div>

          <div className="form-group">
            <label>Style *</label>
            <input
              type="text"
              value={formData.style}
              onChange={(e) => setFormData({ ...formData, style: e.target.value })}
              placeholder="e.g., Professional, Trendy, Classic"
              required
            />
          </div>

          <div className="form-group">
            <label>Formality Level *</label>
            <select
              value={formData.formality}
              onChange={(e) => setFormData({ ...formData, formality: e.target.value as any })}
              required
            >
              <option value="casual">Casual</option>
              <option value="business-casual">Business Casual</option>
              <option value="semi-formal">Semi-Formal</option>
              <option value="formal">Formal</option>
            </select>
          </div>

          <div className="form-group">
            <label>Comfort Level (1-10) *</label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.comfort}
              onChange={(e) => setFormData({ ...formData, comfort: parseInt(e.target.value) })}
            />
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>{formData.comfort}/10</div>
          </div>

          <div className="form-group">
            <label>Budget *</label>
            <select
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value as any })}
              required
            >
              <option value="any">Any</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-group">
            <label>Constraints (Optional)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={constraintInput}
                onChange={(e) => setConstraintInput(e.target.value)}
                placeholder="e.g., No red colors, Must include jacket"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addConstraint())}
              />
              <button type="button" className="button button-secondary" onClick={addConstraint}>
                Add
              </button>
            </div>
            {formData.constraints && formData.constraints.length > 0 && (
              <div className="wardrobe-item-tags" style={{ marginTop: '1rem' }}>
                {formData.constraints.map((constraint, index) => (
                  <span key={index} className="tag" style={{ cursor: 'pointer' }} onClick={() => removeConstraint(index)}>
                    {constraint} ✕
                  </span>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Getting Recommendations...' : 'Get Recommendations'}
          </button>
        </form>
      </div>

      {recommendations && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Recommended Outfits</h2>
          {recommendations.outfits.map((outfit: Outfit) => (
            <div key={outfit.id} className="outfit-card">
              <div className="outfit-score">Score: {outfit.score}/100</div>
              <div className="outfit-items">
                {outfit.items.map((item) => (
                  <div key={item.id} className="outfit-item">
                    <strong>{item.name}</strong>
                    <div style={{ fontSize: '0.875rem', color: '#555' }}>
                      {item.category} • {item.color}
                    </div>
                    <div className="wardrobe-item-tags" style={{ marginTop: '0.5rem' }}>
                      {item.tags.map((tag, i) => (
                        <span key={i} className="tag" style={{ fontSize: '0.75rem' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="outfit-rationale">
                <strong>Why this works:</strong> {outfit.rationale}
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <button className="button" onClick={() => submitFeedback(outfit.id, 5, true)}>
                  ⭐ Select This Outfit
                </button>
                <button className="button button-secondary" onClick={() => submitFeedback(outfit.id, 3, false)}>
                  Maybe Later
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuickOutfit;
