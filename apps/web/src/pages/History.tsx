import { useState, useEffect } from 'react';

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

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/recommendations/history');
      if (!response.ok) throw new Error('Failed to fetch history');
      const data = await response.json();
      setHistory(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <div className="loading">Loading history...</div>;

  return (
    <div>
      <h1 className="page-title">Recommendation History & Feedback</h1>

      {error && <div className="error">{error}</div>}

      {history.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>
            No recommendation history yet. Try the Quick Outfit feature to get started!
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
                    {request.style} • {request.formality} • Budget: {request.budget}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>
                    Comfort: {request.comfort}/10
                  </p>
                </div>
                <div className="history-item-date">
                  {formatDate(request.createdAt)}
                </div>
              </div>

              {request.constraints && request.constraints.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Constraints:</strong>
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
                Generated Outfits ({request.outfits.length})
              </h4>

              {request.outfits.map((outfit) => {
                const feedback = request.feedbacks.find(f => f.outfitId === outfit.id);
                
                return (
                  <div key={outfit.id} className="outfit-card" style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div className="outfit-score">Score: {outfit.score}/100</div>
                      {feedback && (
                        <div style={{ textAlign: 'right' }}>
                          {feedback.selected && (
                            <span className="tag" style={{ background: '#2ecc71' }}>
                              ✓ Selected
                            </span>
                          )}
                          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#7f8c8d' }}>
                            Rating: {'⭐'.repeat(feedback.rating)}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="outfit-items">
                      {outfit.items.map((item) => (
                        <div key={item.id} className="outfit-item">
                          <strong>{item.name}</strong>
                          <div style={{ fontSize: '0.875rem', color: '#555' }}>
                            {item.category} • {item.color}
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
                      <strong>Rationale:</strong> {outfit.rationale}
                    </div>

                    {feedback && feedback.comment && (
                      <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f8f9fa', borderRadius: '4px' }}>
                        <strong>Your feedback:</strong> {feedback.comment}
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
