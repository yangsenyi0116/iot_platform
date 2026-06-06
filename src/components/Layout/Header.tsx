import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SearchOutlined, BellOutlined, UserOutlined } from '@ant-design/icons';
import { Layout, Input, Badge, Dropdown, Avatar } from 'antd';
import { useAppStore } from '../../stores';

const { Header } = Layout;

const menuItems: { key: string; label: string; path: string }[] = [
  { key: '/gateway', label: 'IoT网关管理', path: '/gateway' },
  { key: '/device', label: '设备管理', path: '/device' },
  { key: '/alarm', label: '报警中心', path: '/alarm' },
  { key: '/predictive', label: '预测性维护', path: '/predictive' },
  { key: '/knowledge', label: '知识库', path: '/knowledge' },
  { key: '/digitaltwin', label: '数字孪生', path: '/digitaltwin' },
];

export default function CustomHeader() {
  const [searchValue, setSearchValue] = useState('');
  const location = useLocation();
  const { alarms, setSearchKeyword } = useAppStore();
  
  const unconfirmedAlarmCount = alarms.filter(a => !a.confirmed).length;
  
  const handleSearch = (value: string) => {
    setSearchValue(value);
    setSearchKeyword(value);
  };
  
  const getBreadcrumb = () => {
    const item = menuItems.find(item => item.path === location.pathname);
    return item?.label || '首页';
  };

  return (
    <Header style={{ padding: 0, background: '#fff', boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: '#1890ff' }}>
            {getBreadcrumb()}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Input
            placeholder="全局搜索..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
          />
          
          <Badge count={unconfirmedAlarmCount} overflowCount={99}>
            <BellOutlined style={{ fontSize: 20, cursor: 'pointer', color: '#666' }} />
          </Badge>
          
          <Dropdown menu={{ items: [{ key: 'profile', label: '个人中心' }, { key: 'settings', label: '设置' }, { key: 'logout', label: '退出登录' }] }} trigger={['click']}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span style={{ display: 'inline' }}>管理员</span>
            </div>
          </Dropdown>
        </div>
      </div>
    </Header>
  );
}
