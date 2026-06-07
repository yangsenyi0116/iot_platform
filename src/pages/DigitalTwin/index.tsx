import { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Button, Card, Row, Col, Tag } from 'antd';
import { SunOutlined, CloudOutlined, UndoOutlined, BuildOutlined, HomeOutlined, AreaChartOutlined, DesktopOutlined, WarningOutlined, NotificationOutlined, InfoCircleOutlined, ToolOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAppStore } from '../../stores';
import type { Device, DeviceEvent } from '../../types';
import { mockDeviceEvents } from '../../mocks/devices';
import DeviceDetailModal from '../DeviceManagement/DeviceDetailModal';
import * as THREE from 'three';

const formatEventTime = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  return `${days}天前`;
};

const getEventIcon = (type: DeviceEvent['type']) => {
  switch (type) {
    case 'alarm':
      return <WarningOutlined style={{ color: '#ff4d4f' }} />;
    case 'warning':
      return <NotificationOutlined style={{ color: '#faad14' }} />;
    case 'maintenance':
      return <ToolOutlined style={{ color: '#1890ff' }} />;
    default:
      return <InfoCircleOutlined style={{ color: '#52c41a' }} />;
  }
};

const getEventTagColor = (type: DeviceEvent['type']) => {
  switch (type) {
    case 'alarm': return 'red';
    case 'warning': return 'orange';
    case 'maintenance': return 'blue';
    default: return 'green';
  }
};

const getEventTypeName = (type: DeviceEvent['type']) => {
  switch (type) {
    case 'alarm': return '告警';
    case 'warning': return '预警';
    case 'maintenance': return '维护';
    default: return '信息';
  }
};

interface Device3DProps {
  device: Device;
  position: [number, number, number];
  isHighlighted: boolean;
  isAlert: boolean;
  scale: number;
}

interface Area3DProps {
  name: string;
  position: [number, number, number];
  color: string;
  size: [number, number];
  onClick: () => void;
  scale: number;
}

function Device3D({ device, position, isHighlighted, isAlert, scale }: Device3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isClicked, setIsClicked] = useState(false);
  const [targetScale, setTargetScale] = useState(scale);
  
  const getColor = () => {
    if (isAlert) return '#ff4d4f';
    switch (device.status) {
      case 'normal': return '#52C41A';
      case 'warning': return '#FAAD14';
      case 'alarm': return '#FF4D4F';
      default: return '#8C8C8C';
    }
  };
  
  useEffect(() => {
    setTargetScale(isHighlighted || isAlert ? scale * 1.3 : scale);
  }, [isHighlighted, isAlert, scale]);
  
  useFrame(() => {
    if (meshRef.current) {
      const currentScale = meshRef.current.scale.x;
      const easeFactor = 0.15;
      const newScale = currentScale + (targetScale - currentScale) * easeFactor;
      meshRef.current.scale.set(newScale, newScale, newScale);
      
      if (device.status === 'alarm' || isAlert) {
        const pulse = Math.sin(Date.now() * 0.005) * 0.1;
        meshRef.current.scale.x = newScale * (1 + pulse);
        meshRef.current.scale.y = newScale * (1 + pulse);
        meshRef.current.scale.z = newScale * (1 + pulse);
      }
    }
  });
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
    const event = new CustomEvent('device-click', { detail: device });
    window.dispatchEvent(event);
  };
  
  return (
    <group position={position}>
      {isHighlighted && (
        <mesh position={[0, 0, 0]}>
          {device.model.includes('CNC') ? (
            <boxGeometry args={[2.4, 1.8, 2.4]} />
          ) : device.model.includes('ROB') ? (
            <sphereGeometry args={[1.2, 32, 32]} />
          ) : device.model.includes('CONV') ? (
            <boxGeometry args={[4.8, 0.6, 1.2]} />
          ) : (
            <sphereGeometry args={[1.3, 32, 32]} />
          )}
          <meshBasicMaterial color={getColor()} transparent opacity={0.2} wireframe />
        </mesh>
      )}
      <mesh 
        ref={meshRef}
        onClick={handleClick}
        scale={isClicked ? scale * 0.9 : undefined}
      >
        {device.model.includes('CNC') ? (
          <>
            <boxGeometry args={[2, 1.5, 2]} />
            <meshStandardMaterial 
              color={getColor()} 
              emissive={isHighlighted ? getColor() : '#000'} 
              emissiveIntensity={isHighlighted ? 0.8 : 0}
              roughness={0.3}
              metalness={0.7}
            />
          </>
        ) : device.model.includes('ROB') ? (
          <>
            <cylinderGeometry args={[0.8, 0.8, 3, 32]} />
            <meshStandardMaterial 
              color={getColor()} 
              emissive={isHighlighted ? getColor() : '#000'} 
              emissiveIntensity={isHighlighted ? 0.8 : 0}
              roughness={0.3}
              metalness={0.7}
            />
          </>
        ) : device.model.includes('CONV') ? (
          <>
            <boxGeometry args={[4, 0.5, 1]} />
            <meshStandardMaterial 
              color={getColor()} 
              emissive={isHighlighted ? getColor() : '#000'} 
              emissiveIntensity={isHighlighted ? 0.8 : 0}
              roughness={0.3}
              metalness={0.7}
            />
          </>
        ) : (
          <>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial 
              color={getColor()} 
              emissive={isHighlighted ? getColor() : '#000'} 
              emissiveIntensity={isHighlighted ? 0.8 : 0}
              roughness={0.3}
              metalness={0.7}
            />
          </>
        )}
      </mesh>
      <Text 
        position={[0, 2.5 * scale, 0]} 
        fontSize={0.5 * scale} 
        color={getColor()}
        anchorX="center"
      >
        {device.name}
      </Text>
    </group>
  );
}

