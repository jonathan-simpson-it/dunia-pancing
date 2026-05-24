import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import { ProductStoreProvider } from './context/ProductStore'
import { CartProvider } from './context/CartContext'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ui/ProtectedRoute'
import ScrollToTop from './components/ui/ScrollToTop'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import AdminAddProduct from './pages/AdminAddProduct'
import AdminImport from './pages/AdminImport'
import AdminRevenue from './pages/AdminRevenue'
import Account from './pages/Account'
import Contact from './pages/Contact'

export default function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <AuthProvider>
          <ProductStoreProvider>
            <CartProvider>
              <BrowserRouter>
                <ScrollToTop />
                <Layout>
                  {({ searchTerm, setSearchTerm }) => (
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/catalog" element={<Catalog searchTerm={searchTerm} setSearchTerm={setSearchTerm} />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
                      <Route path="/admin/add" element={<ProtectedRoute role="admin"><AdminAddProduct /></ProtectedRoute>} />
                      <Route path="/admin/import" element={<ProtectedRoute role="admin"><AdminImport /></ProtectedRoute>} />
                      <Route path="/admin/revenue" element={<ProtectedRoute role="admin"><AdminRevenue /></ProtectedRoute>} />
                      <Route path="/account" element={<ProtectedRoute role="client"><Account /></ProtectedRoute>} />
                      <Route path="/contact" element={<Contact />} />
                    </Routes>
                  )}
                </Layout>
              </BrowserRouter>
            </CartProvider>
          </ProductStoreProvider>
        </AuthProvider>
      </LanguageProvider>
    </HelmetProvider>
  )
}
