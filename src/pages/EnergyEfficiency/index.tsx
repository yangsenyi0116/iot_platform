import { useState, useRef, useEffect, useMemo } from 'react';
import { Card, Table, Button, Tag, Select, Dropdown } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { mockEfficiencyStats, mockDeviceEfficiency, efficiencyLevelLabels, efficiencyLevelColors } from '../../mocks/energy';
import type { DeviceEfficiency, EfficiencyLevel } from '../../types';
import DeviceDetailModal from '../DeviceManagement/DeviceDetailModal';

export default function EnergyEfficiency() {
  const [selectedLevel, setSelectedLevel] = useState<EfficiencyLevel | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('efficiencyIndex');
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend'>('ascend');
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  const deviceTypes = useMemo(() => {
    const types = [...new Set(mockDeviceEfficiency.map(d => d.deviceType))];
    return types;
  }, []);

  const filteredData = useMemo(() => {
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
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
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

      chartInstance.current.setOption(option);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  const handleDeviceClick = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setIsDetailModalVisible(true);
  };

  const handleExport = () => {
    const headers = ['设备名称', '设备类型', '能耗(kWh)', '运行时数', '能效指标', '能效等级'];
    const rows = filteredData.map(d => [
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

  const columns = [
    { 
      title: '设备名称', 
      dataIndex: 'deviceName', 
      key: 'deviceName', 
      render: (name: string, record: DeviceEfficiency) => (
        <a onClick={() => handleDeviceClick(record.deviceId)} style={{ cursor: 'pointer' }}>{name}</a>
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
      render: (val: number) => `${val}`,
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
        <Button size="small" onClick={() => handleDeviceClick(record.deviceId)}>详情</Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>能效计算</h2>
        <Button icon={<ExportOutlined />} size="small" onClick={handleExport}>导出</Button>
      </div>

      <Card size="small" title="能效等级设备占比" style={{ borderRadius: 8, marginBottom: 16 }}>
        <div ref={chartRef} style={{ height: 300 }} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, background: efficiencyLevelColors.level1 }} />
            <span style={{ fontSize: 12, color: '#666' }}>一级能效 (25%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, background: efficiencyLevelColors.level2 }} />
            <span style={{ fontSize: 12, color: '#666' }}>二级能效 (42%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, background: efficiencyLevelColors.level3 }} />
            <span style={{ fontSize: 12, color: '#666' }}>三级能效 (28%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, background: efficiencyLevelColors.levelBelow }} />
            <span style={{ fontSize: 12, color: '#666' }}>三级以下 (5%)</span>
          </div>
        </div>
      </Card>

      <Card size="small" title="设备能效等级列表" style={{ borderRadius: 8 }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#666' }}>设备类型：</span>
            <Select
              value={selectedType}
              onChange={setSelectedType}
              style={{ width: 150 }}
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
              style={{ width: 150 }}
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
          columns={columns}
          dataSource={filteredData}
          rowKey="deviceId"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <DeviceDetailModal
        open={isDetailModalVisible}
        onClose={() => setIsDetailModalVisible(false)}
        deviceId={selectedDeviceId || ''}
      />
    </div>
  );
}
