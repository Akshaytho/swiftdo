import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';

import BuyerTaskList from './pages/buyer/BuyerTaskList';
import BuyerCreateTask from './pages/buyer/BuyerCreateTask';
import BuyerTaskDetail from './pages/buyer/BuyerTaskDetail';

import WorkerBrowseTasks from './pages/worker/WorkerBrowseTasks';
import WorkerMyTasks from './pages/worker/WorkerMyTasks';
import WorkerTaskDetail from './pages/worker/WorkerTaskDetail';

import CitizenReportList from './pages/citizen/CitizenReportList';
import CitizenCreateReport from './pages/citizen/CitizenCreateReport';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected — inside AppShell with bottom nav */}
          <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
            <Route path="/" element={<HomePage />} />

            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Buyer */}
            <Route path="/buyer/tasks" element={
              <ProtectedRoute roles={['BUYER']}><BuyerTaskList /></ProtectedRoute>
            } />
            <Route path="/buyer/tasks/new" element={
              <ProtectedRoute roles={['BUYER']}><BuyerCreateTask /></ProtectedRoute>
            } />
            <Route path="/buyer/tasks/:taskId" element={
              <ProtectedRoute roles={['BUYER']}><BuyerTaskDetail /></ProtectedRoute>
            } />

            {/* Worker */}
            <Route path="/worker/tasks" element={
              <ProtectedRoute roles={['WORKER']}><WorkerBrowseTasks /></ProtectedRoute>
            } />
            <Route path="/worker/my-tasks" element={
              <ProtectedRoute roles={['WORKER']}><WorkerMyTasks /></ProtectedRoute>
            } />
            <Route path="/worker/tasks/:taskId" element={
              <ProtectedRoute roles={['WORKER']}><WorkerTaskDetail /></ProtectedRoute>
            } />

            {/* Citizen */}
            <Route path="/citizen/reports" element={
              <ProtectedRoute roles={['CITIZEN']}><CitizenReportList /></ProtectedRoute>
            } />
            <Route path="/citizen/reports/new" element={
              <ProtectedRoute roles={['CITIZEN']}><CitizenCreateReport /></ProtectedRoute>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
