import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Home from './pages/Home';             
import AlgorithmsList from './pages/AlgorithmsList';
import Visualizer from './pages/Visualizer'; 
import Login from './pages/Login';
import { useAuth } from './context/AuthContext';

// Componente para proteger rotas
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota de Login */}
        <Route path="/login" element={<Login />} />

        {/* Layout Principal (Sidebar + Header) - Protegido */}
        <Route element={<MainLayout />}>
            <Route path="/" element={
              <ProtectedRoute>
                <Navigate to="/home" />
              </ProtectedRoute>
            } />
            <Route path="/home" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/algorithms" element={
              <ProtectedRoute>
                <AlgorithmsList />
              </ProtectedRoute>
            } />
            <Route path="/visualizer" element={
              <ProtectedRoute>
                <Visualizer />
              </ProtectedRoute>
            } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;