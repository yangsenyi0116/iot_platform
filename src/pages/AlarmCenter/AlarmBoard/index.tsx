import { Row, Col, Card, Statistic } from 'antd';
import ReactECharts from 'echarts-for-react';
import { useAppStore } from '../../../stores';

export default function AlarmBoard() {
  const { alarms } = useAppStore();
  
  const alarmCount = alarms.length;
  const unconfirmedCount = alarms.filter(a => !a.confirmed).length;
  const alarmTypeCount = alarms.filter(a => a.type === 'alarm').length;
  const warningTypeCount = alarms.filter(a => a.type === 'warning').length;
  
  const chartOption = {
    title: { text: '告警统计', left: 'center', fontSize: 14 },
    tooltip: { trigger: 'item' },
    legend: { orient: 'horizontal', bottom: '0%' },
    series: [{
      name: '告警类型',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: {
        label: { show: true, fontSize: 18, fontWeight: 'bold' },
      },
      data: [
        { value: alarmTypeCount, name: '告警', itemStyle: { color: '#FF4D4F' } },
        { value: warningTypeCount, name: '预警', itemStyle: { color: '#FAAD14' } },
      ],
    }],
  };

  const timelineOption = {
    title: { text: '告警趋势', left: 'center', fontSize: 14 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    },
    yAxis: { type: 'value', min: 0 },
    series: [{
      data: [2, 1, 3, 5, 4, 6, 3],
      type: 'line',
      smooth: true,
      areaStyle: { color: 'rgba(255, 77, 79, 0.2)' },
      lineStyle: { color: '#FF4D4F' },
    }],
  };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="告警总数" value={alarmCount} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="未确认" value={unconfirmedCount} valueStyle={{ color: '#FF4D4F' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="告警" value={alarmTypeCount} valueStyle={{ color: '#FF4D4F' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="预警" value={warningTypeCount} valueStyle={{ color: '#FAAD14' }} />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col span={12}>
          <Card title="告警类型分布">
            <ReactECharts option={chartOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="告警趋势">
            <ReactECharts option={timelineOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}