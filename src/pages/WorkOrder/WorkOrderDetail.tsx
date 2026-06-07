import { Modal, Tag, Button, Descriptions, Timeline, Divider, Progress, List, Card, Row, Col } from 'antd';
import { 
  UserOutlined, 
  ClockCircleOutlined, 
  FileTextOutlined, 
  LeftCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  PlayCircleOutlined,
  RobotOutlined,
  ShoppingCartOutlined,
  WarningOutlined,
  ClockCircleOutlined as ClockIcon,
  BarChartOutlined,
  HistoryOutlined,
  WarningOutlined as AlertIcon,
  CheckCircleOutlined as CheckCircle,
} from '@ant-design/icons';
import type { WorkOrder, SparePart, SafetyNote, HistoricalCase } from '../../types';
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
  pending_parts: 'blue',
  in_progress: 'processing',
  pending_review: 'warning',
  completed: 'success',
  cancelled: 'error'
};

const safetyPriorityColors: Record<string, string> = {
  high: 'red',
  medium: 'orange',
  low: 'green'
};

const safetyPriorityLabels: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低'
};

const safetyCategoryLabels: Record<string, string> = {
  electrical: '电气安全',
  mechanical: '机械安全',
  chemical: '化学安全',
  work_permit: '作业许可',
  environment: '环境保护'
};

const caseResultColors: Record<string, string> = {
  success: 'green',
  partial: 'orange',
  failed: 'red'
};

const caseResultLabels: Record<string, string> = {
  success: '成功',
  partial: '部分成功',
  failed: '失败'
};

const repairResultColors: Record<string, string> = {
  fully_repaired: 'green',
  partially_repaired: 'orange',
  not_repaired: 'red'
};

const repairResultLabels: Record<string, string> = {
  fully_repaired: '完全修复',
  partially_repaired: '部分修复',
  not_repaired: '未修复'
};

