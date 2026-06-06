import type { WorkOrder } from '../types';

export const workOrders: WorkOrder[] = [
  {
    id: '1',
    code: 'WO-20240606-001',
    title: '空压机温度过高报警维修',
    type: 'alarm_repair',
    priority: 'P0',
    status: 'pending',
    deviceId: 'd1',
    deviceName: '空压机A01',
    alarmId: 'a1',
    assignee: '',
    plannedFinishTime: '2024-06-06 18:00:00',
    description: '空压机A01温度达到95度，超过报警阈值，需要检查冷却系统和润滑油状态。',
    attachments: [],
    timeline: [
      { id: 't1', action: 'created', operator: '系统', timestamp: '2024-06-06 10:00:00', description: '工单创建' }
    ],
    createdAt: '2024-06-06 10:00:00'
  },
  {
    id: '2',
    code: 'WO-20240606-002',
    title: '离心泵P-102轴承更换',
    type: 'predictive_maintenance',
    priority: 'P1',
    status: 'pending',
    deviceId: 'd2',
    deviceName: '离心泵P-102',
    assignee: '',
    plannedFinishTime: '2024-06-07 12:00:00',
    description: '根据预测性维护分析，离心泵P-102轴承已运行4872小时，建议更换。',
    attachments: [],
    timeline: [
      { id: 't2', action: 'created', operator: '系统', timestamp: '2024-06-06 09:00:00', description: '工单创建' }
    ],
    createdAt: '2024-06-06 09:00:00'
  },
  {
    id: '3',
    code: 'WO-20240605-003',
    title: '风机F-003振动异常维修',
    type: 'alarm_repair',
    priority: 'P1',
    status: 'in_progress',
    deviceId: 'd3',
    deviceName: '风机F-003',
    alarmId: 'a2',
    assignee: '张工',
    plannedFinishTime: '2024-06-06 16:00:00',
    description: '风机F-003振动值达到12mm/s，需要检查轴承和叶片平衡。',
    attachments: [],
    timeline: [
      { id: 't3', action: 'created', operator: '系统', timestamp: '2024-06-05 14:00:00', description: '工单创建' },
      { id: 't4', action: 'assigned', operator: '管理员', timestamp: '2024-06-05 14:30:00', description: '派发给张工' },
      { id: 't5', action: 'started', operator: '张工', timestamp: '2024-06-06 08:00:00', description: '开始执行' }
    ],
    createdAt: '2024-06-05 14:00:00'
  },
  {
    id: '4',
    code: 'WO-20240605-004',
    title: '电机M-005日常巡检',
    type: 'routine_inspection',
    priority: 'P3',
    status: 'in_progress',
    deviceId: 'd4',
    deviceName: '电机M-005',
    assignee: '李工',
    plannedFinishTime: '2024-06-06 17:00:00',
    description: '按照巡检计划对电机M-005进行日常检查，包括温度、振动、绝缘电阻等项目。',
    attachments: [],
    timeline: [
      { id: 't6', action: 'created', operator: '系统', timestamp: '2024-06-05 08:00:00', description: '工单创建' },
      { id: 't7', action: 'assigned', operator: '管理员', timestamp: '2024-06-05 08:30:00', description: '派发给李工' },
      { id: 't8', action: 'started', operator: '李工', timestamp: '2024-06-06 09:00:00', description: '开始执行' }
    ],
    createdAt: '2024-06-05 08:00:00'
  },
  {
    id: '5',
    code: 'WO-20240604-005',
    title: 'PLC控制柜安装调试',
    type: 'installation',
    priority: 'P2',
    status: 'pending_review',
    deviceId: 'd5',
    deviceName: 'PLC控制柜C-001',
    assignee: '王工',
    plannedFinishTime: '2024-06-05 18:00:00',
    actualFinishTime: '2024-06-05 17:30:00',
    description: '新PLC控制柜安装完成，已完成接线和初步调试，等待验收。',
    attachments: [],
    timeline: [
      { id: 't9', action: 'created', operator: '管理员', timestamp: '2024-06-03 10:00:00', description: '工单创建' },
      { id: 't10', action: 'assigned', operator: '管理员', timestamp: '2024-06-03 10:30:00', description: '派发给王工' },
      { id: 't11', action: 'started', operator: '王工', timestamp: '2024-06-04 08:00:00', description: '开始执行' },
      { id: 't12', action: 'completed', operator: '王工', timestamp: '2024-06-05 17:30:00', description: '提交验收' }
    ],
    createdAt: '2024-06-03 10:00:00'
  },
  {
    id: '6',
    code: 'WO-20240603-006',
    title: '变频器VFD-002参数调整',
    type: 'predictive_maintenance',
    priority: 'P2',
    status: 'completed',
    deviceId: 'd6',
    deviceName: '变频器VFD-002',
    assignee: '赵工',
    plannedFinishTime: '2024-06-04 12:00:00',
    actualFinishTime: '2024-06-04 11:00:00',
    description: '根据能耗分析结果，调整变频器VFD-002的运行参数以优化能耗。',
    attachments: [],
    timeline: [
      { id: 't13', action: 'created', operator: '系统', timestamp: '2024-06-03 09:00:00', description: '工单创建' },
      { id: 't14', action: 'assigned', operator: '管理员', timestamp: '2024-06-03 09:30:00', description: '派发给赵工' },
      { id: 't15', action: 'started', operator: '赵工', timestamp: '2024-06-04 08:00:00', description: '开始执行' },
      { id: 't16', action: 'completed', operator: '赵工', timestamp: '2024-06-04 11:00:00', description: '提交验收' },
      { id: 't17', action: 'approved', operator: '管理员', timestamp: '2024-06-04 14:00:00', description: '验收通过' }
    ],
    createdAt: '2024-06-03 09:00:00'
  },
  {
    id: '7',
    code: 'WO-20240602-007',
    title: '传感器更换',
    type: 'alarm_repair',
    priority: 'P1',
    status: 'completed',
    deviceId: 'd7',
    deviceName: '温度传感器TS-001',
    alarmId: 'a3',
    assignee: '孙工',
    plannedFinishTime: '2024-06-03 12:00:00',
    actualFinishTime: '2024-06-03 10:30:00',
    description: '温度传感器TS-001读数异常，已更换新传感器并校准。',
    attachments: [],
    timeline: [
      { id: 't18', action: 'created', operator: '系统', timestamp: '2024-06-02 16:00:00', description: '工单创建' },
      { id: 't19', action: 'assigned', operator: '管理员', timestamp: '2024-06-02 16:30:00', description: '派发给孙工' },
      { id: 't20', action: 'started', operator: '孙工', timestamp: '2024-06-03 08:00:00', description: '开始执行' },
      { id: 't21', action: 'completed', operator: '孙工', timestamp: '2024-06-03 10:30:00', description: '提交验收' },
      { id: 't22', action: 'approved', operator: '管理员', timestamp: '2024-06-03 11:00:00', description: '验收通过' }
    ],
    createdAt: '2024-06-02 16:00:00'
  },
  {
    id: '8',
    code: 'WO-20240601-008',
    title: '设备迁移准备',
    type: 'migration',
    priority: 'P2',
    status: 'cancelled',
    deviceId: 'd8',
    deviceName: '真空泵VP-001',
    assignee: '周工',
    plannedFinishTime: '2024-06-05 18:00:00',
    description: '将真空泵VP-001从A车间迁移至B车间，因生产计划变更取消。',
    attachments: [],
    timeline: [
      { id: 't23', action: 'created', operator: '管理员', timestamp: '2024-06-01 10:00:00', description: '工单创建' },
      { id: 't24', action: 'assigned', operator: '管理员', timestamp: '2024-06-01 10:30:00', description: '派发给周工' },
      { id: 't25', action: 'cancelled', operator: '管理员', timestamp: '2024-06-02 09:00:00', description: '工单取消，因生产计划变更' }
    ],
    createdAt: '2024-06-01 10:00:00'
  },
  {
    id: '9',
    code: 'WO-20240606-009',
    title: '定期巡检任务',
    type: 'routine_inspection',
    priority: 'P3',
    status: 'pending',
    deviceId: 'd9',
    deviceName: '压缩机C-001',
    assignee: '',
    plannedFinishTime: '2024-06-07 18:00:00',
    description: '按照月度巡检计划，对压缩机C-001进行全面检查。',
    attachments: [],
    timeline: [
      { id: 't26', action: 'created', operator: '系统', timestamp: '2024-06-06 08:00:00', description: '工单创建' }
    ],
    createdAt: '2024-06-06 08:00:00'
  }
];

export const workOrderTypeMap: Record<string, string> = {
  alarm_repair: '报警维修',
  predictive_maintenance: '预测维护',
  routine_inspection: '定期巡检',
  installation: '设备安装',
  migration: '设备迁移',
  scrap: '设备报废'
};

export const workOrderPriorityMap: Record<string, string> = {
  P0: '紧急',
  P1: '高',
  P2: '中',
  P3: '低'
};

export const workOrderStatusMap: Record<string, string> = {
  pending: '待派发',
  in_progress: '进行中',
  pending_review: '待验收',
  completed: '已完成',
  cancelled: '已取消'
};

export const operators = ['张工', '李工', '王工', '赵工', '孙工', '周工', '吴工', '郑工'];