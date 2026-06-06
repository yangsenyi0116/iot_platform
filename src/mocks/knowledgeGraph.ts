import type { GraphNode, GraphEdge } from '../types';

export const graphNodes: GraphNode[] = [
  { id: 'p1', name: '叶轮', type: 'spare_part', properties: { category: '转子组件' } },
  { id: 'p2', name: '轴承', type: 'spare_part', properties: { category: '支撑组件' } },
  { id: 'p3', name: '机械密封', type: 'spare_part', properties: { category: '密封组件' } },
  { id: 'p4', name: '轴承组件', type: 'spare_part', properties: { category: '支撑组件' } },
  
  { id: 'comp1', name: '离心泵C-001', type: 'device', properties: { status: 'normal' } },
  { id: 'comp2', name: '空压机A01', type: 'device', properties: { status: 'warning' } },
  { id: 'comp3', name: '风机F-003', type: 'device', properties: { status: 'normal' } },
  
  { id: 'part1', name: '叶轮', type: 'component', properties: { device: 'comp1' } },
  { id: 'part2', name: '轴承', type: 'component', properties: { device: 'comp1' } },
  { id: 'part3', name: '机械密封', type: 'component', properties: { device: 'comp1' } },
  
  { id: 'fault1', name: '轴承磨损', type: 'fault_mode', properties: { level: 'high' } },
  { id: 'fault2', name: '密封泄漏', type: 'fault_mode', properties: { level: 'high' } },
  { id: 'fault3', name: '振动异常', type: 'fault_mode', properties: { level: 'medium' } },
  
  { id: 'strategy1', name: '更换轴承', type: 'maintenance_strategy', properties: { views: 128 } },
  { id: 'strategy2', name: '更换密封', type: 'maintenance_strategy', properties: { views: 89 } },
  { id: 'strategy3', name: '动平衡校正', type: 'maintenance_strategy', properties: { views: 156 } },
  
  { id: 'symptom1', name: '振动增大', type: 'symptom', properties: { severity: 'high' } },
  { id: 'symptom2', name: '温度升高', type: 'symptom', properties: { severity: 'high' } },
  { id: 'symptom3', name: '异响', type: 'symptom', properties: { severity: 'medium' } },
  { id: 'symptom4', name: '气蚀', type: 'symptom', properties: { severity: 'medium' } },
  { id: 'symptom5', name: '滴漏', type: 'symptom', properties: { severity: 'low' } }
];

export const graphEdges: GraphEdge[] = [
  { source: 'comp1', target: 'part1', relation: 'has_component' },
  { source: 'comp1', target: 'part2', relation: 'has_component' },
  { source: 'comp1', target: 'part3', relation: 'has_component' },
  
  { source: 'part2', target: 'fault1', relation: 'has_fault' },
  { source: 'part3', target: 'fault2', relation: 'has_fault' },
  { source: 'part1', target: 'fault3', relation: 'has_fault' },
  
  { source: 'fault1', target: 'strategy1', relation: 'solution' },
  { source: 'fault2', target: 'strategy2', relation: 'solution' },
  { source: 'fault3', target: 'strategy3', relation: 'solution' },
  
  { source: 'fault1', target: 'symptom1', relation: 'has_symptom' },
  { source: 'fault1', target: 'symptom2', relation: 'has_symptom' },
  { source: 'fault1', target: 'symptom3', relation: 'has_symptom' },
  { source: 'fault2', target: 'symptom4', relation: 'has_symptom' },
  { source: 'fault2', target: 'symptom5', relation: 'has_symptom' },
  { source: 'fault3', target: 'symptom1', relation: 'has_symptom' },
  
  { source: 'strategy1', target: 'p2', relation: 'needs_spare' },
  { source: 'strategy2', target: 'p3', relation: 'needs_spare' },
  { source: 'strategy3', target: 'p1', relation: 'needs_spare' },
  
  { source: 'comp2', target: 'fault1', relation: 'has_fault' },
  { source: 'comp3', target: 'fault3', relation: 'has_fault' }
];

export const nodeTypeColors: Record<string, string> = {
  device: '#00a8ff',
  component: '#5c6bc0',
  fault_mode: '#e53935',
  maintenance_strategy: '#26a69a',
  spare_part: '#ff7043',
  symptom: '#ffb300'
};

export const nodeTypeLabels: Record<string, string> = {
  device: '设备',
  component: '部件',
  fault_mode: '故障模式',
  maintenance_strategy: '维修策略',
  spare_part: '备件',
  symptom: '症状'
};

export const nodeTypeSymbols: Record<string, string> = {
  device: 'circle',
  component: 'circle',
  fault_mode: 'diamond',
  maintenance_strategy: 'roundRect',
  spare_part: 'hexagon',
  symptom: 'triangle'
};

export const relationLabels: Record<string, string> = {
  has_component: '包含',
  has_fault: '存在故障',
  solution: '解决方案',
  has_symptom: '表现为',
  needs_spare: '需要备件'
};