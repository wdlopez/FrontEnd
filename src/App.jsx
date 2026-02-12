import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Importamos el "Guardia de Seguridad" que creamos en el paso anterior
import ProtectedRoutes from './router/ProtectedRoutes'; 
import MainLayout from './components/templates/MainLayoutGlobal';

// Páginas
import LoginPage from './pages/auth/LoginPage';
import ForgotPassword from './pages/auth/ForgotPassword';
import DashboardIndex from './pages/Dashboard/Index';
import UsersPage from './pages/Users/UsersPage';
import RegisterPage from './pages/auth/RegisterPage';
import ClientsPage from './pages/Clients/ClientsPage';
import ContractsPage from './pages/Contracts/General/ContractsPage';
import SuppliersPage from './pages/Suppliers/SuppliersPage';
import ServicesPage from './pages/Contracts/Services/ServicesPage';
import ClausesPage from './pages/Contracts/Clauses/ClausesPage';
import WorkOrdersPage from './pages/Contracts/WorkOrders/WorkOrdesPage';
import SchemasPage from './pages/Contracts/Schemas/SchemasPage';
import SchemasProvidersPage from './pages/Suppliers/Schemas/SchemasProvidersPage';
import SchemasDeliverablesPage from './pages/Deliverables/Schemas/SchemasDeliverablesPage';
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* =======================================================
              1. RUTAS PÚBLICAS (SIN Layout Global)
              ======================================================== */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ForgotPassword />} />
          
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* =======================================================
              2. RUTAS PRIVADAS (CON Layout Global)
              Envolvemos ProtectedRoutes y MainLayout juntos
              ======================================================== */}
          <Route element={<ProtectedRoutes />}>
            {/* Todas las rutas aquí dentro tendrán el Layout */}
            <Route element={<MainLayout />}> 
              <Route path="/dashboard" element={<DashboardIndex />} />
              <Route path="/client" element={<ClientsPage />} />
              <Route path="/settings/userNroles" element={<UsersPage />} />
              <Route path="/contract/general" element={<ContractsPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/contract/services" element={<ServicesPage />} />
              <Route path="/contract/clauses" element={<ClausesPage />} />
              <Route path="/contract/workOrders" element={<WorkOrdersPage />} />
              <Route path="/contract/schemas" element={<SchemasPage />} />
              <Route path="/suppliers/schemas" element={<SchemasProvidersPage />} />
              <Route path="/deliverables/schemas" element={<SchemasDeliverablesPage />} />
            </Route>
          </Route>

          {/* Error 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;