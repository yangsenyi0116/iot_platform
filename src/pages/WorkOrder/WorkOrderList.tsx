import React, { useState } from 'react';
import { Table, Tag, Button, Input, Select, Space } from 'antd';
import { SearchOutlined, EyeOutlined, EditOutlined, FilterOutlined } from '@ant-design/icons';
import type { WorkOrder } from '../../types';
import { workOrderTypeMap, workOrderPriorityMap, workOrderStatusMap } from '../../mocks/workOrders';
import WorkOrderDetail from './WorkOrderDetail';
import WorkOrderForm from './WorkOrderForm';

interface WorkOrderListProps {
  workOrders: WorkOrder[];
  onUpdateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  onUpdateWorkOrderFull: (workOrder: WorkOrder) => void;
}

const priorityColors: Record<string, string> = {
  P0: 'red',
  P1: 'orange',
  P2: 'gold',
  P3: 'gray'
};

const statusColors: Record<string, string> = {
  pending: 'default',
  in_progress: 'processing',
  pending_review: 'warning',
  completed: 'success',
  cancelled: 'error'
};

const WorkOrderList: React.FC<WorkOrderListProps> = ({ workOrders, onUpdateWorkOrder, onUpdateWorkOrderFull }) => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [editWorkOrder, setEditWorkOrder] = useState<WorkOrder | null>(null);

  const columns = [
    {
      title: '工单编号',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: '工单标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
    },
    {
      title: '工单类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (text: string) => <Tag>{workOrderTypeMap[text]}</Tag>
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (text: string) => <Tag color={priorityColors[text]}>{workOrderPriorityMap[text]}</Tag>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (text: string) => <Tag color={statusColors[text]}>{workOrderStatusMap[text]}</Tag>
    },
    {
      title: '关联设备',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 120,
      ellipsis: true
    },
    {
      title: '指派人员',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 80,
      render: (text: string) => text || <span style={{ color: '#999' }}>未指派</span>
    },
    {
      title: '计划完成',
      dataIndex: 'plannedFinishTime',
      key: 'plannedFinishTime',
      width: 140,
      render: (text: string) => text.slice(0, 16)
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: WorkOrder) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => setSelectedWorkOrder(record)}>
            查看
          </Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => setEditWorkOrder(record)}>
            编辑
          </Button>
        </Space>
      )
    }
  ];

  const filteredWorkOrders = workOrders.filter(wo => {
    const matchesSearch = wo.title.toLowerCase().includes(searchText.toLowerCase()) ||
      wo.code.toLowerCase().includes(searchText.toLowerCase()) ||
      wo.deviceName.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || wo.status === statusFilter;
    const matchesPriority = !priorityFilter || wo.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleEdit = (values: Omit<WorkOrder, 'id' | 'code' | 'createdAt' | 'timeline'>) => {
    if (editWorkOrder) {
      const updatedWorkOrder: WorkOrder = {
        ...editWorkOrder,
        ...values,
        timeline: editWorkOrder.timeline
      };
      onUpdateWorkOrderFull(updatedWorkOrder);
      setEditWorkOrder(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Input
            placeholder="搜索工单编号、标题、设备..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <Select
          placeholder="状态筛选"
          style={{ width: 120 }}
          allowClear
          value={statusFilter}
          onChange={setStatusFilter}
          prefix={<FilterOutlined />}
        >
          {Object.entries(workOrderStatusMap).map(([key, label]) => (
            <Select.Option key={key} value={key}>{label}</Select.Option>
          ))}
        </Select>
        <Select
          placeholder="优先级筛选"
          style={{ width: 100 }}
          allowClear
          value={priorityFilter}
          onChange={setPriorityFilter}
        >
          {Object.entries(workOrderPriorityMap).map(([key, label]) => (
            <Select.Option key={key} value={key}>{label}</Select.Option>
          ))}
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={filteredWorkOrders}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />

      {selectedWorkOrder && (
        <WorkOrderDetail
          workOrder={selectedWorkOrder}
          onClose={() => setSelectedWorkOrder(null)}
          onUpdate={(updates) => onUpdateWorkOrder(selectedWorkOrder.id, updates)}
        />
      )}

      {editWorkOrder && (
        <WorkOrderForm
          onClose={() => setEditWorkOrder(null)}
          onCreate={handleEdit}
          editWorkOrder={editWorkOrder}
        />
      )}
    </div>
  );
};

export default WorkOrderList;