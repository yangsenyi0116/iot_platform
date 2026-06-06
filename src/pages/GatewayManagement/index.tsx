import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, DownloadOutlined, UploadOutlined, RestOutlined } from '@ant-design/icons';
import { Button, Modal, Form, Input, Select, Card, Statistic, Row, Col, Tag, Progress, message } from 'antd';
import { useAppStore } from '../../stores';
import StatusBadge from '../../components/Common/StatusBadge';
import type { Gateway } from '../../types';
import { gatewayProtocols } from '../../mocks/gateways';



export default function GatewayManagement() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingGateway, setEditingGateway] = useState<Gateway | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  
  const { gateways, addGateway, updateGateway, deleteGateway } = useAppStore();
  
  const showAddModal = () => {
    setEditingGateway(null);
    form.resetFields();
    setIsModalVisible(true);
  };
  
  const showEditModal = (gateway: Gateway) => {
    setEditingGateway(gateway);
    form.setFieldsValue(gateway);
    setIsModalVisible(true);
  };
  
  const showDetailModal = (gateway: Gateway) => {
    setEditingGateway(gateway);
    setIsDetailModalVisible(true);
  };
  
  const handleOk = () => {
    form.validateFields().then(values => {
      if (editingGateway) {
        updateGateway({ ...editingGateway, ...values });
        message.success('网关信息更新成功');
      } else {
        const newGateway: Gateway = {
          ...values,
          id: `gw-${Date.now()}`,
          status: 'online',
          deviceCount: 0,
          pointCount: 0,
          dataRate: 0,
          cpu: 0,
          memory: 0,
        };
        addGateway(newGateway);
        message.success('网关添加成功');
      }
      setIsModalVisible(false);
    }).catch(() => {
      message.error('表单验证失败');
    });
  };
  
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该网关吗？',
      okText: '删除',
      okType: 'danger',
      onOk: () => {
        deleteGateway(id);
        message.success('删除成功');
      },
    });
  };
  
  const handleTestConnection = () => {
    Modal.info({
      title: '连接测试',
      content: <p>连接成功！网关通信正常。</p>,
    });
  };
  
  const handleExport = () => {
    const dataStr = JSON.stringify(gateways, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gateways.json';
    a.click();
    URL.revokeObjectURL(url);
    message.success('导出成功');
  };
  
  const handleImport = () => {
    Modal.info({
      title: '导入网关',
      content: <p>演示版：点击上传JSON文件即可导入网关配置（前端仅解析，不持久化）</p>,
    });
  };
  
  const onlineCount = gateways.filter(g => g.status === 'online').length;
  const totalPoints = gateways.reduce((sum, g) => sum + g.pointCount, 0);
  const avgCpu = gateways.filter(g => g.status === 'online').reduce((sum, g) => sum + g.cpu, 0) / onlineCount || 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>IoT网关管理</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<RestOutlined />}>刷新</Button>
          <Button icon={<UploadOutlined />} onClick={handleImport}>导入</Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>导出</Button>
          <Button icon={<PlusOutlined />} type="primary" onClick={showAddModal}>新增网关</Button>
        </div>
      </div>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="网关总数" value={gateways.length} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="在线网关" value={onlineCount} suffix={`/${gateways.length}`} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="总采集点数" value={totalPoints} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="平均CPU" value={avgCpu.toFixed(1)} suffix="%" />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {gateways.map(gateway => (
          <Col span={8} key={gateway.id} style={{ marginBottom: 16 }}>
            <Card 
              hoverable
              style={{ 
                height: '100%', 
                cursor: 'pointer',
                borderRadius: 8,
                borderColor: '#e8e8e8',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
              }}
              onClick={() => showDetailModal(gateway)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ fontWeight: 'bold', fontSize: 16, color: '#1f1f1f' }}>{gateway.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: gateway.status === 'online' ? '#52c41a' : '#ff4d4f' }}></span>
                  <span style={{ color: gateway.status === 'online' ? '#52c41a' : '#ff4d4f', fontSize: 12 }}>
                    {gateway.status === 'online' ? '在线' : '离线'}
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#8c8c8c', fontSize: 12 }}>协议类型</span>
                  <Tag color="blue">
                    {gateway.protocol || 'OPC-UA'}
                  </Tag>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#8c8c8c', fontSize: 12 }}>采集点数</span>
                  <span style={{ color: '#1f1f1f', fontSize: 16, fontWeight: 'bold' }}>{gateway.pointCount}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#8c8c8c', fontSize: 12 }}>数据速率</span>
                  <span style={{ color: '#52c41a', fontSize: 16, fontWeight: 'bold' }}>{gateway.dataRate}K/s</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#8c8c8c', fontSize: 12 }}>最后心跳</span>
                  <span style={{ color: '#666', fontSize: 12 }}>2秒前</span>
                </div>
              </div>
              
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#8c8c8c', fontSize: 11 }}>负载</span>
                  <span style={{ color: '#52c41a', fontSize: 11 }}>{gateway.cpu.toFixed(0)}%</span>
                </div>
                <Progress 
                  percent={gateway.cpu} 
                  strokeColor={{
                    '0%': '#1890ff',
                    '100%': '#52c41a'
                  }}
                  size="default"
                  showInfo={false}
                />
              </div>
              
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <Button 
                  icon={<EditOutlined />} 
                  size="small" 
                  onClick={(e) => { e.stopPropagation(); showEditModal(gateway); }}
                >编辑</Button>
                <Button 
                  icon={<EyeOutlined />} 
                  size="small" 
                  onClick={(e) => { e.stopPropagation(); showDetailModal(gateway); }}
                >详情</Button>
                <Button 
                  icon={<DeleteOutlined />} 
                  size="small" 
                  danger 
                  onClick={(e) => { e.stopPropagation(); handleDelete(gateway.id); }}
                >删除</Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      
      <Modal
        title={editingGateway ? '编辑网关' : '新增网关'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="网关名称" name="name" rules={[{ required: true, message: '请输入网关名称' }]}>
            <Input placeholder="请输入网关名称" />
          </Form.Item>
          <Form.Item label="IP地址" name="ip" rules={[{ required: true, message: '请输入IP地址' }]}>
            <Input placeholder="请输入IP地址" />
          </Form.Item>
          <Form.Item label="通信协议" name="protocol">
            <Select placeholder="请选择通信协议">
              {gatewayProtocols.map(p => <Select.Option key={p} value={p}>{p}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="端口" name="port">
            <Input type="number" placeholder="请输入端口号" />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea placeholder="请输入网关描述" />
          </Form.Item>
        </Form>
      </Modal>
      
      <Modal
        title={`网关详情 - ${editingGateway?.name}`}
        visible={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="test" onClick={handleTestConnection}>测试连接</Button>,
          <Button key="bind" onClick={() => { navigate('/device'); setIsDetailModalVisible(false); }}>管理设备</Button>,
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>关闭</Button>,
        ]}
        width={600}
      >
        {editingGateway && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="detail-row">
              <span className="detail-label">网关名称：</span>
              <span>{editingGateway.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">IP地址：</span>
              <span>{editingGateway.ip}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">状态：</span>
              <StatusBadge status={editingGateway.status} />
            </div>
            <div className="detail-row">
              <span className="detail-label">连接设备数：</span>
              <span>{editingGateway.deviceCount} 台</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">采集点数：</span>
              <span>{editingGateway.pointCount} 个</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">数据速率：</span>
              <span>{editingGateway.dataRate} 条/秒</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">CPU使用率：</span>
              <span>{editingGateway.cpu.toFixed(1)}%</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">内存使用率：</span>
              <span>{editingGateway.memory.toFixed(1)}%</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
