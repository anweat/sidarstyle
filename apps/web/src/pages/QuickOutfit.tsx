import { useState } from 'react';
import type { RecommendationRequest, RecommendationResponse, Outfit } from '@sidarstyle/shared';

const CATEGORY_LABELS: Record<string, string> = {
  top: '上装',
  bottom: '下装',
  shoes: '鞋履',
  accessory: '配饰',
  outerwear: '外套',
};

const formatCategoryLabel = (value?: string) => {
  if (!value) return '未指定';
  return CATEGORY_LABELS[value] ?? value;
};

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
        throw new Error('获取推荐失败');
      }
      
      const data = await response.json();
      setRecommendations(data);
    } catch {
      setError('获取推荐失败，请稍后再试。');
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
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        const response = await fetch('/api/feedback', {
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
        
        if (!response.ok) throw new Error('提交反馈失败');
        alert('反馈已提交！可在「历史记录」页面查看全部反馈。');
        return;
      } catch (err) {
        retries++;
        if (retries >= maxRetries) {
          console.error('Failed to submit feedback after retries:', err);
          alert('提交反馈失败，请稍后再试。');
        } else {
          // Exponential backoff: wait 500ms, 1s, 2s
          await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retries - 1)));
        }
      }
    }
  };

  return (
    <div>
      <h1 className="page-title">快速搭配推荐</h1>
      
      {error && <div className="error">{error}</div>}
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>场合 *</label>
            <input
              type="text"
              value={formData.occasion}
              onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
              placeholder="例如：办公室会议、约会、休闲外出"
              required
            />
          </div>

          <div className="form-group">
            <label>风格 *</label>
            <input
              type="text"
              value={formData.style}
              onChange={(e) => setFormData({ ...formData, style: e.target.value })}
              placeholder="例如：职场、潮流、经典"
              required
            />
          </div>

          <div className="form-group">
            <label>正式程度 *</label>
            <select
              value={formData.formality}
              onChange={(e) => setFormData({ ...formData, formality: e.target.value as any })}
              required
            >
              <option value="casual">休闲</option>
              <option value="business-casual">商务休闲</option>
              <option value="semi-formal">半正式</option>
              <option value="formal">正式</option>
            </select>
          </div>

          <div className="form-group">
            <label>舒适度 (1-10) *</label>
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
            <label>预算 *</label>
            <select
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value as any })}
              required
            >
              <option value="any">不限</option>
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>

          <div className="form-group">
            <label>限制条件（可选）</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={constraintInput}
                onChange={(e) => setConstraintInput(e.target.value)}
                placeholder="例如：不含红色、必须包含外套"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addConstraint())}
              />
              <button type="button" className="button button-secondary" onClick={addConstraint}>
                添加
              </button>
            </div>
            {formData.constraints && formData.constraints.length > 0 && (
              <div className="wardrobe-item-tags" style={{ marginTop: '1rem' }}>
                {formData.constraints.map((constraint, index) => (
                  <span key={index} className="tag" style={{ cursor: 'pointer' }} onClick={() => removeConstraint(index)}>
                    {constraint} ×
                  </span>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="button" disabled={loading}>
            {loading ? '正在获取推荐...' : '获取推荐'}
          </button>
        </form>
      </div>

      {recommendations && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>推荐搭配</h2>
          {recommendations.outfits.map((outfit: Outfit) => (
            <div key={outfit.id} className="outfit-card">
              <div className="outfit-score">评分：{outfit.score}/100</div>
              <div className="outfit-items">
                {outfit.items.map((item) => (
                  <div key={item.id} className="outfit-item">
                    <strong>{item.name}</strong>
                    <div style={{ fontSize: '0.875rem', color: '#555' }}>
                      {formatCategoryLabel(item.category)} · {item.color}
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
                <strong>推荐理由：</strong> {outfit.rationale}
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <button className="button" onClick={() => submitFeedback(outfit.id, 5, true)}>
                  选择此搭配
                </button>
                <button className="button button-secondary" onClick={() => submitFeedback(outfit.id, 3, false)}>
                  稍后再说
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
