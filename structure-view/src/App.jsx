import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Home from './pages/Home';             
import AlgorithmsList from './pages/AlgorithmsList';
import Visualizer from './pages/Visualizer'; 
// Remova o import de Login page se não estiver usando
// import Login from './pages/Login'; 
import { AuthProvider } from './context/AuthContext'; // IMPORTANTE

const ProtectedRoute = ({ children }) => {
    // ... (sua lógica de proteção, se houver)
    return children;
};

function App() {
  return (
    <AuthProvider> {/* O PROVIDER TEM QUE SER A RAIZ ABSOLUTA */}
      <BrowserRouter>
        <Routes>
          {/* Rota Pública (se ainda existir) */}
          {/* <Route path="/login" element={<Login />} /> */}

          <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/home" />} />
              <Route path="/home" element={<Home />} />
              <Route path="/algorithms" element={<AlgorithmsList />} />
              <Route path="/visualizer" element={<Visualizer />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;