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

export interface WorkOrder {
  id: string;
  code: string;
  title: string;
  type: 'alarm_repair' | 'predictive_maintenance' | 'routine_inspection' | 'installation' | 'migration' | 'scrap';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  status: 'pending' | 'in_progress' | 'pending_review' | 'completed' | 'cancelled';
  deviceId: string;
  deviceName: string;
  alarmId?: string;
  assignee: string;
  plannedFinishTime: string;
  actualFinishTime?: string;
  description: string;
  attachments: string[];
  timeline: WorkOrderLog[];
  createdAt: string;
}

export interface WorkOrderLog {
  id: string;
  action: string;
  operator: string;
  timestamp: string;
  description?: string;
}

export interface GraphNode {
  id: string;
  name: string;
  type: 'domain' | 'deviceType' | 'device' | 'faultCode' | 'case' | 'document' | 'component' | 'fault_mode' | 'maintenance_strategy' | 'spare_part' | 'symptom';
  properties?: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: 'belongs_to' | 'instance_of' | 'has_fault' | 'solution' | 'references' | 'similar_to' | 'has_component' | 'has_symptom' | 'needs_spare';
}

export interface AIResponse {
  question: string;
  answer: string;
  relatedCases: string[];
  relatedDocuments: string[];
  suggestedWorkOrder?: string;
}

export interface Annotation {
  id: string;
  knowledgeId: string;
  type: 'comment' | 'rating' | 'correction';
  content: string;
  rating?: number;
  author: string;
  createdAt: string;
  replies?: Annotation[];
}

export interface KnowledgeItemExt extends KnowledgeItem {
  annotations: Annotation[];
  rating: number;
  ratingCount: number;
}
