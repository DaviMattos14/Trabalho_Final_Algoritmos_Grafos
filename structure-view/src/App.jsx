import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Home from './pages/Home';             
import AlgorithmsList from './pages/AlgorithmsList'; // Não esqueça de importar se não estiver
import Visualizer from './pages/Visualizer'; 
import Login from './pages/Login'; // Rota antiga de login direto, se ainda existir

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota de Login direto (opcional, se ainda usar) */}
        <Route path="/login" element={<Login />} />

        {/* Layout Principal (Sidebar + Header) */}
        <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/algorithms" element={<AlgorithmsList />} />
            
            <Route path="/visualizer" element={<Visualizer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;