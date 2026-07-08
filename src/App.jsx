import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import DetalheFilme from './pages/DetalheFilme';
import Sessoes from './pages/Sessoes';
import ReservaAssentos from './pages/ReservaAssentos';
import MinhasReservas from './pages/MinhasReservas';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFilmes from './pages/admin/AdminFilmes';
import AdminSalas from './pages/admin/AdminSalas';
import AdminSessoes from './pages/admin/AdminSessoes';
import AdminReservas from './pages/admin/AdminReservas';
import AdminUsuarios from './pages/admin/AdminUsuarios';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <div style={{ flexGrow: 1 }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/filmes/:id" element={<DetalheFilme />} />
                <Route path="/sessoes" element={<Sessoes />} />

                {/* User Authenticated Routes */}
                <Route
                  path="/reservas/nova/:sessaoId"
                  element={
                    <ProtectedRoute allowedRoles={['USUARIO', 'ADMIN']}>
                      <ReservaAssentos />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/minhas-reservas"
                  element={
                    <ProtectedRoute allowedRoles={['USUARIO', 'ADMIN']}>
                      <MinhasReservas />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Authenticated Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/filmes"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminFilmes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/salas"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminSalas />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/sessoes"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminSessoes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reservas"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminReservas />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/usuarios"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminUsuarios />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Home />} />
              </Routes>
            </div>
            
            {/* Simple footer */}
            <footer style={{
              textAlign: 'center',
              padding: '1.5rem',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              marginTop: 'auto'
            }}>
              &copy; {new Date().getFullYear()} CineSenai. Todos os direitos reservados.
            </footer>
          </div>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