function Area3D({ name, position, color, size, onClick, scale }: Area3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isClicked, setIsClicked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  useFrame(() => {
    if (meshRef.current) {
      const targetScale = isHovered ? scale * 1.05 : scale;
      const currentScale = meshRef.current.scale.x;
      const newScale = currentScale + (targetScale - currentScale) * 0.2;
      meshRef.current.scale.set(newScale, newScale, newScale);
    }
  });
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
    onClick();
  };
  
  return (
    <mesh 
      ref={meshRef}
      position={[position[0], 0.1, position[2]]} 
      onClick={handleClick}
      onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setIsHovered(false); }}
      scale={isClicked ? scale * 0.95 : undefined}
    >
      <boxGeometry args={[size[0] * scale, 0.2, size[1] * scale]} />
      <meshStandardMaterial 
        color={color} 
        transparent 
        opacity={isHovered ? 0.8 : 0.6}
        emissive={isHovered ? color : '#000'}
        emissiveIntensity={isHovered ? 0.3 : 0}
      />
      <Text position={[0, 0.5, 0]} fontSize={0.8} color="#fff" anchorX="center">
        {name}
      </Text>
    </mesh>
  );
}

function Factory3D({ name, position, onClick, scale }: { name: string; position: [number, number, number]; onClick: () => void; scale: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const [isClicked, setIsClicked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [targetScale, setTargetScale] = useState(scale);
  
  useEffect(() => {
    setTargetScale(isHovered ? scale * 1.1 : scale);
  }, [isHovered, scale]);
  
  useFrame(() => {
    if (groupRef.current) {
      const currentScale = groupRef.current.scale.x;
      const newScale = currentScale + (targetScale - currentScale) * 0.15;
      groupRef.current.scale.set(newScale, newScale, newScale);
    }
  });
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
    onClick();
  };
  
  return (
    <group ref={groupRef} position={position} scale={isClicked ? scale * 0.95 : undefined}>
      <mesh 
        onClick={handleClick}
        onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setIsHovered(false); }}
      >
        <boxGeometry args={[10 * scale, 3 * scale, 8 * scale]} />
        <meshStandardMaterial 
          color="#4a5568" 
          emissive={isHovered ? '#63b3ed' : '#000'}
          emissiveIntensity={isHovered ? 0.3 : 0}
        />
      </mesh>
      <mesh 
        position={[0, 1.6 * scale, 0]}
        onClick={handleClick}
        onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setIsHovered(false); }}
      >
        <boxGeometry args={[10 * scale, 1 * scale, 8 * scale]} />
        <meshStandardMaterial 
          color="#2d3748" 
          emissive={isHovered ? '#4299e1' : '#000'}
          emissiveIntensity={isHovered ? 0.3 : 0}
        />
      </mesh>
      <Text position={[0, 2.5 * scale, 0]} fontSize={1 * scale} color="#fff" anchorX="center">
        {name}
      </Text>
    </group>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[20, 30, 20]} intensity={1} castShadow />
      <pointLight position={[-20, 20, -20]} intensity={0.5} />
    </>
  );
}

