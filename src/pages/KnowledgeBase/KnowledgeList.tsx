import React, { useState } from 'react';
import { Card, Tag, Input, Select, Rate, Avatar } from 'antd';
import { SearchOutlined, StarOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import type { KnowledgeItemExt } from '../../types';
import KnowledgeDetail from './KnowledgeDetail';

interface KnowledgeListProps {
  knowledgeItems: KnowledgeItemExt[];
  onUpdateKnowledge: (id: string, updates: Partial<KnowledgeItemExt>) => void;
}

const categoryMap: Record<string, string> = {
  fault: '故障处理',
  maintenance: '维护保养',
  manual: '技术手册'
};

const categoryColors: Record<string, string> = {
  fault: '#e53935',
  maintenance: '#26a69a',
  manual: '#00a8ff'
};



const KnowledgeList: React.FC<KnowledgeListProps> = ({ knowledgeItems, onUpdateKnowledge }) => {
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedKnowledge, setSelectedKnowledge] = useState<KnowledgeItemExt | null>(null);

  const filteredItems = knowledgeItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.content.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleRate = (knowledgeId: string, rating: number) => {
    const item = knowledgeItems.find(k => k.id === knowledgeId);
    if (item) {
      const newRating = ((item.rating * item.ratingCount) + rating) / (item.ratingCount + 1);
      onUpdateKnowledge(knowledgeId, {
        rating: Math.round(newRating * 10) / 10,
        ratingCount: item.ratingCount + 1
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fault':
        return <span style={{ color: categoryColors[category], fontSize: 16 }}>⚠</span>;
      case 'maintenance':
        return <span style={{ color: categoryColors[category], fontSize: 16 }}>🔧</span>;
      case 'manual':
        return <span style={{ color: categoryColors[category], fontSize: 16 }}>📖</span>;
      default:
        return <FileTextOutlined style={{ color: '#999' }} />;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <Input
            placeholder="搜索知识标题、内容..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            size="large"
          />
        </div>
        <Select
          placeholder="分类筛选"
          style={{ width: 160 }}
          allowClear
          value={categoryFilter}
          onChange={setCategoryFilter}
          size="large"
        >
          <Select.Option value="fault">故障处理</Select.Option>
          <Select.Option value="maintenance">维护保养</Select.Option>
          <Select.Option value="manual">技术手册</Select.Option>
        </Select>
        <div style={{ fontSize: 14, color: '#666' }}>
          共 <span style={{ color: '#1890ff', fontWeight: 600 }}>{filteredItems.length}</span> 条知识
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
        {filteredItems.map(item => (
          <Card
            key={item.id}
            hoverable
            style={{ 
              borderRadius: 8, 
              border: '1px solid #f0f0f0',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            bodyStyle={{ padding: 16 }}
            onClick={() => setSelectedKnowledge(item)}
          >
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <Avatar 
                size={40} 
                style={{ 
                  backgroundColor: categoryColors[item.category],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {getCategoryIcon(item.category)}
              </Avatar>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 4 }}>
                  {item.title}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Tag 
                    color={categoryColors[item.category]} 
                    style={{ fontSize: 11, borderRadius: 4 }}
                  >
                    {categoryMap[item.category]}
                  </Tag>
                </div>
              </div>
            </div>

            <div style={{ 
              fontSize: 13, 
              color: '#666', 
              lineHeight: 1.5, 
              marginBottom: 12,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {item.content}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Rate disabled defaultValue={item.rating} allowHalf style={{ fontSize: 12 }} />
                  <span style={{ fontSize: 12, color: '#666' }}>{item.rating} ({item.ratingCount})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <StarOutlined style={{ fontSize: 12, color: '#faad14' }} />
                  <span style={{ fontSize: 12, color: '#666' }}>{item.annotations.length}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#1890ff', fontSize: 12 }}>
                <EyeOutlined /> 查看详情
              </div>
            </div>

            {item.deviceIds.length > 0 && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed #f0f0f0' }}>
                <span style={{ fontSize: 11, color: '#999' }}>关联设备：</span>
                <span style={{ fontSize: 12, color: '#666' }}>{item.deviceIds.length} 台设备</span>
              </div>
            )}
          </Card>
        ))}
      </div>

      {selectedKnowledge && (
        <KnowledgeDetail
          knowledge={selectedKnowledge}
          onClose={() => setSelectedKnowledge(null)}
          onUpdate={onUpdateKnowledge}
          onRate={handleRate}
        />
      )}
    </div>
  );
};

export default KnowledgeList;