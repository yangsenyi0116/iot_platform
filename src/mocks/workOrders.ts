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
    createdAt: '2024-06-06 10:00:00',
    spareParts: [
      { id: 'sp1', name: '冷却机油', code: 'SP-OIL-001', quantity: 5, unit: 'L', stock: 12, hasStock: true, location: '仓库A区' },
      { id: 'sp2', name: '空气过滤器芯', code: 'SP-FILTER-003', quantity: 2, unit: '个', stock: 0, hasStock: false, location: '需采购' },
      { id: 'sp3', name: '温度传感器', code: 'SP-SENSOR-005', quantity: 1, unit: '个', stock: 3, hasStock: true, location: '仓库B区' },
    ],
    safetyNotes: [
      { id: 'sn1', content: '维修前必须关闭主电源开关，并挂"正在维修"警示牌', priority: 'high', category: 'electrical' },
      { id: 'sn2', content: '释放储气罐压力后方可进行检修', priority: 'high', category: 'mechanical' },
      { id: 'sn3', content: '更换机油时注意环保要求，废油需妥善处理', priority: 'medium', category: 'environment' },
      { id: 'sn4', content: '需要办理动火作业许可证', priority: 'high', category: 'work_permit' },
    ],
    aiRecommendation: {
      recommendedSolution: '根据历史案例分析，空压机温度过高通常由以下原因引起：1) 冷却系统堵塞或冷却液不足；2) 空气过滤器堵塞导致进气不畅；3) 温度传感器故障。建议按照以下步骤进行排查和维修。',
      confidence: 0.87,
      steps: [
        { id: 'step1', order: 1, title: '停机泄压', description: '关闭空压机电源，释放储气罐内压力，等待设备冷却至安全温度', estimatedTime: '30分钟' },
        { id: 'step2', order: 2, title: '检查冷却系统', description: '检查冷却机油液位和质量，必要时更换冷却机油', estimatedTime: '45分钟' },
        { id: 'step3', order: 3, title: '清洗/更换过滤器', description: '检查并清洗或更换空气过滤器芯', estimatedTime: '30分钟' },
        { id: 'step4', order: 4, title: '检查温度传感器', description: '使用万用表检查温度传感器读数是否准确', estimatedTime: '20分钟' },
        { id: 'step5', order: 5, title: '试运行测试', description: '启动空压机，观察温度变化，确认故障已排除', estimatedTime: '60分钟' },
      ],
      relatedCases: [
        { id: 'c1', code: 'WO-20240315-008', title: '空压机温度过高维修', deviceName: '空压机A02', problemDescription: '空压机温度达到98度报警', solution: '更换冷却机油和空气过滤器，清理散热片', result: 'success', createdAt: '2024-03-15', similarity: 0.89 },
        { id: 'c2', code: 'WO-20240120-012', title: '空压机温度异常处理', deviceName: '空压机B01', problemDescription: '温度传感器读数异常，导致误报警', solution: '更换温度传感器并重新校准', result: 'success', createdAt: '2024-01-20', similarity: 0.76 },
        { id: 'c3', code: 'WO-20231205-005', title: '空压机过热故障', deviceName: '空压机A01', problemDescription: '长时间运行后温度持续升高', solution: '清理冷却系统，更换老化密封圈', result: 'partial', createdAt: '2023-12-05', similarity: 0.72 },
      ],
    },
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
    createdAt: '2024-06-06 09:00:00',
    spareParts: [
      { id: 'sp4', name: '轴承组件', code: 'SP-BEARING-012', quantity: 2, unit: '套', stock: 5, hasStock: true, location: '仓库A区' },
      { id: 'sp5', name: '润滑脂', code: 'SP-GREASE-008', quantity: 1, unit: 'kg', stock: 8, hasStock: true, location: '仓库B区' },
      { id: 'sp6', name: '密封件', code: 'SP-SEAL-003', quantity: 2, unit: '个', stock: 15, hasStock: true, location: '仓库A区' },
    ],
    safetyNotes: [
      { id: 'sn5', content: '维修前关闭进出口阀门，排空泵体内液体', priority: 'high', category: 'mechanical' },
      { id: 'sn6', content: '确保电机已断电并上锁挂牌', priority: 'high', category: 'electrical' },
      { id: 'sn7', content: '轴承安装时使用专用工具，避免敲击损伤', priority: 'medium', category: 'mechanical' },
    ],
    aiRecommendation: {
      recommendedSolution: '根据预测性维护数据，离心泵P-102轴承磨损已接近更换阈值。建议按照标准更换流程进行轴承更换，同时检查密封件状态。',
      confidence: 0.92,
      steps: [
        { id: 'step6', order: 1, title: '停机准备', description: '关闭进出口阀门，排空泵体，关闭电机电源', estimatedTime: '20分钟' },
        { id: 'step7', order: 2, title: '拆卸泵体', description: '拆除联轴器防护罩，松开联轴器螺栓', estimatedTime: '30分钟' },
        { id: 'step8', order: 3, title: '更换轴承', description: '使用轴承拉拔器拆卸旧轴承，安装新轴承并加注润滑脂', estimatedTime: '60分钟' },
        { id: 'step9', order: 4, title: '检查密封', description: '检查机械密封状态，必要时更换', estimatedTime: '30分钟' },
        { id: 'step10', order: 5, title: '回装调试', description: '重新组装泵体，进行试运行检查', estimatedTime: '45分钟' },
      ],
      relatedCases: [
        { id: 'c4', code: 'WO-20240420-006', title: '离心泵P-101轴承更换', deviceName: '离心泵P-101', problemDescription: '轴承运行5000小时，振动值上升', solution: '更换轴承组件和密封件', result: 'success', createdAt: '2024-04-20', similarity: 0.91 },
        { id: 'c5', code: 'WO-20240210-009', title: '离心泵轴承更换', deviceName: '离心泵P-201', problemDescription: '定期维护更换轴承', solution: '按标准流程更换轴承，加注新润滑脂', result: 'success', createdAt: '2024-02-10', similarity: 0.85 },
      ],
    },
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
    createdAt: '2024-06-05 14:00:00',
    spareParts: [
      { id: 'sp7', name: '风机轴承', code: 'SP-BEARING-005', quantity: 2, unit: '个', stock: 3, hasStock: true, location: '仓库A区', issued: true, issuedQuantity: 2, issuedBy: '张工', issuedAt: '2024-06-06 08:30:00' },
      { id: 'sp8', name: '平衡配重块', code: 'SP-WEIGHT-001', quantity: 4, unit: '个', stock: 10, hasStock: true, location: '仓库C区', issued: true, issuedQuantity: 4, issuedBy: '张工', issuedAt: '2024-06-06 08:30:00' },
      { id: 'sp9', name: '联轴器胶垫', code: 'SP-GASKET-007', quantity: 4, unit: '个', stock: 0, hasStock: false, location: '需采购' },
    ],
    safetyNotes: [
      { id: 'sn8', content: '风机叶片可能积聚粉尘，需佩戴防尘口罩', priority: 'high', category: 'environment' },
      { id: 'sn9', content: '确认风机完全停止转动后再进行检修', priority: 'high', category: 'mechanical' },
      { id: 'sn10', content: '高空作业需佩戴安全带', priority: 'high', category: 'work_permit' },
      { id: 'sn11', content: '使用平衡仪时注意校准', priority: 'medium', category: 'mechanical' },
    ],
    aiRecommendation: {
      recommendedSolution: '风机振动异常通常由轴承磨损、叶片积灰不平衡或联轴器松动引起。建议先进行振动分析定位故障点，然后针对性处理。',
      confidence: 0.85,
      steps: [
        { id: 'step11', order: 1, title: '振动检测', description: '使用振动分析仪测量各测点振动值，分析频谱特征', estimatedTime: '30分钟' },
        { id: 'step12', order: 2, title: '检查轴承', description: '检查轴承温度和润滑状态，判断是否需要更换', estimatedTime: '20分钟' },
        { id: 'step13', order: 3, title: '叶片清洁', description: '清理叶片表面积灰，检查是否有损伤', estimatedTime: '45分钟' },
        { id: 'step14', order: 4, title: '动平衡校正', description: '使用平衡仪进行现场动平衡校正', estimatedTime: '60分钟' },
        { id: 'step15', order: 5, title: '试运行验证', description: '启动风机，验证振动值是否恢复正常', estimatedTime: '45分钟' },
      ],
      relatedCases: [
        { id: 'c6', code: 'WO-20240510-003', title: '风机F-001振动处理', deviceName: '风机F-001', problemDescription: '振动值超标至15mm/s', solution: '更换轴承并进行动平衡', result: 'success', createdAt: '2024-05-10', similarity: 0.88 },
        { id: 'c7', code: 'WO-20240325-007', title: '风机叶片不平衡', deviceName: '风机F-002', problemDescription: '叶片积灰导致不平衡', solution: '清洁叶片并进行现场动平衡', result: 'success', createdAt: '2024-03-25', similarity: 0.79 },
      ],
    },
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
    createdAt: '2024-06-05 08:00:00',
    spareParts: [
      { id: 'sp10', name: '绝缘测试表', code: 'SP-TOOL-001', quantity: 1, unit: '台', stock: 5, hasStock: true, location: '工具间' },
      { id: 'sp11', name: '振动分析仪', code: 'SP-TOOL-002', quantity: 1, unit: '台', stock: 2, hasStock: true, location: '工具间' },
    ],
    safetyNotes: [
      { id: 'sn12', content: '巡检前确认电机处于停机状态', priority: 'high', category: 'electrical' },
      { id: 'sn13', content: '使用绝缘测试仪前断开所有电源连接', priority: 'high', category: 'electrical' },
    ],
    aiRecommendation: {
      recommendedSolution: '日常巡检需按照标准流程进行，重点关注电机运行参数、绝缘状态和机械部件。',
      confidence: 0.95,
      steps: [
        { id: 'step16', order: 1, title: '外观检查', description: '检查电机外观有无异常，接线端子是否紧固', estimatedTime: '15分钟' },
        { id: 'step17', order: 2, title: '绝缘测试', description: '使用绝缘测试仪测量绕组绝缘电阻', estimatedTime: '20分钟' },
        { id: 'step18', order: 3, title: '振动检测', description: '使用振动分析仪测量电机振动值', estimatedTime: '15分钟' },
        { id: 'step19', order: 4, title: '温度记录', description: '记录各测点温度值', estimatedTime: '10分钟' },
        { id: 'step20', order: 5, title: '报告填写', description: '填写巡检报告，记录发现的问题', estimatedTime: '10分钟' },
      ],
      relatedCases: [
        { id: 'c8', code: 'WO-20240520-004', title: '电机M-001日常巡检', deviceName: '电机M-001', problemDescription: '例行巡检', solution: '按标准流程完成巡检，未发现异常', result: 'success', createdAt: '2024-05-20', similarity: 0.92 },
      ],
    },
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
    createdAt: '2024-06-03 10:00:00',
    spareParts: [
      { id: 'sp12', name: 'PLC模块', code: 'SP-PLC-001', quantity: 3, unit: '块', stock: 10, hasStock: true, location: '仓库A区' },
      { id: 'sp13', name: '接线端子', code: 'SP-TERMINAL-001', quantity: 50, unit: '个', stock: 200, hasStock: true, location: '仓库B区' },
      { id: 'sp14', name: '通讯电缆', code: 'SP-CABLE-001', quantity: 20, unit: '米', stock: 100, hasStock: true, location: '仓库A区' },
      { id: 'sp15', name: '导轨', code: 'SP-RAIL-001', quantity: 2, unit: '根', stock: 15, hasStock: true, location: '仓库B区' },
    ],
    safetyNotes: [
      { id: 'sn14', content: '接线前确认所有电源已断开', priority: 'high', category: 'electrical' },
      { id: 'sn15', content: '遵守PLC接地规范', priority: 'high', category: 'electrical' },
      { id: 'sn16', content: '信号线与电源线分开走线', priority: 'medium', category: 'electrical' },
    ],
    aiRecommendation: {
      recommendedSolution: 'PLC控制柜安装需严格按照电气规范进行，重点关注接地、接线和程序调试。',
      confidence: 0.93,
      steps: [
        { id: 'step21', order: 1, title: '柜体固定', description: '将控制柜安装固定在指定位置', estimatedTime: '30分钟' },
        { id: 'step22', order: 2, title: '模块安装', description: '安装PLC模块、IO模块等', estimatedTime: '45分钟' },
        { id: 'step23', order: 3, title: '接线', description: '按照接线图完成所有接线', estimatedTime: '120分钟' },
        { id: 'step24', order: 4, title: '程序下载', description: '下载PLC程序并进行功能测试', estimatedTime: '60分钟' },
        { id: 'step25', order: 5, title: '联调测试', description: '与现场设备进行联调', estimatedTime: '90分钟' },
      ],
      relatedCases: [
        { id: 'c9', code: 'WO-20240415-003', title: 'PLC控制柜安装', deviceName: 'PLC控制柜C-002', problemDescription: '新控制柜安装', solution: '完成安装接线和程序调试', result: 'success', createdAt: '2024-04-15', similarity: 0.88 },
      ],
    },
    repairResult: 'fully_repaired',
    repairRemark: '安装调试完成，所有功能正常。',
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
    reviewer: '王工',
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
    createdAt: '2024-06-03 09:00:00',
    spareParts: [
      { id: 'sp16', name: '参数调试软件', code: 'SP-SOFTWARE-001', quantity: 1, unit: '套', stock: 1, hasStock: true, location: 'IT部门' },
      { id: 'sp17', name: '通信线', code: 'SP-CABLE-002', quantity: 1, unit: '根', stock: 10, hasStock: true, location: '仓库A区' },
    ],
    safetyNotes: [
      { id: 'sn17', content: '参数调整前备份原参数', priority: 'high', category: 'electrical' },
      { id: 'sn18', content: '调整过程中密切关注设备运行状态', priority: 'medium', category: 'electrical' },
    ],
    aiRecommendation: {
      recommendedSolution: '变频器参数调整需根据负载特性和能耗数据进行优化，重点关注VFD参数设置。',
      confidence: 0.88,
      steps: [
        { id: 'step26', order: 1, title: '参数备份', description: '备份当前变频器参数', estimatedTime: '10分钟' },
        { id: 'step27', order: 2, title: '参数分析', description: '分析能耗数据，确定需要调整的参数', estimatedTime: '30分钟' },
        { id: 'step28', order: 3, title: '参数调整', description: '调整变频器运行参数', estimatedTime: '20分钟' },
        { id: 'step29', order: 4, title: '试运行', description: '试运行观察设备运行状态', estimatedTime: '60分钟' },
        { id: 'step30', order: 5, title: '效果验证', description: '验证能耗优化效果', estimatedTime: '30分钟' },
      ],
      relatedCases: [
        { id: 'c10', code: 'WO-20240310-002', title: '变频器参数优化', deviceName: '变频器VFD-001', problemDescription: '能耗偏高', solution: '调整VFD参数，优化运行曲线', result: 'success', createdAt: '2024-03-10', similarity: 0.90 },
      ],
    },
    repairResult: 'fully_repaired',
    repairRemark: '参数调整完成，能耗降低约15%。',
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
    reviewer: '李工',
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
    createdAt: '2024-06-02 16:00:00',
    spareParts: [
      { id: 'sp18', name: '温度传感器', code: 'SP-SENSOR-001', quantity: 2, unit: '个', stock: 5, hasStock: true, location: '仓库A区', issued: true, issuedQuantity: 2, issuedBy: '孙工', issuedAt: '2024-06-03 07:30:00', actualQuantity: 1 },
      { id: 'sp19', name: '信号电缆', code: 'SP-CABLE-003', quantity: 5, unit: '米', stock: 50, hasStock: true, location: '仓库B区', issued: true, issuedQuantity: 5, issuedBy: '孙工', issuedAt: '2024-06-03 07:30:00', actualQuantity: 3 },
    ],
    safetyNotes: [
      { id: 'sn19', content: '更换传感器前断开电源', priority: 'high', category: 'electrical' },
      { id: 'sn20', content: '传感器安装后进行校准', priority: 'medium', category: 'mechanical' },
    ],
    aiRecommendation: {
      recommendedSolution: '温度传感器读数异常通常需要更换传感器并重新校准。建议使用同型号传感器进行更换。',
      confidence: 0.91,
      steps: [
        { id: 'step31', order: 1, title: '断电准备', description: '断开传感器电源和信号连接', estimatedTime: '10分钟' },
        { id: 'step32', order: 2, title: '拆除旧传感器', description: '拆除故障传感器', estimatedTime: '15分钟' },
        { id: 'step33', order: 3, title: '安装新传感器', description: '安装新传感器并接线', estimatedTime: '20分钟' },
        { id: 'step34', order: 4, title: '校准', description: '使用标准设备进行校准', estimatedTime: '30分钟' },
        { id: 'step35', order: 5, title: '验证', description: '验证传感器读数准确性', estimatedTime: '15分钟' },
      ],
      relatedCases: [
        { id: 'c11', code: 'WO-20240505-005', title: '温度传感器更换', deviceName: '温度传感器TS-002', problemDescription: '读数漂移', solution: '更换传感器并校准', result: 'success', createdAt: '2024-05-05', similarity: 0.93 },
      ],
    },
    repairResult: 'partially_repaired',
    repairRemark: '已更换传感器并完成校准，但发现连接线有轻微老化，建议下次维护时更换。',
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
    createdAt: '2024-06-01 10:00:00',
    spareParts: [
      { id: 'sp20', name: '吊装带', code: 'SP-STRAP-001', quantity: 4, unit: '条', stock: 10, hasStock: true, location: '工具间' },
      { id: 'sp21', name: '移动底座', code: 'SP-BASE-001', quantity: 1, unit: '个', stock: 3, hasStock: true, location: '仓库C区' },
      { id: 'sp22', name: '固定螺栓', code: 'SP-BOLT-001', quantity: 8, unit: '套', stock: 50, hasStock: true, location: '仓库A区' },
    ],
    safetyNotes: [
      { id: 'sn21', content: '迁移前排空设备内部介质', priority: 'high', category: 'mechanical' },
      { id: 'sn22', content: '使用合格的吊装设备和吊具', priority: 'high', category: 'work_permit' },
      { id: 'sn23', content: '迁移过程中注意保护设备精密部件', priority: 'medium', category: 'mechanical' },
    ],
    aiRecommendation: {
      recommendedSolution: '设备迁移需做好充分准备，包括吊装方案、运输路径规划和安全措施。',
      confidence: 0.89,
      steps: [
        { id: 'step36', order: 1, title: '方案制定', description: '制定详细的迁移方案和安全措施', estimatedTime: '60分钟' },
        { id: 'step37', order: 2, title: '设备准备', description: '排空设备内部介质，拆除外部连接', estimatedTime: '90分钟' },
        { id: 'step38', order: 3, title: '吊装运输', description: '使用吊车将设备吊装至运输车辆', estimatedTime: '60分钟' },
        { id: 'step39', order: 4, title: '现场就位', description: '运输至新位置并安装固定', estimatedTime: '60分钟' },
        { id: 'step40', order: 5, title: '调试验收', description: '重新连接并进行试运行', estimatedTime: '120分钟' },
      ],
      relatedCases: [
        { id: 'c12', code: 'WO-20240215-008', title: '设备迁移', deviceName: '压缩机C-002', problemDescription: '车间布局调整', solution: '完成设备拆卸、运输和重新安装', result: 'success', createdAt: '2024-02-15', similarity: 0.86 },
      ],
    },
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
    createdAt: '2024-06-06 08:00:00',
    spareParts: [
      { id: 'sp23', name: '测振仪', code: 'SP-TOOL-003', quantity: 1, unit: '台', stock: 3, hasStock: true, location: '工具间' },
      { id: 'sp24', name: '红外测温仪', code: 'SP-TOOL-004', quantity: 1, unit: '台', stock: 2, hasStock: true, location: '工具间' },
    ],
    safetyNotes: [
      { id: 'sn24', content: '巡检前确认设备停机或处于安全状态', priority: 'high', category: 'mechanical' },
      { id: 'sn25', content: '检查高压部件时注意安全距离', priority: 'high', category: 'electrical' },
    ],
    aiRecommendation: {
      recommendedSolution: '月度巡检需按照设备保养手册进行全面检查，重点关注关键部件的磨损和运行状态。',
      confidence: 0.94,
      steps: [
        { id: 'step41', order: 1, title: '外观检查', description: '检查设备外观、管道、阀门有无异常', estimatedTime: '20分钟' },
        { id: 'step42', order: 2, title: '振动检测', description: '使用测振仪测量各测点振动值', estimatedTime: '30分钟' },
        { id: 'step43', order: 3, title: '温度检测', description: '使用红外测温仪检测关键部件温度', estimatedTime: '20分钟' },
        { id: 'step44', order: 4, title: '油液检查', description: '检查润滑油液位和质量', estimatedTime: '15分钟' },
        { id: 'step45', order: 5, title: '报告整理', description: '整理巡检报告，记录发现的问题', estimatedTime: '20分钟' },
      ],
      relatedCases: [
        { id: 'c13', code: 'WO-20240501-006', title: '压缩机定期巡检', deviceName: '压缩机C-002', problemDescription: '月度巡检', solution: '按标准流程完成巡检，发现皮带磨损问题', result: 'partial', createdAt: '2024-05-01', similarity: 0.87 },
      ],
    },
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
  pending_parts: '待领用备件',
  in_progress: '进行中',
  pending_review: '待验收',
  completed: '已完成',
  cancelled: '已取消'
};

export const operators = ['张工', '李工', '王工', '赵工', '孙工', '周工', '吴工', '郑工'];