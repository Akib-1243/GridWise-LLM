import {Navigate,Route,Routes} from 'react-router-dom';
import {Shell} from './components/layout/PageContainer';
import {DashboardPage} from './pages/DashboardPage';
import {ForgotPasswordPage} from './pages/ForgotPasswordPage';
import {LoginPage} from './pages/LoginPage';
import {ProfilePage} from './pages/ProfilePage';
import {RegisterPage} from './pages/RegisterPage';
import {ResetPasswordPage} from './pages/ResetPasswordPage';
import {ResultPage} from './pages/ResultPage';
import {ScenarioPage} from './pages/ScenarioPage';
import {useAuth} from './auth/AuthProvider';
import {ProtectedRoute} from './auth/ProtectedRoute';
import {RoleGuard} from './auth/RoleGuard';

export default function App(){
  const {user}=useAuth();
  return <Routes>
    <Route path="/login" element={user?<Navigate to="/" replace/>:<LoginPage/>}/>
    <Route path="/register" element={user?<Navigate to="/" replace/>:<RegisterPage/>}/>
    <Route path="/forgot-password" element={user?<Navigate to="/" replace/>:<ForgotPasswordPage/>}/>
    <Route path="/reset-password" element={user?<Navigate to="/" replace/>:<ResetPasswordPage/>}/>
    <Route path="/profile" element={<ProtectedRoute><Shell><ProfilePage/></Shell></ProtectedRoute>}/>
    <Route path="/" element={<ProtectedRoute><Shell><DashboardPage/></Shell></ProtectedRoute>}/>
    <Route path="/scenario" element={<ProtectedRoute><RoleGuard allowed={['admin','operator']} fallback={<Navigate to="/" replace />}><Shell><ScenarioPage/></Shell></RoleGuard></ProtectedRoute>}/>
    <Route path="/results" element={<ProtectedRoute><RoleGuard allowed={['admin','operator','viewer']} fallback={<Navigate to="/" replace />}><Shell><ResultPage/></Shell></RoleGuard></ProtectedRoute>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>;
}
