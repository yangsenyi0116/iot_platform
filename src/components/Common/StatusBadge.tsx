import { Tag } from 'antd';

interface StatusBadgeProps {
  status: string;
  showText?: boolean;
}

const statusConfig: Record<string, { color: string; text: string }> = {
  online: { color: 'green', text: '在线' },
  offline: { color: 'default', text: '离线' },
  error: { color: 'error', text: '异常' },
  normal: { color: 'green', text: '正常' },
  warning: { color: 'gold', text: '预警' },
  alarm: { color: 'error', text: '告警' },
};

export default function StatusBadge({ status, showText = true }: StatusBadgeProps) {
  const config = statusConfig[status] || { color: 'default' as const, text: status };
  
  return (
    <Tag color={config.color}>
      {showText && config.text}
    </Tag>
  );
}
