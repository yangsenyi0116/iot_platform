import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CustomLayout from './components/Layout/Layout';
import GatewayManagement from './pages/GatewayManagement';
import DeviceManagement from './pages/DeviceManagement';
import AlarmCenter from './pages/AlarmCenter';
import AlarmHistory from './pages/AlarmCenter/AlarmHistory';
import WorkOrder from './pages/WorkOrder';
import PredictiveMaintenance from './pages/PredictiveMaintenance';
import KnowledgeBase from './pages/KnowledgeBase';
import DigitalTwin from './pages/DigitalTwin';

export default function App() {
  return (
    <Router>
      <CustomLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/digitaltwin" />} />
          <Route path="/digitaltwin" element={<DigitalTwin />} />
          <Route path="/gateway" element={<GatewayManagement />} />
          <Route path="/device" element={<DeviceManagement />} />
          <Route path="/alarm" element={<AlarmCenter />} />
          <Route path="/alarm/history" element={<AlarmHistory />} />
          <Route path="/work-orders" element={<WorkOrder />} />
          <Route path="/predictive" element={<PredictiveMaintenance />} />
          <Route path="/knowledge" element={<KnowledgeBase />} />
        </Routes>
      </CustomLayout>
    </Router>
  );
}