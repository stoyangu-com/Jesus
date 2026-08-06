import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';
import Login from './pages/Login';
import Management from './pages/Management';
import NewClient from './pages/NewClient';
import MyStore from './pages/MyStore';
import Home from './pages/Home';
import About from './pages/About';
import StoresDirectory from './pages/StoresDirectory';
import PublicStore from './pages/PublicStore';
import { getStoreSlugFromHost } from './lib/storeLinks';

function AppHome() {
  const { user, profile, loading } = useAuth();
  const host = window.location.hostname;
  const storeSlug = getStoreSlugFromHost(host);

  if (loading) return <LoadingScreen />;

  // If we are on a store subdomain, never show the marketing homepage.
  // Redirect to the storefront path /s/{slug}
  if (storeSlug) {
    return <Navigate to={`/s/${storeSlug}`} replace />;
  }

  // Logged-in staff/owners go to their tools; everyone else sees the public homepage
  if (user && profile?.role === 'founder') return <Navigate to="/management" replace />;
  if (user && profile?.role === 'owner') return <Navigate to="/my-store" replace />;
  return <Home />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public — indexable */}
          <Route path="/" element={<AppHome />} />
          <Route path="/about" element={<About />} />
          <Route path="/stores" element={<StoresDirectory />} />
          <Route path="/s/:slug" element={<PublicStore />} />

          {/* Auth + internal — noindex via page Seo */}
          <Route path="/login" element={<Login />} />
          <Route
            path="/management"
            element={
              <ProtectedRoute role="founder">
                <Management />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new-client"
            element={
              <ProtectedRoute role="founder">
                <NewClient />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-store"
            element={
              <ProtectedRoute>
                <MyStore />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
