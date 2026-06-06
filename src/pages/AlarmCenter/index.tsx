import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  NotificationOutlined,
  FilterOutlined,
  ReloadOutlined,
  MoreOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { Button, Table, Card, Tag, Row, Col, Select, Input, DatePicker } from 'antd';
import ReactECharts from 'echarts-for-react';
import dayjs, { Dayjs } from 'dayjs';
import { useAppStore } from '../../stores';
import type { Alarm } from '../../types';

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function AlarmCenter() {
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterDevice, setFilterDevice] = useState<string>('');
  const [filterTime, setFilterTime] = useState<[Dayjs, Dayjs] | null>(null);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  const { alarms, confirmAlarm, deleteAlarm, setHighlightedDeviceId } = useAppStore();

  const deviceOptions = useMemo(() => {
    return [...new Set(alarms.map(a => a.deviceName))];
  }, [alarms]);

  const filteredAlarms = useMemo(() => {
    return alarms.filter(alarm => {
      if (filterLevel !== 'all' && alarm.type !== filterLevel) return false;
      if (filterDevice && alarm.deviceName !== filterDevice) return false;
      if (searchText && !alarm.message.includes(searchText) && !alarm.deviceName.includes(searchText)) return false;
      if (filterTime && filterTime[0] && filterTime[1]) {
        const alarmTime = dayjs(alarm.timestamp);
        if (alarmTime.isBefore(filterTime[0]) || alarmTime.isAfter(filterTime[1])) return false;
      }
      return true;
    });
  }, [alarms, filterLevel, filterDevice, searchText, filterTime]);

  const todayAlarms = useMemo(() => {
    const today = dayjs().startOf('day');
    return alarms.filter(a => dayjs(a.timestamp).isAfter(today));
  }, [alarms]);

  const unconfirmedCount = useMemo(() => alarms.filter(a => !a.confirmed).length, [alarms]);
  const confirmedCount = useMemo(() => alarms.filter(a => a.confirmed).length, [alarms]);
  const alarmCompressionRate = useMemo(() => {
    if (alarms.length === 0) return '0.00';
    return ((confirmedCount / alarms.length) * 100).toFixed(2);
  }, [alarms.length, confirmedCount]);

  const handleConfirm = (id: string) => {
    confirmAlarm(id);
  };

  const handleDelete = (id: string) => {
    deleteAlarm(id);
  };

  const handleViewIn3D = (deviceId: string) => {
    setHighlightedDeviceId(deviceId);
    navigate('/digitaltwin');
  };

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
      width: 80,
      render: (_: unknown, record: Alarm) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
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
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: unknown, record: Alarm) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewIn3D(record.deviceId)}
            style={{ padding: '4px 8px' }}
          >
            3D查看
          </Button>
          {!record.confirmed && (
            <Button
              icon={<CheckCircleOutlined />}
              size="small"
              type="primary"
              onClick={() => handleConfirm(record.id)}
              style={{ padding: '4px 8px' }}
            >
              确认
            </Button>
          )}
          <Button
            icon={<MoreOutlined />}
            size="small"
            onClick={() => handleDelete(record.id)}
            style={{ padding: '4px 8px' }}
          />
        </div>
      ),
    },
  ];

  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day');
      days.push(date.format('MM-DD'));
    }
    return days;
  }, []);

  const alarmTrendData = useMemo(() => {
    return last7Days.map((_, index) => {
      const targetDate = dayjs().subtract(6 - index, 'day');
      const start = targetDate.startOf('day');
      const end = targetDate.endOf('day');
      return alarms.filter(a => {
        const alarmTime = dayjs(a.timestamp);
        return alarmTime.isAfter(start) && alarmTime.isBefore(end);
      }).length;
    });
  }, [alarms, last7Days]);

  const trendChartOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e8e8e8',
      borderWidth: 1,
      textStyle: { color: '#333' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: last7Days,
      axisLine: { lineStyle: { color: '#e8e8e8' } },
      axisLabel: { color: '#666' },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
      axisLabel: { color: '#666' },
    },
    series: [
      {
        name: '告警数',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: alarmTrendData,
        lineStyle: { color: '#1890ff', width: 3 },
        itemStyle: { color: '#1890ff', borderWidth: 2, borderColor: '#fff' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.05)' },
            ],
          },
        },
      },
    ],
  };

  const typeDistribution = useMemo(() => {
    const alarmCount = alarms.filter(a => a.type === 'alarm').length;
    const warningCount = alarms.filter(a => a.type === 'warning').length;
    return [
      { value: alarmCount, name: '告警', color: '#FF4D4F' },
      { value: warningCount, name: '预警', color: '#FAAD14' },
    ];
  }, [alarms]);

  const pieChartOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e8e8e8',
      borderWidth: 1,
      textStyle: { color: '#333' },
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#666' },
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: '#333',
          },
        },
        labelLine: { show: false },
        data: typeDistribution,
      },
    ],
  };

  const topAlarmDevices = useMemo(() => {
    const deviceCount: Record<string, number> = {};
    alarms.forEach(a => {
      deviceCount[a.deviceName] = (deviceCount[a.deviceName] || 0) + 1;
    });
    return Object.entries(deviceCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [alarms]);

  const StatisticCard = ({ icon, title, value, suffix, color }: {
    icon: React.ReactNode;
    title: string;
    value: number | string;
    suffix?: string;
    color: string;
  }) => (
    <Card
      style={{
        borderLeft: `4px solid ${color}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ color, fontSize: 24 }}>{icon}</div>
        <div>
          <div style={{ color: '#8c8c8c', fontSize: 14, marginBottom: 4 }}>{title}</div>
          <div style={{ color, fontSize: 28, fontWeight: 600 }}>
            {value}
            {suffix && <span style={{ fontSize: 16, fontWeight: 400, marginLeft: 4 }}>{suffix}</span>}
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#1f1f1f' }}>报警中心</h2>
          <p style={{ margin: '4px 0 0', color: '#8c8c8c', fontSize: 14 }}>实时监控设备告警信息</p>
        </div>
        <Button icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
          刷新数据
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <StatisticCard
            icon={<BellOutlined />}
            title="今日告警"
            value={todayAlarms.length}
            color="#FF4D4F"
          />
        </Col>
        <Col span={6}>
          <StatisticCard
            icon={<ClockCircleOutlined />}
            title="待处理"
            value={unconfirmedCount}
            color="#FAAD14"
          />
        </Col>
        <Col span={6}>
          <StatisticCard
            icon={<CheckCircleOutlined />}
            title="已处理"
            value={confirmedCount}
            color="#52C41A"
          />
        </Col>
        <Col span={6}>
          <StatisticCard
            icon={<BellOutlined />}
            title="告警压缩率"
            value={alarmCompressionRate}
            suffix="%"
            color="#1890ff"
          />
        </Col>
      </Row>

      <Card
        style={{ marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <WarningOutlined style={{ color: '#FF4D4F' }} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>告警列表</span>
            <span style={{ color: '#999', fontSize: 12 }}>（共 {filteredAlarms.length} 条）</span>
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
          dataSource={filteredAlarms}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ y: 350 }}
          rowClassName={(record) => !record.confirmed ? 'alarm-row-highlight' : ''}
        />
      </Card>

      <Row gutter={16} align="stretch">
        <Col span={8}>
          <Card
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>近7天趋势</span>
              </div>
            }
            styles={{ body: { height: 220 } }}
          >
            <ReactECharts option={trendChartOption} style={{ height: '100%' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>告警类型分布</span>
              </div>
            }
            styles={{ body: { height: 220 } }}
          >
            <ReactECharts option={pieChartOption} style={{ height: '100%' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>高频告警设备</span>
              </div>
            }
            styles={{ body: { height: 220 } }}
          >
            <div style={{ padding: '8px 0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {topAlarmDevices.map((item, index) => (
                <div
                  key={item.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    marginBottom: 8,
                    background: index < 3 ? 'rgba(24, 144, 255, 0.08)' : '#fafafa',
                    borderRadius: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 20,
                      height: 20,
                      background: index === 0 ? '#FF4D4F' : index === 1 ? '#FAAD14' : '#52C41A',
                      color: '#fff',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                    }}>
                      {index + 1}
                    </span>
                    <span style={{ fontSize: 13, color: '#333' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1890ff' }}>{item.count}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <style>{`
        .alarm-row-highlight {
          background-color: rgba(255, 77, 79, 0.05);
        }
        .ant-table-row:hover td {
          background-color: rgba(24, 144, 255, 0.05) !important;
        }
      `}</style>
    </div>
  );
}