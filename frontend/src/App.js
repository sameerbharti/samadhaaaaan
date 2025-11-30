import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import ThemeProvider from './context/ThemeContext';

// Views
import Login from './views/Login';
import Register from './views/Register';
import Dashboard from './views/Dashboard';
import ComplaintForm from './views/ComplaintForm';
import ComplaintList from './views/ComplaintList';
import ComplaintDetail from './views/ComplaintDetail';
import UserProfile from './views/UserProfile';
import AdminDashboard from './views/AdminDashboard';
import AdminUserManagement from './views/AdminUserManagement';
import GeneralComplaints from './views/GeneralComplaints';

// Component to handle the root route with authentication check
const RootRedirect = () => {
  const { isAuthenticated } = useAuth();

  // If user is authenticated, redirect to dashboard; otherwise, redirect to login
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
};

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected routes with Layout */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/complaint/new" element={
                  <ProtectedRoute>
                    <Layout>
                      <ComplaintForm />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/complaints" element={
                  <ProtectedRoute>
                    <Layout>
                      <ComplaintList />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/complaint/:id" element={
                  <ProtectedRoute>
                    <Layout>
                      <ComplaintDetail />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/general-complaints" element={
                  <ProtectedRoute>
                    <Layout>
                      <GeneralComplaints />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Layout>
                      <UserProfile />
                    </Layout>
                  </ProtectedRoute>
                } />


                <Route path="/admin" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout>
                      <AdminDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/admin/users" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout>
                      <AdminUserManagement />
                    </Layout>
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;