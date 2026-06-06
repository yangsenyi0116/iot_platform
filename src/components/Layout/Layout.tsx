import { useEffect } from 'react';
import { Layout } from 'antd';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import { useAppStore } from '../../stores';

const { Content } = Layout;

interface LayoutProps {
  children: React.ReactNode;
}

export default function CustomLayout({ children }: LayoutProps) {
  const { startSimulation } = useAppStore();
  
  useEffect(() => {
    startSimulation();
    return () => {
      // Cleanup handled by zustand store
    };
  }, [startSimulation]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout style={{ marginLeft: 200 }}>
        <Header />
        <Content style={{ padding: '24px', background: '#f5f5f5', minHeight: 'calc(100vh - 136px)' }}>
          {children}
        </Content>
        <Footer />
      </Layout>
    </Layout>
  );
}
