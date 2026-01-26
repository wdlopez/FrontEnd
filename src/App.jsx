import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Importamos el "Guardia de Seguridad" que creamos en el paso anterior
import ProtectedRoutes from './router/ProtectedRoutes'; 
import MainLayout from './components/templates/MainLayoutGlobal';

// Páginas
import LoginPage from './pages/auth/LoginPage';
import DashboardIndex from './pages/Dashboard/Index';
import UsersPage from './pages/Users/UsersPage';
import RegisterPage from './pages/auth/RegisterPage';
import ClientsPage from './pages/Clients/ClientsPage';


function App() {
  return (
    // 1. El AuthProvider envuelve TODA la app para dar acceso a la sesión en cualquier lugar
    <AuthProvider>
      <BrowserRouter>
      <MainLayout>
        <Routes>
          
          {/* =======================================================
              ZONA PÚBLICA (Cualquiera puede entrar aquí)
          ======================================================== */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Si alguien entra a "tudominio.com", lo mandamos al login */}
          <Route path="/" element={<Navigate to="/login" replace />} />


          {/* =======================================================
              ZONA PRIVADA (Solo usuarios con Token)
              El componente <ProtectedRoutes /> actúa como un muro.
          ======================================================== */}
          <Route element={<ProtectedRoutes />}>
            <Route path="/dashboard" element={<DashboardIndex />} />
            
            {/* Aquí irás agregando tus futuras rutas privadas:
            <Route path="/contracts" element={<ContractsPage />} />
            <Route path="/users" element={<UsersPage />} /> 
            */}
            <Route path="/client" element={<ClientsPage />} />
            <Route path="/settings/userNroles" element={<UsersPage />} />
          </Route>


          {/* =======================================================
              MANEJO DE ERRORES (404)
          ======================================================== */}
          {/* Si escriben una ruta que no existe, los devolvemos al login (o a una pág 404) */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
        </MainLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;