interface HierarchyNode {
  key: string;
  title: string;
  icon?: React.ReactNode;
  children?: HierarchyNode[];
  deviceIds?: string[];
  position?: [number, number, number];
  areaSize?: [number, number];
  color?: string;
}

const hierarchyData: HierarchyNode[] = [
  {
    key: 'company',
    title: '工业智能平台',
    icon: <BuildOutlined />,
    children: [
      {
        key: 'factory-a',
        title: 'A厂区',
        icon: <HomeOutlined />,
        position: [-15, 0, 0] as [number, number, number],
        children: [
          {
            key: 'area-a1',
            title: '1号车间',
            icon: <AreaChartOutlined />,
            position: [-18, 0, -8] as [number, number, number],
            areaSize: [12, 8] as [number, number],
            color: '#4299e1',
            deviceIds: ['dev-001', 'dev-002'],
          },
          {
            key: 'area-a2',
            title: '2号车间',
            icon: <AreaChartOutlined />,
            position: [-18, 0, 8] as [number, number, number],
            areaSize: [12, 8] as [number, number],
            color: '#38a169',
            deviceIds: ['dev-006'],
          },
        ],
      },
      {
        key: 'factory-b',
        title: 'B厂区',
        icon: <HomeOutlined />,
        position: [15, 0, 0] as [number, number, number],
        children: [
          {
            key: 'area-b1',
            title: '焊接车间',
            icon: <AreaChartOutlined />,
            position: [12, 0, -8] as [number, number, number],
            areaSize: [12, 8] as [number, number],
            color: '#ed8936',
            deviceIds: ['dev-003', 'dev-004'],
          },
          {
            key: 'area-b2',
            title: '物流区',
            icon: <AreaChartOutlined />,
            position: [12, 0, 8] as [number, number, number],
            areaSize: [12, 8] as [number, number],
            color: '#9f7aea',
            deviceIds: ['dev-005', 'dev-008'],
          },
        ],
      },
    ],
  },
];

const devicePositionsInArea: Record<string, [number, number, number]> = {
  'dev-001': [-18 + 3, 0.75, -8 + 2],
  'dev-002': [-18 + 7, 0.75, -8 + 4],
  'dev-003': [12 + 3, 1.5, -8 + 2],
  'dev-004': [12 + 7, 1.5, -8 + 4],
  'dev-005': [12 + 3, 0.25, 8 + 2],
  'dev-006': [-18 + 5, 0.5, 8 + 3],
  'dev-007': [12 + 5, 0.5, -8 + 3],
  'dev-008': [12 + 7, 0.25, 8 + 4],
};

type ViewLevel = 'company' | 'factory' | 'area' | 'device';

