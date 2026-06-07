import { useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { WorkOrder } from '../../types';
import { workOrderTypeMap, workOrderPriorityMap } from '../../mocks/workOrders';

interface WorkOrderFormProps {
  onClose: () => void;
  onCreate: (workOrder: Omit<WorkOrder, 'id' | 'code' | 'createdAt' | 'timeline'>) => void;
  editWorkOrder?: WorkOrder;
}

const WorkOrderForm: React.FC<WorkOrderFormProps> = ({ onClose, onCreate, editWorkOrder }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const types = Object.entries(workOrderTypeMap).map(([key, label]) => ({ value: key, label }));
  const priorities = Object.entries(workOrderPriorityMap).map(([key, label]) => ({ value: key, label }));

  const devices = [
    { value: 'd1', label: '空压机A01' },
    { value: 'd2', label: '离心泵P-102' },
    { value: 'd3', label: '风机F-003' },
    { value: 'd4', label: '电机M-005' },
    { value: 'd5', label: 'PLC控制柜C-001' },
    { value: 'd6', label: '变频器VFD-002' },
    { value: 'd7', label: '温度传感器TS-001' },
    { value: 'd8', label: '真空泵VP-001' },
    { value: 'd9', label: '压缩机C-001' }
  ];

  const operators = ['张工', '李工', '王工', '赵工', '孙工', '周工'];

  const handleSubmit = () => {
    form.validateFields().then(values => {
      setLoading(true);
      
      const device = devices.find(d => d.value === values.deviceId);
      
      const workOrderData = {
        title: values.title,
        type: values.type as WorkOrder['type'],
        priority: values.priority as WorkOrder['priority'],
        status: 'pending' as WorkOrder['status'],
        deviceId: values.deviceId,
        deviceName: device?.label || '',
        assignee: values.assignee || '',
        plannedFinishTime: values.plannedFinishTime.format('YYYY-MM-DD HH:mm:ss'),
        description: values.description,
        attachments: []
      };

      setTimeout(() => {
        onCreate(workOrderData);
        setLoading(false);
        onClose();
      }, 500);
    });
  };

  return (
    <Modal
      title={editWorkOrder ? '编辑工单' : '新建工单'}
      open={true}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form form={form} layout="vertical" initialValues={editWorkOrder ? {
        title: editWorkOrder.title,
        type: editWorkOrder.type,
        priority: editWorkOrder.priority,
        deviceId: editWorkOrder.deviceId,
        assignee: editWorkOrder.assignee,
        plannedFinishTime: editWorkOrder.plannedFinishTime
      } : {}}>
        <Form.Item
          name="title"
          label="工单标题"
          rules={[{ required: true, message: '请输入工单标题' }]}
        >
          <Input placeholder="请输入工单标题" />
        </Form.Item>

        <Form.Item
          name="type"
          label="工单类型"
          rules={[{ required: true, message: '请选择工单类型' }]}
        >
          <Select placeholder="请选择工单类型">
            {types.map(type => (
              <Select.Option key={type.value} value={type.value}>{type.label}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="priority"
          label="优先级"
          rules={[{ required: true, message: '请选择优先级' }]}
        >
          <Select placeholder="请选择优先级">
            {priorities.map(priority => (
              <Select.Option key={priority.value} value={priority.value}>{priority.label}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="deviceId"
          label="关联设备"
          rules={[{ required: true, message: '请选择关联设备' }]}
        >
          <Select placeholder="请选择关联设备">
            {devices.map(device => (
              <Select.Option key={device.value} value={device.value}>{device.label}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="assignee" label="指派人员">
          <Select placeholder="请选择指派人员" allowClear>
            {operators.map(operator => (
              <Select.Option key={operator} value={operator}>{operator}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="plannedFinishTime"
          label="计划完成时间"
          rules={[{ required: true, message: '请选择计划完成时间' }]}
        >
          <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="description" label="工单描述">
          <Input.TextArea rows={4} placeholder="请输入工单描述..." />
        </Form.Item>

        <Form.Item>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button onClick={onClose}>取消</Button>
            <Button type="primary" loading={loading} onClick={handleSubmit} icon={<PlusOutlined />}>
              {editWorkOrder ? '保存修改' : '创建工单'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default WorkOrderForm;