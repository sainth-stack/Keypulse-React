import "./App.css";
import { AdminLayout } from "./layout";
import { Login } from "./pages/Auth/login";
import { Register } from "./pages/Auth/register";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Bot from "./pages/bot";
import DataAnalysis from "./pages/data-analysis";
import MissingValues from "./pages/missing-values";
import AiAndModels from "./pages/ai-and-models";
import Kpi from "./pages/kpi";
import Bot2 from "./pages/bot2";
import Dashboard from "./pages/dashboard";
import DiagnosticReports from "./pages/diagnostic-reports";
import { AdminScrenLayout } from "./pages/admin-screens/shared/layout";
import TenantsManager from "./pages/admin-screens/tenants/TenantsManager";
import OrganizationsManager from "./pages/admin-screens/organizations/OrganizationsManager";
import UsersManager from "./pages/admin-screens/users/UsersManager";
import UserRoles from "./pages/admin-screens/user-roles";
import UserSessions from "./pages/admin-screens/user-sessions"
import AccessDenied from "./pages/access-denied";
import ProtectedRoute from "./components/ProtectedRoute";
import SessionStatus from "./components/SessionStatus";
import SessionTestPage from "./components/SessionTestPage";
import SimpleSessionDemo from "./components/SimpleSessionDemo";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Protected routes wrapped with ProtectedRoute */}
        <Route path="/" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="/" element={<Bot2 />} />
          <Route path="/bot" element={<Bot2 />} />
          <Route path="/kprocess" element={<Bot />} />
          <Route path="/data-analysis" element={<DataAnalysis />} />
          <Route path="/diagnostic-reports" element={<DiagnosticReports />} />
          <Route path="/visualizations" element={<Dashboard />} />
          <Route path="/missing-value" element={<MissingValues />} />
          <Route path="/ai-models" element={<AiAndModels />} />
          <Route path="/kpi" element={<Kpi />} />
          <Route path="/session-test" element={<SessionTestPage />} />
          <Route path="/session-demo" element={<SimpleSessionDemo />} />
        </Route>
        
        {/* Admin screens also protected */}
        <Route path="/" element={
          <ProtectedRoute>
            <AdminScrenLayout />
          </ProtectedRoute>
        }>
          <Route path="/tenants" element={<TenantsManager />} />
          <Route path="/organizations" element={<OrganizationsManager />} />
          <Route path="/users" element={<UsersManager />} />
          <Route path="/user-roles" element={<UserRoles />} />
          <Route path="/user-sessions" element={<UserSessions />} />
        </Route>
        
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/access-denied" element={<AccessDenied />} />
      </Routes>
      
      {/* Session Status Display - only show on protected routes */}
      {window.location.pathname !== '/login' && window.location.pathname !== '/register' && (
        <SessionStatus showDetails={false} />
      )}
    </BrowserRouter>
  );
}

export default App;
