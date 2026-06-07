import { useState, useRef, useEffect, useMemo } from 'react';
import { Card, Row, Col, Tag, Button, List } from 'antd';
import { ApiOutlined, SettingOutlined, AlertOutlined, HeartOutlined, FileTextOutlined, LineChartOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';

const mockDevices = [
  { id: 'dev-001', name: '设备C-001', healthScore: 72, remainingDays: 23, status: 'warning', reason: '主轴振动值偏高' },
  { id: 'dev-002', name: '设备CNC-A01', healthScore: 85, remainingDays: 45, status: 'normal', reason: '运行状态良好' },
  { id: 'dev-003', name: '设备PUMP-B02', healthScore: 68, remainingDays: 15, status: 'danger', reason: '液压系统压力异常' },
  { id: 'dev-004', name: '设备MOTOR-D03', healthScore: 78, remainingDays: 30, status: 'warning', reason: '电机温度偏高' },
];

const mockDiagnosisResults = [
  { id: '1', deviceName: 'CNC-A003', issue: '主轴轴承磨损', confidence: 95.2, type: 'warning', dataSource: '主轴振动测点 振动值 12.5mm/s', cause: '长期高速运转导致轴承内圈疲劳剥落', suggestion: '更换主轴轴承，建议72小时内处理', timestamp: Date.now() - 3600000 },
  { id: '2', deviceName: 'PUMP-B012', issue: '密封泄漏', confidence: 82.7, type: 'warning', dataSource: '液压油液位测点 液位值 35%', cause: '密封圈老化，温度循环加速材料退化', suggestion: '更换密封圈，检查密封槽磨损情况', timestamp: Date.now() - 7200000 },
  { id: '3', deviceName: 'MACHINE-B005', issue: '液压系统压力异常', confidence: 78.5, type: 'warning', dataSource: '液压压力测点 压力值 18MPa', cause: '液压油泄漏或泵体磨损', suggestion: '检查液压油位，排查泄漏点', timestamp: Date.now() - 10800000 },
  { id: '4', deviceName: 'FAN-C001', issue: '风机振动超标', confidence: 91.3, type: 'warning', dataSource: '风机振动测点 振动值 8.8mm/s', cause: '叶轮不平衡或轴承损坏', suggestion: '检查叶轮平衡，更换轴承', timestamp: Date.now() - 14400000 },
];

const mockModelStatus = [
  { name: '预测模型', version: 'v3.2.1', status: 'running', responseTime: '45ms', todayCalls: 1283 },
  { name: '诊断模型', version: 'v2.0.0', status: 'running', responseTime: '128ms', todayCalls: 892 },
  { name: '异常检测', version: 'v1.5.3', status: 'training', responseTime: '67ms', todayCalls: 3456 },
  { name: '健康评分', version: 'v4.1.0', status: 'running', responseTime: '23ms', todayCalls: 5678 },
];

export default function PredictiveMaintenance() {
  const [expandedDevice, setExpandedDevice] = useState<string | null>(null);
  const chartRefs = useRef<Record<string, HTMLDivElement>>({});
  const chartInstances = useRef<Record<string, echarts.ECharts | null>>({});

  const sortedDevices = useMemo(() => {
    return [...mockDevices].sort((a, b) => a.remainingDays - b.remainingDays);
  }, []);

  useEffect(() => {
    Object.keys(chartRefs.current).forEach(deviceId => {
      if (chartRefs.current[deviceId] && expandedDevice === deviceId) {
        chartInstances.current[deviceId] = echarts.init(chartRefs.current[deviceId]);
        updateChart(deviceId);
      }
    });

    return () => {
      Object.values(chartInstances.current).forEach(instance => {
        instance?.dispose();
      });
    };
  }, [expandedDevice]);

  useEffect(() => {
    if (expandedDevice && chartInstances.current[expandedDevice]) {
      updateChart(expandedDevice);
    }
  }, [expandedDevice]);

  const updateChart = (deviceId: string) => {
    const chart = chartInstances.current[deviceId];
    if (!chart) return;

    const device = mockDevices.find(d => d.id === deviceId);
    if (!device) return;

    const healthData = generateHealthData(device.healthScore);

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['实际健康度', '预测健康度'],
        top: 0,
        textStyle: { color: '#666', fontSize: 10 },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '20%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: healthData.xLabels,
        axisLine: { lineStyle: { color: '#e8e8e8' } },
        axisLabel: { color: '#666', fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLine: { lineStyle: { color: '#e8e8e8' } },
        axisLabel: { color: '#666', fontSize: 10 },
        splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
      },
      series: [
        {
          name: '实际健康度',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: healthData.actualData,
          lineStyle: { color: '#10b981', width: 2 },
          areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0.05)' },
          ]) },
          markLine: {
            silent: true,
            lineStyle: { color: '#ef4444', width: 1, type: 'solid' },
            data: [{ yAxis: 60 }],
          },
        },
        {
          name: '预测健康度',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: healthData.predictedData,
          lineStyle: { color: '#f59e0b', width: 2, type: 'dashed' },
          areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 158, 11, 0.2)' },
            { offset: 1, color: 'rgba(245, 158, 11, 0.05)' },
          ]) },
        },
      ],
    };

    chart.setOption(option);
  };

  const generateHealthData = (currentScore: number) => {
    const days = 30;
    const xLabels: string[] = [];
    const actualData: (number | null)[] = [];
    const predictedData: (number | null)[] = [];

    const today = new Date();
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (days - i - 1));
      xLabels.push(`${date.getMonth() + 1}/${date.getDate()}`);

      if (i <= days / 2) {
        const val = currentScore + (days / 2 - i) * 0.5 + Math.random() * 2 - 1;
        actualData.push(Math.min(100, Math.max(0, val)));
        predictedData.push(null);
      } else {
        const val = currentScore - (i - days / 2) * (currentScore / (days / 2));
        actualData.push(null);
        predictedData.push(Math.min(100, Math.max(0, val)));
      }
    }

    const midIndex = Math.floor(days / 2);
    if (actualData[midIndex] !== null) {
      predictedData[midIndex] = actualData[midIndex];
    }

    return { xLabels, actualData, predictedData };
  };

  const statusColors = {
    danger: '#ef4444',
    warning: '#f59e0b',
    normal: '#10b981',
  };

  

  return (
    <div style={{ minHeight: '100%', padding: 16, background: '#f5f5f5' }}>
      <Row gutter={12} style={{ marginBottom: 12 }}>
        <Col span={6}>
          <Card size="small" style={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ padding: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, background: '#f0f5ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ApiOutlined style={{ fontSize: 16, color: '#6366f1' }} />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>156</div>
                  <div style={{ color: '#999', fontSize: 10 }}>预测性维护</div>
                </div>
              </div>
              <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#999', fontSize: 10 }}>准确率</span>
                <span style={{ color: '#6366f1', fontWeight: 'bold', fontSize: 11 }}>94.2%</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ padding: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, background: '#ecfeff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SettingOutlined style={{ fontSize: 16, color: '#06b6d4' }} />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>89</div>
                  <div style={{ color: '#999', fontSize: 10 }}>智能诊断</div>
                </div>
              </div>
              <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#999', fontSize: 10 }}>匹配率</span>
                <span style={{ color: '#06b6d4', fontWeight: 'bold', fontSize: 11 }}>91.5%</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ padding: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, background: '#fff7ed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertOutlined style={{ fontSize: 16, color: '#f97316' }} />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>34</div>
                  <div style={{ color: '#999', fontSize: 10 }}>异常检测</div>
                </div>
              </div>
              <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#999', fontSize: 10 }}>误报率</span>
                <span style={{ color: '#f97316', fontWeight: 'bold', fontSize: 11 }}>3.2%</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ padding: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, background: '#ecfdf5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HeartOutlined style={{ fontSize: 16, color: '#10b981' }} />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>1,286</div>
                  <div style={{ color: '#999', fontSize: 10 }}>台设备已覆盖</div>
                </div>
              </div>
              <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#999', fontSize: 10 }}>健康评分</span>
                <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: 11 }}>85.6%</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card 
        style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
        title={<span style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>AI 诊断结果</span>}
      >
        <List
          dataSource={mockDiagnosisResults}
          renderItem={(result) => (
            <List.Item
              key={result.id}
              style={{ 
                padding: 16, 
                background: '#fff',
                borderRadius: 8,
                border: `1px solid ${result.type === 'warning' ? '#fef3c7' : '#fee2e2'}`,
                marginBottom: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                  <div style={{ 
                    width: 8, 
                    height: 32, 
                    background: result.type === 'warning' ? '#f59e0b' : '#ef4444',
                    borderRadius: 4,
                  }} />
                  <div>
                    <span style={{ fontWeight: 'bold', fontSize: 14, color: '#333' }}>{result.deviceName}</span>
                    <Tag 
                      color={result.type === 'warning' ? 'gold' : 'red'} 
                      style={{ marginLeft: 8, padding: '2px 8px' }}
                    >
                      {result.issue}
                    </Tag>
                    <span style={{ color: '#1890ff', fontWeight: 'bold', fontSize: 13, marginLeft: 8 }}>{result.confidence}%</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <span style={{ fontSize: 11, color: '#999', marginRight: 8 }}>数据来源：</span>
                    <span style={{ fontSize: 12, color: '#666' }}>{result.dataSource}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: '#999', marginRight: 8 }}>根因分析：</span>
                    <span style={{ fontSize: 12, color: '#666' }}>{result.cause}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: '#999', marginRight: 8 }}>处理建议：</span>
                    <span style={{ fontSize: 12, color: '#1890ff' }}>{result.suggestion}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
                <Button 
                  type="primary" 
                  size="small" 
                  icon={<FileTextOutlined />}
                  style={{ borderRadius: 6, padding: '4px 12px' }}
                >
                  发起工单
                </Button>
                <Button 
                  size="small"
                  style={{ borderRadius: 6, padding: '4px 12px', borderColor: '#d9d9d9' }}
                >
                  忽略
                </Button>
              </div>
            </List.Item>
          )}
        />
      </Card>

      <Row gutter={16}>
        <Col span={16}>
          <Card 
            title={<span style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>RUL 预测面板</span>}
            style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
          >
            <List
              dataSource={sortedDevices}
              renderItem={(device) => (
                <div key={device.id} style={{ marginBottom: 8 }}>
                  <List.Item
                    style={{ 
                      padding: 12, 
                      background: '#fafafa',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ 
                        width: 8, 
                        height: 40, 
                        background: statusColors[device.status as keyof typeof statusColors],
                        borderRadius: 4,
                      }} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>{device.name}</div>
                        <div style={{ fontSize: 12, color: '#8b5cf6', fontWeight: '500' }}>
                          预计在 <span style={{ fontWeight: 'bold', color: '#f59e0b', fontSize: 14, margin: '0 2px' }}>{device.remainingDays}天</span> 后健康度降至60%以下，建议安排预防性维护。
                        </div>
                      </div>
                    </div>
                    <Button 
                      icon={<LineChartOutlined />} 
                      size="small"
                      shape="circle"
                      onClick={() => setExpandedDevice(expandedDevice === device.id ? null : device.id)}
                    />
                  </List.Item>
                  {expandedDevice === device.id && (
                    <div style={{ padding: 16, background: '#fff', border: '1px solid #f0f0f0', borderRadius: '0 0 8px 8px' }}>
                      <div ref={(el) => { if (el) chartRefs.current[device.id] = el; }} style={{ height: 200 }} />
                    </div>
                  )}
                </div>
              )}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card 
            title={<span style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>模型状态监控</span>}
            size="small"
            style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          >
            <Row gutter={8}>
              {mockModelStatus.map(model => (
                <Col span={12} key={model.name}>
                  <div 
                    style={{ 
                      padding: 8, 
                      background: '#fafafa',
                      borderRadius: 6,
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 'bold', fontSize: 11, color: '#333' }}>{model.name}</span>
                      <Tag color={model.status === 'running' ? 'green' : 'gold'}>
                        {model.status === 'running' ? '运行中' : '训练中'}
                      </Tag>
                    </div>
                    <div style={{ fontSize: 9, color: '#999', marginBottom: 3 }}>{model.version}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                      <div>
                        <span style={{ color: '#999' }}>调用</span>
                        <div style={{ fontWeight: 'bold', color: '#333' }}>{model.todayCalls}</div>
                      </div>
                      <div>
                        <span style={{ color: '#999' }}>延迟</span>
                        <div style={{ fontWeight: 'bold', color: '#1890ff' }}>{model.responseTime}</div>
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
