import { useEffect, useMemo, useState } from 'react';
import type { CreateWardrobeItem, WardrobeItem } from '@sidarstyle/shared';
import {
  WARDROBE_CATEGORIES,
  WARDROBE_CONDITIONS,
  WARDROBE_FITS,
  WARDROBE_OCCASIONS,
  WARDROBE_PATTERNS,
  WARDROBE_SEASONS,
  WARDROBE_STYLES,
} from '@sidarstyle/shared';

type GroupByOption =
  | 'none'
  | 'category'
  | 'color'
  | 'season'
  | 'style'
  | 'occasion'
  | 'brand'
  | 'material'
  | 'pattern'
  | 'fit'
  | 'condition';

const LABEL_MAP: Record<string, string> = {
  top: '上装',
  bottom: '下装',
  shoes: '鞋履',
  accessory: '配饰',
  outerwear: '外套',
  spring: '春季',
  summer: '夏季',
  autumn: '秋季',
  winter: '冬季',
  'all-season': '四季',
  casual: '休闲',
  business: '商务',
  formal: '正式',
  sporty: '运动',
  street: '街头',
  vintage: '复古',
  outdoor: '户外',
  daily: '日常',
  work: '工作',
  date: '约会',
  party: '派对',
  travel: '旅行',
  fitness: '健身',
  'formal-event': '正式场合',
  solid: '纯色',
  striped: '条纹',
  plaid: '格纹',
  floral: '花卉',
  graphic: '图案',
  'polka-dot': '波点',
  other: '其他',
  slim: '修身',
  regular: '常规',
  loose: '宽松',
  oversized: '超宽松',
  new: '全新',
  good: '良好',
  worn: '磨损',
};

const UNSPECIFIED_LABEL = '未指定';
const ALL_LABEL = '全部';

const GROUP_BY_OPTIONS: { value: GroupByOption; label: string }[] = [
  { value: 'none', label: '不分组' },
  { value: 'category', label: '类别' },
  { value: 'season', label: '季节' },
  { value: 'style', label: '风格' },
  { value: 'occasion', label: '场合' },
  { value: 'color', label: '颜色' },
  { value: 'brand', label: '品牌' },
  { value: 'material', label: '材质' },
  { value: 'pattern', label: '图案' },
  { value: 'fit', label: '版型' },
  { value: 'condition', label: '状态' },
];

const formatLabel = (value?: string) => {
  if (!value) return UNSPECIFIED_LABEL;
  return LABEL_MAP[value] ?? value;
};

const formatList = (values: string[] | undefined) => {
  if (!values || values.length === 0) return UNSPECIFIED_LABEL;
  return values.map((value) => formatLabel(value)).join(', ');
};

const formatPrice = (price?: number) => {
  if (price === undefined || price === null) return UNSPECIFIED_LABEL;
  return `$${price.toFixed(2)}`;
};

