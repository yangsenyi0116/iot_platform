import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, DownloadOutlined, UploadOutlined, RestOutlined, LineChartOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Modal, Form, Input, Select, Card, Statistic, Row, Col, Tag, Progress, message, Table, DatePicker } from 'antd';
import ReactECharts from 'echarts-for-react';
import { useAppStore } from '../../stores';
import StatusBadge from '../../components/Common/StatusBadge';
import type { Gateway, DataPoint } from '../../types';
import { gatewayProtocols, mockDataPoints } from '../../mocks/gateways';
import dayjs from 'dayjs';

export default function GatewayManagement() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isPointsModalVisible, setIsPointsModalVisible] = useState(false);
  const [isTrendModalVisible, setIsTrendModalVisible] = useState(false);
  const [editingGateway, setEditingGateway] = useState<Gateway | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<Gateway | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);
  const [gatewayPoints, setGatewayPoints] = useState<DataPoint[]>([]);
  const [trendData, setTrendData] = useState<{ time: string; value: number }[]>([]);
  const [timeRange, setTimeRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
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
  
  const showPointsModal = (gateway: Gateway) => {
    setSelectedGateway(gateway);
    const points = mockDataPoints.filter(p => p.gatewayId === gateway.id);
    setGatewayPoints(points);
    setIsPointsModalVisible(true);
  };

  const generateMockTrendData = (point: DataPoint, start: dayjs.Dayjs, end: dayjs.Dayjs): { time: string; value: number }[] => {
    const data: { time: string; value: number }[] = [];
    const { dataType, currentValue, minValue, maxValue } = point;
    const range = maxValue - minValue;
    const variance = range * 0.08;
    
    const totalSeconds = end.unix() - start.unix();
    const pointCount = Math.min(120, Math.max(30, Math.floor(totalSeconds / 60)));
    const interval = totalSeconds / pointCount;
    
    let currentTime = start;
    let currentValueState = currentValue;
    
    const trendFactor = (Math.random() - 0.5) * 0.3;
    const cyclePeriod = 24 * 60 * 60;
    const cycleAmplitude = range * 0.05;
    
    for (let i = 0; i <= pointCount; i++) {
      let newValue: number;
      
      const progress = i / pointCount;
      const trendOffset = trendFactor * progress * range;
      const timeOffset = currentTime.unix() % cyclePeriod;
      const cycleOffset = Math.sin((timeOffset / cyclePeriod) * Math.PI * 2) * cycleAmplitude;
      
      switch (dataType) {
        case 'Bool':
          const boolBase = currentValueState;
          const boolRand = Math.random();
          if (boolRand < 0.05) {
            newValue = boolBase === 1 ? 0 : 1;
          } else {
            newValue = boolBase;
          }
          break;
        case 'Int':
          const intBase = Math.round(currentValueState);
          const intRandomOffset = Math.floor((Math.random() - 0.5) * variance * 2);
          newValue = Math.round(intBase + intRandomOffset + trendOffset + cycleOffset);
          newValue = Math.max(minValue, Math.min(maxValue, newValue));
          break;
        case 'Float':
        default:
          const floatRandomOffset = (Math.random() - 0.5) * variance * 2;
          newValue = currentValueState + floatRandomOffset + trendOffset + cycleOffset;
          newValue = Math.max(minValue, Math.min(maxValue, newValue));
          break;
      }
      
      currentValueState = newValue;
      
      const timeFormat = totalSeconds > 7 * 24 * 60 * 60 
        ? 'MM-DD' 
        : totalSeconds > 24 * 60 * 60 
          ? 'MM-DD HH:mm' 
          : 'HH:mm:ss';
      
      data.push({
        time: currentTime.format(timeFormat),
        value: newValue,
      });
      
      currentTime = currentTime.add(interval, 'second');
    }
    
    return data;
  };

  const showTrendModal = (point: DataPoint) => {
    setSelectedPoint(point);
    const endTime = dayjs();
    const startTime = endTime.subtract(1, 'hour');
    setTimeRange([startTime, endTime]);
    setTrendData(generateMockTrendData(point, startTime, endTime));
    setIsTrendModalVisible(true);
  };

  const handleTimeRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1] && selectedPoint) {
      const validDates: [dayjs.Dayjs, dayjs.Dayjs] = [dates[0], dates[1]];
      setTimeRange(validDates);
      setTrendData(generateMockTrendData(selectedPoint, dates[0], dates[1]));
    }
  };

  const presetTimeRanges = [
    { label: '1小时', hours: 1 },
    { label: '6小时', hours: 6 },
    { label: '24小时', hours: 24 },
    { label: '7天', hours: 168 },
  ];

  const handlePresetTimeRange = (hours: number) => {
    if (selectedPoint) {
      const endTime = dayjs();
      const startTime = endTime.subtract(hours, 'hour');
      setTimeRange([startTime, endTime]);
      setTrendData(generateMockTrendData(selectedPoint, startTime, endTime));
    }
  };

  const handleExportTrendData = () => {
    if (!selectedPoint) return;
    
    const exportData = trendData.map(d => ({
      time: d.time,
      value: d.value.toFixed(2),
      unit: selectedPoint.unit,
    }));
    
    const csvContent = [
      ['时间', '数值', '单位'].join(','),
      ...exportData.map(d => [d.time, d.value, d.unit].join(','))
    ].join('\n');
    
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedPoint.name}_趋势数据_${dayjs().format('YYYYMMDDHHmmss')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('数据导出成功');
  };

  const generateMockValue = (point: DataPoint): number => {
    const { dataType, currentValue, minValue, maxValue } = point;
    const range = maxValue - minValue;
    const variance = range * 0.05;
    
    switch (dataType) {
      case 'Bool':
        return Math.random() > 0.5 ? 1 : 0;
      case 'Int':
        const intBase = Math.round(currentValue);
        const intOffset = Math.floor((Math.random() - 0.5) * variance * 2);
        return Math.max(minValue, Math.min(maxValue, intBase + intOffset));
      case 'Float':
      default:
        const floatOffset = (Math.random() - 0.5) * variance * 2;
        return Math.max(minValue, Math.min(maxValue, currentValue + floatOffset));
    }
  };

  const refreshPointsData = () => {
    setGatewayPoints(prevPoints => 
      prevPoints.map(point => ({
        ...point,
        currentValue: generateMockValue(point),
        timestamp: Date.now(),
      }))
    );
  };

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    if (isPointsModalVisible && gatewayPoints.length > 0) {
      intervalId = setInterval(refreshPointsData, 2000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPointsModalVisible, gatewayPoints.length]);
  
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
                  size="medium"
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
                  icon={<LineChartOutlined />} 
                  size="small" 
                  type="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    showPointsModal(gateway);
                  }}
                >采集点</Button>
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

      <Modal
        title={`${selectedGateway?.name} - 数据采集列表`}
        open={isPointsModalVisible}
        onCancel={() => setIsPointsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsPointsModalVisible(false)}>关闭</Button>,
        ]}
        width={900}
        forceRender
      >
        <div style={{ padding: '0 8px' }}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <Input
              placeholder="搜索名称、设备、数据类型"
              prefix={<SearchOutlined />}
              style={{ width: 280 }}
              onChange={(e) => {
                const keyword = e.target.value.toLowerCase();
                const points = mockDataPoints.filter(p => p.gatewayId === selectedGateway?.id);
                const filtered = points.filter(p => 
                  p.name.toLowerCase().includes(keyword) ||
                  p.deviceName.toLowerCase().includes(keyword) ||
                  p.dataType.toLowerCase().includes(keyword)
                );
                setGatewayPoints(filtered);
              }}
            />
          </div>
          <Table
            dataSource={gatewayPoints}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
            scroll={{ y: 500 }}
          >
            <Table.Column
              title="名称"
              dataIndex="name"
              key="name"
              width={160}
              render={(text: string) => (
                <span style={{ fontWeight: 500, color: '#333' }}>{text}</span>
              )}
            />
            <Table.Column
              title="数据类型"
              dataIndex="dataType"
              key="dataType"
              width={100}
              render={(text: string) => (
                <Tag color="blue" style={{ borderRadius: 2 }}>{text}</Tag>
              )}
            />
            <Table.Column
              title="实时值"
              dataIndex="currentValue"
              key="currentValue"
              width={150}
              render={(value: number, record: DataPoint) => {
                const isAlarm = value >= record.alarmThreshold;
                const isWarning = value >= record.warningThreshold && value < record.alarmThreshold;
                let color = '#1890ff';
                if (isAlarm) color = '#ff4d4f';
                else if (isWarning) color = '#faad14';
                
                const displayValue = record.dataType === 'Bool' 
                  ? (value === 1 ? 'TRUE' : 'FALSE') 
                  : value;
                
                return (
                  <span style={{ 
                    fontWeight: 'bold', 
                    fontSize: 16, 
                    color: color 
                  }}>
                    {typeof displayValue === 'string' ? displayValue : displayValue.toFixed(2)}{record.unit ? ` ${record.unit}` : ''}
                  </span>
                );
              }}
            />
            <Table.Column
              title="最后上送时间"
              dataIndex="timestamp"
              key="timestamp"
              width={160}
              render={(ts: number) => (
                <span style={{ color: '#8c8c8c', fontSize: 12 }}>
                  {new Date(ts).toLocaleString('zh-CN', { hour12: false })}
                </span>
              )}
            />
            <Table.Column
              title="操作"
              key="action"
              width={120}
              render={(_: unknown, record: DataPoint) => (
                <Button 
                  icon={<LineChartOutlined />} 
                  size="small" 
                  onClick={() => showTrendModal(record)}
                >
                  历史趋势查看
                </Button>
              )}
            />
          </Table>
        </div>
      </Modal>

      <Modal
        title={`${selectedPoint?.name} - 历史趋势`}
        open={isTrendModalVisible}
        onCancel={() => setIsTrendModalVisible(false)}
        footer={[
          <Button key="export" icon={<DownloadOutlined />} onClick={handleExportTrendData}>导出数据</Button>,
          <Button key="close" onClick={() => setIsTrendModalVisible(false)}>关闭</Button>,
        ]}
        width={1000}
        forceRender
      >
        <div style={{ padding: '0 8px' }}>
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <span style={{ color: '#8c8c8c', fontSize: 12 }}>数据类型：</span>
              <Tag color="blue" style={{ borderRadius: 2 }}>{selectedPoint?.dataType}</Tag>
              <span style={{ color: '#8c8c8c', fontSize: 12 }}>单位：</span>
              <span style={{ fontWeight: 500 }}>{selectedPoint?.unit}</span>
            </div>
            <Button icon={<DownloadOutlined />} onClick={handleExportTrendData}>导出CSV</Button>
          </div>
          
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {presetTimeRanges.map(option => (
                <Button
                  key={option.hours}
                  size="small"
                  type={timeRange && (dayjs().diff(timeRange[0], 'hour') === option.hours) ? 'primary' : 'default'}
                  onClick={() => handlePresetTimeRange(option.hours)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <DatePicker.RangePicker
              value={timeRange}
              onChange={handleTimeRangeChange}
              style={{ width: 320 }}
              format="YYYY-MM-DD HH:mm"
              showTime={{ format: 'HH:mm' }}
              placeholder={['开始时间', '结束时间']}
            />
          </div>
          
          <ReactECharts
            option={{
              backgroundColor: '#fff',
              tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#e8e8e8',
                borderWidth: 1,
                textStyle: { color: '#333' },
                formatter: (params: any) => {
                  const param = params[0];
                  return `<div style="padding: 8px;">
                    <div style="font-weight: 500; margin-bottom: 4px;">${param.name}</div>
                    <div style="color: #1890ff;">${param.seriesName}: <span style="font-weight: bold;">${param.value.toFixed(2)} ${selectedPoint?.unit}</span></div>
                  </div>`;
                },
              },
              legend: {
                data: [selectedPoint?.name || '数据'],
                top: 10,
              },
              grid: {
                left: '3%',
                right: '4%',
                bottom: '12%',
                top: '15%',
                containLabel: true,
              },
              xAxis: {
                type: 'category',
                boundaryGap: false,
                data: trendData.map(d => d.time),
                axisLine: { lineStyle: { color: '#e8e8e8' } },
                axisLabel: {
                  rotate: trendData.length > 30 ? 45 : 0,
                  fontSize: 11,
                  color: '#8c8c8c',
                },
                axisTick: { show: false },
              },
              yAxis: {
                type: 'value',
                min: selectedPoint?.minValue,
                max: selectedPoint?.maxValue,
                axisLine: { show: false },
                axisLabel: {
                  formatter: (value: number) => `${value.toFixed(2)}`,
                  color: '#8c8c8c',
                  fontSize: 11,
                },
                splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
              },
              dataZoom: [
                {
                  type: 'inside',
                  start: 0,
                  end: 100,
                  zoomLock: false,
                },
                {
                  type: 'slider',
                  start: 0,
                  end: 100,
                  height: 20,
                  bottom: 10,
                  borderColor: '#e8e8e8',
                  fillerColor: 'rgba(24, 144, 255, 0.2)',
                  handleStyle: { color: '#1890ff' },
                  textStyle: { color: '#8c8c8c' },
                },
              ],
              series: [
                {
                  name: selectedPoint?.name || '数据',
                  type: 'line',
                  smooth: true,
                  symbol: 'circle',
                  symbolSize: 6,
                  itemStyle: { color: '#1890ff' },
                  data: trendData.map(d => d.value),
                  lineStyle: {
                    width: 2,
                    color: '#1890ff',
                  },
                  areaStyle: {
                    color: {
                      type: 'linear',
                      x: 0,
                      y: 0,
                      x2: 0,
                      y2: 1,
                      colorStops: [
                        { offset: 0, color: 'rgba(24, 144, 255, 0.35)' },
                        { offset: 0.5, color: 'rgba(24, 144, 255, 0.15)' },
                        { offset: 1, color: 'rgba(24, 144, 255, 0.02)' },
                      ],
                    },
                  },
                  markLine: {
                    silent: true,
                    symbol: 'none',
                    data: selectedPoint ? [
                      {
                        yAxis: selectedPoint.warningThreshold,
                        name: '预警阈值',
                        lineStyle: { color: '#faad14', type: 'dashed', width: 1 },
                        label: { 
                          formatter: '预警阈值', 
                          color: '#faad14',
                          fontSize: 11,
                        },
                      },
                      {
                        yAxis: selectedPoint.alarmThreshold,
                        name: '报警阈值',
                        lineStyle: { color: '#ff4d4f', type: 'dashed', width: 1 },
                        label: { 
                          formatter: '报警阈值', 
                          color: '#ff4d4f',
                          fontSize: 11,
                        },
                      },
                    ] : [],
                  },
                  emphasis: {
                    focus: 'series',
                    itemStyle: {
                      borderWidth: 2,
                      borderColor: '#fff',
                      shadowBlur: 10,
                      shadowColor: 'rgba(24, 144, 255, 0.5)',
                    },
                  },
                },
              ],
            }}
            style={{ height: 420, width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
          
          <div style={{ marginTop: 16, padding: '12px 16px', backgroundColor: '#fafafa', borderRadius: 8, display: 'flex', gap: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#1890ff' }}></div>
              <span style={{ color: '#8c8c8c', fontSize: 12 }}>最小值：</span>
              <span style={{ fontWeight: 600, color: '#1890ff', fontSize: 14 }}>{trendData.length > 0 ? Math.min(...trendData.map(d => d.value)).toFixed(2) : '0.00'} {selectedPoint?.unit}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ff4d4f' }}></div>
              <span style={{ color: '#8c8c8c', fontSize: 12 }}>最大值：</span>
              <span style={{ fontWeight: 600, color: '#ff4d4f', fontSize: 14 }}>{trendData.length > 0 ? Math.max(...trendData.map(d => d.value)).toFixed(2) : '0.00'} {selectedPoint?.unit}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#52c41a' }}></div>
              <span style={{ color: '#8c8c8c', fontSize: 12 }}>平均值：</span>
              <span style={{ fontWeight: 600, color: '#52c41a', fontSize: 14 }}>{trendData.length > 0 ? (trendData.reduce((sum, d) => sum + d.value, 0) / trendData.length).toFixed(2) : '0.00'} {selectedPoint?.unit}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#722ed1' }}></div>
              <span style={{ color: '#8c8c8c', fontSize: 12 }}>数据点数：</span>
              <span style={{ fontWeight: 600, color: '#722ed1', fontSize: 14 }}>{trendData.length}</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