const WorkOrderDetail: React.FC<WorkOrderDetailProps> = ({ workOrder, onClose, onUpdate }) => {
  const handleAction = (action: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    let newStatus = workOrder.status;
    let actionText = '';
    let description = '';
    let updates: Partial<WorkOrder> = {};

    switch (action) {
      case 'assign':
        if (workOrder.spareParts && workOrder.spareParts.some(p => p.hasStock && !p.issued)) {
          newStatus = 'pending_parts';
          actionText = 'assigned';
          description = '派单完成，等待领用备件';
        } else {
          newStatus = 'in_progress';
          actionText = 'assigned';
          description = '派单并开始执行';
        }
        break;
      case 'issue_parts':
        newStatus = 'in_progress';
        actionText = 'parts_issued';
        description = '备件领用完成，开始维修';
        updates.spareParts = workOrder.spareParts?.map(part => ({
          ...part,
          issued: part.hasStock ? true : part.issued,
          issuedQuantity: part.hasStock ? part.quantity : part.issuedQuantity,
          issuedBy: part.hasStock ? '当前用户' : part.issuedBy,
          issuedAt: part.hasStock ? now : part.issuedAt
        }));
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

    const newLog: WorkOrder['timeline'][0] = {
      id: `t${Date.now()}`,
      action: actionText,
      operator: '当前用户',
      timestamp: now,
      description
    };

    onUpdate({
      status: newStatus,
      timeline: [...workOrder.timeline, newLog],
      actualFinishTime: newStatus === 'completed' ? now : undefined,
      ...updates
    });
  };

  const getActionButtons = () => {
    switch (workOrder.status) {
      case 'pending':
        return (
          <>
            <Button type="primary" onClick={() => handleAction('assign')}>
              <PlayCircleOutlined /> 派发工单
            </Button>
            <Button danger onClick={() => handleAction('cancel')}>
              <CloseCircleOutlined /> 取消工单
            </Button>
          </>
        );
      case 'pending_parts':
        return (
          <>
            <Button type="primary" onClick={() => handleAction('issue_parts')}>
              <ShoppingCartOutlined /> 领用备件
            </Button>
            <Button onClick={() => handleAction('start')}>
              <PlayCircleOutlined /> 跳过领用，直接开始
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
              <CloseCircleOutlined /> 取消工单
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
      width={900}
      bodyStyle={{ maxHeight: '75vh', overflowY: 'auto', padding: '16px 24px' }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <Tag color={statusColors[workOrder.status]} style={{ fontSize: 12, padding: '2px 10px' }}>
            {workOrderStatusMap[workOrder.status]}
          </Tag>
          <Tag color={priorityColors[workOrder.priority]} style={{ fontSize: 12, padding: '2px 10px' }}>
            {workOrderPriorityMap[workOrder.priority]}
          </Tag>
          <Tag style={{ fontSize: 12, padding: '2px 10px' }}>
            {workOrderTypeMap[workOrder.type]}
          </Tag>
          {workOrder.repairResult && (
            <Tag color={repairResultColors[workOrder.repairResult]} style={{ fontSize: 12, padding: '2px 10px' }}>
              {repairResultLabels[workOrder.repairResult]}
            </Tag>
          )}
        </div>

        <h3 style={{ marginBottom: 0, fontSize: 16 }}>{workOrder.title}</h3>
      </div>

      <Descriptions bordered column={3} size="small" style={{ marginBottom: 16 }}>
        <Descriptions.Item label="关联设备" style={{ padding: '8px 12px' }}>
          <span style={{ color: '#1890ff', cursor: 'pointer' }}>{workOrder.deviceName}</span>
        </Descriptions.Item>
        <Descriptions.Item label="指派人员" style={{ padding: '8px 12px' }}>
          {workOrder.assignee ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <UserOutlined /> {workOrder.assignee}
            </span>
          ) : (
            <span style={{ color: '#999' }}>未指派</span>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="验收人员" style={{ padding: '8px 12px' }}>
          {workOrder.reviewer ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#52c41a' }}>
              <CheckCircle /> {workOrder.reviewer}
            </span>
          ) : (
            <span style={{ color: '#999' }}>未验收</span>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="计划完成" style={{ padding: '8px 12px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ClockCircleOutlined /> {formatTime(workOrder.plannedFinishTime).slice(5, 16)}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="实际完成" style={{ padding: '8px 12px' }}>
          {workOrder.actualFinishTime ? (
            <span style={{ color: '#52c41a' }}>{formatTime(workOrder.actualFinishTime).slice(5, 16)}</span>
          ) : (
            <span style={{ color: '#999' }}>未完成</span>
          )}
        </Descriptions.Item>
        {workOrder.alarmId && (
          <Descriptions.Item label="关联报警" style={{ padding: '8px 12px' }}>
            <Tag color="red" style={{ fontSize: 11 }}>报警ID: {workOrder.alarmId}</Tag>
          </Descriptions.Item>
        )}
        <Descriptions.Item label="创建时间" style={{ padding: '8px 12px' }}>
          {formatTime(workOrder.createdAt)}
        </Descriptions.Item>
      </Descriptions>

      <div style={{ marginBottom: 16 }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 14 }}>
          <FileTextOutlined /> 工单描述
        </h4>
        <div style={{ padding: 10, background: '#fafafa', borderRadius: 6, whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: '1.6' }}>
          {workOrder.description}
        </div>
      </div>

      {workOrder.aiRecommendation && (workOrder.status === 'pending' || workOrder.status === 'in_progress') && (
        <div style={{ marginBottom: 16 }}>
          <Divider style={{ marginBottom: 12, marginTop: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ backgroundColor: '#1890ff', color: '#fff', width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RobotOutlined />
              </div>
              <span style={{ fontSize: 14, fontWeight: 500 }}>AI推荐维修方案</span>
            </div>
          </Divider>
          
          <div style={{ padding: 12, background: '#e6f7ff', borderRadius: 6, marginBottom: 12, fontSize: 13, lineHeight: '1.6', color: '#1890ff' }}>
            {workOrder.aiRecommendation.recommendedSolution}
          </div>
          
          <Row gutter={12}>
            <Col span={12}>
              <Card size="small" title={
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                  <BarChartOutlined /> 维修步骤
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: '#8c8c8c' }}>
                    置信度 <Progress percent={Math.round(workOrder.aiRecommendation.confidence * 100)} size="small" showInfo={false} strokeColor="#1890ff" /> {Math.round(workOrder.aiRecommendation.confidence * 100)}%
                  </span>
                </span>
              } style={{ marginBottom: 0 }}>
                <List
                  dataSource={workOrder.aiRecommendation.steps}
                  size="small"
                  renderItem={(step) => (
                    <List.Item key={step.id} style={{ padding: '6px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ 
                          backgroundColor: '#1890ff', 
                          color: '#fff', 
                          width: 20, 
                          height: 20, 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: 11,
                          flexShrink: 0
                        }}>
                          {step.order}
                        </div>
                        <div style={{ flex: 1, position: 'relative' }}>
                          <div style={{ marginBottom: 2 }}>
                            <span style={{ fontWeight: 500, fontSize: 13 }}>{step.title}</span>
                            <span style={{ fontSize: 11, color: '#1890ff', position: 'absolute', right: 0, top: 0 }}>
                              <ClockIcon style={{ fontSize: 10, marginRight: 2 }} /> {step.estimatedTime}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: '#666', lineHeight: '1.5' }}>{step.description}</div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            
            <Col span={12}>
              <Card size="small" title={
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                  <ShoppingCartOutlined /> 备件清单
                  {workOrder.spareParts && workOrder.spareParts.some(p => p.issued) && (
                    <span style={{ marginLeft: 'auto', color: '#52c41a', fontSize: 12 }}>
                      已领用 {workOrder.spareParts.filter(p => p.issued).length}/{workOrder.spareParts.length}
                    </span>
                  )}
                </span>
              } style={{ marginBottom: 0 }}>
                <List
                  dataSource={workOrder.spareParts}
                  size="small"
                  renderItem={(part: SparePart) => (
                    <List.Item key={part.id} style={{ padding: '6px 0' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {part.issued && <CheckCircle style={{ fontSize: 12, color: '#52c41a' }} />}
                          <span style={{ fontWeight: 500, fontSize: 13 }}>{part.name}</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#999' }}>{part.code}</div>
                        {part.issued && (
                          <div style={{ fontSize: 11, color: '#52c41a', marginTop: 2 }}>
                            领用人: {part.issuedBy} | {part.issuedAt?.slice(5, 16)}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, color: part.hasStock ? '#52c41a' : '#ff4d4f' }}>
                          需求: {part.quantity} {part.unit}
                        </div>
                        {part.issued && (
                          <div style={{ fontSize: 12, color: '#1890ff', marginTop: 2 }}>
                            已领: {part.issuedQuantity} {part.unit}
                          </div>
                        )}
                      </div>
                    </List.Item>
                  )}
                />
                {workOrder.spareParts && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #e8e8e8', display: 'flex', gap: 16, fontSize: 12 }}>
                    <span>总数: <strong>{workOrder.spareParts.length}</strong></span>
                    <span style={{ color: '#52c41a' }}>有库存: <strong>{workOrder.spareParts.filter(p => p.hasStock).length}</strong></span>
                    <span style={{ color: '#ff4d4f' }}>缺货: <strong>{workOrder.spareParts.filter(p => !p.hasStock).length}</strong></span>
                    <span style={{ color: '#1890ff' }}>已领用: <strong>{workOrder.spareParts.filter(p => p.issued).length}</strong></span>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
          
          {workOrder.aiRecommendation.relatedCases && workOrder.aiRecommendation.relatedCases.length > 0 && (
            <Card size="small" title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginTop: 12 }}>
                <HistoryOutlined /> 相似历史案例
              </span>
            } style={{ marginTop: 12 }}>
              <Row gutter={12}>
                {workOrder.aiRecommendation.relatedCases.map((item: HistoricalCase) => (
                  <Col span={8} key={item.id}>
                    <div style={{ padding: 10, borderLeft: `3px solid ${caseResultColors[item.result]}`, background: '#fafafa', borderRadius: '0 4px 4px 0', marginBottom: 8 }}>
                      <div style={{ fontWeight: 500, fontSize: 12, marginBottom: 4 }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>{item.deviceName}</div>
                      <div style={{ fontSize: 11, color: '#666', marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.solution}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Tag color={caseResultColors[item.result]} style={{ fontSize: 10 }}>
                          {caseResultLabels[item.result]}
                        </Tag>
                        <span style={{ fontSize: 11, color: '#8c8c8c' }}>相似度 {Math.round(item.similarity * 100)}%</span>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          )}
        </div>
      )}

      {workOrder.safetyNotes && workOrder.safetyNotes.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Divider style={{ marginBottom: 12, marginTop: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ backgroundColor: '#faad14', color: '#fff', width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <WarningOutlined />
              </div>
              <span style={{ fontSize: 14, fontWeight: 500 }}>安全注意事项</span>
            </div>
          </Divider>
          
          <Row gutter={12}>
            {workOrder.safetyNotes.map((note: SafetyNote) => (
              <Col span={12} key={note.id}>
                <div style={{ padding: 10, background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 6, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Tag color={safetyPriorityColors[note.priority]} style={{ fontSize: 10, padding: '0 6px' }}>
                      {safetyPriorityLabels[note.priority]}
                    </Tag>
                    <span style={{ fontSize: 11, color: '#8c8c8c' }}>{safetyCategoryLabels[note.category]}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#666', lineHeight: '1.5' }}>{note.content}</div>
                </div>
              </Col>
            ))}
          </Row>
          
          <div style={{ padding: 10, background: '#fffbe6', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertIcon style={{ color: '#faad14', fontSize: 16 }} />
            <span style={{ color: '#ad8b00', fontSize: 12 }}>
              作业前请仔细阅读以上安全注意事项，严格遵守操作规程。
            </span>
          </div>
        </div>
      )}

      {workOrder.repairResult && (
        <div style={{ marginBottom: 16 }}>
          <Divider style={{ marginBottom: 12, marginTop: 0 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>维修反馈</span>
          </Divider>
          <Card size="small">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Tag color={repairResultColors[workOrder.repairResult]} style={{ fontSize: 14, padding: '4px 12px' }}>
                {repairResultLabels[workOrder.repairResult]}
              </Tag>
              {workOrder.reviewer && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#52c41a' }}>
                  <CheckCircle /> 验收人: {workOrder.reviewer}
                </span>
              )}
            </div>
            
            {workOrder.repairRemark && (
              <div style={{ padding: 12, background: '#f6ffed', borderRadius: 6, marginBottom: 12 }}>
                <div style={{ fontSize: 13, color: '#52c41a', lineHeight: '1.6' }}>
                  {workOrder.repairRemark}
                </div>
              </div>
            )}
            
            {workOrder.spareParts && workOrder.spareParts.some(p => p.actualQuantity !== undefined) && (
              <div>
                <h5 style={{ fontSize: 13, marginBottom: 8 }}>备件实际用量</h5>
                <List
                  dataSource={workOrder.spareParts.filter(p => p.actualQuantity !== undefined)}
                  size="small"
                  renderItem={(part: SparePart) => (
                    <List.Item key={part.id} style={{ padding: '6px 0' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{part.name}</div>
                        <div style={{ fontSize: 11, color: '#999' }}>{part.code}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13 }}>
                          需求: <span style={{ color: '#8c8c8c' }}>{part.quantity}</span> | 
                          实际: <span style={{ color: '#1890ff', fontWeight: 600 }}>{part.actualQuantity}</span> {part.unit}
                        </div>
                        {part.actualQuantity !== part.quantity && (
                          <div style={{ fontSize: 11, color: '#faad14', marginTop: 2 }}>
                            差异: {part.actualQuantity! - part.quantity > 0 ? '+' : ''}{part.actualQuantity! - part.quantity}
                          </div>
                        )}
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            )}
          </Card>
        </div>
      )}

      <Divider style={{ marginBottom: 12, marginTop: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ClockCircleOutlined />
          <span style={{ fontSize: 14, fontWeight: 500 }}>执行时间线</span>
        </div>
      </Divider>

      <Timeline>
        {workOrder.timeline.map(log => (
          <Timeline.Item key={log.id}>
            <div style={{ fontWeight: 500, fontSize: 13 }}>{log.description}</div>
            <div style={{ fontSize: 12, color: '#999' }}>
              {log.operator} · {formatTime(log.timestamp)}
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    </Modal>
  );
};

export default WorkOrderDetail;