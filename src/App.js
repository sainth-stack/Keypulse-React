import './App.css';
import { AdminLayout } from './layout';
import { Login } from './pages/Auth/login';
import { Register } from './pages/Auth/register';
import { KProcess } from './pages/KProcess';
import { ResourceManagement } from './pages/ResourceManagement';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Sustainability } from './pages/Sustainability';
import { Resilience } from './pages/Resilience';
import { InnerProductivity } from './pages/InnerProductivity';
import Reports from './pages/Reports';
import { HtmlReport } from './pages/Reports/generateHTMLfile';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/" element={<AdminLayout />}>
          <Route path="/dashboard" element={<KProcess />} />
          <Route path='/sustainability' element={<Sustainability />} />
          <Route path='/resilience' element={<Resilience />} />
          <Route path='/productivity' element={<InnerProductivity />} />
          <Route path='/reports' element={<Reports />} />
          <Route path='/review-report' element={<HtmlReport />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
