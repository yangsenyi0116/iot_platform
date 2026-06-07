export type StockStatus = 'out' | 'critical' | 'warning' | 'normal' | 'overstock';

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

export function getStockStatus(stock: number, safetyStock: number): StockStatus {
  if (stock === 0) return 'out';
  if (stock <= safetyStock * 0.5) return 'critical';
  if (stock <= safetyStock) return 'warning';
  if (stock <= safetyStock * 2) return 'normal';
  return 'overstock';
}

export const stockStatusLabels: Record<StockStatus, string> = {
  out: '缺货',
  critical: '低库存',
  warning: '预警',
  normal: '正常',
  overstock: '积压',
};

export const stockStatusColors: Record<StockStatus, string> = {
  out: '#8c8c8c',
  critical: '#ff4d4f',
  warning: '#faad14',
  normal: '#52c41a',
  overstock: '#f97316',
};

export const mockSpareParts: SparePartItem[] = [
  {
    id: 'SP-001',
    name: '轴承6304',
    code: 'BEAR-001',
    stock: 2,
    safetyStock: 5,
    status: 'critical',
    warehouse: 'A仓',
    unit: '个',
    category: '轴承类',
    lastIssuedDate: '2024-01-10',
    unitPrice: 120,
    totalValue: 240,
    issueRecords: [
      { id: 'IR-001', date: '2024-01-10', quantity: 3, operator: '张三', workOrderCode: 'WO-20240110001', trend: 'down' },
      { id: 'IR-002', date: '2023-12-15', quantity: 5, operator: '李四', workOrderCode: 'WO-20231215002', trend: 'stable' },
      { id: 'IR-003', date: '2023-11-20', quantity: 4, operator: '张三', workOrderCode: 'WO-20231120003', trend: 'down' },
    ],
  },
  {
    id: 'SP-002',
    name: '密封圈DN50',
    code: 'SEAL-002',
    stock: 8,
    safetyStock: 10,
    status: 'warning',
    warehouse: 'B仓',
    unit: '个',
    category: '密封件',
    lastIssuedDate: '2024-01-12',
    unitPrice: 35,
    totalValue: 280,
    issueRecords: [
      { id: 'IR-004', date: '2024-01-12', quantity: 5, operator: '王五', workOrderCode: 'WO-20240112004', trend: 'up' },
      { id: 'IR-005', date: '2023-12-18', quantity: 3, operator: '赵六', workOrderCode: 'WO-20231218005', trend: 'up' },
    ],
  },
  {
    id: 'SP-003',
    name: '电机M-102',
    code: 'MOT-003',
    stock: 0,
    safetyStock: 3,
    status: 'out',
    warehouse: 'A仓',
    unit: '台',
    category: '电机',
    lastIssuedDate: '2024-01-08',
    unitPrice: 2500,
    totalValue: 0,
    issueRecords: [
      { id: 'IR-006', date: '2024-01-08', quantity: 1, operator: '张三', workOrderCode: 'WO-20240108006', trend: 'down' },
    ],
  },
  {
    id: 'SP-004',
    name: '过滤器F01',
    code: 'FIL-004',
    stock: 15,
    safetyStock: 10,
    status: 'normal',
    warehouse: 'C仓',
    unit: '个',
    category: '过滤件',
    lastIssuedDate: '2023-12-20',
    unitPrice: 80,
    totalValue: 1200,
    issueRecords: [
      { id: 'IR-007', date: '2023-12-20', quantity: 6, operator: '李四', workOrderCode: 'WO-20231220007', trend: 'up' },
      { id: 'IR-008', date: '2023-11-25', quantity: 4, operator: '王五', workOrderCode: 'WO-20231125008', trend: 'up' },
    ],
  },
  {
    id: 'SP-005',
    name: '皮带SPA-100',
    code: 'BEL-005',
    stock: 45,
    safetyStock: 15,
    status: 'overstock',
    warehouse: 'A仓',
    unit: '条',
    category: '传动件',
    lastIssuedDate: '2023-12-28',
    unitPrice: 50,
    totalValue: 2250,
    issueRecords: [
      { id: 'IR-009', date: '2023-12-28', quantity: 2, operator: '赵六', workOrderCode: 'WO-20231228009', trend: 'down' },
      { id: 'IR-010', date: '2023-10-10', quantity: 3, operator: '张三', workOrderCode: 'WO-20231010010', trend: 'stable' },
    ],
  },
  {
    id: 'SP-006',
    name: '轴承6205',
    code: 'BEAR-006',
    stock: 30,
    safetyStock: 10,
    status: 'overstock',
    warehouse: 'B仓',
    unit: '个',
    category: '轴承类',
    lastIssuedDate: '2023-12-25',
    unitPrice: 85,
    totalValue: 2550,
    issueRecords: [
      { id: 'IR-011', date: '2023-12-25', quantity: 1, operator: '李四', workOrderCode: 'WO-20231225011', trend: 'down' },
    ],
  },
  {
    id: 'SP-007',
    name: '螺栓M12x50',
    code: 'BOLT-007',
    stock: 200,
    safetyStock: 100,
    status: 'normal',
    warehouse: 'A仓',
    unit: '个',
    category: '紧固件',
    lastIssuedDate: '2024-01-05',
    unitPrice: 2,
    totalValue: 400,
    issueRecords: [
      { id: 'IR-012', date: '2024-01-05', quantity: 50, operator: '王五', workOrderCode: 'WO-20240105012', trend: 'stable' },
    ],
  },
  {
    id: 'SP-008',
    name: '油封TC30x50x8',
    code: 'OILSEAL-008',
    stock: 3,
    safetyStock: 8,
    status: 'critical',
    warehouse: 'B仓',
    unit: '个',
    category: '密封件',
    lastIssuedDate: '2024-01-15',
    unitPrice: 25,
    totalValue: 75,
    issueRecords: [
      { id: 'IR-013', date: '2024-01-15', quantity: 10, operator: '赵六', workOrderCode: 'WO-20240115013', trend: 'down' },
    ],
  },
  {
    id: 'SP-009',
    name: '齿轮GC-120',
    code: 'GEAR-009',
    stock: 0,
    safetyStock: 2,
    status: 'out',
    warehouse: 'C仓',
    unit: '个',
    category: '传动件',
    lastIssuedDate: '2023-11-05',
    unitPrice: 800,
    totalValue: 0,
    issueRecords: [
      { id: 'IR-014', date: '2023-11-05', quantity: 1, operator: '张三', workOrderCode: 'WO-20231105014', trend: 'stable' },
    ],
  },
  {
    id: 'SP-010',
    name: '弹簧TS-200',
    code: 'SPRING-010',
    stock: 80,
    safetyStock: 30,
    status: 'overstock',
    warehouse: 'A仓',
    unit: '个',
    category: '弹性件',
    lastIssuedDate: '2023-10-20',
    unitPrice: 15,
    totalValue: 1200,
    issueRecords: [
      { id: 'IR-015', date: '2023-10-20', quantity: 5, operator: '李四', workOrderCode: 'WO-20231020015', trend: 'down' },
    ],
  },
  {
    id: 'SP-011',
    name: '垫片DP-40',
    code: 'GASKET-011',
    stock: 120,
    safetyStock: 50,
    status: 'overstock',
    warehouse: 'B仓',
    unit: '个',
    category: '密封件',
    lastIssuedDate: '2023-12-01',
    unitPrice: 5,
    totalValue: 600,
    issueRecords: [
      { id: 'IR-016', date: '2023-12-01', quantity: 20, operator: '王五', workOrderCode: 'WO-20231201016', trend: 'stable' },
    ],
  },
  {
    id: 'SP-012',
    name: '螺钉M6x20',
    code: 'SCREW-012',
    stock: 500,
    safetyStock: 300,
    status: 'normal',
    warehouse: 'A仓',
    unit: '个',
    category: '紧固件',
    lastIssuedDate: '2024-01-18',
    unitPrice: 0.5,
    totalValue: 250,
    issueRecords: [
      { id: 'IR-017', date: '2024-01-18', quantity: 100, operator: '赵六', workOrderCode: 'WO-20240118017', trend: 'stable' },
    ],
  },
  {
    id: 'SP-013',
    name: '联轴器CL-50',
    code: 'COUPLING-013',
    stock: 5,
    safetyStock: 5,
    status: 'warning',
    warehouse: 'C仓',
    unit: '个',
    category: '传动件',
    lastIssuedDate: '2024-01-08',
    unitPrice: 150,
    totalValue: 750,
    issueRecords: [
      { id: 'IR-018', date: '2024-01-08', quantity: 2, operator: '张三', workOrderCode: 'WO-20240108018', trend: 'stable' },
    ],
  },
  {
    id: 'SP-014',
    name: '液压油HY-46',
    code: 'OIL-014',
    stock: 15,
    safetyStock: 20,
    status: 'warning',
    warehouse: 'A仓',
    unit: '桶',
    category: '油品',
    lastIssuedDate: '2024-01-20',
    unitPrice: 380,
    totalValue: 5700,
    issueRecords: [
      { id: 'IR-019', date: '2024-01-20', quantity: 5, operator: '李四', workOrderCode: 'WO-20240120019', trend: 'up' },
    ],
  },
  {
    id: 'SP-015',
    name: '密封圈DN80',
    code: 'SEAL-015',
    stock: 12,
    safetyStock: 15,
    status: 'warning',
    warehouse: 'B仓',
    unit: '个',
    category: '密封件',
    lastIssuedDate: '2024-01-16',
    unitPrice: 55,
    totalValue: 660,
    issueRecords: [
      { id: 'IR-020', date: '2024-01-16', quantity: 8, operator: '王五', workOrderCode: 'WO-20240116020', trend: 'up' },
    ],
  },
];

