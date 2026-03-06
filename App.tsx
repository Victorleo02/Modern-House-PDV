
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { StockEntry } from './pages/StockEntry';
import { POS } from './pages/POS';
import { Reports } from './pages/Reports';
import { Login } from './pages/Login';
import { Config } from './pages/Config';

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = localStorage.getItem('mh_logged_user');
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/pdv" element={<AuthGuard><POS /></AuthGuard>} />
          <Route path="/estoque" element={<AuthGuard><Inventory /></AuthGuard>} />
          <Route path="/entrada" element={<AuthGuard><StockEntry /></AuthGuard>} />
          <Route path="/relatorios" element={<AuthGuard><Reports /></AuthGuard>} />
          <Route path="/config" element={<AuthGuard><Config /></AuthGuard>} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
