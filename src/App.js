import './App.css';
import { AdminLayout } from './layout';
import { Login } from './pages/Auth/login';
import { Register } from './pages/Auth/register';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Bot from './pages/bot';
import DataAnalysis from './pages/data-analysis';
import MissingValues from './pages/missing-values';
import AiAndModels from './pages/ai-and-models';
import Kpi from './pages/kpi';
import Bot2 from './pages/bot2';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
        <Route path="/" element={<Bot2 />} />
        <Route path="/bot" element={<Bot2 />} />
        <Route path="/kprocess" element={<Bot />} />
        <Route path="/data-analysis" element={<DataAnalysis />} />
        <Route path="/missing-value" element={<MissingValues />} />
        <Route path="/ai-models" element={<AiAndModels />} />
        <Route path="/kpi" element={<Kpi />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
