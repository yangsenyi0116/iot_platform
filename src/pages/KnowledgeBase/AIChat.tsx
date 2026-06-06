import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Avatar, Tag, Spin } from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined, FileTextOutlined, LeftCircleOutlined } from '@ant-design/icons';
import { getAIResponse } from '../../mocks/aiResponses';
import type { AIResponse } from '../../types';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  response?: AIResponse;
  timestamp: string;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '您好！我是智能知识助手。请问有什么可以帮助您的？',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim() || loading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    setTimeout(() => {
      const aiResponse = getAIResponse(inputValue);
      const aiMessage: Message = {
        id: `msg-${Date.now()}`,
        type: 'ai',
        content: aiResponse.answer,
        response: aiResponse,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, aiMessage]);
      setLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleGenerateWorkOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert('工单生成功能已触发！（Mock）');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((message) => (
          <div key={message.id} style={{ display: 'flex', gap: 12 }}>
            <Avatar
              icon={message.type === 'user' ? <UserOutlined /> : <RobotOutlined />}
              style={{
                backgroundColor: message.type === 'user' ? '#1890ff' : '#52c41a',
                flexShrink: 0
              }}
            />
            <div style={{ flex: 1, maxWidth: '70%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 500 }}>
                  {message.type === 'user' ? '我' : 'AI助手'}
                </span>
                <span style={{ fontSize: 12, color: '#999' }}>{message.timestamp}</span>
              </div>
              <div
                style={{
                  padding: 12,
                  borderRadius: 8,
                  background: message.type === 'user' ? '#1890ff' : '#f5f5f5',
                  color: message.type === 'user' ? '#fff' : '#333',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {message.content}
              </div>

              {message.response && (
                <div style={{ marginTop: 12, paddingLeft: 8, borderLeft: '3px solid #1890ff' }}>
                  {message.response.relatedCases.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4, color: '#666' }}>
                        <LeftCircleOutlined /> 相关案例：
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {message.response.relatedCases.map((caseItem: string, index: number) => (
                          <Tag key={index} color="orange">{caseItem}</Tag>
                        ))}
                      </div>
                    </div>
                  )}

                  {message.response.relatedDocuments.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4, color: '#666' }}>
                        <FileTextOutlined /> 参考文档：
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {message.response.relatedDocuments.map((doc: string, index: number) => (
                          <Tag key={index} color="cyan">{doc}</Tag>
                        ))}
                      </div>
                    </div>
                  )}

                  {message.response.suggestedWorkOrder && (
                    <Button
                      type="primary"
                      size="small"
                      onClick={handleGenerateWorkOrder}
                      style={{ marginTop: 8 }}
                    >
                      {message.response.suggestedWorkOrder}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: 16, borderTop: '1px solid #e8e8e8', background: '#fff', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <Input.TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="请输入问题，例如：空压机温度过高怎么办？"
            rows={2}
            disabled={loading}
            style={{ resize: 'none' }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            disabled={loading || !inputValue.trim()}
            loading={loading}
          >
            {loading ? <Spin size="small" /> : '发送'}
          </Button>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
          提示：您可以询问关于设备故障、维护周期、报警代码等问题
        </div>
      </div>
    </div>
  );
};

export default AIChat;