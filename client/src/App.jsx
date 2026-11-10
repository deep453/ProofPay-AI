import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { MilestoneProvider } from './context/MilestoneContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <MilestoneProvider>
            <AppRoutes />
          </MilestoneProvider>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}