export default function DigitalTwin() {
  const { devices, highlightedDeviceId, setHighlightedDeviceId } = useAppStore();
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showShadows, setShowShadows] = useState(true);
  const [viewLevel, setViewLevel] = useState<ViewLevel>('company');
  const [selectedNode, setSelectedNode] = useState<string>('company');
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([35, 30, 35]);
  const [targetCameraPosition, setTargetCameraPosition] = useState<[number, number, number]>([35, 30, 35]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [deviceEvents, setDeviceEvents] = useState<DeviceEvent[]>(mockDeviceEvents);
  const [newEventIds, setNewEventIds] = useState<Set<string>>(new Set());
  const [alertDeviceIds, setAlertDeviceIds] = useState<Set<string>>(new Set());
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const randomDevice = devices[Math.floor(Math.random() * devices.length)];
      if (!randomDevice) return;
      
      const eventTypes: Array<'alarm' | 'warning' | 'info' | 'maintenance'> = ['alarm', 'warning', 'info', 'maintenance'];
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const messages = {
        alarm: `${randomDevice.name}：温度异常告警，当前${randomDevice.temperature}°C`,
        warning: `${randomDevice.name}：振动值偏高，当前${randomDevice.vibration}mm/s`,
        info: `${randomDevice.name}：设备运行正常`,
        maintenance: `${randomDevice.name}：定期维护提醒`,
      };
      
      const newEvent: DeviceEvent = {
        id: `evt-new-${Date.now()}`,
        deviceId: randomDevice.id,
        deviceName: randomDevice.name,
        type: eventType,
        message: messages[eventType],
        timestamp: Date.now(),
        resolved: false,
      };
      
      setDeviceEvents(prev => [newEvent, ...prev.slice(0, 9)]);
      setNewEventIds(prev => new Set(prev).add(newEvent.id));
      setAlertDeviceIds(prev => new Set(prev).add(randomDevice.id));
      
      setTimeout(() => {
        setNewEventIds(prev => {
          const next = new Set(prev);
          next.delete(newEvent.id);
          return next;
        });
      }, 3000);
      
      setTimeout(() => {
        setAlertDeviceIds(prev => {
          const next = new Set(prev);
          next.delete(randomDevice.id);
          return next;
        });
      }, 5000);
    }, 15000);
    
    return () => clearInterval(interval);
  }, [devices]);
  
  useEffect(() => {
    const handleDeviceClick = (e: Event) => {
      const detail = (e as CustomEvent<Device>).detail;
      setSelectedDevice(detail);
      setViewLevel('device');
    };
    window.addEventListener('device-click', handleDeviceClick);
    return () => window.removeEventListener('device-click', handleDeviceClick);
  }, []);

  useEffect(() => {
    if (isAnimating) {
      const duration = 800;
      const start = Date.now();
      const startPos = [...cameraPosition] as [number, number, number];
      
      const animate = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        const newPos: [number, number, number] = [
          startPos[0] + (targetCameraPosition[0] - startPos[0]) * easeProgress,
          startPos[1] + (targetCameraPosition[1] - startPos[1]) * easeProgress,
          startPos[2] + (targetCameraPosition[2] - startPos[2]) * easeProgress,
        ];
        
        setCameraPosition(newPos);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [isAnimating, cameraPosition, targetCameraPosition]);

  const handleResetView = () => {
    setViewLevel('company');
    setSelectedNode('company');
    setTargetCameraPosition([35, 30, 35]);
    setIsAnimating(true);
    setHighlightedDeviceId(null);
    setSelectedDevice(null);
  };

  const getDevicesInCurrentView = () => {
    if (viewLevel === 'company') return devices;
    if (viewLevel === 'factory') {
      const factory = hierarchyData[0].children?.find(f => f.key === selectedNode);
      if (!factory) return [];
      const deviceIds: string[] = [];
      factory.children?.forEach(area => {
        if (area.deviceIds) deviceIds.push(...area.deviceIds);
      });
      return devices.filter(d => deviceIds.includes(d.id));
    }
    if (viewLevel === 'area') {
      const area = hierarchyData[0].children?.flatMap(f => f.children || []).find(a => a.key === selectedNode);
      if (!area) return [];
      const deviceIds = area.deviceIds || [];
      return devices.filter(d => deviceIds.includes(d.id));
    }
    return selectedDevice ? [selectedDevice] : [];
  };

  const currentViewDevices = getDevicesInCurrentView();
  const runningDevices = currentViewDevices.filter(d => d.status !== 'offline');
  const alarmDevices = currentViewDevices.filter(d => d.status === 'alarm');

  const getFilteredEvents = () => {
    const deviceIds = currentViewDevices.map(d => d.id);
    return deviceEvents.filter(event => deviceIds.includes(event.deviceId));
  };

  const getViewScale = () => {
    switch (viewLevel) {
      case 'company': return 0.8;
      case 'factory': return 1.2;
      case 'area': return 1.5;
      case 'device': return 2;
      default: return 1;
    }
  };

  const render3DContent = () => {
    const currentDevices = getDevicesInCurrentView();
    const scale = getViewScale();
    
    if (viewLevel === 'company') {
      return (
        <>
          {hierarchyData[0].children?.map(factory => (
            <Factory3D 
              key={factory.key} 
              name={factory.title} 
              position={factory.position || [0, 0, 0]}
              onClick={() => {
                setSelectedNode(factory.key);
                setViewLevel('factory');
                if (factory.position) {
                  setTargetCameraPosition([factory.position[0] + 15, 15, factory.position[2] + 15]);
                  setIsAnimating(true);
                }
              }}
              scale={scale}
            />
          ))}
        </>
      );
    }
    
    if (viewLevel === 'factory') {
      const factory = hierarchyData[0].children?.find(f => f.key === selectedNode);
      return (
        <>
          {factory?.children?.map(area => (
            <Area3D 
              key={area.key}
              name={area.title}
              position={area.position || [0, 0, 0]}
              color={area.color || '#666'}
              size={area.areaSize || [10, 10]}
              onClick={() => {
                setSelectedNode(area.key);
                setViewLevel('area');
                if (area.position) {
                  setTargetCameraPosition([area.position[0], 12, area.position[2] + 10]);
                  setIsAnimating(true);
                }
              }}
              scale={scale}
            />
          ))}
          {currentDevices.map(device => (
            <Device3D 
              key={device.id}
              device={device}
              position={devicePositionsInArea[device.id] || [0, 0, 0]}
              isHighlighted={highlightedDeviceId === device.id}
              isAlert={alertDeviceIds.has(device.id)}
              scale={scale}
            />
          ))}
        </>
      );
    }
    
    if (viewLevel === 'area' || viewLevel === 'device') {
      return currentDevices.map(device => (
        <Device3D 
          key={device.id}
          device={device}
          position={devicePositionsInArea[device.id] || [0, 0, 0]}
          isHighlighted={highlightedDeviceId === device.id || selectedDevice?.id === device.id}
          isAlert={alertDeviceIds.has(device.id)}
          scale={scale}
        />
      ));
    }
    
    return null;
  };

  return (
    <>
      <div style={{ height: 'calc(100vh - 136px)', display: 'flex', gap: 16, position: 'relative' }}>
        <div style={{ flex: 1, position: 'relative', background: '#f0f2f5', borderRadius: 8 }}>
        <Canvas shadows={showShadows} camera={{ position: cameraPosition, fov: 50 }} style={{ background: 'transparent' }}>
          <Lights />
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
          />
          {render3DContent()}
        </Canvas>
        
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: '#1a1a2e',
            opacity: isAnimating ? 0.3 : 0,
            transition: 'opacity 0.4s ease',
            pointerEvents: 'none'
          }}
        />
        
        <div style={{ position: 'absolute', bottom: 20, left: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button icon={<UndoOutlined />} onClick={handleResetView}>重置视角</Button>
          <Button 
            icon={showShadows ? <SunOutlined /> : <CloudOutlined />} 
            onClick={() => setShowShadows(!showShadows)}
          >
            {showShadows ? '关闭阴影' : '开启阴影'}
          </Button>
          {isAnimating && (
            <Tag color="processing">导航中...</Tag>
          )}
        </div>
      </div>
      
      <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card>
          <Row gutter={12}>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>设备总数</div>
                <div style={{ color: '#000', fontSize: 24, fontWeight: 'bold' }}>{currentViewDevices.length}</div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>运行中</div>
                <div style={{ color: '#52C41A', fontSize: 24, fontWeight: 'bold' }}>{runningDevices.length}</div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>告警</div>
                <div style={{ color: '#FF4D4F', fontSize: 24, fontWeight: 'bold' }}>{alarmDevices.length}</div>
              </div>
            </Col>
          </Row>
        </Card>
        
        <Card 
          title="最近事件" 
          style={{ maxHeight: 280, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          headStyle={{ padding: '6px 12px', minHeight: 32 }}
          styles={{ body: { flex: 1, overflowY: 'auto', padding: '8px 12px' } }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {getFilteredEvents().map(event => (
              <div 
                key={event.id}
                style={{
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  padding: 6,
                  backgroundColor: event.resolved ? '#f5f5f5' : newEventIds.has(event.id) ? '#fff5f5' : '#fff',
                  borderRadius: 4,
                  border: `1px solid ${event.resolved ? '#e8e8e8' : newEventIds.has(event.id) ? '#ff4d4f' : '#f0f0f0'}`,
                  animation: newEventIds.has(event.id) ? 'eventPulse 1s ease-in-out 3, slideIn 0.3s ease-out' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{ fontSize: 14, flexShrink: 0 }}>
                  {event.resolved ? (
                    <CheckCircleOutlined style={{ color: '#d9d9d9' }} />
                  ) : (
                    getEventIcon(event.type)
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 2 }}>
                    <Tag color={getEventTagColor(event.type)} style={{ fontSize: 9, padding: '1px 4px' }}>
                      {getEventTypeName(event.type)}
                    </Tag>
                    <span style={{ fontWeight: 'bold', fontSize: 11 }}>{event.deviceName}</span>
                    {newEventIds.has(event.id) && (
                      <Tag color="red" style={{ fontSize: 8, padding: '0 3px' }}>新</Tag>
                    )}
                  </div>
                  <div style={{ color: '#666', fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {event.message}
                  </div>
                </div>
                <div style={{ color: '#999', fontSize: 9, flexShrink: 0 }}>
                  {formatEventTime(event.timestamp)}
                </div>
              </div>
            ))}
          </div>
          <style>{`
            @keyframes eventPulse {
              0%, 100% { box-shadow: 0 0 0 0 rgba(255, 77, 77, 0.4); }
              50% { box-shadow: 0 0 0 6px rgba(255, 77, 77, 0); }
            }
            @keyframes slideIn {
              from { transform: translateX(-20px); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </Card>
        
        <Card title="设备列表" style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {getDevicesInCurrentView().map(device => (
              <div 
                key={device.id}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12, 
                  padding: 8, 
                  borderRadius: 8,
                  backgroundColor: selectedDevice?.id === device.id ? '#e6f7ff' : '#fafafa',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => {
                  setSelectedDevice(device);
                  setHighlightedDeviceId(device.id);
                  setViewLevel('device');
                  const pos = devicePositionsInArea[device.id];
                  if (pos) {
                    setTargetCameraPosition([pos[0], 15, pos[2] + 10]);
                    setIsAnimating(true);
                  }
                }}
              >
                <DesktopOutlined style={{ fontSize: 20, color: device.status === 'normal' ? '#52C41A' : device.status === 'warning' ? '#FAAD14' : '#FF4D4F' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: 13 }}>{device.name}</div>
                  <div style={{ color: '#666', fontSize: 11 }}>{device.model}</div>
                </div>
                <StatusBadge status={device.status} />
              </div>
            ))}
          </div>
        </Card>
        
        {selectedDevice && (
          <Card 
            title={`设备详情 - ${selectedDevice.name}`}
            hoverable
            style={{ cursor: 'pointer' }}
            onClick={() => setIsDetailModalVisible(true)}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>设备编码</span>
                <span>{selectedDevice.code}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>型号</span>
                <span>{selectedDevice.model}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>位置</span>
                <span>{selectedDevice.location}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>温度</span>
                <span>{selectedDevice.temperature}°C</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>振动</span>
                <span>{selectedDevice.vibration}mm/s</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>健康评分</span>
                <span style={{ color: selectedDevice.healthScore >= 80 ? '#52C41A' : selectedDevice.healthScore >= 60 ? '#FAAD14' : '#FF4D4F' }}>
                  {selectedDevice.healthScore}分
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>

    <DeviceDetailModal
        open={isDetailModalVisible}
        onClose={() => setIsDetailModalVisible(false)}
        deviceId={selectedDevice?.id || ''}
      />
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    normal: 'green',
    warning: 'gold',
    alarm: 'red',
    offline: 'gray',
  };
  const labels: Record<string, string> = {
    normal: '正常',
    warning: '预警',
    alarm: '告警',
    offline: '离线',
  };
  return <Tag color={colors[status]}>{labels[status]}</Tag>;
}