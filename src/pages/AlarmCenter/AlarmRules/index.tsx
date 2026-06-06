import { useState } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Table, Modal, Form, Input, Select, Card, Tag, message } from 'antd';
import { useAppStore } from '../../../stores';
import type { AlarmRule } from '../../../types';

const { Option } = Select;

export default function AlarmRules() {
  const [isRuleModalVisible, setIsRuleModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<AlarmRule | null>(null);
  const [form] = Form.useForm();
  
  const { alarmRules, dataPoints, addAlarmRule, updateAlarmRule, deleteAlarmRule } = useAppStore();
  
  const showRuleModal = (rule?: AlarmRule) => {
    if (rule) {
      setEditingRule(rule);
      form.setFieldsValue(rule);
    } else {
      setEditingRule(null);
      form.resetFields();
    }
    setIsRuleModalVisible(true);
  };
  
  const handleRuleOk = () => {
    form.validateFields().then(values => {
      if (editingRule) {
        updateAlarmRule({ ...editingRule, ...values });
        message.success('规则更新成功');
      } else {
        const newRule: AlarmRule = {
          ...values,
          id: `rule-${Date.now()}`,
          enabled: true,
        };
        addAlarmRule(newRule);
        message.success('规则添加成功');
      }
      setIsRuleModalVisible(false);
    }).catch(() => {
      message.error('表单验证失败');
    });
  };
  
  const handleDeleteRule = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该规则吗？',
      okText: '删除',
      okType: 'danger',
      onOk: () => {
        deleteAlarmRule(id);
        message.success('规则删除成功');
      },
    });
  };
  
  const ruleColumns = [
    { title: '规则名称', dataIndex: 'name', key: 'name' },
    { title: '采集点', dataIndex: 'pointId', key: 'pointId', render: (id: string) => {
      const point = dataPoints.find(p => p.id === id);
      return point?.name || id;
    }},
    { 
      title: '条件', 
      dataIndex: 'condition', 
      key: 'condition', 
      render: (cond: string) => ({ gt: '大于', lt: '小于', eq: '等于' }[cond] || cond)
    },
    { title: '阈值', dataIndex: 'threshold', key: 'threshold' },
    { 
      title: '级别', 
      dataIndex: 'level', 
      key: 'level', 
      render: (level: string) => (
        <Tag color={level === 'alarm' ? 'error' : 'gold'}>
          {level === 'alarm' ? '告警' : '预警'}
        </Tag>
      ),
    },
    { 
      title: '状态', 
      dataIndex: 'enabled', 
      key: 'enabled', 
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'green' : 'default'}>{enabled ? '启用' : '禁用'}</Tag>
      ),
    },
    { 
      title: '操作', 
      key: 'action', 
      render: (_: unknown, record: AlarmRule) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<EditOutlined />} size="small" onClick={() => showRuleModal(record)} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDeleteRule(record.id)} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>报警规则</h2>
        <Button icon={<PlusOutlined />} type="primary" onClick={() => showRuleModal()}>新增规则</Button>
      </div>
      
      <Card>
        <Table 
          columns={ruleColumns} 
          dataSource={alarmRules} 
          rowKey="id" 
          pagination={{ pageSize: 10 }}
          scroll={{ y: 450 }}
        />
      </Card>
      
      <Modal
        title={editingRule ? '编辑规则' : '新增报警规则'}
        open={isRuleModalVisible}
        onOk={handleRuleOk}
        onCancel={() => setIsRuleModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="规则名称" name="name" rules={[{ required: true, message: '请输入规则名称' }]}>
            <Input placeholder="请输入规则名称" />
          </Form.Item>
          <Form.Item label="采集点" name="pointId" rules={[{ required: true, message: '请选择采集点' }]}>
            <Select placeholder="请选择采集点">
              {dataPoints.map(p => <Option key={p.id} value={p.id}>{p.name} ({p.unit})</Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="比较条件" name="condition" rules={[{ required: true }]}>
            <Select placeholder="请选择条件">
              <Option value="gt">大于</Option>
              <Option value="lt">小于</Option>
              <Option value="eq">等于</Option>
            </Select>
          </Form.Item>
          <Form.Item label="阈值" name="threshold" rules={[{ required: true, message: '请输入阈值' }]}>
            <Input type="number" placeholder="请输入阈值" />
          </Form.Item>
          <Form.Item label="告警级别" name="level" rules={[{ required: true }]}>
            <Select placeholder="请选择级别">
              <Option value="warning">预警</Option>
              <Option value="alarm">告警</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}