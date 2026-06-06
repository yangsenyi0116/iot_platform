import React, { useState } from 'react';
import { Tabs } from 'antd';
import { ForkOutlined, CiOutlined, MessageOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import type { KnowledgeItemExt } from '../../types';
import { knowledgeItems as baseKnowledgeItems } from '../../mocks/knowledge';
import KnowledgeList from './KnowledgeList';
import KnowledgeGraph from './KnowledgeGraph';
import AIChat from './AIChat';

const KnowledgeBasePage: React.FC = () => {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItemExt[]>(
    baseKnowledgeItems.map(item => ({
      ...item,
      annotations: [],
      rating: 0,
      ratingCount: 0
    }))
  );

  const [chatCollapsed, setChatCollapsed] = useState(false);

  const handleUpdateKnowledge = (id: string, updates: Partial<KnowledgeItemExt>) => {
    setKnowledgeItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleNodeClick = () => {
    // Placeholder for node click handling
  };

  return (
    <div style={{ display: 'flex', height: '100%', gap: 16 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Tabs
          defaultActiveKey="graph"
          items={[
            {
              key: 'graph',
              label: (
                <span>
                  <ForkOutlined /> 知识图谱
                </span>
              ),
              children: <KnowledgeGraph onNodeClick={handleNodeClick} />
            },
            {
              key: 'list',
              label: (
                <span>
                  <CiOutlined /> 知识列表
                </span>
              ),
              children: (
                <KnowledgeList
                  knowledgeItems={knowledgeItems}
                  onUpdateKnowledge={handleUpdateKnowledge}
                />
              )
            }
          ]}
        />
      </div>

      <div 
        style={{ 
          width: chatCollapsed ? 48 : 360, 
          flexShrink: 0,
          transition: 'width 0.3s ease',
          position: 'relative'
        }}
      >
        <div 
          style={{ 
            position: 'absolute', 
            left: -16, 
            top: 20, 
            zIndex: 10,
            backgroundColor: '#fff',
            border: '1px solid #f0f0f0',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          onClick={() => setChatCollapsed(!chatCollapsed)}
        >
          {chatCollapsed ? <LeftOutlined /> : <RightOutlined />}
        </div>

        <div style={{ height: '100%', backgroundColor: '#fff', borderRadius: 8, border: '1px solid #f0f0f0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {chatCollapsed ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 16 }}>
              <MessageOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
              <span style={{ fontSize: 12, color: '#666', writingMode: 'vertical-rl' }}>AI对话</span>
            </div>
          ) : (
            <div style={{ padding: 12, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageOutlined style={{ fontSize: 18, color: '#1890ff' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>AI智能助手</span>
            </div>
          )}
          
          {!chatCollapsed && (
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <AIChat />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBasePage;