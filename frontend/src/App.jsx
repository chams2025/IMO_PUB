import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import SuperAdminRoute from "./components/SuperAdminRoute";
import AnnonceDetail from "./pages/AnnonceDetail";
import PublierAnnonce from "./pages/PublierAnnonce";
import MesAnnonces from "./pages/MesAnnonces";
import Favoris from "./pages/Favoris";
import MesMessages from "./pages/MesMessages";
import AdminDashboard from "./pages/AdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import ArticlePage from "./pages/ArticlePage";
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import PublicLayout from "./components/PublicLayout";
import DashboardLayout from "./components/DashboardLayout";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";
import AdminLogin from "./pages/AdminLogin";
import AdminUsers from "./pages/AdminUsers";
import AdminAnnonces from "./pages/AdminAnnonces";
import AdminReports from "./pages/AdminReports";
import AdminStats from "./pages/AdminStats";
import AdminActivity from "./pages/AdminActivity";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import SuperAdminManagers from "./pages/SuperAdminManagers";
import SuperAdminUsers from "./pages/SuperAdminUsers";
import SuperAdminAnnonces from "./pages/SuperAdminAnnonces";
import SuperAdminReports from "./pages/SuperAdminReports";
import SuperAdminStats from "./pages/SuperAdminStats";
import SuperAdminActivity from "./pages/SuperAdminActivity";
import SuperAdminSettings from "./pages/SuperAdminSettings";
import AchatImmobilier from "./pages/AchatImmobilier";
import VenteProprietes from "./pages/VenteProprietes";
import LocationLogement from "./pages/LocationLogement";
import EstimationGratuite from "./pages/EstimationGratuite";
import ConseilsImmobiliers from "./pages/ConseilsImmobiliers";
import GestionLocative from "./pages/GestionLocative";
import ModifierAnnonce from "./pages/ModifierAnnonce";
import InfoPage from "./pages/InfoPage";
import Profile from "./pages/Profile";
import AdminContactMessages from "./pages/AdminContactMessages";
import ScrollToTop from "./components/ScrollToTop";

function Logout() {
  localStorage.removeItem(ACCESS_TOKEN);
  localStorage.removeItem(REFRESH_TOKEN);
  localStorage.removeItem("user");
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
     <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/annonces/:id" element={<AnnonceDetail />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
<Route path="/article/:id" element={<ArticlePage />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/super-admin-login" element={<SuperAdminLogin />} />
          <Route path="/achat-immobilier" element={<AchatImmobilier />} />
<Route path="/vente-proprietes" element={<VenteProprietes />} />
<Route path="/location-logement" element={<LocationLogement />} />
<Route path="/estimation-gratuite" element={<EstimationGratuite />} />
<Route path="/conseils-immobiliers" element={<ConseilsImmobiliers />} />
<Route path="/gestion-locative" element={<GestionLocative />} />
          <Route path="/faq" element={<InfoPage slug="faq" />} />
          <Route path="/help" element={<InfoPage slug="help" />} />
          <Route path="/privacy" element={<InfoPage slug="privacy" />} />
          <Route path="/terms" element={<InfoPage slug="terms" />} />
        </Route>

        {/* Connected user routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/publier" element={<PublierAnnonce />} />
          <Route path="/mes-annonces" element={<MesAnnonces />} />
          <Route path="/favoris" element={<Favoris />} />
          <Route path="/mes-favoris" element={<Favoris />} />
          <Route path="/mes-messages" element={<MesMessages />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/annonces/:id/edit" element={<ModifierAnnonce />} />
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
<Route
  path="/admin/users"
  element={
    <AdminRoute>
      <AdminUsers />
    </AdminRoute>
  }
/>

<Route
  path="/admin/annonces"
  element={
    <AdminRoute>
      <AdminAnnonces />
    </AdminRoute>
  }
/>

<Route
  path="/admin/reports"
  element={
    <AdminRoute>
      <AdminReports />
    </AdminRoute>
  }
/>

<Route
  path="/admin/stats"
  element={
    <AdminRoute>
      <AdminStats />
    </AdminRoute>
  }
/>

<Route
  path="/admin/activity"
  element={
    <AdminRoute>
      <AdminActivity />
    </AdminRoute>
  }
/>
<Route
  path="/admin/contact-messages"
  element={
    <AdminRoute>
      <AdminContactMessages />
    </AdminRoute>
  }
/>
        {/* Super admin routes */}
        <Route
          path="/super-admin-dashboard"
          element={
            <SuperAdminRoute>
              <SuperAdminDashboard />
            </SuperAdminRoute>
          } />
          <Route
            path="/super-admin/managers"
            element={
            <SuperAdminRoute>
              <SuperAdminManagers />
              </SuperAdminRoute>
            }
         />
<Route
  path="/super-admin/users"
  element={
    <SuperAdminRoute>
      <SuperAdminUsers />
    </SuperAdminRoute>
  }
/>
<Route
  path="/super-admin/annonces"
  element={
    <SuperAdminRoute>
      <SuperAdminAnnonces />
    </SuperAdminRoute>
  }
/>
<Route
  path="/super-admin/reports"
  element={
    <SuperAdminRoute>
      <SuperAdminReports />
    </SuperAdminRoute>
  }
/>
<Route
  path="/super-admin/stats"
  element={
    <SuperAdminRoute>
      <SuperAdminStats />
    </SuperAdminRoute>
  }
/>
<Route
  path="/super-admin/activity"
  element={
    <SuperAdminRoute>
      <SuperAdminActivity />
    </SuperAdminRoute>
  }
/>
<Route
  path="/super-admin/settings"
  element={
    <SuperAdminRoute>
      <SuperAdminSettings />
    </SuperAdminRoute>
  }
/>
<Route
  path="/super-admin/contact-messages"
  element={
    <SuperAdminRoute>
      <AdminContactMessages superAdmin />
    </SuperAdminRoute>
  }
/>
        {/* Not found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;