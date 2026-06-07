import { useState, useEffect, useRef } from 'react';
import { Modal, Descriptions, Table, Tag, Button, Card, Row, Col } from 'antd';
import {
  FileTextOutlined, BookOutlined, AlertOutlined,
  PlayCircleOutlined, CheckCircleOutlined, DownloadOutlined,
  FileSearchOutlined, ForkOutlined,
  SettingOutlined, PoweroffOutlined,
  ToolOutlined
} from '@ant-design/icons';
import {
  type DeviceDetail, type BoundPoint, type HistoryDataPoint
} from '../../types';
import { mockDeviceDetails, mockHistoryData } from '../../mocks/devices';
import * as echarts from 'echarts';

interface DeviceDetailModalProps {
  open: boolean;
  onClose: () => void;
  deviceId: string;
}

const statusColors = {
  normal: '#52c41a',
  warning: '#faad14',
  alarm: '#ff4d4f',
};

const statusLabels = {
  normal: '正常',
  warning: '预警',
  alarm: '告警',
};

const deviceStatusLabels = {
  running: '运行中',
  stopped: '停机',
  maintenance: '维修中',
  idle: '闲置',
};

const deviceStatusColors = {
  running: '#52c41a',
  stopped: '#d9d9d9',
  maintenance: '#faad14',
  idle: '#1890ff',
};

const knowledgeTypeLabels = {
  faultCode: '故障码',
  case: '案例',
  manual: '手册',
};

const eventTypeLabels = {
  alarm: '报警',
  warning: '预警',
  start: '启动',
  stop: '停止',
  workOrder: '工单',
  config: '配置变更',
  maintenance: '维修',
  info: '信息',
};

const eventTypeIcons = {
  alarm: <AlertOutlined style={{ color: '#ff4d4f' }} />,
  warning: <AlertOutlined style={{ color: '#faad14' }} />,
  start: <PlayCircleOutlined style={{ color: '#52c41a' }} />,
  stop: <PoweroffOutlined style={{ color: '#d9d9d9' }} />,
  workOrder: <ForkOutlined style={{ color: '#1890ff' }} />,
  config: <SettingOutlined style={{ color: '#faad14' }} />,
  maintenance: <ToolOutlined style={{ color: '#722ed1' }} />,
  info: <FileTextOutlined style={{ color: '#1890ff' }} />,
};

