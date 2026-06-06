import type { AIResponse } from '../types';

export const aiResponses: Record<string, AIResponse> = {
  temperature_high: {
    question: '温度过高/过热',
    answer: '根据知识库，设备温度过高可能的原因有：\n\n1. 冷却系统故障（冷却风扇损坏/散热片堵塞）\n2. 润滑油不足或变质\n3. 长时间超负荷运行\n4. 环境温度过高\n\n建议处理步骤：\n- 检查冷却风扇是否正常运转\n- 清理散热片灰尘\n- 检查润滑油液位和状态\n- 降低设备负载或增加散热措施',
    relatedCases: ['案例#023：冷却系统清洗', '案例#045：润滑油更换'],
    relatedDocuments: ['空压机操作手册章节3.2', '设备润滑手册'],
    suggestedWorkOrder: '生成温度异常维修工单'
  },
  vibration: {
    question: '振动/异响',
    answer: '设备振动异常通常由以下原因引起：\n\n1. 轴承磨损或损坏\n2. 叶轮/转子不平衡\n3. 对中不良\n4. 基础松动\n\n建议处理步骤：\n- 使用振动分析仪检测振动频率\n- 检查轴承状态和润滑情况\n- 进行叶轮动平衡校正\n- 检查设备基础紧固情况',
    relatedCases: ['案例#001：轴承更换', '案例#078：叶轮平衡校正'],
    relatedDocuments: ['离心泵维护指南', '机械传动维护手册'],
    suggestedWorkOrder: '生成振动异常维修工单'
  },
  replacement_cycle: {
    question: '更换周期/多久换',
    answer: '不同设备部件的建议更换周期：\n\n• 离心泵C系列轴承：\n  - 标准工况: 8000运行小时\n  - 重载工况: 5000运行小时\n\n• 空压机润滑油：\n  - 矿物油: 2000-3000小时\n  - 合成油: 6000-8000小时\n\n• 风机叶轮：\n  - 定期检查，根据磨损情况更换\n\n当前设备"水泵P-102"已运行4872小时，建议安排预防性维护。',
    relatedCases: ['案例#001：轴承更换', '案例#045：润滑油更换'],
    relatedDocuments: ['设备润滑手册', '离心泵维护指南'],
    suggestedWorkOrder: '生成预防性维护工单'
  },
  alarm_code: {
    question: '报警代码/E-xxx',
    answer: '常见故障代码解析：\n\n• E-101（过载）：设备负载超过额定值\n  - 检查负载情况，降低运行负荷\n  - 检查电机电流是否正常\n\n• E-205（温度过高）：设备温度超过报警阈值\n  - 检查冷却系统\n  - 检查润滑油状态\n\n• E-301（振动异常）：振动值超过报警阈值\n  - 检查轴承和叶轮\n  - 进行动平衡检测\n\n• E-402（油位过低）：润滑油液位不足\n  - 添加润滑油至正常液位\n  - 检查是否存在泄漏',
    relatedCases: ['案例#001：轴承更换', '案例#023：冷却系统清洗', '案例#045：润滑油更换'],
    relatedDocuments: ['电气安全规范', '设备润滑手册'],
    suggestedWorkOrder: '生成故障处理工单'
  },
  installation: {
    question: '如何安装/怎么装',
    answer: '设备安装的通用步骤：\n\n1. 基础准备：\n   - 检查安装基础平整度\n   - 预留足够的操作和维护空间\n\n2. 设备就位：\n   - 使用合适的吊装设备\n   - 确保设备水平度符合要求\n\n3. 固定连接：\n   - 紧固地脚螺栓\n   - 连接管道和电缆\n\n4. 调试验收：\n   - 检查转向是否正确\n   - 空载试运行\n   - 带载试运行并记录参数',
    relatedCases: ['案例#102：PLC程序升级'],
    relatedDocuments: ['空压机操作手册v2.0', '电气安全规范'],
    suggestedWorkOrder: '生成安装调试工单'
  },
  maintenance: {
    question: '维护保养/日常维护',
    answer: '设备日常维护要点：\n\n1. 班前检查：\n   - 检查润滑油液位\n   - 检查设备外观有无异常\n   - 确认安全防护装置完好\n\n2. 运行中监控：\n   - 定期记录运行参数（温度、压力、振动）\n   - 注意设备运行声音\n   - 检查有无泄漏\n\n3. 定期保养：\n   - 按周期更换润滑油\n   - 清洗或更换滤芯\n   - 检查紧固件力矩\n\n4. 记录管理：\n   - 建立设备维护档案\n   - 记录每次维护内容和发现的问题',
    relatedCases: ['案例#045：润滑油更换'],
    relatedDocuments: ['设备润滑手册', '离心泵维护指南'],
    suggestedWorkOrder: '生成定期维护工单'
  }
};

export const defaultResponse: AIResponse = {
  question: '',
  answer: '暂无相关知识，建议创建工单或补充知识库。如需帮助，请提供更具体的问题描述。',
  relatedCases: [],
  relatedDocuments: []
};

export const getAIResponse = (question: string): AIResponse => {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('温度过高') || lowerQuestion.includes('过热') || lowerQuestion.includes('温度异常')) {
    return { ...aiResponses.temperature_high, question };
  }
  
  if (lowerQuestion.includes('振动') || lowerQuestion.includes('异响') || lowerQuestion.includes('抖动')) {
    return { ...aiResponses.vibration, question };
  }
  
  if (lowerQuestion.includes('更换周期') || lowerQuestion.includes('多久换') || lowerQuestion.includes('什么时候换')) {
    return { ...aiResponses.replacement_cycle, question };
  }
  
  if (lowerQuestion.includes('报警') || lowerQuestion.includes('E-') || lowerQuestion.includes('故障码')) {
    return { ...aiResponses.alarm_code, question };
  }
  
  if (lowerQuestion.includes('安装') || lowerQuestion.includes('怎么装') || lowerQuestion.includes('如何装')) {
    return { ...aiResponses.installation, question };
  }
  
  if (lowerQuestion.includes('维护') || lowerQuestion.includes('保养') || lowerQuestion.includes('日常')) {
    return { ...aiResponses.maintenance, question };
  }
  
  return { ...defaultResponse, question };
};