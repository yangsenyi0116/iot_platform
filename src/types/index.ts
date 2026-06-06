export interface Gateway {
  id: string;
  name: string;
  ip: string;
  protocol: string;
  status: 'online' | 'offline' | 'error';
  deviceCount: number;
  pointCount: number;
  dataRate: number;
  cpu: number;
  memory: number;
}

export interface Device {
  id: string;
  code: string;
  name: string;
  model: string;
  status: 'normal' | 'warning' | 'alarm' | 'offline';
  location: string;
  gatewayId: string;
  boundPoints: string[];
  lifecycleStage: string;
  healthScore: number;
  temperature: number;
  vibration: number;
  hasStartStopPoint: boolean;
  cumulativeOperatingHours: number;
  lastStartTime: number;
  currentRunHours: number;
  faultHours: number;
}

export interface DataPoint {
  id: string;
  name: string;
  unit: string;
  currentValue: number;
  timestamp: number;
  gatewayId: string;
  deviceId?: string;
  minValue: number;
  maxValue: number;
  warningThreshold: number;
  alarmThreshold: number;
}

export interface Alarm {
  id: string;
  deviceId: string;
  deviceName: string;
  pointId: string;
  pointName: string;
  type: 'warning' | 'alarm';
  message: string;
  timestamp: number;
  confirmed: boolean;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  category: 'fault' | 'maintenance' | 'manual';
  content: string;
  deviceIds: string[];
  attachments: string[];
}

export interface GatewayConfig {
  id: string;
  name: string;
  ip: string;
  port: number;
  protocol: string;
  description: string;
}

export interface AlarmRule {
  id: string;
  name: string;
  pointId: string;
  condition: 'gt' | 'lt' | 'eq';
  threshold: number;
  level: 'warning' | 'alarm';
  enabled: boolean;
}

export interface DeviceLifecycleEvent {
  stage: string;
  date: string;
  description: string;
}

export interface DeviceEvent {
  id: string;
  deviceId: string;
  deviceName: string;
  type: 'alarm' | 'warning' | 'info' | 'maintenance';
  message: string;
  timestamp: number;
  resolved: boolean;
}

export type LifecycleStage = 'purchased' | 'warehoused' | 'installed' | 'running' | 'maintenance' | 'retired';
