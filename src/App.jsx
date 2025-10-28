import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import { ProtectedRoute, AdminRoute } from './components/RouteGuards'
import LandingPage from './pages/LandingPage'
import ShopPage from './pages/ShopPage'
import OriginalsPage from './pages/OriginalsPage'
import ResinArtPage from './pages/ResinArtPage'
import CrochetPage from './pages/CrochetPage'
import CeramicArtPage from './pages/CeramicArtPage'
import CustomizationPage from './pages/CustomizationPage'
import CommissionPage from './pages/CommissionPage'
import GiftablesPage from './pages/GiftablesPage'
import BouquetsPage from './pages/BouquetsPage'
import WorkshopsPage from './pages/WorkshopsPage'
import InteriorDesignPage from './pages/InteriorDesignPage'
import UploadArtworkPage from './pages/admin/upload'
import AdminDashboard from './pages/admin/dashboard'
import OrderHistoryPage from './pages/OrderHistoryPage'
import AuthCallback from './pages/AuthCallback'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import LoginPage from './pages/LoginPage'
import TestConnection from './pages/TestConnection'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Layout>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/test-connection" element={<TestConnection />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/originals" element={<OriginalsPage />} />
              <Route path="/resin-art" element={<ResinArtPage />} />
              <Route path="/crochet" element={<CrochetPage />} />
              <Route path="/ceramic-art" element={<CeramicArtPage />} />
              <Route path="/customization" element={<CustomizationPage />} />
              <Route path="/commission" element={<CommissionPage />} />
              <Route path="/giftables" element={<GiftablesPage />} />
              <Route path="/bouquets" element={<BouquetsPage />} />
              <Route path="/workshops" element={<WorkshopsPage />} />
              <Route path="/interior-design" element={<InteriorDesignPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Authenticated customer routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/orders" element={<OrderHistoryPage />} />
              </Route>

              {/* Admin routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/admin/upload" element={<UploadArtworkPage />} />
                <Route path="/upload-artwork" element={<UploadArtworkPage />} />
              </Route>
            </Routes>
          </Layout>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#228B22',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
