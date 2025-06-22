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
import { AdminScrenLayout } from "./pages/admin-screens/shared/layout";
import TenantsManager from "./pages/admin-screens/tenants/TenantsManager";
import OrganizationsManager from "./pages/admin-screens/organizations/OrganizationsManager";
import UsersManager from "./pages/admin-screens/users/UsersManager";
import UserRoles from "./pages/admin-screens/user-roles";
import UserSessions from "./pages/admin-screens/user-sessions"
import AccessDenied from "./pages/access-denied";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route path="/" element={<Bot2 />} />
          <Route path="/bot" element={<Bot2 />} />
          <Route path="/kprocess" element={<Bot />} />
          <Route path="/data-analysis" element={<DataAnalysis />} />
          <Route path="/visualizations" element={<Dashboard />} />
          <Route path="/missing-value" element={<MissingValues />} />
          <Route path="/ai-models" element={<AiAndModels />} />
          <Route path="/kpi" element={<Kpi />} />
        </Route>
        <Route path="/" element={<AdminScrenLayout />}>
          <Route path="/tenants" element={<TenantsManager />} />
          <Route path="/organizations" element={<OrganizationsManager />} />
          <Route path="/users" element={<UsersManager />} />
          <Route path="/user-roles" element={<UserRoles />} />
          <Route path="/user-sessions" element={<UserSessions />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/access-denied" element={<AccessDenied />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
