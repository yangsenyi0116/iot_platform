import { useMemo } from 'react';
import { SettingOutlined, LineChartOutlined, ToolOutlined, DownOutlined, MinusOutlined } from '@ant-design/icons';
import { Card, Row, Col, Progress, Tag, List, Button } from 'antd';
import ReactECharts from 'echarts-for-react';
import { useAppStore } from '../../stores';
import type { Device } from '../../types';

export default function PredictiveMaintenance() {
  const { devices, knowledgeBase } = useAppStore();
  
  const normalDevices = devices.filter(d => d.status === 'normal');
  const warningDevices = devices.filter(d => d.status === 'warning');
  const alarmDevices = devices.filter(d => d.status === 'alarm');
  
  const avgHealthScore = useMemo(() => {
    const runningDevices = devices.filter(d => d.status !== 'offline');
    if (runningDevices.length === 0) return 0;
    return runningDevices.reduce((sum, d) => sum + d.healthScore, 0) / runningDevices.length;
  }, [devices]);
  
  const predictRemainingLife = (device: Device): number => {
    const baseLife = 10000;
    const usageFactor = (device.healthScore / 100) * 0.8 + 0.2;
    return Math.round(baseLife * usageFactor);
  };
  
  const healthRadarOption = {
    title: { text: '设备健康指标', left: 'center', fontSize: 14 },
    tooltip: {},
    legend: { data: ['综合评分'], bottom: 0 },
    radar: {
      indicator: [
        { name: '温度', max: 100 },
        { name: '振动', max: 1 },
        { name: '健康', max: 100 },
        { name: '运行时长', max: 100 },
        { name: '维护频率', max: 100 },
      ],
    },
    series: [{
      type: 'radar',
      data: [{
        value: [72, 0.3, avgHealthScore, 85, 70],
        name: '综合评分',
        areaStyle: { color: 'rgba(24, 144, 255, 0.3)' },
        lineStyle: { color: '#1890ff' },
        itemStyle: { color: '#1890ff' },
      }],
    }],
  };
  
  const trendChartOption = {
    title: { text: '健康趋势预测', left: 'center', fontSize: 14 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    },
    yAxis: { type: 'value', min: 0, max: 100 },
    series: [{
      name: '健康评分',
      type: 'line',
      smooth: true,
      data: [88, 85, 82, 80, 78, 75, 72],
      lineStyle: { color: '#52c41a' },
      areaStyle: { color: 'rgba(82, 196, 26, 0.2)' },
    }],
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <MinusOutlined style={{ color: '#52C41A' }} />;
      case 'warning': return <DownOutlined style={{ color: '#FAAD14' }} />;
      case 'alarm': return <SettingOutlined style={{ color: '#FF4D4F' }} />;
      default: return <MinusOutlined style={{ color: '#8C8C8C' }} />;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>预测性维护</h2>
      </div>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <LineChartOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              <div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>{avgHealthScore.toFixed(1)}</div>
                <div style={{ color: '#666', fontSize: 12 }}>平均健康评分</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Tag color="green" style={{ fontSize: 24, borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {normalDevices.length}
              </Tag>
              <div>
                <div style={{ fontSize: 16 }}>正常运行</div>
                <div style={{ color: '#666', fontSize: 12 }}>{normalDevices.length} 台设备</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Tag color="gold" style={{ fontSize: 24, borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {warningDevices.length}
              </Tag>
              <div>
                <div style={{ fontSize: 16 }}>需要关注</div>
                <div style={{ color: '#666', fontSize: 12 }}>{warningDevices.length} 台设备</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Tag color="red" style={{ fontSize: 24, borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {alarmDevices.length}
              </Tag>
              <div>
                <div style={{ fontSize: 16 }}>需要维护</div>
                <div style={{ color: '#666', fontSize: 12 }}>{alarmDevices.length} 台设备</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="健康雷达图">
            <ReactECharts option={healthRadarOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="趋势预测">
            <ReactECharts option={trendChartOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>
      
      <Card title="设备预测列表" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          {devices.filter(d => d.status !== 'offline').map(device => (
            <Col span={8} key={device.id}>
              <Card 
                bordered={false} 
                style={{ marginBottom: 16 }}
                className={device.status === 'alarm' ? 'alarm-card' : device.status === 'warning' ? 'warning-card' : ''}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontWeight: 'bold' }}>{device.name}</span>
                  {getStatusIcon(device.status)}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#666', fontSize: 12 }}>健康评分</span>
                    <span style={{ color: device.healthScore >= 80 ? '#52C41A' : device.healthScore >= 60 ? '#FAAD14' : '#FF4D4F' }}>
                      {device.healthScore}分
                    </span>
                  </div>
                  <Progress 
                    percent={device.healthScore} 
                    strokeColor={{
                      '0%': '#FF4D4F',
                      '50%': '#FAAD14',
                      '100%': '#52C41A',
                    }}
                    size="small"
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div style={{ color: '#666', fontSize: 12 }}>温度</div>
                    <div>{device.temperature.toFixed(1)}°C</div>
                  </div>
                  <div>
                    <div style={{ color: '#666', fontSize: 12 }}>振动</div>
                    <div>{device.vibration.toFixed(2)}mm/s</div>
                  </div>
                  <div>
                    <div style={{ color: '#666', fontSize: 12 }}>剩余寿命</div>
                    <div>{predictRemainingLife(device)}h</div>
                  </div>
                </div>
                <Button type="primary" size="small" block>查看详情</Button>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
      
      <Card title="维护建议">
        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={knowledgeBase.slice(0, 6)}
          renderItem={item => (
            <List.Item>
              <Card hoverable>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <ToolOutlined style={{ color: '#1890ff' }} />
                  <span style={{ fontWeight: 'bold' }}>{item.title}</span>
                </div>
                <div style={{ color: '#666', fontSize: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.content.replace(/[#*]/g, '').slice(0, 100)}...
                </div>
                <div style={{ marginTop: 8 }}>
                  <Tag color={item.category === 'fault' ? 'red' : item.category === 'maintenance' ? 'blue' : 'green'}>
                    {{ fault: '故障处理', maintenance: '维护指南', manual: '操作手册' }[item.category]}
                  </Tag>
                </div>
              </Card>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
