import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Páginas públicas
import Login from './pages/login/login';
import CadastroPublico from './pages/cadastro/cadastropublico';

// Páginas do cliente
import HomeCatalog from './pages/home/home';
import Profile from './pages/perfil/perfil';

// Páginas do admin
import AdminDashboard from './pages/admin-dashboard/admindashboard';
import AdminUsuarios from './pages/admin-usuarios/adminusuarios';
import AdminCustomersOrders from './pages/admin-pedidos/admincustomersorders';
import AdminTrocas from './pages/admin-trocas/admintrocas';
import AdminAnalytics from './pages/admin-analise/adminanalise';

// Componente de rota protegida para clientes
function ProtectedClientRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) {
    return null;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (isAdmin) {
    return <Navigate to="/admin-dashboard" replace />;
  }
  
  return <>{children}</>;
}

// Componente de rota protegida para admin
function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) {
    return null;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }
  
  return <>{children}</>;
}

// Componente de rota pública (redireciona se já estiver logado)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) {
    return null;
  }
  
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin-dashboard' : '/home'} replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/cadastro" 
        element={
          <PublicRoute>
            <CadastroPublico />
          </PublicRoute>
        } 
      />

      {/* Rotas do cliente */}
      <Route 
        path="/home" 
        element={
          <ProtectedClientRoute>
            <HomeCatalog />
          </ProtectedClientRoute>
        } 
      />
      <Route 
        path="/perfil" 
        element={
          <ProtectedClientRoute>
            <Profile />
          </ProtectedClientRoute>
        } 
      />

      {/* Rotas do admin */}
      <Route 
        path="/admin-dashboard" 
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        } 
      />
      <Route 
        path="/admin-usuarios" 
        element={
          <ProtectedAdminRoute>
            <AdminUsuarios />
          </ProtectedAdminRoute>
        } 
      />
      <Route 
        path="/admin-pedidos" 
        element={
          <ProtectedAdminRoute>
            <AdminCustomersOrders />
          </ProtectedAdminRoute>
        } 
      />
      <Route 
        path="/admin-trocas" 
        element={
          <ProtectedAdminRoute>
            <AdminTrocas />
          </ProtectedAdminRoute>
        } 
      />
      <Route 
        path="/admin-analise" 
        element={
          <ProtectedAdminRoute>
            <AdminAnalytics />
          </ProtectedAdminRoute>
        } 
      />

      {/* Redirecionamentos */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
