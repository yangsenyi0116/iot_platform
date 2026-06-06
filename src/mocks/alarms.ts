import type { Alarm, AlarmRule } from '../types';
import { mockDevices } from './devices';

export const mockAlarms: Alarm[] = [
  {
    id: 'alarm-001',
    deviceId: 'dev-004',
    deviceName: '焊接机器人-B2',
    pointId: 'p-005',
    pointName: '温度传感器',
    type: 'alarm',
    message: '设备温度超过告警阈值，当前温度92°C',
    timestamp: Date.now() - 1000 * 60 * 5,
    confirmed: false,
  },
  {
    id: 'alarm-002',
    deviceId: 'dev-007',
    deviceName: '测试设备-T1',
    pointId: 'p-011',
    pointName: '温度传感器',
    type: 'alarm',
    message: '设备温度过高，当前温度88°C',
    timestamp: Date.now() - 1000 * 60 * 2,
    confirmed: false,
  },
  {
    id: 'alarm-003',
    deviceId: 'dev-002',
    deviceName: 'CNC加工中心-A2',
    pointId: 'p-002',
    pointName: '振动传感器',
    type: 'warning',
    message: '设备振动接近预警阈值，当前0.32mm/s',
    timestamp: Date.now() - 1000 * 60 * 15,
    confirmed: true,
  },
  {
    id: 'alarm-004',
    deviceId: 'dev-007',
    deviceName: '测试设备-T1',
    pointId: 'p-012',
    pointName: '振动传感器',
    type: 'warning',
    message: '设备振动偏高，当前0.45mm/s',
    timestamp: Date.now() - 1000 * 60 * 1,
    confirmed: false,
  },
];

export const mockAlarmRules: AlarmRule[] = [
  { id: 'rule-001', name: '温度告警规则', pointId: 'p-001', condition: 'gt', threshold: 85, level: 'alarm', enabled: true },
  { id: 'rule-002', name: '温度预警规则', pointId: 'p-001', condition: 'gt', threshold: 75, level: 'warning', enabled: true },
  { id: 'rule-003', name: '振动告警规则', pointId: 'p-002', condition: 'gt', threshold: 0.5, level: 'alarm', enabled: true },
  { id: 'rule-004', name: '振动预警规则', pointId: 'p-002', condition: 'gt', threshold: 0.3, level: 'warning', enabled: true },
];

const alarmMessages = [
  { type: 'alarm' as const, messages: ['设备温度过高', '设备振动超标', '设备压力超限', '设备电流异常', '设备通讯中断'] },
  { type: 'warning' as const, messages: ['设备温度接近阈值', '设备振动偏高', '设备性能下降', '建议进行维护', '设备运行时间过长'] },
];

export const generateRandomAlarm = (): Alarm => {
  const randomDevice = mockDevices[Math.floor(Math.random() * mockDevices.length)];
  const alarmType = Math.random() > 0.7 ? 'alarm' : 'warning';
  const typeMessages = alarmMessages.find(a => a.type === alarmType)?.messages || [];
  const message = typeMessages[Math.floor(Math.random() * typeMessages.length)];
  
  return {
    id: `alarm-${Date.now()}`,
    deviceId: randomDevice.id,
    deviceName: randomDevice.name,
    pointId: `p-${String(Math.floor(Math.random() * 12) + 1).padStart(3, '0')}`,
    pointName: Math.random() > 0.5 ? '温度传感器' : '振动传感器',
    type: alarmType,
    message: `${message}，设备: ${randomDevice.name}`,
    timestamp: Date.now(),
    confirmed: false,
  };
};
