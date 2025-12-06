import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Home from './pages/Home';             
import AlgorithmsList from './pages/AlgorithmsList';
import Visualizer from './pages/Visualizer'; 
// Remova o import de Login se não estiver usando
// import Login from './pages/Login'; 
import { AuthProvider } from './context/AuthContext';

// Importa a página de Aulas
import Classes from './pages/Classes';
// --- NOVO IMPORT ---
import GraphRepresentation from './pages/classes/GraphRepresentation'; 
import LinkedListClass from './pages/classes/LinkedList';
import DepthFirstSearchClass from './pages/classes/DepthFirstSearch';
import BreadthFirstSearchClass from './pages/classes/BreadthFirstSearch';
import TopologicalSortClass from './pages/classes/TopologicalSort';
import DijkstraClass from './pages/classes/Dijkstra';
import ProblemsList from './pages/ProblemsList';
import DFSStartFinish from './pages/problems/DFSStartFinish';
import Forms from './pages/problems/Forms';

const ProtectedRoute = ({ children }) => {
    // ... (sua lógica de proteção) ...
    return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota Pública (se ainda existir) */}
          {/* <Route path="/login" element={<Login />} /> */}

          <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/home" />} />
              <Route path="/home" element={<Home />} />
              <Route path="/algorithms" element={<AlgorithmsList />} />
              <Route path="/visualizer" element={<Visualizer />} />
              
              {/* Rotas de Aulas */}
              <Route path="/classes" element={<Classes />} />
              
              {/* --- NOVA ROTA ADICIONADA AQUI --- */}
              <Route path="/classes/graph-rep" element={<GraphRepresentation />} />
              <Route path="/classes/linked-list" element={<LinkedListClass />} />
              <Route path="/classes/dfs" element={<DepthFirstSearchClass />} />
              <Route path="/classes/bfs" element={<BreadthFirstSearchClass />} />
              <Route path="/classes/topological" element={<TopologicalSortClass />} />
              <Route path="/classes/dijkstra" element={<DijkstraClass />} />

              {/* Rotas dos exercicios */}
              <Route path="/problem" element={<ProblemsList />} />
              <Route path="/problem/dfs-start-finish-time" element={<DFSStartFinish />} />
              <Route path="/problem/form" element={<Forms />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;