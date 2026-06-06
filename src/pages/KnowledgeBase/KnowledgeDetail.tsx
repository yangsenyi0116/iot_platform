import React, { useState } from 'react';
import { Modal, Tag, Button, Rate, Input, List, Divider } from 'antd';
import { FileTextOutlined, StarOutlined, MessageOutlined, LeftCircleOutlined, GithubOutlined } from '@ant-design/icons';
import type { KnowledgeItemExt, Annotation } from '../../types';

interface KnowledgeDetailProps {
  knowledge: KnowledgeItemExt;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<KnowledgeItemExt>) => void;
  onRate: (id: string, rating: number) => void;
}

const categoryMap: Record<string, string> = {
  fault: '故障处理',
  maintenance: '维护保养',
  manual: '技术手册'
};

const categoryColors: Record<string, string> = {
  fault: 'red',
  maintenance: 'green',
  manual: 'blue'
};

const KnowledgeDetail: React.FC<KnowledgeDetailProps> = ({ knowledge, onClose, onUpdate, onRate }) => {
  const [rating, setRating] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [correctionText, setCorrectionText] = useState('');
  const [showCorrection, setShowCorrection] = useState(false);

  const handleSubmitRating = () => {
    if (rating > 0) {
      onRate(knowledge.id, rating);
      setRating(0);
    }
  };

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;

    const newAnnotation: Annotation = {
      id: `anno-${Date.now()}`,
      knowledgeId: knowledge.id,
      type: 'comment',
      content: commentText,
      author: '当前用户',
      createdAt: new Date().toLocaleString()
    };

    onUpdate(knowledge.id, {
      annotations: [...knowledge.annotations, newAnnotation]
    });
    setCommentText('');
  };

  const handleSubmitCorrection = () => {
    if (!correctionText.trim()) return;

    const newAnnotation: Annotation = {
      id: `anno-${Date.now()}`,
      knowledgeId: knowledge.id,
      type: 'correction',
      content: correctionText,
      author: '当前用户',
      createdAt: new Date().toLocaleString()
    };

    onUpdate(knowledge.id, {
      annotations: [...knowledge.annotations, newAnnotation]
    });
    setCorrectionText('');
    setShowCorrection(false);
  };

  const getAnnotationIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageOutlined />;
      case 'rating':
        return <StarOutlined />;
      case 'correction':
        return <LeftCircleOutlined />;
      default:
        return <MessageOutlined />;
    }
  };

  const getAnnotationColor = (type: string) => {
    switch (type) {
      case 'comment':
        return 'blue';
      case 'rating':
        return 'gold';
      case 'correction':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Modal
      title={knowledge.title}
      open={true}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <Tag color={categoryColors[knowledge.category]} style={{ fontSize: 14 }}>
            {categoryMap[knowledge.category]}
          </Tag>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Rate disabled defaultValue={knowledge.rating} allowHalf />
            <span style={{ fontSize: 14, color: '#666' }}>
              {knowledge.rating} ({knowledge.ratingCount} 人评分)
            </span>
          </div>
        </div>

        <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <FileTextOutlined /> 内容
        </h4>
        <div style={{ padding: 16, background: '#fafafa', borderRadius: 8, whiteSpace: 'pre-wrap' }}>
          {knowledge.content}
        </div>
      </div>

      <Divider />

      <div style={{ marginBottom: 16 }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <StarOutlined /> 我来评分
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Rate value={rating} onChange={setRating} />
          <Button type="primary" disabled={rating === 0} onClick={handleSubmitRating}>
            提交评分
          </Button>
        </div>
      </div>

      <Divider />

      <div style={{ marginBottom: 16 }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <MessageOutlined /> 发表评论
        </h4>
        <Input.TextArea
          rows={3}
          placeholder="分享您的经验或补充说明..."
          value={commentText}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCommentText(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <Button onClick={() => setShowCorrection(true)} type="default">
            <LeftCircleOutlined /> 提交纠错
          </Button>
          <Button type="primary" disabled={!commentText.trim()} onClick={handleSubmitComment}>
            发表评论
          </Button>
        </div>
      </div>

      {showCorrection && (
        <div style={{ marginBottom: 16, padding: 16, background: '#fff7e6', borderRadius: 8 }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: '#fa8c16' }}>
            <LeftCircleOutlined /> 提交纠错建议
          </h4>
          <Input.TextArea
            rows={3}
            placeholder="请描述您发现的错误或建议的更正内容..."
            value={correctionText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCorrectionText(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <Button onClick={() => setShowCorrection(false)}>取消</Button>
            <Button type="primary" danger disabled={!correctionText.trim()} onClick={handleSubmitCorrection}>
              提交纠错
            </Button>
          </div>
        </div>
      )}

      <Divider />

      <div>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <GithubOutlined /> 用户标注 ({knowledge.annotations.length})
        </h4>
        {knowledge.annotations.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', padding: 24 }}>
            暂无标注，成为第一个发表看法的人吧！
          </div>
        ) : (
          <List
            dataSource={knowledge.annotations}
            renderItem={(annotation) => (
              <div style={{ padding: 12, borderBottom: '1px solid #f0f0f0', display: 'flex', gap: 12 }}>
                <Tag color={getAnnotationColor(annotation.type)}>
                  {getAnnotationIcon(annotation.type)}
                </Tag>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 500 }}>{annotation.author}</span>
                    <span style={{ fontSize: 12, color: '#999' }}>{annotation.createdAt}</span>
                  </div>
                  <p style={{ color: '#666' }}>{annotation.content}</p>
                  {annotation.type === 'rating' && annotation.rating && (
                    <Rate disabled defaultValue={annotation.rating} />
                  )}
                </div>
              </div>
            )}
          />
        )}
      </div>
    </Modal>
  );
};

export default KnowledgeDetail;