import { useState, useMemo } from 'react';
import {
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  NotificationOutlined,
  FilterOutlined,
  ReloadOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { Button, Table, Card, Tag, Select, Input, DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useAppStore } from '../../stores';
import type { Alarm } from '../../types';

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function AlarmHistory() {
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterDevice, setFilterDevice] = useState<string>('');
  const [filterTime, setFilterTime] = useState<[Dayjs, Dayjs] | null>(null);
  const [searchText, setSearchText] = useState('');

  const { alarms } = useAppStore();

  const deviceOptions = useMemo(() => {
    return [...new Set(alarms.map(a => a.deviceName))];
  }, [alarms]);

  const historicalAlarms = useMemo(() => {
    const now = dayjs();
    const threeMonthsAgo = now.subtract(3, 'month');
    return alarms.filter(alarm => {
      const alarmTime = dayjs(alarm.timestamp);
      if (alarmTime.isBefore(threeMonthsAgo)) return false;
      if (filterLevel !== 'all' && alarm.type !== filterLevel) return false;
      if (filterDevice && alarm.deviceName !== filterDevice) return false;
      if (searchText && !alarm.message.includes(searchText) && !alarm.deviceName.includes(searchText)) return false;
      if (filterTime && filterTime[0] && filterTime[1]) {
        if (alarmTime.isBefore(filterTime[0]) || alarmTime.isAfter(filterTime[1])) return false;
      }
      return true;
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [alarms, filterLevel, filterDevice, searchText, filterTime]);

  const columns = [
    {
      title: '级别',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {type === 'alarm' ? (
            <WarningOutlined style={{ color: '#FF4D4F', fontSize: 16 }} />
          ) : (
            <NotificationOutlined style={{ color: '#FAAD14', fontSize: 16 }} />
          )}
          <Tag color={type === 'alarm' ? 'error' : 'gold'}>
            {type === 'alarm' ? '告警' : '预警'}
          </Tag>
        </div>
      ),
    },
    {
      title: '告警时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 160,
      render: (ts: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <ClockCircleOutlined style={{ color: '#1890ff', fontSize: 14 }} />
          <span>{dayjs(ts).format('YYYY-MM-DD HH:mm:ss')}</span>
        </div>
      ),
    },
    { title: '设备名称', dataIndex: 'deviceName', key: 'deviceName', width: 140 },
    { title: '采集点', dataIndex: 'pointName', key: 'pointName', width: 120 },
    {
      title: '告警描述',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (text: string) => (
        <span title={text}>{text}</span>
      ),
    },
    {
      title: '状态',
      key: 'confirmed',
      width: 100,
      render: (_: unknown, record: Alarm) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
          {record.confirmed ? (
            <>
              <CheckCircleOutlined style={{ color: '#52C41A', fontSize: 14 }} />
              <span style={{ color: '#52C41A', fontSize: 12 }}>已处理</span>
            </>
          ) : (
            <>
              <BellOutlined style={{ color: '#FF4D4F', fontSize: 14 }} />
              <span style={{ color: '#FF4D4F', fontSize: 12 }}>待处理</span>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#1f1f1f' }}>历史报警记录</h2>
          <p style={{ margin: '4px 0 0', color: '#8c8c8c', fontSize: 14 }}>查看历史报警信息</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
            刷新数据
          </Button>
          <Button icon={<DownloadOutlined />} type="primary">
            导出报表
          </Button>
        </div>
      </div>

      <Card
        style={{ marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <WarningOutlined style={{ color: '#FF4D4F' }} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>历史告警列表</span>
            <span style={{ color: '#999', fontSize: 12 }}>（共 {historicalAlarms.length} 条）</span>
          </div>
        }
      >
        <div style={{ marginBottom: 16, padding: '12px 16px', background: '#fafafa', borderRadius: 8 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FilterOutlined style={{ color: '#1890ff' }} />
              <span style={{ color: '#666', fontSize: 14 }}>级别：</span>
              <Select
                value={filterLevel}
                onChange={setFilterLevel}
                style={{ width: 100 }}
                size="small"
              >
                <Option value="all">全部</Option>
                <Option value="alarm">告警</Option>
                <Option value="warning">预警</Option>
              </Select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#666', fontSize: 14 }}>设备：</span>
              <Select
                value={filterDevice}
                onChange={setFilterDevice}
                style={{ width: 130 }}
                size="small"
                placeholder="请选择"
              >
                <Option value="">全部设备</Option>
                {deviceOptions.map(d => <Option key={d} value={d}>{d}</Option>)}
              </Select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#666', fontSize: 14 }}>时间：</span>
              <RangePicker
                value={filterTime}
                onChange={(dates) => setFilterTime(dates as [Dayjs, Dayjs])}
                size="small"
              />
            </div>
            <Input
              placeholder="搜索告警描述..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 180 }}
              size="small"
              allowClear
            />
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={historicalAlarms}
          rowKey="id"
          pagination={{ pageSize: 15 }}
          scroll={{ y: 500 }}
        />
      </Card>

      <style>{`
        .ant-table-row:hover td {
          background-color: rgba(24, 144, 255, 0.05) !important;
        }
      `}</style>
    </div>
  );
}