export function generateAIAnalysis(): AIInventoryAnalysis {
  const totalParts = mockSpareParts.length;
  const outCount = mockSpareParts.filter(p => p.status === 'out').length;
  const criticalCount = mockSpareParts.filter(p => p.status === 'critical').length;
  const overstockCount = mockSpareParts.filter(p => p.status === 'overstock').length;

  const healthScore = Math.max(0, 100 - outCount * 5 - criticalCount * 3 - overstockCount * 2);
  
  let healthLevel: 'excellent' | 'good' | 'fair' | 'poor';
  if (healthScore >= 90) healthLevel = 'excellent';
  else if (healthScore >= 75) healthLevel = 'good';
  else if (healthScore >= 60) healthLevel = 'fair';
  else healthLevel = 'poor';

  const overstockRatio = (overstockCount / totalParts) * 100;
  const outOfStockRatio = (outCount / totalParts) * 100;
  const turnoverRate = 2.8 + Math.random() * 0.5;

  const suggestions: AIInventoryAnalysis['suggestions'] = [];
  
  if (overstockCount > 0) {
    const overstockParts = mockSpareParts.filter(p => p.status === 'overstock');
    suggestions.push({
      id: 'SUG-001',
      type: 'overstock',
      title: '积压优化',
      content: `${overstockParts[0].category}备件整体库存偏高（${overstockParts.map(p => p.name).join('、')}积压严重），建议暂停采购，消耗库存。`,
      affectedParts: overstockParts.map(p => p.id),
      estimatedImpact: `预计可释放资金 ¥${overstockParts.reduce((sum, p) => sum + p.totalValue, 0).toLocaleString()}`,
      actions: [
        { label: '查看积压清单', actionType: 'viewList', params: { status: 'overstock' } },
        { label: '生成工单', actionType: 'createWorkOrder', params: { type: 'overstock_handling' } },
      ],
    });
  }

  if (outCount > 0) {
    const outParts = mockSpareParts.filter(p => p.status === 'out');
    suggestions.push({
      id: 'SUG-002',
      type: 'shortage',
      title: '缺货预警',
      content: `${outParts[0].name}已缺货，可能影响设备维修，建议紧急采购。`,
      affectedParts: outParts.map(p => p.id),
      actions: [
        { label: '一键采购', actionType: 'purchase', params: { partId: outParts[0].id } },
        { label: '查看关联设备', actionType: 'viewDevices', params: { partId: outParts[0].id } },
      ],
    });
  }

  suggestions.push({
    id: 'SUG-003',
    type: 'procurement',
    title: '采购优化',
    content: '根据近3个月领用趋势，密封圈DN50建议采购量调整为15个（原建议10个），以避免频繁采购。',
    affectedParts: ['SP-002'],
    actions: [
      { label: '采纳建议', actionType: 'adopt', params: { partId: 'SP-002' } },
      { label: '忽略', actionType: 'ignore', params: { suggestionId: 'SUG-003' } },
    ],
  });

  suggestions.push({
    id: 'SUG-004',
    type: 'trend',
    title: '趋势预测',
    content: '过滤器F01领用量上升趋势（+35%），建议提前备货。',
    affectedParts: ['SP-004'],
    actions: [
      { label: '生成采购建议', actionType: 'purchase', params: { partId: 'SP-004' } },
    ],
  });

  const procurementOptimizations: AIInventoryAnalysis['procurementOptimizations'] = [
    {
      partId: 'SP-002',
      partName: '密封圈DN50',
      originalSuggested: 10,
      optimizedSuggested: 15,
      reason: '近3个月领用量上升45%',
    },
    {
      partId: 'SP-004',
      partName: '过滤器F01',
      originalSuggested: 8,
      optimizedSuggested: 12,
      reason: '领用量上升趋势明显',
    },
  ];

  return {
    healthScore: Math.round(healthScore),
    healthLevel,
    overstockRatio: Math.round(overstockRatio * 10) / 10,
    outOfStockRatio: Math.round(outOfStockRatio * 10) / 10,
    turnoverRate: Math.round(turnoverRate * 10) / 10,
    suggestions,
    procurementOptimizations,
  };
}

