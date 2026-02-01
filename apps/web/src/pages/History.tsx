import { useState, useEffect } from 'react';

const FORMALITY_LABELS: Record<string, string> = {
  casual: '休闲',
  'business-casual': '商务休闲',
  'semi-formal': '半正式',
  formal: '正式',
};

const BUDGET_LABELS: Record<string, string> = {
  any: '不限',
  low: '低',
  medium: '中',
  high: '高',
};

const CATEGORY_LABELS: Record<string, string> = {
  top: '上装',
  bottom: '下装',
  shoes: '鞋履',
  accessory: '配饰',
  outerwear: '外套',
};

const formatFormalityLabel = (value?: string) => {
  if (!value) return '未指定';
  return FORMALITY_LABELS[value] ?? value;
};

const formatBudgetLabel = (value?: string) => {
  if (!value) return '未指定';
  return BUDGET_LABELS[value] ?? value;
};

const formatCategoryLabel = (value?: string) => {
  if (!value) return '未指定';
  return CATEGORY_LABELS[value] ?? value;
};

interface HistoryRequest {
  id: string;
  occasion: string;
  style: string;
  formality: string;
  comfort: number;
  budget: string;
  constraints: string[];
  createdAt: string;
  outfits: HistoryOutfit[];
  feedbacks: HistoryFeedback[];
}

interface HistoryOutfit {
  id: string;
  score: number;
  rationale: string;
  items: any[];
}

interface HistoryFeedback {
  id: string;
  outfitId: string;
  rating: number;
  comment?: string;
  selected: boolean;
  createdAt: string;
}

function History() {
  const [history, setHistory] = useState<HistoryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        const response = await fetch('/api/recommendations/history');
        if (!response.ok) throw new Error('加载历史记录失败');
        const data = await response.json();
        setHistory(data);
        setLoading(false);
        return;
      } catch (err: any) {
        retries++;
        if (retries >= maxRetries) {
          const isFetchError = typeof err?.message === 'string' && err.message.includes('fetch');
          const hint = isFetchError
            ? '后端 API 可能未在 3001 端口运行。'
            : '请稍后再试。';
          setError(`加载历史记录失败。${hint}`);
          setLoading(false);
        } else {
          // Exponential backoff: wait 500ms, 1s, 2s
          await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retries - 1)));
        }
      }
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <div className="loading">正在加载历史记录...</div>;

  return (
    <div>
      <h1 className="page-title">推荐历史与反馈</h1>

      {error && <div className="error">{error}</div>}

      {history.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>
            暂无推荐历史，试试「快速搭配」开始吧！
          </p>
        </div>
      ) : (
        <div>
          {history.map((request) => (
            <div key={request.id} className="history-item">
              <div className="history-item-header">
                <div>
                  <h3>{request.occasion}</h3>
                  <p style={{ color: '#555' }}>
                    {request.style} · {formatFormalityLabel(request.formality)} · 预算：{formatBudgetLabel(request.budget)}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>
                    舒适度：{request.comfort}/10
                  </p>
                </div>
                <div className="history-item-date">
                  {formatDate(request.createdAt)}
                </div>
              </div>

              {request.constraints && request.constraints.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>限制条件：</strong>
                  <div className="wardrobe-item-tags" style={{ marginTop: '0.5rem' }}>
                    {request.constraints.map((constraint, i) => (
                      <span key={i} className="tag">
                        {constraint}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                生成的搭配（{request.outfits.length}）
              </h4>

              {request.outfits.map((outfit) => {
                const feedback = request.feedbacks.find(f => f.outfitId === outfit.id);
                
                return (
                  <div key={outfit.id} className="outfit-card" style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div className="outfit-score">评分：{outfit.score}/100</div>
                      {feedback && (
                        <div style={{ textAlign: 'right' }}>
                          {feedback.selected && (
                            <span className="tag" style={{ background: '#2ecc71' }}>
                              已选
                            </span>
                          )}
                          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#7f8c8d' }}>
                            评分：{'★'.repeat(feedback.rating)}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="outfit-items">
                      {outfit.items.map((item) => (
                        <div key={item.id} className="outfit-item">
                          <strong>{item.name}</strong>
                          <div style={{ fontSize: '0.875rem', color: '#555' }}>
                            {formatCategoryLabel(item.category)} · {item.color}
                          </div>
                          <div className="wardrobe-item-tags" style={{ marginTop: '0.5rem' }}>
                            {item.tags.map((tag: string, i: number) => (
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

                    {feedback && feedback.comment && (
                      <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f8f9fa', borderRadius: '4px' }}>
                        <strong>你的反馈：</strong> {feedback.comment}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;
