// this file is the main entry point of the application and handles routing and authentication

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from '../src/components/ProtectedRoutes';
import Login from '../src/pages/Login';
import Dashboard from '../src/pages/Dashboard';
import EmployeeList from '../src/pages/EmployeeList';
import OrgChart from '../src/pages/OrgChart';
import Layout from './components/Layout';
import { useContext } from 'react';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import Profile from './pages/Profile';

const ThemeToggleButton = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    return (
        <button 
            onClick={toggleTheme} 
            style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 1000 }}
        >
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
    );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ThemeToggleButton />
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes wrapped with Layout & Sidebar */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/employees" element={
              <ProtectedRoute>
                <Layout>
                  <EmployeeList />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/organization" element={
              <ProtectedRoute>
                <Layout>
                  <OrgChart />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Redirect to login by default */}
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;