export const mockProcurementSuggestions: ProcurementSuggestion[] = [
  {
    id: 'PS-001',
    partId: 'SP-001',
    partName: '轴承6304',
    partCode: 'BEAR-001',
    currentStock: 2,
    safetyStock: 5,
    status: 'critical',
    suggestedQuantity: 8,
    hasAIOptimization: false,
  },
  {
    id: 'PS-002',
    partId: 'SP-002',
    partName: '密封圈DN50',
    partCode: 'SEAL-002',
    currentStock: 8,
    safetyStock: 10,
    status: 'warning',
    suggestedQuantity: 15,
    hasAIOptimization: true,
    aiReason: '近3个月领用量上升45%',
  },
  {
    id: 'PS-003',
    partId: 'SP-003',
    partName: '电机M-102',
    partCode: 'MOT-003',
    currentStock: 0,
    safetyStock: 3,
    status: 'out',
    suggestedQuantity: 3,
    hasAIOptimization: false,
  },
  {
    id: 'PS-004',
    partId: 'SP-008',
    partName: '油封TC30x50x8',
    partCode: 'OILSEAL-008',
    currentStock: 3,
    safetyStock: 8,
    status: 'critical',
    suggestedQuantity: 10,
    hasAIOptimization: false,
  },
  {
    id: 'PS-005',
    partId: 'SP-009',
    partName: '齿轮GC-120',
    partCode: 'GEAR-009',
    currentStock: 0,
    safetyStock: 2,
    status: 'out',
    suggestedQuantity: 2,
    hasAIOptimization: false,
  },
  {
    id: 'PS-006',
    partId: 'SP-013',
    partName: '联轴器CL-50',
    partCode: 'COUPLING-013',
    currentStock: 5,
    safetyStock: 5,
    status: 'warning',
    suggestedQuantity: 5,
    hasAIOptimization: false,
  },
  {
    id: 'PS-007',
    partId: 'SP-014',
    partName: '液压油HY-46',
    partCode: 'OIL-014',
    currentStock: 15,
    safetyStock: 20,
    status: 'warning',
    suggestedQuantity: 10,
    hasAIOptimization: false,
  },
  {
    id: 'PS-008',
    partId: 'SP-015',
    partName: '密封圈DN80',
    partCode: 'SEAL-015',
    currentStock: 12,
    safetyStock: 15,
    status: 'warning',
    suggestedQuantity: 15,
    hasAIOptimization: true,
    aiReason: '领用量持续上升',
  },
];

export const warehouseStats = [
  { name: 'A仓', value: 45, color: '#52c41a' },
  { name: 'B仓', value: 30, color: '#1890ff' },
  { name: 'C仓', value: 25, color: '#faad14' },
];

export const categoryStats = [
  { name: '轴承类', count: 3, value: 32, stock: 62 },
  { name: '密封件', count: 4, value: 28, stock: 143 },
  { name: '传动件', count: 3, value: 22, stock: 53 },
  { name: '紧固件', count: 2, value: 10, stock: 700 },
  { name: '其他', count: 3, value: 8, stock: 34 },
];