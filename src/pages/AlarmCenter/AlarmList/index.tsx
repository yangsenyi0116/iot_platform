import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellOutlined, CheckCircleOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import { Button, Table, Select, Card, Tag, message } from 'antd';
import { useAppStore } from '../../../stores';
import type { Alarm } from '../../../types';

const { Option } = Select;

export default function AlarmList() {
  const [filterType, setFilterType] = useState<string>('all');
  const navigate = useNavigate();
  
  const { alarms, confirmAlarm, deleteAlarm, setHighlightedDeviceId } = useAppStore();
  
  const filteredAlarms = alarms.filter(alarm => {
    if (filterType === 'all') return true;
    if (filterType === 'unconfirmed') return !alarm.confirmed;
    return alarm.type === filterType;
  });
  
  const handleConfirm = (id: string) => {
    confirmAlarm(id);
    message.success('告警已确认');
  };
  
  const handleDelete = (id: string) => {
    deleteAlarm(id);
    message.success('告警已删除');
  };
  
  const handleViewIn3D = (deviceId: string) => {
    setHighlightedDeviceId(deviceId);
    navigate('/digitaltwin');
  };
  
  const columns = [
    { 
      title: '状态', 
      key: 'confirmed', 
      render: (_: unknown, record: Alarm) => (
        record.confirmed ? <CheckCircleOutlined style={{ color: '#52C41A' }} /> : <BellOutlined style={{ color: '#FF4D4F' }} />
      ),
    },
    { 
      title: '级别', 
      dataIndex: 'type', 
      key: 'type', 
      render: (type: string) => (
        <Tag color={type === 'alarm' ? 'error' : 'gold'}>
          {type === 'alarm' ? '告警' : '预警'}
        </Tag>
      ),
    },
    { title: '设备名称', dataIndex: 'deviceName', key: 'deviceName' },
    { title: '采集点', dataIndex: 'pointName', key: 'pointName' },
    { title: '消息', dataIndex: 'message', key: 'message' },
    { 
      title: '时间', 
      dataIndex: 'timestamp', 
      key: 'timestamp', 
      render: (ts: number) => new Date(ts).toLocaleString('zh-CN'),
    },
    { 
      title: '操作', 
      key: 'action', 
      render: (_: unknown, record: Alarm) => (
        <div style={{ display: 'flex', gap: 8 }}>
          {!record.confirmed && (
            <Button icon={<CheckCircleOutlined />} size="small" onClick={() => handleConfirm(record.id)}>确认</Button>
          )}
          <Button icon={<LinkOutlined />} size="small" onClick={() => handleViewIn3D(record.deviceId)}>3D查看</Button>
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.id)}>删除</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>报警列表</h2>
        <Select value={filterType} onChange={setFilterType} style={{ width: 150 }}>
          <Option value="all">全部</Option>
          <Option value="unconfirmed">未确认</Option>
          <Option value="alarm">告警</Option>
          <Option value="warning">预警</Option>
        </Select>
      </div>
      
      <Card>
        <Table 
          columns={columns} 
          dataSource={filteredAlarms} 
          rowKey="id" 
          pagination={{ pageSize: 10 }}
          scroll={{ y: 450 }}
        />
      </Card>
    </div>
  );
}