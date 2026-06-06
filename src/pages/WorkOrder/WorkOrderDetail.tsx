import React from 'react';
import { Modal, Tag, Button, Descriptions, Timeline, Divider } from 'antd';
import { UserOutlined, ClockCircleOutlined, FileTextOutlined, LeftCircleOutlined, CheckCircleOutlined, CiCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import type { WorkOrder, WorkOrderLog } from '../../types';
import { workOrderTypeMap, workOrderPriorityMap, workOrderStatusMap } from '../../mocks/workOrders';

interface WorkOrderDetailProps {
  workOrder: WorkOrder;
  onClose: () => void;
  onUpdate: (updates: Partial<WorkOrder>) => void;
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

const WorkOrderDetail: React.FC<WorkOrderDetailProps> = ({ workOrder, onClose, onUpdate }) => {
  const handleAction = (action: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    let newStatus = workOrder.status;
    let actionText = '';
    let description = '';

    switch (action) {
      case 'assign':
        newStatus = 'in_progress';
        actionText = 'assigned';
        description = '开始执行';
        break;
      case 'start':
        newStatus = 'in_progress';
        actionText = 'started';
        description = '开始执行';
        break;
      case 'complete':
        newStatus = 'pending_review';
        actionText = 'completed';
        description = '提交验收';
        break;
      case 'approve':
        newStatus = 'completed';
        actionText = 'approved';
        description = '验收通过';
        break;
      case 'reject':
        newStatus = 'in_progress';
        actionText = 'rejected';
        description = '验收驳回，需重新处理';
        break;
      case 'cancel':
        newStatus = 'cancelled';
        actionText = 'cancelled';
        description = '工单取消';
        break;
    }

    const newLog: WorkOrderLog = {
      id: `t${Date.now()}`,
      action: actionText,
      operator: '当前用户',
      timestamp: now,
      description
    };

    onUpdate({
      status: newStatus,
      timeline: [...workOrder.timeline, newLog],
      actualFinishTime: newStatus === 'completed' ? now : undefined
    });
  };

  const getActionButtons = () => {
    switch (workOrder.status) {
      case 'pending':
        return (
          <>
            <Button type="primary" onClick={() => handleAction('assign')}>
              <PlayCircleOutlined /> 派发并开始
            </Button>
            <Button danger onClick={() => handleAction('cancel')}>
              <CiCircleOutlined /> 取消工单
            </Button>
          </>
        );
      case 'in_progress':
        return (
          <>
            <Button type="primary" onClick={() => handleAction('complete')}>
              <CheckCircleOutlined /> 完成并提交验收
            </Button>
            <Button danger onClick={() => handleAction('cancel')}>
              <CiCircleOutlined /> 取消工单
            </Button>
          </>
        );
      case 'pending_review':
        return (
          <>
            <Button type="primary" onClick={() => handleAction('approve')}>
              <CheckCircleOutlined /> 验收通过
            </Button>
            <Button onClick={() => handleAction('reject')}>
              <LeftCircleOutlined /> 驳回修改
            </Button>
          </>
        );
      case 'completed':
      case 'cancelled':
        return null;
      default:
        return null;
    }
  };

  const formatTime = (timestamp: string) => {
    return timestamp.replace('T', ' ').slice(0, 19);
  };

  return (
    <Modal
      title={`工单详情 - ${workOrder.code}`}
      open={true}
      onCancel={onClose}
      footer={getActionButtons()}
      width={800}
    >
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <Tag color={statusColors[workOrder.status]} style={{ fontSize: 14, padding: '4px 12px' }}>
            {workOrderStatusMap[workOrder.status]}
          </Tag>
          <Tag color={priorityColors[workOrder.priority]} style={{ fontSize: 14, padding: '4px 12px' }}>
            {workOrderPriorityMap[workOrder.priority]}
          </Tag>
          <Tag style={{ fontSize: 14, padding: '4px 12px' }}>
            {workOrderTypeMap[workOrder.type]}
          </Tag>
        </div>

        <h3 style={{ marginBottom: 16 }}>{workOrder.title}</h3>
      </div>

      <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
        <Descriptions.Item label="关联设备">
          <span style={{ color: '#1890ff', cursor: 'pointer' }}>{workOrder.deviceName}</span>
        </Descriptions.Item>
        <Descriptions.Item label="指派人员">
          {workOrder.assignee ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <UserOutlined /> {workOrder.assignee}
            </span>
          ) : (
            <span style={{ color: '#999' }}>未指派</span>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="计划完成时间">
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ClockCircleOutlined /> {formatTime(workOrder.plannedFinishTime)}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="实际完成时间">
          {workOrder.actualFinishTime ? (
            <span style={{ color: '#52c41a' }}>{formatTime(workOrder.actualFinishTime)}</span>
          ) : (
            <span style={{ color: '#999' }}>未完成</span>
          )}
        </Descriptions.Item>
        {workOrder.alarmId && (
          <Descriptions.Item label="关联报警">
            <Tag color="red">报警ID: {workOrder.alarmId}</Tag>
          </Descriptions.Item>
        )}
        <Descriptions.Item label="创建时间">
          {formatTime(workOrder.createdAt)}
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <div style={{ marginBottom: 24 }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <FileTextOutlined /> 工单描述
        </h4>
        <div style={{ padding: 12, background: '#fafafa', borderRadius: 8, whiteSpace: 'pre-wrap' }}>
          {workOrder.description}
        </div>
      </div>

      <div>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <ClockCircleOutlined /> 执行时间线
        </h4>
        <Timeline>
          {workOrder.timeline.map(log => (
            <Timeline.Item key={log.id}>
              <div style={{ fontWeight: 500 }}>{log.description}</div>
              <div style={{ fontSize: 12, color: '#999' }}>
                {log.operator} · {formatTime(log.timestamp)}
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </div>
    </Modal>
  );
};

export default WorkOrderDetail;