import type { EnergyOverview, EnergyCurveData, DeviceEnergyRank, AIOptimizationSuggestion, EnergyEfficiencyStats, DeviceEfficiency } from '../types';

export const mockEnergyOverview: EnergyOverview = {
  totalEnergy: 1284500,
  totalEnergyChange: -3.2,
  greenEnergy: 342200,
  greenEnergyRatio: 26.6,
  carbonEmission: 486.5,
  carbonChange: -2.8,
};

export function mockEnergyCurveData(range: 'day' | 'week' | 'month' | 'year'): EnergyCurveData {
  const timePoints: string[] = [];
  const totalEnergy: number[] = [];
  const greenEnergy: number[] = [];

  let count: number;
  let unit: string;

  switch (range) {
    case 'day':
      count = 24;
      unit = '时';
      break;
    case 'week':
      count = 7;
      unit = '日';
      break;
    case 'month':
      count = 30;
      unit = '日';
      break;
    case 'year':
      count = 12;
      unit = '月';
      break;
    default:
      count = 24;
      unit = '时';
  }

  for (let i = 0; i < count; i++) {
    if (range === 'day') {
      timePoints.push(`${i}${unit}`);
      const hour = i;
      let energy = 40000 + Math.sin((hour - 6) * Math.PI / 12) * 30000;
      if (hour >= 22 || hour < 6) {
        energy *= 0.4;
      }
      totalEnergy.push(Math.round(energy));

      let green = 0;
      if (hour >= 8 && hour <= 18) {
        green = 20000 + Math.sin((hour - 12) * Math.PI / 6) * 15000;
      }
      greenEnergy.push(Math.round(green));
    } else if (range === 'week') {
      const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      timePoints.push(days[i]);
      let energy = 180000;
      if (i >= 5) {
        energy *= 0.6;
      }
      totalEnergy.push(Math.round(energy));
      greenEnergy.push(Math.round(48000));
    } else if (range === 'month') {
      timePoints.push(`${i + 1}${unit}`);
      const energy = 42000 + Math.sin(i * Math.PI / 15) * 15000;
      totalEnergy.push(Math.round(energy));
      const green = 11000 + Math.sin((i - 7) * Math.PI / 15) * 5000;
      greenEnergy.push(Math.round(green));
    } else {
      const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
      timePoints.push(months[i]);
      let energy = 100000;
      if (i >= 4 && i <= 9) {
        energy *= 1.3;
      }
      totalEnergy.push(Math.round(energy));
      let green = 30000;
      if (i >= 5 && i <= 8) {
        green *= 1.5;
      }
      greenEnergy.push(Math.round(green));
    }
  }

  return { timePoints, totalEnergy, greenEnergy };
}

export const mockDeviceEnergyRank: DeviceEnergyRank[] = [
  { deviceId: 'dev-001', deviceName: '空压机A01', deviceType: '空压机', energy: 86500, ratio: 18.5 },
  { deviceId: 'dev-002', deviceName: '空压机A02', deviceType: '空压机', energy: 78200, ratio: 16.7 },
  { deviceId: 'dev-003', deviceName: '干燥机B01', deviceType: '干燥设备', energy: 45300, ratio: 9.7 },
  { deviceId: 'dev-004', deviceName: '冷却塔C01', deviceType: '冷却设备', energy: 38900, ratio: 8.3 },
  { deviceId: 'dev-005', deviceName: '风机D01', deviceType: '风机', energy: 32100, ratio: 6.9 },
  { deviceId: 'dev-006', deviceName: '水泵E01', deviceType: '水泵', energy: 28600, ratio: 6.1 },
  { deviceId: 'dev-007', deviceName: '空压机A03', deviceType: '空压机', energy: 25400, ratio: 5.4 },
  { deviceId: 'dev-008', deviceName: '风机D02', deviceType: '风机', energy: 22100, ratio: 4.7 },
];

