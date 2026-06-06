import { useEffect, useState } from 'react';
import { Layout } from 'antd';
import { useAppStore } from '../../stores';

const { Footer } = Layout;

export default function CustomFooter() {
  const { gateways, alarms, lastUpdateTime, updateIntervalId } = useAppStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const onlineGateways = gateways.filter(g => g.status === 'online').length;
  const activeAlarms = alarms.filter(a => !a.confirmed).length;
  
  return (
    <Footer style={{ 
      padding: '8px 24px', 
      background: '#f0f2f5', 
      borderTop: '1px solid #e8e8e8',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: 12,
      color: '#666',
    }}>
      <div style={{ display: 'flex', gap: 24 }}>
        <span>网关在线: {onlineGateways}/{gateways.length}</span>
        <span>最新告警: {activeAlarms}</span>
        <span style={{ color: updateIntervalId ? '#52C41A' : '#FF4D4F' }}>
          {updateIntervalId ? '模拟运行中' : '模拟已停止'}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 24 }}>
        <span>最后更新: {new Date(lastUpdateTime).toLocaleTimeString('zh-CN')}</span>
        <span>系统时间: {currentTime.toLocaleTimeString('zh-CN')}</span>
      </div>
    </Footer>
  );
}
