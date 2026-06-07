import { useState, useRef, useEffect } from 'react';
import { Card, Row, Col, Button, Tag, List, Modal, Table, Dropdown } from 'antd';
import { FileTextOutlined, CheckCircleOutlined, ArrowUpOutlined, ArrowDownOutlined, CalendarOutlined, BarChartOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { mockEnergyOverview, mockEnergyCurveData, mockDeviceEnergyRank, mockOptimizationSuggestions } from '../../mocks/energy';
import type { DeviceEnergyRank, AIOptimizationSuggestion } from '../../types';
import DeviceDetailModal from '../DeviceManagement/DeviceDetailModal';

type TimeRange = 'day' | 'week' | 'month' | 'year';

const timeRangeLabels: Record<TimeRange, string> = {
  day: '日',
  week: '周',
  month: '月',
  year: '年',
};

export default function EnergyOptimization() {
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [suggestions, setSuggestions] = useState<AIOptimizationSuggestion[]>(mockOptimizationSuggestions);
  const [showRankModal, setShowRankModal] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  const energyOverview = mockEnergyOverview;
  const energyCurveData = mockEnergyCurveData(timeRange);

  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      const option: echarts.EChartsOption = {
        tooltip: {
          trigger: 'axis',
          formatter: (params: any) => {
            let result = `<div style="font-weight: bold; margin-bottom: 8px;">${params[0].axisValue}</div>`;
            params.forEach((item: any) => {
              result += `<div style="display: flex; align-items: center; margin-bottom: 4px;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${item.color}; margin-right: 8px;"></span>
                <span>${item.seriesName}: ${item.value.toLocaleString()} kWh</span>
              </div>`;
            });
            return result;
          },
        },
        legend: {
          data: ['总能耗', '绿电发电'],
          top: 0,
          textStyle: { color: '#666', fontSize: 10 },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '15%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: energyCurveData.timePoints,
          axisLine: { lineStyle: { color: '#e8e8e8' } },
          axisLabel: { color: '#666', fontSize: 10 },
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: '#e8e8e8' } },
          axisLabel: { color: '#666', fontSize: 10 },
          splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
        },
        series: [
          {
            name: '总能耗',
            type: 'line',
            smooth: true,
            symbol: 'none',
            data: energyCurveData.totalEnergy,
            lineStyle: { color: '#3b82f6', width: 2 },
            areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
            ]) },
          },
          {
            name: '绿电发电',
            type: 'line',
            smooth: true,
            symbol: 'none',
            data: energyCurveData.greenEnergy,
            lineStyle: { color: '#22c55e', width: 2 },
            areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(34, 197, 94, 0.3)' },
              { offset: 1, color: 'rgba(34, 197, 94, 0.05)' },
            ]) },
          },
        ],
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [energyCurveData]);

  const handleAdopt = (id: string) => {
    setSuggestions(suggestions.map(s => s.id === id ? { ...s, status: 'adopted' as const } : s));
  };

  const handleGenerateWorkOrder = () => {
    Modal.info({ title: '提示', content: '工单已生成，请前往工单管理查看。' });
  };

  const handleDeviceClick = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setIsDetailModalVisible(true);
  };

  const rankColumns = [
    { title: '排名', dataIndex: 'index', key: 'index', width: 60, render: (_: unknown, __: unknown, i: number) => i + 1 },
    { 
      title: '设备名称', 
      dataIndex: 'deviceName', 
      key: 'deviceName', 
      render: (name: string, record: DeviceEnergyRank) => (
        <a onClick={() => handleDeviceClick(record.deviceId)} style={{ cursor: 'pointer' }}>{name}</a>
      ) 
    },
    { title: '设备类型', dataIndex: 'deviceType', key: 'deviceType' },
    { title: '能耗(kWh)', dataIndex: 'energy', key: 'energy', render: (val: number) => val.toLocaleString() },
    { title: '占比', dataIndex: 'ratio', key: 'ratio', render: (val: number) => `${val}%` },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>能耗优化</h2>
        <Dropdown 
          menu={{
            items: [
              { key: 'day', label: '日' },
              { key: 'week', label: '周' },
              { key: 'month', label: '月' },
              { key: 'year', label: '年' },
            ],
            onClick: (e) => setTimeRange(e.key as TimeRange),
          }}
        >
          <Button icon={<CalendarOutlined />} size="small">
            {timeRangeLabels[timeRange]}
          </Button>
        </Dropdown>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card size="small">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 28, height: 28, background: '#f0f5ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChartOutlined style={{ color: '#3b82f6', fontSize: 16 }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#999' }}>总能耗</div>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>{energyOverview.totalEnergy.toLocaleString()} kWh</div>
              </div>
            </div>
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#999' }}>较昨日</span>
              <span style={{ display: 'flex', alignItems: 'center', color: energyOverview.totalEnergyChange >= 0 ? '#ef4444' : '#22c55e', fontSize: 12, fontWeight: 500 }}>
                {energyOverview.totalEnergyChange >= 0 ? <ArrowUpOutlined style={{ fontSize: 10 }} /> : <ArrowDownOutlined style={{ fontSize: 10 }} />}
                {Math.abs(energyOverview.totalEnergyChange)}%
              </span>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 28, height: 28, background: '#ecfdf5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChartOutlined style={{ color: '#22c55e', fontSize: 16 }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#999' }}>绿电发电量</div>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>{energyOverview.greenEnergy.toLocaleString()} kWh</div>
              </div>
            </div>
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#999' }}>占能耗比</span>
              <span style={{ color: '#22c55e', fontSize: 12, fontWeight: 500 }}>{energyOverview.greenEnergyRatio}%</span>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 28, height: 28, background: '#fef3c7', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChartOutlined style={{ color: '#f97316', fontSize: 16 }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#999' }}>碳排放</div>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>{energyOverview.carbonEmission} 吨 CO₂e</div>
              </div>
            </div>
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#999' }}>较昨日</span>
              <span style={{ display: 'flex', alignItems: 'center', color: energyOverview.carbonChange >= 0 ? '#ef4444' : '#22c55e', fontSize: 12, fontWeight: 500 }}>
                {energyOverview.carbonChange >= 0 ? <ArrowUpOutlined style={{ fontSize: 10 }} /> : <ArrowDownOutlined style={{ fontSize: 10 }} />}
                {Math.abs(energyOverview.carbonChange)}%
              </span>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={16}>
          <Card size="small" title="能耗曲线 & 绿电发电曲线" style={{ borderRadius: 8 }}>
            <div ref={chartRef} style={{ height: 250 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" title="设备能耗排名" style={{ borderRadius: 8 }}>
            <List
              dataSource={mockDeviceEnergyRank.slice(0, 5)}
              renderItem={(item, index) => (
                <List.Item key={item.deviceId} style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 20, textAlign: 'center', fontSize: 12, color: '#999' }}>{index + 1}</span>
                    <span style={{ cursor: 'pointer', color: '#1890ff' }} onClick={() => handleDeviceClick(item.deviceId)}>
                      {item.deviceName}
                    </span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{item.energy.toLocaleString()}</span>
                </List.Item>
              )}
            />
            <div style={{ marginTop: 8, textAlign: 'center' }}>
              <Button size="small" type="link" onClick={() => setShowRankModal(true)}>查看全部</Button>
            </div>
          </Card>
        </Col>
      </Row>

      <Card size="small" title="AI能耗优化建议" style={{ borderRadius: 8 }}>
        <List
          dataSource={suggestions}
          renderItem={(suggestion) => (
            <List.Item 
              key={suggestion.id} 
              style={{ padding: 16, background: '#fafafa', borderRadius: 8, marginBottom: 12, borderLeft: '4px solid #3b82f6' }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#333', marginBottom: 8 }}>
                  💡 {suggestion.content}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 12, color: '#999' }}>
                    预计优化能耗：<span style={{ color: '#22c55e', fontWeight: 500 }}>≈ {suggestion.estimatedSaving.toLocaleString()} kWh/月</span>
                    <span style={{ marginLeft: 8, color: '#666' }}>(约占总能耗 {suggestion.savingRatio}%)</span>
                  </span>
                  {suggestion.status === 'adopted' && (
                    <Tag color="green" icon={<CheckCircleOutlined />}>已采纳</Tag>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
                <Button type="primary" size="small" icon={<FileTextOutlined />} onClick={handleGenerateWorkOrder}>
                  生成工单
                </Button>
                <Button 
                  size="small" 
                  onClick={() => handleAdopt(suggestion.id)}
                  disabled={suggestion.status === 'adopted'}
                >
                  采纳
                </Button>
              </div>
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="设备能耗排名"
        open={showRankModal}
        onCancel={() => setShowRankModal(false)}
        width={700}
        footer={null}
      >
        <Table
          columns={rankColumns}
          dataSource={mockDeviceEnergyRank}
          rowKey="deviceId"
          pagination={false}
        />
      </Modal>

      <DeviceDetailModal
        open={isDetailModalVisible}
        onClose={() => setIsDetailModalVisible(false)}
        deviceId={selectedDeviceId || ''}
      />
    </div>
  );
}
