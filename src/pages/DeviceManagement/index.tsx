import { useState } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, LinkOutlined, PlayCircleOutlined, DesktopOutlined, HeatMapOutlined, ClockCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Modal, Form, Input, Select, Card, Tag, Timeline, Row, Col, message, Pagination } from 'antd';
import { useAppStore } from '../../stores';
import StatusBadge from '../../components/Common/StatusBadge';
import type { Device } from '../../types';
import { lifecycleStages, mockLifecycleEvents } from '../../mocks/devices';

const { Option } = Select;

const formatHours = (hours: number): string => {
  if (hours === 0) return '0小时';
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  if (days === 0) return `${remainingHours}小时`;
  if (remainingHours === 0) return `${days}天`;
  return `${days}天${remainingHours}小时`;
};

export default function DeviceManagement() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isBindModalVisible, setIsBindModalVisible] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [selectedDeviceForBinding, setSelectedDeviceForBinding] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  const { devices, gateways, dataPoints, addDevice, updateDevice, deleteDevice, bindDataPoint, unbindDataPoint } = useAppStore();

  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    device.code.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    device.model.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    device.location.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const paginatedDevices = filteredDevices.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const showAddModal = () => {
    setEditingDevice(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (device: Device) => {
    setEditingDevice(device);
    form.setFieldsValue(device);
    setIsModalVisible(true);
  };

  const showDetailModal = (device: Device) => {
    setEditingDevice(device);
    setIsDetailModalVisible(true);
  };

  const showBindModal = (deviceId: string) => {
    setSelectedDeviceForBinding(deviceId);
    setIsBindModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      if (editingDevice) {
        updateDevice({ ...editingDevice, ...values });
        message.success('设备信息更新成功');
      } else {
        const newDevice: Device = {
          ...values,
          id: `dev-${Date.now()}`,
          status: 'normal',
          boundPoints: [],
          healthScore: 100,
          temperature: 60,
          vibration: 0.1,
          hasStartStopPoint: false,
          cumulativeOperatingHours: 0,
          lastStartTime: 0,
          currentRunHours: 0,
          faultHours: 0,
        };
        addDevice(newDevice);
        message.success('设备添加成功');
      }
      setIsModalVisible(false);
    }).catch(() => {
      message.error('表单验证失败');
    });
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该设备吗？',
      okText: '删除',
      okType: 'danger',
      onOk: () => {
        deleteDevice(id);
        message.success('删除成功');
      },
    });
  };

  const handleBindPoints = (values: { points?: string[] }) => {
    if (!selectedDeviceForBinding || !values.points) return;
    values.points.forEach(pointId => {
      bindDataPoint(selectedDeviceForBinding!, pointId);
    });
    message.success('采集点绑定成功');
    setIsBindModalVisible(false);
  };

  const handleUnbindPoint = (deviceId: string, pointId: string) => {
    unbindDataPoint(deviceId, pointId);
    message.success('采集点解绑成功');
  };

  const device = editingDevice;
  const lifecycleEvents = device ? mockLifecycleEvents[device.id] || [] : [];

  const unboundPoints = dataPoints.filter(p => !device?.boundPoints.includes(p.id));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Input
          placeholder="搜索设备名称、编码、型号、位置..."
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          value={searchKeyword}
          onChange={(e) => {
            setSearchKeyword(e.target.value);
            setCurrentPage(1);
          }}
          allowClear
        />
        <Button icon={<PlusOutlined />} type="primary" onClick={showAddModal}>新增设备</Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        {paginatedDevices.map(device => (
          <Col span={8} key={device.id} style={{ marginBottom: 16 }}>
            <Card 
              hoverable
              style={{ height: '100%' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DesktopOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: 16 }}>{device.name}</div>
                    <div style={{ color: '#666', fontSize: 12 }}>{device.code}</div>
                  </div>
                </div>
                <StatusBadge status={device.status} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666', fontSize: 12 }}>型号</span>
                  <span style={{ fontSize: 12 }}>{device.model}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666', fontSize: 12 }}>位置</span>
                  <span style={{ fontSize: 12 }}>{device.location}</span>
                </div>
              </div>

              {device.hasStartStopPoint && (
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12, marginTop: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#666', fontSize: 12 }}>累计运行</span>
                      <span style={{ fontSize: 12, color: '#1890ff', fontWeight: 'bold' }}>{formatHours(device.cumulativeOperatingHours)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#666', fontSize: 12 }}>当前运行</span>
                      <span style={{ fontSize: 12, color: '#52C41A', fontWeight: 'bold' }}>{device.currentRunHours > 0 ? formatHours(device.currentRunHours) : '-'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#666', fontSize: 12 }}>故障时长</span>
                      <span style={{ fontSize: 12, color: device.faultHours > 100 ? '#FF4D4F' : '#FAAD14', fontWeight: 'bold' }}>
                        {device.faultHours > 0 ? formatHours(device.faultHours) : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12, marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <HeatMapOutlined style={{ fontSize: 14, color: '#FF6B6B' }} />
                    <span style={{ fontSize: 12 }}>{device.temperature}°C</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ClockCircleOutlined style={{ fontSize: 14, color: '#4ECDC4' }} />
                    <span style={{ fontSize: 12 }}>{device.vibration}mm/s</span>
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#666', fontSize: 12 }}>健康评分</span>
                    <span style={{ color: device.healthScore >= 80 ? '#52C41A' : device.healthScore >= 60 ? '#FAAD14' : '#FF4D4F', fontWeight: 'bold' }}>
                      {device.healthScore}分
                    </span>
                  </div>
                  <div style={{ height: 6, backgroundColor: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${device.healthScore}%`,
                        backgroundColor: device.healthScore >= 80 ? '#52C41A' : device.healthScore >= 60 ? '#FAAD14' : '#FF4D4F',
                        borderRadius: 3
                      }} 
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <Button icon={<EyeOutlined />} size="small" onClick={() => showDetailModal(device)}>详情</Button>
                <Button icon={<LinkOutlined />} size="small" onClick={() => showBindModal(device.id)}>绑定</Button>
                <Button icon={<EditOutlined />} size="small" onClick={() => showEditModal(device)}>编辑</Button>
                <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(device.id)}>删除</Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredDevices.length}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
          showTotal={(total) => `共 ${total} 台设备`}
        />
      </div>

      <Modal
        title={editingDevice ? '编辑设备' : '新增设备'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="设备编码" name="code" rules={[{ required: true, message: '请输入设备编码' }]}>
            <Input placeholder="请输入设备编码" />
          </Form.Item>
          <Form.Item label="设备名称" name="name" rules={[{ required: true, message: '请输入设备名称' }]}>
            <Input placeholder="请输入设备名称" />
          </Form.Item>
          <Form.Item label="型号" name="model" rules={[{ required: true, message: '请输入设备型号' }]}>
            <Input placeholder="请输入设备型号" />
          </Form.Item>
          <Form.Item label="位置" name="location">
            <Input placeholder="请输入设备位置" />
          </Form.Item>
          <Form.Item label="所属网关" name="gatewayId">
            <Select placeholder="请选择网关">
              {gateways.map(g => <Option key={g.id} value={g.id}>{g.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="生命周期阶段" name="lifecycleStage">
            <Select placeholder="请选择生命周期阶段">
              {lifecycleStages.map(s => <Option key={s.value} value={s.value}>{s.label}</Option>)}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`设备详情 - ${editingDevice?.name}`}
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        width={900}
      >
        {device && (
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ flex: 1 }}>
              <h3>基本信息</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <span style={{ color: '#666' }}>设备编码：</span>
                  <span>{device.code}</span>
                </div>
                <div>
                  <span style={{ color: '#666' }}>设备名称：</span>
                  <span>{device.name}</span>
                </div>
                <div>
                  <span style={{ color: '#666' }}>型号：</span>
                  <span>{device.model}</span>
                </div>
                <div>
                  <span style={{ color: '#666' }}>状态：</span>
                  <StatusBadge status={device.status} />
                </div>
                <div>
                  <span style={{ color: '#666' }}>位置：</span>
                  <span>{device.location}</span>
                </div>
                <div>
                  <span style={{ color: '#666' }}>温度：</span>
                  <span>{device.temperature}°C</span>
                </div>
                <div>
                  <span style={{ color: '#666' }}>振动：</span>
                  <span>{device.vibration}mm/s</span>
                </div>
                <div>
                  <span style={{ color: '#666' }}>健康评分：</span>
                  <span style={{ color: device.healthScore >= 80 ? '#52C41A' : device.healthScore >= 60 ? '#FAAD14' : '#FF4D4F' }}>
                    {device.healthScore}分
                  </span>
                </div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <h3>运行信息</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <span style={{ color: '#666' }}>开停机采集点：</span>
                  <Tag icon={device.hasStartStopPoint ? <PlayCircleOutlined /> : undefined} color={device.hasStartStopPoint ? 'green' : 'default'}>
                    {device.hasStartStopPoint ? '有' : '无'}
                  </Tag>
                </div>
                {device.hasStartStopPoint && (
                  <>
                    <div>
                      <span style={{ color: '#666' }}>累计运行时间：</span>
                      <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{formatHours(device.cumulativeOperatingHours)}</span>
                    </div>
                    <div>
                      <span style={{ color: '#666' }}>上次开机时间：</span>
                      <span>{device.lastStartTime > 0 ? new Date(device.lastStartTime).toLocaleString('zh-CN') : '-'}</span>
                    </div>
                    <div>
                      <span style={{ color: '#666' }}>当前连续运行：</span>
                      <span style={{ fontWeight: 'bold', color: '#52C41A' }}>{device.currentRunHours > 0 ? formatHours(device.currentRunHours) : '-'}</span>
                    </div>
                    <div>
                      <span style={{ color: '#666' }}>故障运行时间：</span>
                      <span style={{ fontWeight: 'bold', color: device.faultHours > 100 ? '#FF4D4F' : '#FAAD14' }}>
                        {device.faultHours > 0 ? formatHours(device.faultHours) : '-'}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <h3 style={{ marginTop: 24 }}>生命周期时间轴</h3>
              <Timeline mode="left">
                {lifecycleEvents.map((event, index) => (
                  <Timeline.Item key={index}>
                    <div>{event.stage}</div>
                    <div style={{ color: '#666', fontSize: 12 }}>{event.date}</div>
                    <div style={{ color: '#999', fontSize: 12 }}>{event.description}</div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="绑定采集点"
        open={isBindModalVisible}
        onCancel={() => setIsBindModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical" onValuesChange={handleBindPoints}>
          <Form.Item label="已绑定采集点">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {device?.boundPoints.map(pointId => {
                const point = dataPoints.find(p => p.id === pointId);
                return point ? (
                  <Tag key={pointId} closable onClose={() => handleUnbindPoint(device.id, pointId)}>
                    {point.name}
                  </Tag>
                ) : null;
              })}
            </div>
          </Form.Item>
          <Form.Item label="待绑定采集点" name="points">
            <Select mode="multiple" placeholder="请选择要绑定的采集点">
              {unboundPoints.map(p => <Option key={p.id} value={p.id}>{p.name} ({p.unit})</Option>)}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={() => {
              const values = form.getFieldValue('points') || [];
              handleBindPoints({ points: values });
            }}>
              确认绑定
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}