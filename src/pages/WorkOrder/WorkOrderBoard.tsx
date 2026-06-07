import { useState } from 'react';
import { Card, Button, Tag, Popconfirm } from 'antd';
import { PlusOutlined, MoreOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { WorkOrder, WorkOrderLog } from '../../types';
import { workOrderTypeMap, workOrderPriorityMap, workOrderStatusMap, operators } from '../../mocks/workOrders';
import WorkOrderDetail from './WorkOrderDetail';
import WorkOrderForm from './WorkOrderForm';

interface WorkOrderBoardProps {
  workOrders: WorkOrder[];
  onUpdateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  onCreateWorkOrder: (workOrder: Omit<WorkOrder, 'id' | 'code' | 'createdAt' | 'timeline'>) => void;
}

const priorityColors: Record<string, string> = {
  P0: 'red',
  P1: 'orange',
  P2: 'gold',
  P3: 'gray'
};

const statusColumns = [
  { key: 'pending', title: '待派发' },
  { key: 'in_progress', title: '进行中' },
  { key: 'pending_review', title: '待验收' },
  { key: 'completed', title: '已完成' },
  { key: 'cancelled', title: '已取消' }
];

const WorkOrderBoard: React.FC<WorkOrderBoardProps> = ({ workOrders, onUpdateWorkOrder, onCreateWorkOrder }) => {
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const getWorkOrdersByStatus = (status: string) => {
    return workOrders.filter(wo => wo.status === status);
  };

  const handleDragStart = (e: React.DragEvent, workOrderId: string) => {
    setDraggedItem(workOrderId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedItem) {
      const workOrder = workOrders.find(wo => wo.id === draggedItem);
      if (workOrder && workOrder.status !== newStatus) {
        const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
        let action = '';
        let description = '';
        
        switch (newStatus) {
          case 'in_progress':
            action = 'started';
            description = '开始执行';
            break;
          case 'pending_review':
            action = 'completed';
            description = '提交验收';
            break;
          case 'completed':
            action = 'approved';
            description = '验收通过';
            break;
          case 'cancelled':
            action = 'cancelled';
            description = '工单取消';
            break;
          case 'pending':
            action = 'reset';
            description = '退回待派发';
            break;
          default:
            action = 'status_changed';
            description = `状态变更为${workOrderStatusMap[newStatus]}`;
        }

        const newLog: WorkOrderLog = {
          id: `t${Date.now()}`,
          action,
          operator: '系统',
          timestamp: now,
          description
        };

        onUpdateWorkOrder(draggedItem, {
          status: newStatus as WorkOrder['status'],
          timeline: [...workOrder.timeline, newLog],
          actualFinishTime: newStatus === 'completed' ? now : undefined
        });
      }
      setDraggedItem(null);
    }
  };

  const handleAssign = (workOrderId: string) => {
    const workOrder = workOrders.find(wo => wo.id === workOrderId);
    if (workOrder) {
      const randomOperator = operators[Math.floor(Math.random() * operators.length)];
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const newLog: WorkOrderLog = {
        id: `t${Date.now()}`,
        action: 'assigned',
        operator: '管理员',
        timestamp: now,
        description: `派发给${randomOperator}`
      };

      onUpdateWorkOrder(workOrderId, {
        assignee: randomOperator,
        status: 'in_progress',
        timeline: [...workOrder.timeline, newLog]
      });
    }
  };

  const handleCancel = (workOrderId: string) => {
    const workOrder = workOrders.find(wo => wo.id === workOrderId);
    if (workOrder) {
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const newLog: WorkOrderLog = {
        id: `t${Date.now()}`,
        action: 'cancelled',
        operator: '管理员',
        timestamp: now,
        description: '工单取消'
      };

      onUpdateWorkOrder(workOrderId, {
        status: 'cancelled',
        timeline: [...workOrder.timeline, newLog]
      });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>工单看板</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowCreateForm(true)}>
          新建工单
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
        {statusColumns.map(column => (
          <div
            key={column.key}
            style={{ flex: '0 0 300px', minWidth: '300px' }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.key)}
          >
            <Card
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{column.title}</span>
                  <Tag color="blue">{getWorkOrdersByStatus(column.key).length}</Tag>
                </div>
              }
              style={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {getWorkOrdersByStatus(column.key).map(workOrder => (
                  <div
                    key={workOrder.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, workOrder.id)}
                    style={{
                      padding: 12,
                      background: '#fafafa',
                      borderRadius: 8,
                      cursor: 'move',
                      border: '1px solid #e8e8e8',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => setSelectedWorkOrder(workOrder)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, marginBottom: 4 }}>{workOrder.code}</div>
                        <div style={{ fontSize: 13, color: '#666' }}>{workOrder.title}</div>
                      </div>
                      <Tag color={priorityColors[workOrder.priority]}>{workOrderPriorityMap[workOrder.priority]}</Tag>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#888' }}>
                      <span>{workOrder.deviceName}</span>
                      <span>{workOrderTypeMap[workOrder.type]}</span>
                    </div>

                    {workOrder.assignee && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 12, color: '#555' }}>
                        <UserOutlined />
                        <span>{workOrder.assignee}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 12, color: '#888' }}>
                      <ClockCircleOutlined />
                      <span>{workOrder.plannedFinishTime.slice(5, 16)}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      {workOrder.status === 'pending' && (
                        <>
                          <Button size="small" onClick={(e) => { e.stopPropagation(); handleAssign(workOrder.id); }}>
                            派发
                          </Button>
                          <Popconfirm
                            title="确定取消工单吗？"
                            onConfirm={(e) => { e?.stopPropagation(); handleCancel(workOrder.id); }}
                          >
                            <Button size="small" danger onClick={(e) => e.stopPropagation()}>取消</Button>
                          </Popconfirm>
                        </>
                      )}
                      <Button size="small" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ))}
      </div>

      {selectedWorkOrder && (
        <WorkOrderDetail
          workOrder={selectedWorkOrder}
          onClose={() => setSelectedWorkOrder(null)}
          onUpdate={(updates) => onUpdateWorkOrder(selectedWorkOrder.id, updates)}
        />
      )}

      {showCreateForm && (
        <WorkOrderForm
          onClose={() => setShowCreateForm(false)}
          onCreate={onCreateWorkOrder}
        />
      )}
    </div>
  );
};

export default WorkOrderBoard;