const formatPurchaseDate = (value?: string) => {
  if (!value) return UNSPECIFIED_LABEL;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const createEmptyFormData = (): CreateWardrobeItem => ({
  name: '',
  category: 'top',
  subcategory: '',
  color: '',
  brand: '',
  size: '',
  material: '',
  pattern: undefined,
  fit: undefined,
  season: [],
  style: [],
  occasion: [],
  condition: undefined,
  warmth: undefined,
  waterproof: false,
  price: undefined,
  purchaseDate: '',
  notes: '',
  tags: [],
  imageUrl: '',
});

function Wardrobe() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<WardrobeItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
  const [formData, setFormData] = useState<CreateWardrobeItem>(createEmptyFormData());
  const [tagInput, setTagInput] = useState('');
  const [groupBy, setGroupBy] = useState<GroupByOption>('none');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        const response = await fetch('/api/wardrobe/items');
        if (!response.ok) throw new Error('加载衣橱失败');
        const data = await response.json();
        setItems(data);
        setLoading(false);
        return;
      } catch (err: any) {
        retries++;
        if (retries >= maxRetries) {
          const isFetchError = typeof err?.message === 'string' && err.message.includes('fetch');
          const hint = isFetchError ? '后端 API 可能未在 3001 端口运行。' : '请稍后再试。';
          setError(`加载衣橱失败。${hint}`);
          setLoading(false);
        } else {
          // Exponential backoff: wait 500ms, 1s, 2s
          await new Promise((resolve) => setTimeout(resolve, 500 * Math.pow(2, retries - 1)));
        }
      }
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingItem
        ? `/api/wardrobe/items/${editingItem.id}`
        : '/api/wardrobe/items';

      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('保存单品失败');

      await fetchItems();
      closeModal();
    } catch {
      setError('保存单品失败，请稍后再试。');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除该单品吗？')) return;

    try {
      const response = await fetch(`/api/wardrobe/items/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('删除单品失败');

      await fetchItems();
    } catch {
      setError('删除单品失败，请稍后再试。');
    }
  };

  const openModal = (item?: WardrobeItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        subcategory: item.subcategory || '',
        color: item.color,
        brand: item.brand || '',
        size: item.size || '',
        material: item.material || '',
        pattern: item.pattern,
        fit: item.fit,
        season: item.season || [],
        style: item.style || [],
        occasion: item.occasion || [],
        condition: item.condition,
        warmth: item.warmth,
        waterproof: item.waterproof ?? false,
        price: item.price,
        purchaseDate: item.purchaseDate || '',
        notes: item.notes || '',
        tags: item.tags || [],
        imageUrl: item.imageUrl || '',
      });
    } else {
      setEditingItem(null);
      setFormData(createEmptyFormData());
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData(createEmptyFormData());
    setTagInput('');
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const toggleMultiValue = (field: 'season' | 'style' | 'occasion', value: string) => {
    setFormData((prev) => {
      switch (field) {
        case 'season': {
          const typedValue = value as CreateWardrobeItem['season'][number];
          const exists = prev.season.includes(typedValue);
          const nextValues = exists
            ? prev.season.filter((item) => item !== typedValue)
            : [...prev.season, typedValue];
          return { ...prev, season: nextValues };
        }
        case 'style': {
          const typedValue = value as CreateWardrobeItem['style'][number];
          const exists = prev.style.includes(typedValue);
          const nextValues = exists
            ? prev.style.filter((item) => item !== typedValue)
            : [...prev.style, typedValue];
          return { ...prev, style: nextValues };
        }
        case 'occasion': {
          const typedValue = value as CreateWardrobeItem['occasion'][number];
          const exists = prev.occasion.includes(typedValue);
          const nextValues = exists
            ? prev.occasion.filter((item) => item !== typedValue)
            : [...prev.occasion, typedValue];
          return { ...prev, occasion: nextValues };
        }
        default:
          return prev;
      }
    });
  };

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) => {
      const haystack = [
        item.name,
        item.subcategory,
        item.brand,
        item.color,
        item.material,
        item.pattern,
        item.fit,
        item.category,
        ...(item.tags || []),
        ...(item.style || []),
        ...(item.season || []),
        ...(item.occasion || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [items, searchQuery]);

  const groupedItems = useMemo(() => {
    if (groupBy === 'none') {
      return { [ALL_LABEL]: filteredItems };
    }

    const groups: Record<string, WardrobeItem[]> = {};

    const getGroupKeys = (item: WardrobeItem): string[] => {
      switch (groupBy) {
        case 'category':
          return [item.category];
        case 'color':
          return [item.color || UNSPECIFIED_LABEL];
        case 'season':
          return item.season && item.season.length > 0 ? item.season : [UNSPECIFIED_LABEL];
        case 'style':
          return item.style && item.style.length > 0 ? item.style : [UNSPECIFIED_LABEL];
        case 'occasion':
          return item.occasion && item.occasion.length > 0 ? item.occasion : [UNSPECIFIED_LABEL];
        case 'brand':
          return [item.brand || UNSPECIFIED_LABEL];
        case 'material':
          return [item.material || UNSPECIFIED_LABEL];
        case 'pattern':
          return [item.pattern || UNSPECIFIED_LABEL];
        case 'fit':
          return [item.fit || UNSPECIFIED_LABEL];
        case 'condition':
          return [item.condition || UNSPECIFIED_LABEL];
        default:
          return [ALL_LABEL];
      }
    };

    filteredItems.forEach((item) => {
      const keys = getGroupKeys(item);
      keys.forEach((key) => {
        const label = formatLabel(key);
        if (!groups[label]) {
          groups[label] = [];
        }
        groups[label].push(item);
      });
    });

    return groups;
  }, [filteredItems, groupBy]);

  const groupedEntries = useMemo(() => {
    const entries = Object.entries(groupedItems);
    if (groupBy === 'none') return entries;

    return entries.sort(([a], [b]) => {
      if (a === UNSPECIFIED_LABEL) return 1;
      if (b === UNSPECIFIED_LABEL) return -1;
      return a.localeCompare(b);
    });
  }, [groupedItems, groupBy]);

  if (loading) return <div className="loading">正在加载衣橱...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">我的衣橱</h1>
        <button className="button" onClick={() => openModal()}>
          + 添加新单品
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="wardrobe-toolbar">
        <div className="wardrobe-toolbar-group">
          <label htmlFor="wardrobe-search">搜索</label>
          <input
            id="wardrobe-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="按名称、品牌、标签或属性搜索"
          />
        </div>
        <div className="wardrobe-toolbar-group">
          <label htmlFor="wardrobe-group">分组方式</label>
          <select
            id="wardrobe-group"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupByOption)}
          >
            {GROUP_BY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>
            你的衣橱还是空的。添加一些单品开始吧！
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>
            没有符合当前搜索的单品。
          </p>
        </div>
      ) : (
        groupedEntries.map(([groupLabel, groupItems]) => (
          <div key={groupLabel} className="wardrobe-group">
            {groupBy !== 'none' && (
              <div className="wardrobe-group-header">
                <h2>{groupLabel}</h2>
                <span className="wardrobe-group-count">{groupItems.length}</span>
              </div>
            )}
            <div className="wardrobe-grid">
              {groupItems.map((item) => (
                <div
                  key={item.id}
                  className="wardrobe-item-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedItem(item)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedItem(item);
                    }
                  }}
                >
                  <div className="wardrobe-item-photo">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={`${item.name} 照片`} loading="lazy" />
                    ) : (
                      <div className="wardrobe-item-photo-placeholder">暂无图片</div>
                    )}
                  </div>
                  <h3>{item.name}</h3>
                  <p className="wardrobe-item-meta">
                    <strong>类别：</strong> {formatLabel(item.category)}
                    {item.subcategory ? ` · ${item.subcategory}` : ''}
                  </p>
                  <p className="wardrobe-item-meta">
                    <strong>颜色：</strong> {item.color}
                    {item.material ? ` · ${item.material}` : ''}
                  </p>
                  {item.style && item.style.length > 0 && (
                    <div className="wardrobe-item-tags">
                      {item.style.slice(0, 3).map((style) => (
                        <span key={style} className="tag tag-muted">
                          {formatLabel(style)}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.tags.length > 0 && (
                    <div className="wardrobe-item-tags">
                      {item.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="item-actions">
                    <button
                      className="button button-secondary"
                      onClick={(event) => {
                        event.stopPropagation();
                        openModal(item);
                      }}
                    >
                      编辑
                    </button>
                    <button
                      className="button button-danger"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDelete(item.id);
                      }}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {showModal && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? '编辑单品' : '添加新单品'}</h2>
              <button className="modal-close" onClick={closeModal} aria-label="关闭">
                X
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>名称 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>类别 *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    required
                  >
                    {WARDROBE_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {formatLabel(category)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>子类</label>
                  <input
                    type="text"
                    value={formData.subcategory || ''}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    placeholder="例如：T恤、牛仔裤"
                  />
                </div>

                <div className="form-group">
                  <label>颜色 *</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>品牌</label>
                  <input
                    type="text"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>尺码</label>
                  <input
                    type="text"
                    value={formData.size || ''}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder="例如：M、32、42"
                  />
                </div>

                <div className="form-group">
                  <label>材质</label>
                  <input
                    type="text"
                    value={formData.material || ''}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    placeholder="例如：棉、羊毛"
                  />
                </div>

                <div className="form-group">
                  <label>图案</label>
                  <select
                    value={formData.pattern || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pattern: (e.target.value || undefined) as any,
                      })
                    }
                  >
                    <option value="">未设置</option>
                    {WARDROBE_PATTERNS.map((pattern) => (
                      <option key={pattern} value={pattern}>
                        {formatLabel(pattern)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>版型</label>
                  <select
                    value={formData.fit || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fit: (e.target.value || undefined) as any,
                      })
                    }
                  >
                    <option value="">未设置</option>
                    {WARDROBE_FITS.map((fit) => (
                      <option key={fit} value={fit}>
                        {formatLabel(fit)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>状态</label>
                  <select
                    value={formData.condition || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        condition: (e.target.value || undefined) as any,
                      })
                    }
                  >
                    <option value="">未设置</option>
                    {WARDROBE_CONDITIONS.map((condition) => (
                      <option key={condition} value={condition}>
                        {formatLabel(condition)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>保暖程度 (1-5)</label>
                  <select
                    value={formData.warmth ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        warmth: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  >
                    <option value="">未设置</option>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>防水</label>
                  <label className="checkbox-inline">
                    <input
                      type="checkbox"
                      checked={formData.waterproof || false}
                      onChange={(e) => setFormData({ ...formData, waterproof: e.target.checked })}
                    />
                    是
                  </label>
                </div>

                <div className="form-group">
                  <label>价格</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>购买日期</label>
                  <input
                    type="date"
                    value={formData.purchaseDate || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        purchaseDate: e.target.value || '',
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>图片链接</label>
                  <input
                    type="url"
                    value={formData.imageUrl || ''}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>季节</label>
                <div className="checkbox-group">
                  {WARDROBE_SEASONS.map((season) => (
                    <label key={season} className="checkbox-chip">
                      <input
                        type="checkbox"
                        checked={formData.season.includes(season)}
                        onChange={() => toggleMultiValue('season', season)}
                      />
                      {formatLabel(season)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>风格</label>
                <div className="checkbox-group">
                  {WARDROBE_STYLES.map((style) => (
                    <label key={style} className="checkbox-chip">
                      <input
                        type="checkbox"
                        checked={formData.style.includes(style)}
                        onChange={() => toggleMultiValue('style', style)}
                      />
                      {formatLabel(style)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>场合</label>
                <div className="checkbox-group">
                  {WARDROBE_OCCASIONS.map((occasion) => (
                    <label key={occasion} className="checkbox-chip">
                      <input
                        type="checkbox"
                        checked={formData.occasion.includes(occasion)}
                        onChange={() => toggleMultiValue('occasion', occasion)}
                      />
                      {formatLabel(occasion)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>备注</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="保养提示、搭配笔记或其他说明"
                />
              </div>

              <div className="form-group">
                <label>标签</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="例如：休闲、舒适"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button type="button" className="button button-secondary" onClick={addTag}>
                    添加
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="wardrobe-item-tags" style={{ marginTop: '1rem' }}>
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="tag"
                        style={{ cursor: 'pointer' }}
                        onClick={() => removeTag(tag)}
                      >
                        {tag} ×
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="button">
                  {editingItem ? '更新' : '创建'}
                </button>
                <button type="button" className="button button-secondary" onClick={closeModal}>
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedItem && (
        <div className="modal" onClick={() => setSelectedItem(null)}>
          <div
            className="modal-content wardrobe-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{selectedItem.name}</h2>
              <button
                className="modal-close"
                onClick={() => setSelectedItem(null)}
                aria-label="关闭"
              >
                X
              </button>
            </div>
            <div className="wardrobe-detail">
              <div className="wardrobe-detail-media">
                {selectedItem.imageUrl ? (
                  <img src={selectedItem.imageUrl} alt={`${selectedItem.name} 照片`} loading="lazy" />
                ) : (
                  <div className="wardrobe-item-photo-placeholder">暂无图片</div>
                )}
              </div>
              <div className="wardrobe-detail-grid">
                <div className="detail-item">
                  <span className="detail-label">类别</span>
                  <span className="detail-value">
                    {formatLabel(selectedItem.category)}
                    {selectedItem.subcategory ? ` · ${selectedItem.subcategory}` : ''}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">颜色</span>
                  <span className="detail-value">{selectedItem.color}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">品牌</span>
                  <span className="detail-value">{selectedItem.brand || UNSPECIFIED_LABEL}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">尺码</span>
                  <span className="detail-value">{selectedItem.size || UNSPECIFIED_LABEL}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">材质</span>
                  <span className="detail-value">{selectedItem.material || UNSPECIFIED_LABEL}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">图案</span>
                  <span className="detail-value">
                    {selectedItem.pattern ? formatLabel(selectedItem.pattern) : UNSPECIFIED_LABEL}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">版型</span>
                  <span className="detail-value">
                    {selectedItem.fit ? formatLabel(selectedItem.fit) : UNSPECIFIED_LABEL}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">状态</span>
                  <span className="detail-value">
                    {selectedItem.condition ? formatLabel(selectedItem.condition) : UNSPECIFIED_LABEL}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">季节</span>
                  <span className="detail-value">{formatList(selectedItem.season)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">风格</span>
                  <span className="detail-value">{formatList(selectedItem.style)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">场合</span>
                  <span className="detail-value">{formatList(selectedItem.occasion)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">保暖程度</span>
                  <span className="detail-value">
                    {selectedItem.warmth ? `${selectedItem.warmth}/5` : UNSPECIFIED_LABEL}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">防水</span>
                  <span className="detail-value">{selectedItem.waterproof ? '是' : '否'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">价格</span>
                  <span className="detail-value">{formatPrice(selectedItem.price)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">购买日期</span>
                  <span className="detail-value">{formatPurchaseDate(selectedItem.purchaseDate)}</span>
                </div>
                <div className="detail-item detail-item-full">
                  <span className="detail-label">备注</span>
                  <span className="detail-value">{selectedItem.notes || UNSPECIFIED_LABEL}</span>
                </div>
                <div className="detail-item detail-item-full">
                  <span className="detail-label">标签</span>
                  <span className="detail-value">
                    {selectedItem.tags.length > 0 ? selectedItem.tags.join(', ') : UNSPECIFIED_LABEL}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Wardrobe;

