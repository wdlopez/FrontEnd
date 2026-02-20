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
import ViewOneUser from './components/organisms/Views/ViewOneUser';
import RegisterPage from './pages/auth/RegisterPage';
import ClientsPage from './pages/Clients/ClientsPage';
import ViewOneClient from './components/organisms/Views/ViewOneClient';
import ContractsPage from './pages/Contracts/General/ContractsPage';
import SuppliersPage from './pages/Suppliers/SuppliersPage';
import SupplierContactPage from './pages/Suppliers/Contacts/SuppliersContactPage';
import SuppliersRiskPage from './pages/Suppliers/Risks/SuppliersRiskPage';
import ServicesPage from './pages/Contracts/Services/ServicesPage';
import ClausesPage from './pages/Contracts/Clauses/ClausesPage';
import WorkOrdersPage from './pages/Contracts/WorkOrders/WorkOrdesPage';
import SchemasPage from './pages/Contracts/Schemas/SchemasPage';
import SchemasProvidersPage from './pages/Suppliers/Schemas/SchemasProvidersPage';
import SchemasDeliverablesPage from './pages/Deliverables/Schemas/SchemasDeliverablesPage';
import DeliverablesPage from './pages/Deliverables/DeliverablesPage';
import DeliverablesSonPage from './pages/Deliverables/DeliverablesSon/DeliverablesSonPage';
import SchemasSlasPage from './pages/SLAs/Schemas/SchemasSlasPage';
import SlasPage from './pages/SLAs/SlasPage';
import MeasurementWindowsPage from './pages/SLAs/MeasurementWindows/MeasurementWindowsPage';
import SchemasInvoicesPage from './pages/Invoices/Schemas/SchemasInvoicesPage';
import InvoicesPage from './pages/Invoices/InvoicesPage';
import ItemsInvoicePage from './pages/Invoices/Items/ItemsInvoicePage';
import PaymentsPage from './pages/Invoices/Payments/PaymentsPage';
import SchemasNotificationsPage from './pages/Notifications/Schemas/SchemasNotificationsPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import PreferencePage from './pages/Notifications/Preferences/PreferencesPage';
import TrackingNotificationPage from './pages/Notifications/Tracking/TrackingNotificationsPage';
import BestPracticesPage from './pages/Others/BestPractices/BestPracticesPage';
import DocumentTemplatePage from './pages/Others/DocumentTemplate/DocumentTemplatePage';
import ReportsAdHocPage from './pages/Reports/ReportsAdHocPage';
import StandarReportsPage from './pages/Reports/Standar/StandarReportsPage';
import EmailLogsPage from './pages/Reports/Emails/EmailLogsPage';
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
              <Route path="/client/:id" element={<ViewOneClient />} />
              <Route path="/settings/userNroles" element={<UsersPage />} />
              <Route path="/settings/userNroles/:id" element={<ViewOneUser />} />
              <Route path="/contract/general" element={<ContractsPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/suppliers/contacts" element={<SupplierContactPage />} />
              <Route path="/suppliers/risks" element={<SuppliersRiskPage />} />
              <Route path="/contract/services" element={<ServicesPage />} />
              <Route path="/contract/clauses" element={<ClausesPage />} />
              <Route path="/contract/workOrders" element={<WorkOrdersPage />} />
              <Route path="/contract/schemas" element={<SchemasPage />} />
              <Route path="/suppliers/schemas" element={<SchemasProvidersPage />} />
              <Route path="/deliverables/schemas" element={<SchemasDeliverablesPage />} />
              <Route path="/contract/deliverables" element={<DeliverablesPage />} />
              <Route path="/contract/deliverables-son" element={<DeliverablesSonPage />} />
              <Route path="/slas/schemas" element={<SchemasSlasPage />} />
              <Route path="/contract/sla" element={<SlasPage />} />
              <Route path="/contract/sla/measurement-windows" element={<MeasurementWindowsPage />} />
              <Route path="/invoices/schemas" element={<SchemasInvoicesPage />} />
              <Route path="/invoices" element={<InvoicesPage />} />
              <Route path="/invoices/items" element={<ItemsInvoicePage />} />
              <Route path="/invoice/payments" element={<PaymentsPage />} />
              <Route path="/notifications/schemas" element={<SchemasNotificationsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/notifications/preferences" element={<PreferencePage />} />
              <Route path="/notifications/tracking" element={<TrackingNotificationPage />} />
              <Route path="/others/practics" element={<BestPracticesPage />} />
              <Route path="/others/document-templates" element={<DocumentTemplatePage />} />
              <Route path="/reports/ad-hoc" element={<ReportsAdHocPage />} />
              <Route path="/reports" element={<StandarReportsPage />} />
              <Route path="/reports/email-logs" element={<EmailLogsPage />} />
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