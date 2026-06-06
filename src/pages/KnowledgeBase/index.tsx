import { useState } from 'react';
import { SearchOutlined, FileTextOutlined, DownloadOutlined, BookOutlined } from '@ant-design/icons';
import { Input, Card, Row, Col, Tag, Button, Modal, Tabs, message } from 'antd';
import ReactMarkdown from 'react-markdown';
import { useAppStore } from '../../stores';
import { knowledgeCategories } from '../../mocks/knowledge';
import type { KnowledgeItem } from '../../types';

const { TabPane } = Tabs;

export default function KnowledgeBase() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const { knowledgeBase, devices } = useAppStore();
  
  const filteredKnowledge = knowledgeBase.filter(item => {
    const matchSearch = !searchValue || 
      item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.content.toLowerCase().includes(searchValue.toLowerCase());
    const matchCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchSearch && matchCategory;
  });
  
  const handleViewDetail = (item: KnowledgeItem) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };
  
  const handleDownload = (fileName: string) => {
    message.info(`演示版：${fileName} 下载功能演示`);
  };
  
  const getRelatedDevices = (deviceIds: string[]) => {
    return devices.filter(d => deviceIds.includes(d.id));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>知识库</h2>
        <Input
          placeholder="搜索知识库..."
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>
      
      <Tabs activeKey={activeCategory} onChange={setActiveCategory} style={{ marginBottom: 24 }}>
        <TabPane tab="全部" key="all" />
        {knowledgeCategories.map(cat => (
          <TabPane tab={cat.label} key={cat.value} />
        ))}
      </Tabs>
      
      <Row gutter={16}>
        {filteredKnowledge.map(item => (
          <Col span={8} key={item.id}>
            <Card 
              hoverable 
              style={{ height: '100%' }}
              onClick={() => handleViewDetail(item)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <BookOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                <Tag color={item.category === 'fault' ? 'red' : item.category === 'maintenance' ? 'blue' : 'green'}>
                  {{ fault: '故障码', maintenance: '维修案例', manual: '操作手册' }[item.category]}
                </Tag>
              </div>
              <h3 style={{ marginBottom: 8 }}>{item.title}</h3>
              <p style={{ color: '#666', fontSize: 12, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {item.content.replace(/[#*]/g, '').slice(0, 150)}...
              </p>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#999', fontSize: 12 }}>
                  关联设备: {getRelatedDevices(item.deviceIds).length} 台
                </span>
                <Button icon={<FileTextOutlined />} size="small" onClick={(e) => { e.stopPropagation(); handleViewDetail(item); }}>
                  查看详情
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      
      {filteredKnowledge.length === 0 && (
        <Card>
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            <BookOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <div>暂无匹配的知识库内容</div>
          </div>
        </Card>
      )}
      
      <Modal
        title={selectedItem?.title}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        footer={null}
      >
        {selectedItem && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <Tag color={selectedItem.category === 'fault' ? 'red' : selectedItem.category === 'maintenance' ? 'blue' : 'green'}>
                {{ fault: '故障码', maintenance: '维修案例', manual: '操作手册' }[selectedItem.category]}
              </Tag>
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <ReactMarkdown>{selectedItem.content}</ReactMarkdown>
            </div>
            
            {selectedItem.deviceIds.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h4>关联设备</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {getRelatedDevices(selectedItem.deviceIds).map(device => (
                    <Tag key={device.id}>{device.name}</Tag>
                  ))}
                </div>
              </div>
            )}
            
            {selectedItem.attachments.length > 0 && (
              <div>
                <h4>附件下载</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedItem.attachments.map((file, index) => (
                    <Button 
                      key={index} 
                      icon={<DownloadOutlined />} 
                      onClick={() => handleDownload(file)}
                    >
                      {file}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
