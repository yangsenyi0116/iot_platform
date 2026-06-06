import type { Gateway, Device, DataPoint } from '../types';

export const simulateGatewayStatus = (gateway: Gateway): Gateway => {
  const random = Math.random();
  let newStatus = gateway.status;
  
  if (gateway.status === 'online') {
    if (random < 0.05) {
      newStatus = 'error';
    } else if (random < 0.1) {
      newStatus = 'offline';
    }
  } else if (gateway.status === 'offline' || gateway.status === 'error') {
    if (random < 0.3) {
      newStatus = 'online';
    }
  }
  
  if (newStatus === 'online') {
    return {
      ...gateway,
      status: newStatus,
      cpu: Math.max(10, Math.min(90, gateway.cpu + (Math.random() - 0.5) * 10)),
      memory: Math.max(20, Math.min(95, gateway.memory + (Math.random() - 0.5) * 8)),
      dataRate: Math.max(0, Math.floor(gateway.dataRate + (Math.random() - 0.5) * 20)),
    };
  }
  
  return {
    ...gateway,
    status: newStatus,
    cpu: newStatus === 'error' ? Math.random() * 30 + 70 : 0,
    memory: newStatus === 'error' ? Math.random() * 20 + 80 : 0,
    dataRate: 0,
  };
};

export const simulateDeviceData = (device: Device): Device => {
  if (device.status === 'offline') {
    return device;
  }
  
  const tempChange = (Math.random() - 0.5) * 10;
  const vibChange = (Math.random() - 0.5) * 0.1;
  
  const newTemp = Math.max(40, Math.min(100, device.temperature + tempChange));
  const newVib = Math.max(0.05, Math.min(0.8, device.vibration + vibChange));
  
  let newStatus = device.status;
  if (newTemp >= 85 || newVib >= 0.5) {
    newStatus = 'alarm';
  } else if (newTemp >= 75 || newVib >= 0.3) {
    newStatus = newStatus !== 'alarm' ? 'warning' : 'alarm';
  } else {
    newStatus = 'normal';
  }
  
  const healthScore = Math.max(0, Math.min(100, 
    100 - (newTemp - 60) * 1.5 - newVib * 50
  ));
  
  return {
    ...device,
    temperature: Math.round(newTemp * 10) / 10,
    vibration: Math.round(newVib * 100) / 100,
    status: newStatus,
    healthScore: Math.round(healthScore),
  };
};

export const simulateDataPoint = (point: DataPoint): DataPoint => {
  if (point.currentValue === 0) {
    return point;
  }
  
  const range = (point.maxValue - point.minValue) * 0.1;
  const change = (Math.random() - 0.5) * range;
  const newValue = Math.max(point.minValue, Math.min(point.maxValue, point.currentValue + change));
  
  return {
    ...point,
    currentValue: Math.round(newValue * 100) / 100,
    timestamp: Date.now(),
  };
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    online: '#52C41A',
    normal: '#52C41A',
    warning: '#FAAD14',
    alarm: '#FF4D4F',
    offline: '#8C8C8C',
    error: '#FF4D4F',
  };
  return colors[status] || '#8C8C8C';
};

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};
