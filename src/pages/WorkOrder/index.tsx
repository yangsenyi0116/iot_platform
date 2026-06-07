import { useState } from 'react';
import { Tabs } from 'antd';
import { LayoutOutlined, CiOutlined } from '@ant-design/icons';
import type { WorkOrder } from '../../types';
import { workOrders as initialWorkOrders } from '../../mocks/workOrders';
import WorkOrderBoard from './WorkOrderBoard';
import WorkOrderList from './WorkOrderList';

const WorkOrderPage: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders);

  const handleUpdateWorkOrder = (id: string, updates: Partial<WorkOrder>) => {
    setWorkOrders(prev => prev.map(wo => wo.id === id ? { ...wo, ...updates } : wo));
  };

  const handleUpdateWorkOrderFull = (updatedWorkOrder: WorkOrder) => {
    setWorkOrders(prev => prev.map(wo => wo.id === updatedWorkOrder.id ? updatedWorkOrder : wo));
  };

  const handleCreateWorkOrder = (workOrderData: Omit<WorkOrder, 'id' | 'code' | 'createdAt' | 'timeline'>) => {
    const now = new Date();
    const code = `WO-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(workOrders.length + 1).padStart(3, '0')}`;
    
    const newWorkOrder: WorkOrder = {
      ...workOrderData,
      id: String(Date.now()),
      code,
      createdAt: now.toISOString().replace('T', ' ').slice(0, 19),
      timeline: [{
        id: `t${Date.now()}`,
        action: 'created',
        operator: '当前用户',
        timestamp: now.toISOString().replace('T', ' ').slice(0, 19),
        description: '工单创建'
      }]
    };

    setWorkOrders(prev => [...prev, newWorkOrder]);
  };

  return (
    <div>
      <Tabs
        defaultActiveKey="board"
        items={[
          {
            key: 'board',
            label: (
              <span>
                <LayoutOutlined /> 看板视图
              </span>
            ),
            children: (
              <WorkOrderBoard
                workOrders={workOrders}
                onUpdateWorkOrder={handleUpdateWorkOrder}
                onCreateWorkOrder={handleCreateWorkOrder}
              />
            )
          },
          {
            key: 'list',
            label: (
              <span>
                <CiOutlined /> 列表视图
              </span>
            ),
            children: (
              <WorkOrderList
                workOrders={workOrders}
                onUpdateWorkOrder={handleUpdateWorkOrder}
                onUpdateWorkOrderFull={handleUpdateWorkOrderFull}
              />
            )
          }
        ]}
      />
    </div>
  );
};

export default WorkOrderPage;