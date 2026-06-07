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
  deviceName: string;
  dataType: string;
  frequency: string;
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

export type StockStatus = 'out' | 'critical' | 'warning' | 'normal' | 'overstock';

export interface SparePart {
  id: string;
  name: string;
  code: string;
  quantity: number;
  unit: string;
  stock: number;
  hasStock: boolean;
  location?: string;
  actualQuantity?: number;
  issued?: boolean;
  issuedQuantity?: number;
  issuedBy?: string;
  issuedAt?: string;
}

export interface SparePartItem {
  id: string;
  name: string;
  code: string;
  stock: number;
  safetyStock: number;
  status: StockStatus;
  warehouse: string;
  unit: string;
  category: string;
  lastIssuedDate: string;
  unitPrice: number;
  totalValue: number;
  issueRecords: IssueRecord[];
}

export interface IssueRecord {
  id: string;
  date: string;
  quantity: number;
  operator: string;
  workOrderCode: string;
  trend: 'up' | 'down' | 'stable';
}

export interface AIInventoryAnalysis {
  healthScore: number;
  healthLevel: 'excellent' | 'good' | 'fair' | 'poor';
  overstockRatio: number;
  outOfStockRatio: number;
  turnoverRate: number;
  suggestions: Array<{
    id: string;
    type: 'overstock' | 'shortage' | 'procurement' | 'trend' | 'capital';
    title: string;
    content: string;
    affectedParts: string[];
    estimatedImpact?: string;
    actions: Array<{
      label: string;
      actionType: 'viewList' | 'createWorkOrder' | 'purchase' | 'viewDevices' | 'adopt' | 'ignore';
      params?: any;
    }>;
  }>;
  procurementOptimizations: Array<{
    partId: string;
    partName: string;
    originalSuggested: number;
    optimizedSuggested: number;
    reason: string;
  }>;
}

export interface ProcurementSuggestion {
  id: string;
  partId: string;
  partName: string;
  partCode: string;
  currentStock: number;
  safetyStock: number;
  status: StockStatus;
  suggestedQuantity: number;
  hasAIOptimization: boolean;
  aiReason?: string;
}

export interface SafetyNote {
  id: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  category: 'electrical' | 'mechanical' | 'chemical' | 'work_permit' | 'environment';
}

export interface MaintenanceStep {
  id: string;
  order: number;
  title: string;
  description: string;
  estimatedTime: string;
}

export interface AIRecommendation {
  recommendedSolution: string;
  confidence: number;
  steps: MaintenanceStep[];
  relatedCases: HistoricalCase[];
}

export interface HistoricalCase {
  id: string;
  code: string;
  title: string;
  deviceName: string;
  problemDescription: string;
  solution: string;
  result: 'success' | 'partial' | 'failed';
  createdAt: string;
  similarity: number;
}

export type RepairResult = 'fully_repaired' | 'partially_repaired' | 'not_repaired';

export interface WorkOrder {
  id: string;
  code: string;
  title: string;
  type: 'alarm_repair' | 'predictive_maintenance' | 'routine_inspection' | 'installation' | 'migration' | 'scrap';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  status: 'pending' | 'pending_parts' | 'in_progress' | 'pending_review' | 'completed' | 'cancelled';
  deviceId: string;
  deviceName: string;
  alarmId?: string;
  assignee: string;
  reviewer?: string;
  plannedFinishTime: string;
  actualFinishTime?: string;
  description: string;
  attachments: string[];
  timeline: WorkOrderLog[];
  createdAt: string;
  spareParts?: SparePart[];
  safetyNotes?: SafetyNote[];
  aiRecommendation?: AIRecommendation;
  repairResult?: RepairResult;
  repairRemark?: string;
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

export interface BoundPoint {
  pointId: string;
  pointName: string;
  gatewayId: string;
  gatewayName: string;
  currentValue: number;
  unit: string;
  updateTime: string;
  status: 'normal' | 'warning' | 'alarm';
  thresholdWarning: number;
  thresholdAlarm: number;
}

export interface RunningStatus {
  isRunning: boolean;
  currentPower: number;
  loadRate: number;
  currentSpeed: number;
  cumulativeHours: number;
  currentSessionHours: number;
  monthHours: number;
  yearHours: number;
  startStopRecords: Array<{
    time: string;
    action: 'start' | 'stop';
  }>;
}

export interface RelatedKnowledge {
  id: string;
  title: string;
  type: 'faultCode' | 'case' | 'manual';
}

export interface DeviceDocument {
  id: string;
  name: string;
  uploadTime: string;
  url: string;
}

export interface RecentEvent {
  time: string;
  type: 'alarm' | 'warning' | 'start' | 'stop' | 'workOrder' | 'config' | 'maintenance' | 'info';
  description: string;
  source: string;
}

export interface MaintenanceRecord {
  time: string;
  workOrderId: string;
  workOrderCode: string;
  type: string;
  faultDescription: string;
  result: string;
  technician: string;
}

export interface DeviceDetail {
  basicInfo: {
    id: string;
    name: string;
    code: string;
    type: string;
    model: string;
    location: string;
    commissionDate: string;
    department: string;
    responsiblePerson: string;
    manufacturer: string;
    status: 'running' | 'stopped' | 'maintenance' | 'idle';
    gatewayId: string;
    gatewayName: string;
    healthScore: number;
  };
  boundPoints: BoundPoint[];
  runningStatus: RunningStatus;
  relatedKnowledge: RelatedKnowledge[];
  documents: DeviceDocument[];
  recentEvents: RecentEvent[];
  maintenanceRecords: MaintenanceRecord[];
}

export interface HistoryDataPoint {
  timestamp: number;
  value: number;
}

export interface EnergyOverview {
  totalEnergy: number;
  totalEnergyChange: number;
  greenEnergy: number;
  greenEnergyRatio: number;
  carbonEmission: number;
  carbonChange: number;
}

export interface EnergyCurveData {
  timePoints: string[];
  totalEnergy: number[];
  greenEnergy: number[];
}

export interface DeviceEnergyRank {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  energy: number;
  ratio: number;
}

export interface AIOptimizationSuggestion {
  id: string;
  content: string;
  estimatedSaving: number;
  savingRatio: number;
  relatedDeviceId?: string;
  relatedDeviceName?: string;
  status: 'pending' | 'adopted' | 'implemented';
}

export interface EnergyEfficiencyStats {
  level1: { count: number; ratio: number };
  level2: { count: number; ratio: number };
  level3: { count: number; ratio: number };
  levelBelow: { count: number; ratio: number };
}

export type EfficiencyLevel = 'level1' | 'level2' | 'level3' | 'levelBelow';

export interface DeviceEfficiency {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  energy: number;
  output: number;
  outputUnit: string;
  efficiencyIndex: number;
  level: EfficiencyLevel;
}
