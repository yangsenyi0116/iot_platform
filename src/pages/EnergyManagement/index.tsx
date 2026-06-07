import { useState, useRef, useEffect, useMemo } from 'react';
import { Card, Row, Col, Button, Tag, Select, Dropdown, List, Modal, Table, DatePicker } from 'antd';
import { ExportOutlined, CheckCircleOutlined, ArrowUpOutlined, ArrowDownOutlined, CalendarOutlined, BarChartOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import { mockEnergyOverview, mockEnergyCurveData, mockDeviceEnergyRank, mockOptimizationSuggestions, mockEfficiencyStats, mockDeviceEfficiency, efficiencyLevelLabels, efficiencyLevelColors } from '../../mocks/energy';
import type { DeviceEnergyRank, DeviceEfficiency, EfficiencyLevel } from '../../types';

type TimeRange = 'day' | 'week' | 'month' | 'year';

const timeRangeLabels: Record<TimeRange, string> = {
  day: '日',
  week: '周',
  month: '月',
  year: '年',
};

export default function EnergyManagement() {
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const suggestions = mockOptimizationSuggestions;
  const [showRankModal, setShowRankModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<EfficiencyLevel | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('efficiencyIndex');
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend'>('ascend');
  const [showEfficiencyTrendModal, setShowEfficiencyTrendModal] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [trendDateRange, setTrendDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(() => {
    const now = dayjs();
    const start = now.startOf('month');
    const end = now;
    return [start, end];
  });
  const overviewChartRef = useRef<HTMLDivElement>(null);
  const overviewChartInstance = useRef<echarts.ECharts | null>(null);
  const efficiencyChartRef = useRef<HTMLDivElement>(null);
  const efficiencyChartInstance = useRef<echarts.ECharts | null>(null);
  const trendChartRef = useRef<HTMLDivElement>(null);
  const trendChartInstance = useRef<echarts.ECharts | null>(null);

  const energyOverview = mockEnergyOverview;
  const energyCurveData = mockEnergyCurveData(timeRange);

  const deviceTypes = useMemo(() => {
    const types = [...new Set(mockDeviceEfficiency.map(d => d.deviceType))];
    return types;
  }, []);

  const filteredEfficiencyData = useMemo(() => {
    let data = [...mockDeviceEfficiency];
    
    if (selectedLevel !== 'all') {
      data = data.filter(d => d.level === selectedLevel);
    }
    
    if (selectedType !== 'all') {
      data = data.filter(d => d.deviceType === selectedType);
    }
    
    data.sort((a, b) => {
      if (sortField === 'efficiencyIndex') {
        return sortOrder === 'ascend' ? a.efficiencyIndex - b.efficiencyIndex : b.efficiencyIndex - a.efficiencyIndex;
      }
      return 0;
    });
    
    return data;
  }, [selectedLevel, selectedType, sortField, sortOrder]);

  useEffect(() => {
    if (overviewChartRef.current) {
      if (!overviewChartInstance.current) {
        overviewChartInstance.current = echarts.init(overviewChartRef.current);
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

      overviewChartInstance.current.setOption(option);
    }

    return () => {
      if (overviewChartInstance.current) {
        overviewChartInstance.current.dispose();
        overviewChartInstance.current = null;
      }
    };
  }, [energyCurveData]);

  useEffect(() => {
    if (efficiencyChartRef.current) {
      if (!efficiencyChartInstance.current) {
        efficiencyChartInstance.current = echarts.init(efficiencyChartRef.current);
      }

      const option: echarts.EChartsOption = {
        tooltip: {
          trigger: 'item',
          formatter: (params: any) => {
            return `${params.name}<br/>数量: ${params.value}<br/>占比: ${params.percent}%`;
          },
        },
        legend: {
          orient: 'horizontal',
          bottom: 0,
          textStyle: { color: '#666', fontSize: 11 },
          data: ['一级', '二级', '三级', '三级以下'],
        },
        series: [
          {
            name: '能效等级',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 8,
              borderColor: '#fff',
              borderWidth: 2,
            },
            label: {
              show: true,
              fontSize: 11,
              formatter: '{b}: {d}%',
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 14,
                fontWeight: 'bold',
              },
            },
            labelLine: {
              show: true,
            },
            data: [
              { value: mockEfficiencyStats.level1.count, name: '一级', itemStyle: { color: efficiencyLevelColors.level1 } },
              { value: mockEfficiencyStats.level2.count, name: '二级', itemStyle: { color: efficiencyLevelColors.level2 } },
              { value: mockEfficiencyStats.level3.count, name: '三级', itemStyle: { color: efficiencyLevelColors.level3 } },
              { value: mockEfficiencyStats.levelBelow.count, name: '三级以下', itemStyle: { color: efficiencyLevelColors.levelBelow } },
            ],
          },
        ],
      };

      efficiencyChartInstance.current.setOption(option);
    }

    return () => {
      if (efficiencyChartInstance.current) {
        efficiencyChartInstance.current.dispose();
        efficiencyChartInstance.current = null;
      }
    };
  }, []);

  const handleEfficiencyTrend = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setShowEfficiencyTrendModal(true);
  };

  const handleExport = () => {
    const headers = ['设备名称', '设备类型', '能耗(kWh)', '运行时数', '能效指标', '能效等级'];
    const rows = filteredEfficiencyData.map(d => [
      d.deviceName,
      d.deviceType,
      d.energy.toLocaleString(),
      `${d.output}${d.outputUnit}`,
      d.efficiencyIndex,
      efficiencyLevelLabels[d.level],
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '设备能效等级.csv';
    link.click();
  };

  useEffect(() => {
    if (showEfficiencyTrendModal) {
      const timer = setTimeout(() => {
        if (trendChartRef.current) {
          if (!trendChartInstance.current) {
            trendChartInstance.current = echarts.init(trendChartRef.current);
          }

      const getMockTrendData = () => {
          const labels: string[] = [];
          const efficiencyData: number[] = [];
          const energyData: number[] = [];
          
          const efficiencyItem = mockDeviceEfficiency.find(d => d.deviceId === selectedDeviceId);
          const baseEfficiency = efficiencyItem?.efficiencyIndex || 90;
          const baseEnergy = efficiencyItem?.energy || 8000;

          if (!trendDateRange) {
            return { labels, efficiencyData, energyData };
          }

          const [startDate, endDate] = trendDateRange;
          const daysDiff = endDate.diff(startDate, 'day');
          
          for (let i = 0; i <= daysDiff; i++) {
            const date = startDate.add(i, 'day');
            labels.push(`${date.month() + 1}/${date.date()}`);
            efficiencyData.push(baseEfficiency + (Math.random() - 0.5) * 5);
            energyData.push(Math.floor(baseEnergy / 30 + (Math.random() - 0.5) * 400));
          }

          return { labels, efficiencyData, energyData };
        };

      const { labels, efficiencyData, energyData } = getMockTrendData();

      const option: echarts.EChartsOption = {
        tooltip: {
          trigger: 'axis',
          formatter: (params: any) => {
            let result = `<div style="font-weight: bold; margin-bottom: 8px;">${params[0].axisValue}</div>`;
            params.forEach((item: any) => {
              const unit = item.seriesName === '能效指标' ? '%' : 'kWh';
              result += `<div style="display: flex; align-items: center; margin-bottom: 4px;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${item.color}; margin-right: 8px;"></span>
                <span>${item.seriesName}: ${item.value.toFixed(item.seriesName === '能效指标' ? 1 : 0)} ${unit}</span>
              </div>`;
            });
            return result;
          },
        },
        legend: {
          data: ['能效指标', '能耗'],
          top: 0,
          textStyle: { color: '#666', fontSize: 12 },
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
          data: labels,
          axisLine: { lineStyle: { color: '#e8e8e8' } },
          axisLabel: { color: '#666', fontSize: 11 },
        },
        yAxis: [
          {
            type: 'value',
            name: '能效指标 (%)',
            position: 'left',
            axisLine: { lineStyle: { color: '#e8e8e8' } },
            axisLabel: { color: '#666', fontSize: 11 },
            splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
          },
          {
            type: 'value',
            name: '能耗 (kWh)',
            position: 'right',
            axisLine: { lineStyle: { color: '#e8e8e8' } },
            axisLabel: { color: '#666', fontSize: 11 },
            splitLine: { show: false },
          },
        ],
        series: [
          {
            name: '能效指标',
            type: 'line',
            smooth: true,
            symbol: 'none',
            data: efficiencyData,
            lineStyle: { color: '#3b82f6', width: 2 },
            areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
            ]) },
          },
          {
            name: '能耗',
            type: 'line',
            yAxisIndex: 1,
            smooth: true,
            symbol: 'none',
            data: energyData,
            lineStyle: { color: '#f97316', width: 2 },
            areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(249, 115, 22, 0.3)' },
              { offset: 1, color: 'rgba(249, 115, 22, 0.05)' },
            ]) },
          },
        ],
      };

      trendChartInstance.current.setOption(option);

            const handleResize = () => {
              trendChartInstance.current?.resize();
            };

            window.addEventListener('resize', handleResize);

            return () => {
              window.removeEventListener('resize', handleResize);
            };
          }
        }, 100);

        return () => {
          clearTimeout(timer);
        };
      }
    }, [showEfficiencyTrendModal, trendDateRange, selectedDeviceId]);

  useEffect(() => {
    if (!showEfficiencyTrendModal && trendChartInstance.current) {
      trendChartInstance.current.dispose();
      trendChartInstance.current = null;
    }
  }, [showEfficiencyTrendModal]);

  const rankColumns = [
    { title: '排名', dataIndex: 'index', key: 'index', width: 60, render: (_: unknown, __: unknown, i: number) => i + 1 },
    { 
      title: '设备名称', 
      dataIndex: 'deviceName', 
      key: 'deviceName', 
      render: (name: string, record: DeviceEnergyRank) => (
        <a onClick={() => handleEfficiencyTrend(record.deviceId)} style={{ cursor: 'pointer' }}>{name}</a>
      ) 
    },
    { title: '设备类型', dataIndex: 'deviceType', key: 'deviceType' },
    { title: '能耗(kWh)', dataIndex: 'energy', key: 'energy', render: (val: number) => val.toLocaleString() },
    { title: '占比', dataIndex: 'ratio', key: 'ratio', render: (val: number) => `${val}%` },
  ];

  const efficiencyColumns = [
    { 
      title: '设备名称', 
      dataIndex: 'deviceName', 
      key: 'deviceName', 
      render: (name: string, record: DeviceEfficiency) => (
        <a onClick={() => handleEfficiencyTrend(record.deviceId)} style={{ cursor: 'pointer' }}>{name}</a>
      ),
    },
    { title: '设备类型', dataIndex: 'deviceType', key: 'deviceType' },
    { title: '能耗(kWh)', dataIndex: 'energy', key: 'energy', render: (val: number) => val.toLocaleString() },
    { title: '运行时数', dataIndex: 'output', key: 'output', render: (val: number, record: DeviceEfficiency) => `${val}${record.outputUnit}` },
    { 
      title: '能效指标', 
      dataIndex: 'efficiencyIndex', 
      key: 'efficiencyIndex',
      sorter: true,
      sortOrder: sortField === 'efficiencyIndex' ? sortOrder : undefined,
      render: (val: number) => `${val}%`,
    },
    { 
      title: '能效等级', 
      dataIndex: 'level', 
      key: 'level',
      render: (level: EfficiencyLevel) => (
        <Tag color={efficiencyLevelColors[level]}>
          {efficiencyLevelLabels[level]}
        </Tag>
      ),
    },
    { 
      title: '操作', 
      key: 'action', 
      render: (_: unknown, record: DeviceEfficiency) => (
        <>
          <Button size="small">详情</Button>
          <Button size="small" onClick={() => handleEfficiencyTrend(record.deviceId)}>趋势图</Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>能耗管理</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<ExportOutlined />} size="small" onClick={handleExport}>导出</Button>
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
            <div ref={overviewChartRef} style={{ height: 250 }} />
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
                    <span style={{ cursor: 'pointer', color: '#1890ff' }} onClick={() => handleEfficiencyTrend(item.deviceId)}>
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

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={10}>
          <Card size="small" title="能效等级设备占比" style={{ borderRadius: 8 }}>
            <div ref={efficiencyChartRef} style={{ height: 280 }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12, justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: efficiencyLevelColors.level1 }} />
                <span style={{ fontSize: 11, color: '#666' }}>一级 ({mockEfficiencyStats.level1.ratio}%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: efficiencyLevelColors.level2 }} />
                <span style={{ fontSize: 11, color: '#666' }}>二级 ({mockEfficiencyStats.level2.ratio}%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: efficiencyLevelColors.level3 }} />
                <span style={{ fontSize: 11, color: '#666' }}>三级 ({mockEfficiencyStats.level3.ratio}%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: efficiencyLevelColors.levelBelow }} />
                <span style={{ fontSize: 11, color: '#666' }}>三级以下 ({mockEfficiencyStats.levelBelow.ratio}%)</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={14}>
          <Card size="small" title="AI能耗优化建议" style={{ borderRadius: 8, height: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {suggestions.map((suggestion) => (
                <Card 
                  key={suggestion.id} 
                  size="small" 
                  style={{ 
                    borderRadius: 6, 
                    borderLeft: '3px solid #3b82f6',
                    margin: 0,
                  }}
                >
                  <div style={{ fontSize: 12, color: '#333', marginBottom: 8 }}>
                    💡 {suggestion.content}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: '#999' }}>
                      预计优化：<span style={{ color: '#22c55e', fontWeight: 500 }}>≈ {suggestion.estimatedSaving.toLocaleString()} kWh/月</span>
                      <span style={{ marginLeft: 4, color: '#666' }}>({suggestion.savingRatio}%)</span>
                    </span>
                    {suggestion.status === 'adopted' && (
                      <Tag color="green" icon={<CheckCircleOutlined />} style={{ fontSize: 10 }}>已采纳</Tag>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Card size="small" title="设备能效等级列表" style={{ borderRadius: 8 }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#666' }}>设备类型：</span>
            <Select
              value={selectedType}
              onChange={setSelectedType}
              style={{ width: 140 }}
              size="small"
              options={[
                { value: 'all', label: '全部' },
                ...deviceTypes.map(type => ({ value: type, label: type })),
              ]}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#666' }}>能效等级：</span>
            <Select
              value={selectedLevel}
              onChange={setSelectedLevel}
              style={{ width: 140 }}
              size="small"
              options={[
                { value: 'all', label: '全部' },
                { value: 'level1', label: '一级' },
                { value: 'level2', label: '二级' },
                { value: 'level3', label: '三级' },
                { value: 'levelBelow', label: '三级以下' },
              ]}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#666' }}>排序：</span>
            <Dropdown
              menu={{
                items: [
                  { key: 'efficiencyIndex', label: '能效指标' },
                ],
                onClick: (e) => {
                  if (sortField === e.key) {
                    setSortOrder(sortOrder === 'ascend' ? 'descend' : 'ascend');
                  } else {
                    setSortField(e.key);
                    setSortOrder('ascend');
                  }
                },
              }}
            >
              <Button size="small">
                能效指标 {sortOrder === 'ascend' ? '↑' : '↓'}
              </Button>
            </Dropdown>
          </div>
        </div>
        <Table
          columns={efficiencyColumns}
          dataSource={filteredEfficiencyData}
          rowKey="deviceId"
          pagination={{ pageSize: 10 }}
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

      <Modal
        title={`${selectedDeviceId ? mockDeviceEfficiency.find(d => d.deviceId === selectedDeviceId)?.deviceName : ''} - 能效趋势图`}
        open={showEfficiencyTrendModal}
        onCancel={() => setShowEfficiencyTrendModal(false)}
        width={800}
        footer={
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <DatePicker.RangePicker
              value={trendDateRange}
              onChange={(dates) => dates && setTrendDateRange([dates[0]!, dates[1]!])}
              style={{ width: 300 }}
            />
          </div>
        }
      >
        <div ref={trendChartRef} style={{ height: 400 }} />
      </Modal>
    </div>
  );
}