export default function DeviceDetailModal({ open, onClose, deviceId }: DeviceDetailModalProps) {
  const [deviceDetail, setDeviceDetail] = useState<DeviceDetail | null>(null);
  const [points, setPoints] = useState<BoundPoint[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<BoundPoint | null>(null);
  const [historyRange, setHistoryRange] = useState<'1h' | '6h' | '12h' | '24h'>('24h');
  const [, setHistoryData] = useState<HistoryDataPoint[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const refreshTimer = useRef<number | null>(null);

  useEffect(() => {
    if (open && deviceId) {
      const detail = mockDeviceDetails[deviceId];
      if (detail) {
        setDeviceDetail(detail);
        setPoints(detail.boundPoints);
      }
    }
  }, [open, deviceId]);

  useEffect(() => {
    if (open && points.length > 0) {
      refreshTimer.current = window.setInterval(() => {
        setPoints(prev => prev.map(point => ({
          ...point,
          currentValue: point.currentValue + (Math.random() - 0.5) * (point.thresholdAlarm - point.thresholdWarning) * 0.1,
          updateTime: new Date().toISOString(),
        })));
      }, 3000);
    }

    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
    };
  }, [open, points.length]);

  useEffect(() => {
    if (showHistoryModal && selectedPoint && chartRef.current) {
      const data = mockHistoryData(selectedPoint.pointId, historyRange);
      setHistoryData(data);

      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      const option: echarts.EChartsOption = {
        tooltip: {
          trigger: 'axis',
          formatter: (params: any) => {
            const date = new Date(params[0].axisValue);
            return `${date.toLocaleString('zh-CN')}<br/>${selectedPoint?.pointName}: ${params[0].value.toFixed(2)} ${selectedPoint?.unit}`;
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: data.map(d => new Date(d.timestamp).toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit' })),
          axisLabel: {
            rotate: 45,
            fontSize: 10,
          },
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            name: selectedPoint.pointName,
            type: 'line',
            data: data.map(d => d.value),
            smooth: true,
            lineStyle: {
              color: '#1890ff',
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                { offset: 1, color: 'rgba(24, 144, 255, 0.05)' },
              ]),
            },
          },
        ],
      };

      chartInstance.current.setOption(option);

      const handleResize = () => {
        chartInstance.current?.resize();
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [showHistoryModal, selectedPoint, historyRange]);

  useEffect(() => {
    if (!showHistoryModal && chartInstance.current) {
      chartInstance.current.dispose();
      chartInstance.current = null;
    }
  }, [showHistoryModal]);

  const handleViewHistory = (point: BoundPoint) => {
    setSelectedPoint(point);
    setShowHistoryModal(true);
  };

  const handleGenerateWorkOrder = () => {
    onClose();
  };

  const handleViewAlarmHistory = () => {
    onClose();
  };

  const handleGoToTwin = () => {
    onClose();
  };

  if (!deviceDetail) {
    return (
      <Modal
        title="加载中..."
        open={open}
        onCancel={onClose}
        footer={null}
      >
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⌛</div>
          <div style={{ color: '#999' }}>正在加载设备信息...</div>
        </div>
      </Modal>
    );
  }

  const { basicInfo, runningStatus, relatedKnowledge, documents, recentEvents, maintenanceRecords } = deviceDetail;

  const pointColumns = [
    {
      title: '测点名称',
      dataIndex: 'pointName',
      key: 'pointName',
      width: 120,
    },
    {
      title: '测点ID',
      dataIndex: 'pointId',
      key: 'pointId',
      width: 80,
      render: (id: string) => <span style={{ color: '#8c8c8c', fontSize: 12 }}>{id}</span>,
    },
    {
      title: '网关名称',
      dataIndex: 'gatewayName',
      key: 'gatewayName',
      width: 100,
    },
    {
      title: '实时值',
      dataIndex: 'currentValue',
      key: 'currentValue',
      width: 120,
      render: (value: number, record: BoundPoint) => (
        <span style={{ color: statusColors[record.status], fontWeight: 600 }}>
          {value.toFixed(2)} {record.unit}
        </span>
      ),
    },
    {
      title: '采集时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 140,
      render: (time: string) => {
        const date = new Date(time);
        return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={statusColors[status as keyof typeof statusColors]}>
          {statusLabels[status as keyof typeof statusLabels]}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: BoundPoint) => (
        <Button type="link" size="small" onClick={() => handleViewHistory(record)}>
          历史趋势
        </Button>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
            <span style={{ fontWeight: 600 }}>{basicInfo.name}</span>
            <span style={{ color: '#8c8c8c', fontSize: 14 }}>({basicInfo.code})</span>
            <Tag color={deviceStatusColors[basicInfo.status]}>
              {deviceStatusLabels[basicInfo.status]}
            </Tag>
          </div>
        }
        open={open}
        onCancel={onClose}
        width={900}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button icon={<ForkOutlined />} onClick={handleGenerateWorkOrder}>生成工单</Button>
              <Button icon={<AlertOutlined />} onClick={handleViewAlarmHistory}>查看报警历史</Button>
              <Button icon={<FileSearchOutlined />} onClick={handleGoToTwin}>跳转到孪生场景</Button>
            </div>
            <Button onClick={onClose}>关闭</Button>
          </div>
        }
      >
        <Card size="small" title="基本信息" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="设备名称">{basicInfo.name}</Descriptions.Item>
                <Descriptions.Item label="设备编码">{basicInfo.code}</Descriptions.Item>
                <Descriptions.Item label="设备类型">{basicInfo.type}</Descriptions.Item>
                <Descriptions.Item label="设备型号">{basicInfo.model}</Descriptions.Item>
                <Descriptions.Item label="安装位置">{basicInfo.location}</Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={12}>
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="投运时间">{basicInfo.commissionDate}</Descriptions.Item>
                <Descriptions.Item label="负责部门">{basicInfo.department}</Descriptions.Item>
                <Descriptions.Item label="负责人">{basicInfo.responsiblePerson}</Descriptions.Item>
                <Descriptions.Item label="制造商">{basicInfo.manufacturer}</Descriptions.Item>
                <Descriptions.Item label="关联网关">{basicInfo.gatewayName}</Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
          <div style={{ marginTop: 16, padding: 12, background: '#f6ffed', borderRadius: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
              <div>
                <span style={{ fontWeight: 600 }}>健康评分：</span>
                <span style={{ color: basicInfo.healthScore >= 80 ? '#52c41a' : basicInfo.healthScore >= 60 ? '#faad14' : '#ff4d4f', fontWeight: 600, fontSize: 18 }}>
                  {basicInfo.healthScore}分
                </span>
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ height: 6, width: 200, backgroundColor: '#e8e8e8', borderRadius: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${basicInfo.healthScore}%`,
                    backgroundColor: basicInfo.healthScore >= 80 ? '#52c41a' : basicInfo.healthScore >= 60 ? '#faad14' : '#ff4d4f',
                    borderRadius: 3,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card size="small" title="测点数据" style={{ marginBottom: 16 }}>
          {points.length > 0 ? (
            <Table
              dataSource={points}
              columns={pointColumns}
              rowKey="pointId"
              size="small"
              pagination={false}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              <FileTextOutlined style={{ fontSize: 48, marginBottom: 12, opacity: 0.5 }} />
              <div>暂无绑定测点，请前往设备管理绑定</div>
            </div>
          )}
        </Card>

        <Card size="small" title="运行状态" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ textAlign: 'center', padding: 20, background: runningStatus.isRunning ? '#f6ffed' : '#fff2f0', borderRadius: 8 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>
                  {runningStatus.isRunning ? (
                    <span style={{ color: '#52c41a' }}>●</span>
                  ) : (
                    <span style={{ color: '#ff4d4f' }}>○</span>
                  )}
                </div>
                <div style={{ fontSize: 18, fontWeight: 600, color: runningStatus.isRunning ? '#52c41a' : '#ff4d4f' }}>
                  {runningStatus.isRunning ? '运行中' : '已停机'}
                </div>
                {runningStatus.isRunning && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                      <div>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>当前功率</div>
                        <div style={{ fontSize: 18, fontWeight: 600 }}>{runningStatus.currentPower} <span style={{ fontSize: 12, fontWeight: 400 }}>kW</span></div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>当前负载率</div>
                        <div style={{ fontSize: 18, fontWeight: 600 }}>{runningStatus.loadRate} <span style={{ fontSize: 12, fontWeight: 400 }}>%</span></div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>当前转速</div>
                        <div style={{ fontSize: 18, fontWeight: 600 }}>{runningStatus.currentSpeed} <span style={{ fontSize: 12, fontWeight: 400 }}>rpm</span></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Col>
            <Col span={12}>
              <div style={{ padding: 16 }}>
                <div style={{ marginBottom: 12, fontSize: 14, fontWeight: 600 }}>累计运行信息</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#8c8c8c' }}>累计运行时间</span>
                    <span style={{ fontWeight: 600, color: '#1890ff' }}>{runningStatus.cumulativeHours.toLocaleString()} 小时</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#8c8c8c' }}>本次运行时长</span>
                    <span style={{ fontWeight: 600, color: '#52c41a' }}>{runningStatus.currentSessionHours} 小时</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#8c8c8c' }}>本月运行时长</span>
                    <span style={{ fontWeight: 600 }}>{runningStatus.monthHours} 小时</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#8c8c8c' }}>本年度运行时长</span>
                    <span style={{ fontWeight: 600 }}>{runningStatus.yearHours.toLocaleString()} 小时</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
          <div style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 12, fontSize: 14, fontWeight: 600 }}>启停记录</div>
            <Card size="small" style={{ maxHeight: 200, overflow: 'auto' }}>
              {runningStatus.startStopRecords.length > 0 ? (
                runningStatus.startStopRecords.map((record, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: index < runningStatus.startStopRecords.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <span>{record.time}</span>
                    <Tag color={record.action === 'start' ? 'green' : 'default'}>
                      {record.action === 'start' ? '启动' : '停止'}
                    </Tag>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>暂无启停记录</div>
              )}
            </Card>
          </div>
        </Card>

        <Card size="small" title="文档与知识" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginBottom: 12, fontSize: 14, fontWeight: 600 }}>
                <BookOutlined style={{ marginRight: 4 }} /> 关联知识库
              </div>
              {relatedKnowledge.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {relatedKnowledge.map(item => (
                    <div key={item.id} style={{ padding: 12, background: '#fafafa', borderRadius: 6, cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileTextOutlined style={{ color: '#1890ff' }} />
                        <span style={{ fontWeight: 500 }}>{item.title}</span>
                        <Tag color="blue">
                          {knowledgeTypeLabels[item.type]}
                        </Tag>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>暂无关联知识</div>
              )}
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 12, fontSize: 14, fontWeight: 600 }}>
                <DownloadOutlined style={{ marginRight: 4 }} /> 设备文档
              </div>
              {documents.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {documents.map(doc => (
                    <div key={doc.id} style={{ padding: 12, background: '#fafafa', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileTextOutlined style={{ color: '#52c41a' }} />
                        <span>{doc.name}</span>
                      </div>
                      <span style={{ fontSize: 12, color: '#8c8c8c' }}>{doc.uploadTime}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>暂无设备文档</div>
              )}
            </Col>
          </Row>
        </Card>

        <Card size="small" title="事件与维修">
          <div style={{ marginBottom: 16, fontSize: 14, fontWeight: 600 }}>最近事件</div>
          {recentEvents.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {recentEvents.map((event, index) => (
                <div key={index} style={{ padding: 12, background: '#fafafa', borderRadius: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#8c8c8c' }}>{event.time}</span>
                    <span>{eventTypeIcons[event.type]}</span>
                    <Tag color={event.type === 'alarm' ? 'red' : event.type === 'warning' ? 'orange' : 'blue'}>
                      {eventTypeLabels[event.type]}
                    </Tag>
                  </div>
                  <div style={{ fontSize: 13 }}>{event.description}</div>
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>来源：{event.source}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 20, color: '#999', marginBottom: 16 }}>暂无事件记录</div>
          )}
          <div style={{ fontSize: 14, fontWeight: 600 }}>维修记录</div>
          {maintenanceRecords.length > 0 ? (
            <Table
              dataSource={maintenanceRecords}
              columns={[
                { title: '维修时间', dataIndex: 'time', key: 'time' },
                {
                  title: '工单编号',
                  dataIndex: 'workOrderCode',
                  key: 'workOrderCode',
                  render: (code: string) => <a href="#" style={{ color: '#1890ff' }}>{code}</a>,
                },
                { title: '维修类型', dataIndex: 'type', key: 'type' },
                { title: '故障描述', dataIndex: 'faultDescription', key: 'faultDescription' },
                { title: '维修结果', dataIndex: 'result', key: 'result' },
                { title: '维修人员', dataIndex: 'technician', key: 'technician' },
              ]}
              rowKey="workOrderId"
              size="small"
              pagination={false}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>暂无维修记录</div>
          )}
        </Card>
      </Modal>

      <Modal
        title={`${selectedPoint?.pointName} - 历史趋势`}
        open={showHistoryModal}
        onCancel={() => setShowHistoryModal(false)}
        width={700}
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {['1h', '6h', '12h', '24h'].map(range => (
              <Button
                key={range}
                type={historyRange === range ? 'primary' : 'default'}
                onClick={() => setHistoryRange(range as '1h' | '6h' | '12h' | '24h')}
              >
                {range === '1h' ? '1小时' : range === '6h' ? '6小时' : range === '12h' ? '12小时' : '24小时'}
              </Button>
            ))}
          </div>
        }
      >
        <div ref={chartRef} style={{ height: 350 }} />
      </Modal>

      </>
  );
}
