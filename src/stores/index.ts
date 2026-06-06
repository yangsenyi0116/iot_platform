import { create } from 'zustand';
import type { Gateway, Device, Alarm, AlarmRule, KnowledgeItem, DataPoint } from '../types';
import { mockGateways, mockDataPoints } from '../mocks/gateways';
import { mockDevices } from '../mocks/devices';
import { mockAlarms, mockAlarmRules, generateRandomAlarm } from '../mocks/alarms';
import { knowledgeItems as mockKnowledgeBase } from '../mocks/knowledge';
import { simulateGatewayStatus, simulateDeviceData, simulateDataPoint } from '../mocks/realtimeSimulator';

interface AppStore {
  gateways: Gateway[];
  devices: Device[];
  dataPoints: DataPoint[];
  alarms: Alarm[];
  alarmRules: AlarmRule[];
  knowledgeBase: KnowledgeItem[];
  selectedGatewayId: string | null;
  selectedDeviceId: string | null;
  highlightedDeviceId: string | null;
  searchKeyword: string;
  lastUpdateTime: number;
  updateIntervalId: number | null;
  
  setGateways: (gateways: Gateway[]) => void;
  addGateway: (gateway: Gateway) => void;
  updateGateway: (gateway: Gateway) => void;
  deleteGateway: (id: string) => void;
  
  setDevices: (devices: Device[]) => void;
  addDevice: (device: Device) => void;
  updateDevice: (device: Device) => void;
  deleteDevice: (id: string) => void;
  bindDataPoint: (deviceId: string, pointId: string) => void;
  unbindDataPoint: (deviceId: string, pointId: string) => void;
  
  setDataPoints: (points: DataPoint[]) => void;
  
  setAlarms: (alarms: Alarm[]) => void;
  addAlarm: (alarm: Alarm) => void;
  confirmAlarm: (id: string) => void;
  deleteAlarm: (id: string) => void;
  
  setAlarmRules: (rules: AlarmRule[]) => void;
  addAlarmRule: (rule: AlarmRule) => void;
  updateAlarmRule: (rule: AlarmRule) => void;
  deleteAlarmRule: (id: string) => void;
  
  setSelectedGatewayId: (id: string | null) => void;
  setSelectedDeviceId: (id: string | null) => void;
  setHighlightedDeviceId: (id: string | null) => void;
  setSearchKeyword: (keyword: string) => void;
  
  simulateRealtimeData: () => void;
  startSimulation: () => void;
  stopSimulation: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  gateways: mockGateways,
  devices: mockDevices,
  dataPoints: mockDataPoints,
  alarms: mockAlarms,
  alarmRules: mockAlarmRules,
  knowledgeBase: mockKnowledgeBase,
  selectedGatewayId: null,
  selectedDeviceId: null,
  highlightedDeviceId: null,
  searchKeyword: '',
  lastUpdateTime: Date.now(),
  updateIntervalId: null,
  
  setGateways: (gateways) => set({ gateways }),
  addGateway: (gateway) => set((state) => ({ gateways: [...state.gateways, gateway] })),
  updateGateway: (gateway) => set((state) => ({
    gateways: state.gateways.map(g => g.id === gateway.id ? gateway : g),
  })),
  deleteGateway: (id) => set((state) => ({
    gateways: state.gateways.filter(g => g.id !== id),
  })),
  
  setDevices: (devices) => set({ devices }),
  addDevice: (device) => set((state) => ({ devices: [...state.devices, device] })),
  updateDevice: (device) => set((state) => ({
    devices: state.devices.map(d => d.id === device.id ? device : d),
  })),
  deleteDevice: (id) => set((state) => ({
    devices: state.devices.filter(d => d.id !== id),
  })),
  bindDataPoint: (deviceId, pointId) => set((state) => ({
    devices: state.devices.map(d => 
      d.id === deviceId && !d.boundPoints.includes(pointId)
        ? { ...d, boundPoints: [...d.boundPoints, pointId] }
        : d
    ),
  })),
  unbindDataPoint: (deviceId, pointId) => set((state) => ({
    devices: state.devices.map(d => 
      d.id === deviceId
        ? { ...d, boundPoints: d.boundPoints.filter(p => p !== pointId) }
        : d
    ),
  })),
  
  setDataPoints: (points) => set({ dataPoints: points }),
  
  setAlarms: (alarms) => set({ alarms }),
  addAlarm: (alarm) => set((state) => ({ alarms: [alarm, ...state.alarms] })),
  confirmAlarm: (id) => set((state) => ({
    alarms: state.alarms.map(a => a.id === id ? { ...a, confirmed: true } : a),
  })),
  deleteAlarm: (id) => set((state) => ({
    alarms: state.alarms.filter(a => a.id !== id),
  })),
  
  setAlarmRules: (rules) => set({ alarmRules: rules }),
  addAlarmRule: (rule) => set((state) => ({ alarmRules: [...state.alarmRules, rule] })),
  updateAlarmRule: (rule) => set((state) => ({
    alarmRules: state.alarmRules.map(r => r.id === rule.id ? rule : r),
  })),
  deleteAlarmRule: (id) => set((state) => ({
    alarmRules: state.alarmRules.filter(r => r.id !== id),
  })),
  
  setSelectedGatewayId: (id) => set({ selectedGatewayId: id }),
  setSelectedDeviceId: (id) => set({ selectedDeviceId: id }),
  setHighlightedDeviceId: (id) => set({ highlightedDeviceId: id }),
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  
  simulateRealtimeData: () => {
    const { gateways, devices, dataPoints, alarms } = get();
    
    const newGateways = gateways.map(g => simulateGatewayStatus(g));
    const newDevices = devices.map(d => simulateDeviceData(d));
    const newDataPoints = dataPoints.map(p => simulateDataPoint(p));
    
    if (Math.random() < 0.03) {
      const newAlarm = generateRandomAlarm();
      set({ alarms: [newAlarm, ...alarms.slice(0, 49)] });
    }
    
    set({ 
      gateways: newGateways,
      devices: newDevices,
      dataPoints: newDataPoints,
      lastUpdateTime: Date.now(),
    });
  },
  
  startSimulation: () => {
    const { updateIntervalId, simulateRealtimeData } = get();
    if (updateIntervalId) return;
    
    const intervalId = window.setInterval(() => {
      simulateRealtimeData();
    }, 2000);
    
    set({ updateIntervalId: intervalId });
  },
  
  stopSimulation: () => {
    const { updateIntervalId } = get();
    if (updateIntervalId) {
      clearInterval(updateIntervalId);
      set({ updateIntervalId: null });
    }
  },
}));