export const mockOptimizationSuggestions: AIOptimizationSuggestion[] = [
  {
    id: '1',
    content: '空压机A01 在非生产时段（22:00-06:00）存在待机能耗，建议设置定时停机策略。',
    estimatedSaving: 8500,
    savingRatio: 6.6,
    relatedDeviceId: 'dev-001',
    relatedDeviceName: '空压机A01',
    status: 'pending',
  },
  {
    id: '2',
    content: '绿电发电高峰期（12:00-15:00）高能耗设备可错峰使用，提升绿电消纳率。',
    estimatedSaving: 3200,
    savingRatio: 2.5,
    status: 'pending',
  },
  {
    id: '3',
    content: '空压机群联控优化，根据用气量自动调节启停数量，减少空载运行。',
    estimatedSaving: 6800,
    savingRatio: 5.3,
    status: 'pending',
  },
];

export const mockEfficiencyStats: EnergyEfficiencyStats = {
  level1: { count: 8, ratio: 25 },
  level2: { count: 13, ratio: 42 },
  level3: { count: 9, ratio: 28 },
  levelBelow: { count: 2, ratio: 5 },
};

export const mockDeviceEfficiency: DeviceEfficiency[] = [
  { deviceId: 'dev-001', deviceName: '空压机A01', deviceType: '空压机', energy: 86500, output: 2160, outputUnit: 'h', efficiencyIndex: 89.5, level: 'level2' },
  { deviceId: 'dev-002', deviceName: '空压机A02', deviceType: '空压机', energy: 78200, output: 2160, outputUnit: 'h', efficiencyIndex: 97.8, level: 'level1' },
  { deviceId: 'dev-003', deviceName: '干燥机B01', deviceType: '干燥设备', energy: 45300, output: 2160, outputUnit: 'h', efficiencyIndex: 82.3, level: 'level3' },
  { deviceId: 'dev-004', deviceName: '冷却塔C01', deviceType: '冷却设备', energy: 38900, output: 2160, outputUnit: 'h', efficiencyIndex: 72.1, level: 'levelBelow' },
  { deviceId: 'dev-005', deviceName: '风机D01', deviceType: '风机', energy: 32100, output: 2160, outputUnit: 'h', efficiencyIndex: 91.2, level: 'level2' },
  { deviceId: 'dev-006', deviceName: '水泵E01', deviceType: '水泵', energy: 28600, output: 2160, outputUnit: 'h', efficiencyIndex: 88.6, level: 'level2' },
  { deviceId: 'dev-007', deviceName: '空压机A03', deviceType: '空压机', energy: 25400, output: 2160, outputUnit: 'h', efficiencyIndex: 96.5, level: 'level1' },
  { deviceId: 'dev-008', deviceName: '风机D02', deviceType: '风机', energy: 22100, output: 2160, outputUnit: 'h', efficiencyIndex: 98.2, level: 'level1' },
  { deviceId: 'dev-009', deviceName: '水泵E02', deviceType: '水泵', energy: 19800, output: 2160, outputUnit: 'h', efficiencyIndex: 95.1, level: 'level1' },
  { deviceId: 'dev-010', deviceName: '冷却泵F01', deviceType: '水泵', energy: 17500, output: 2160, outputUnit: 'h', efficiencyIndex: 93.4, level: 'level2' },
  { deviceId: 'dev-011', deviceName: '空压机A04', deviceType: '空压机', energy: 45300, output: 2160, outputUnit: 'h', efficiencyIndex: 79.8, level: 'level3' },
  { deviceId: 'dev-012', deviceName: '干燥机B02', deviceType: '干燥设备', energy: 32100, output: 2160, outputUnit: 'h', efficiencyIndex: 84.5, level: 'level3' },
  { deviceId: 'dev-013', deviceName: '风机D03', deviceType: '风机', energy: 15200, output: 2160, outputUnit: 'h', efficiencyIndex: 97.3, level: 'level1' },
  { deviceId: 'dev-014', deviceName: '水泵E03', deviceType: '水泵', energy: 12800, output: 2160, outputUnit: 'h', efficiencyIndex: 95.8, level: 'level1' },
  { deviceId: 'dev-015', deviceName: '冷却泵F02', deviceType: '水泵', energy: 18900, output: 2160, outputUnit: 'h', efficiencyIndex: 92.1, level: 'level2' },
  { deviceId: 'dev-016', deviceName: '冷却塔C02', deviceType: '冷却设备', energy: 25600, output: 2160, outputUnit: 'h', efficiencyIndex: 81.6, level: 'level3' },
  { deviceId: 'dev-017', deviceName: '风机D04', deviceType: '风机', energy: 18200, output: 2160, outputUnit: 'h', efficiencyIndex: 93.8, level: 'level2' },
  { deviceId: 'dev-018', deviceName: '空压机A05', deviceType: '空压机', energy: 52100, output: 2160, outputUnit: 'h', efficiencyIndex: 77.2, level: 'level3' },
  { deviceId: 'dev-019', deviceName: '水泵E04', deviceType: '水泵', energy: 22400, output: 2160, outputUnit: 'h', efficiencyIndex: 89.9, level: 'level2' },
  { deviceId: 'dev-020', deviceName: '冷却泵F03', deviceType: '水泵', energy: 28900, output: 2160, outputUnit: 'h', efficiencyIndex: 87.3, level: 'level2' },
  { deviceId: 'dev-021', deviceName: '干燥机B03', deviceType: '干燥设备', energy: 38500, output: 2160, outputUnit: 'h', efficiencyIndex: 68.5, level: 'levelBelow' },
  { deviceId: 'dev-022', deviceName: '风机D05', deviceType: '风机', energy: 16800, output: 2160, outputUnit: 'h', efficiencyIndex: 96.9, level: 'level1' },
  { deviceId: 'dev-023', deviceName: '水泵E05', deviceType: '水泵', energy: 14500, output: 2160, outputUnit: 'h', efficiencyIndex: 98.1, level: 'level1' },
  { deviceId: 'dev-024', deviceName: '冷却塔C03', deviceType: '冷却设备', energy: 31200, output: 2160, outputUnit: 'h', efficiencyIndex: 83.9, level: 'level3' },
  { deviceId: 'dev-025', deviceName: '空压机A06', deviceType: '空压机', energy: 48600, output: 2160, outputUnit: 'h', efficiencyIndex: 80.5, level: 'level3' },
  { deviceId: 'dev-026', deviceName: '风机D06', deviceType: '风机', energy: 19500, output: 2160, outputUnit: 'h', efficiencyIndex: 97.5, level: 'level1' },
  { deviceId: 'dev-027', deviceName: '水泵E06', deviceType: '水泵', energy: 17200, output: 2160, outputUnit: 'h', efficiencyIndex: 94.2, level: 'level2' },
  { deviceId: 'dev-028', deviceName: '冷却泵F04', deviceType: '水泵', energy: 21300, output: 2160, outputUnit: 'h', efficiencyIndex: 90.8, level: 'level2' },
  { deviceId: 'dev-029', deviceName: '干燥机B04', deviceType: '干燥设备', energy: 41200, output: 2160, outputUnit: 'h', efficiencyIndex: 75.6, level: 'level3' },
  { deviceId: 'dev-030', deviceName: '风机D07', deviceType: '风机', energy: 20100, output: 2160, outputUnit: 'h', efficiencyIndex: 92.7, level: 'level2' },
];

export const efficiencyLevelLabels: Record<string, string> = {
  level1: '一级',
  level2: '二级',
  level3: '三级',
  levelBelow: '三级以下',
};

export const efficiencyLevelColors: Record<string, string> = {
  level1: '#22c55e',
  level2: '#eab308',
  level3: '#f97316',
  levelBelow: '#ef4444',
};
