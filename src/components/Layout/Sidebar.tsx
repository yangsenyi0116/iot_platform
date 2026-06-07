import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  GatewayOutlined,
  DesktopOutlined,
  BellOutlined,
  BarChartOutlined,
  BookOutlined,
  BoxPlotOutlined,
  HistoryOutlined,
  DashboardOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';

const { Sider } = Layout;

const menuItems = [
  {
    group: '总览',
    items: [
      { key: '/digitaltwin', icon: <BoxPlotOutlined />, label: '全场总览' },
    ]
  },
  {
    group: '设备管理',
    items: [
      { key: '/gateway', icon: <GatewayOutlined />, label: 'IoT网关管理' },
      { key: '/device', icon: <DesktopOutlined />, label: '设备管理' },
    ]
  },
  {
    group: '监控告警',
    items: [
      {
        key: 'alarm',
        icon: <BellOutlined />,
        label: '报警中心',
        children: [
          { key: '/alarm', icon: <DashboardOutlined />, label: '实时报警' },
          { key: '/alarm/history', icon: <HistoryOutlined />, label: '历史报警' },
        ]
      },
    ]
  },
  {
    group: '工单管理',
    items: [
      { key: '/work-orders', icon: <FileTextOutlined />, label: '工单管理' },
    ]
  },
  {
    group: '分析决策',
    items: [
      { key: '/predictive', icon: <BarChartOutlined />, label: '预测性维护' },
      { key: '/knowledge', icon: <BookOutlined />, label: '知识库' },
      { key: '/energy', icon: <ThunderboltOutlined />, label: '能耗管理' },
      { key: '/spare-parts', icon: <ToolOutlined />, label: '备件管理' },
    ]
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const renderMenuItems = () => {
    if (collapsed) {
      const items: any[] = [];
      menuItems.forEach((group) => {
        group.items.forEach((item: any) => {
          if (item.children) {
            item.children.forEach((child: any) => {
              items.push({
                key: child.key,
                icon: child.icon,
                label: child.label,
              });
            });
          } else {
            items.push({
              key: item.key,
              icon: item.icon,
              label: item.label,
            });
          }
        });
      });
      return items;
    }

    const items: any[] = [];

    menuItems.forEach((group) => {
      items.push({
        type: 'group' as const,
        label: (
          <span style={{
            color: '#6b7280',
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 1,
            padding: '8px 16px 4px',
            display: 'block',
          }}>
            {group.group}
          </span>
        ),
        children: group.items.map((item: any) => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
          children: item.children,
        })),
      });
    });

    return items;
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className="logo" style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        position: 'relative',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          <div style={{
            width: 32,
            height: 32,
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: collapsed ? '50%' : '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
          }}>
            <DashboardOutlined style={{ color: '#fff', fontSize: 18 }} />
          </div>
          {!collapsed && (
            <div style={{
              marginLeft: 10,
              display: 'flex',
              flexDirection: 'column',
            }}>
              <div style={{
                fontSize: 15,
                fontWeight: 600,
                color: '#f1f5f9',
                letterSpacing: 0.5,
              }}>
                工业智能平台
              </div>
              <div style={{
                fontSize: 9,
                color: '#64748b',
                letterSpacing: 1.5,
                marginTop: 1,
              }}>
                IIoT PLATFORM
              </div>
            </div>
          )}
        </div>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={['alarm']}
        onClick={({ key }) => navigate(key)}
        style={{
          height: 'calc(100% - 64px)',
          borderRight: 0,
          background: 'transparent',
        }}
        items={renderMenuItems()}
        theme="dark"
        inlineCollapsed={collapsed}
      />
      <div
        className="collapse-trigger"
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.08)',
          transition: 'all 0.3s',
          color: '#94a3b8',
        }}
      >
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </div>
    </Sider>
  );
}