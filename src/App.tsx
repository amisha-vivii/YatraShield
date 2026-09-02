import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Shell } from './components/Shell';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Landing } from './pages/Landing';
import { About } from './pages/About';
import { Admin } from './pages/Admin';
import { Dashboard } from './pages/Dashboard';
import { Emergency } from './pages/Emergency';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ProviderProfile } from './pages/ProviderProfile';
import { ReportIncident } from './pages/ReportIncident';
import { RiskCheck } from './pages/RiskCheck';
import { RiskMap } from './pages/RiskMap';
import { ServiceExplorer } from './pages/ServiceExplorer';

function AdminRoute() {
  const { account } = useAuth();
  return account?.role === 'admin' ? <Admin /> : <Navigate to="/login" replace />;
}

function TravelerRoute({ children }: { children: React.ReactElement }) {
  const { account } = useAuth();
  return account ? children : <Navigate to="/login" replace />;
}

export function App() {
  return (
    <AuthProvider>
      <DataProvider>
      <BrowserRouter>
        <Shell>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/risk-check" element={<RiskCheck />} />
            <Route path="/risk-map" element={<RiskMap />} />
            <Route path="/services" element={<ServiceExplorer />} />
            <Route path="/services/:id" element={<ProviderProfile />} />
            <Route path="/report" element={<ReportIncident />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<TravelerRoute><Dashboard /></TravelerRoute>} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/admin" element={<AdminRoute />} />
            <Route path="*" element={<Landing />} />
          </Routes>
        </Shell>
      </BrowserRouter>
      </DataProvider>
    </AuthProvider>);

}