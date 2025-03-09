import { Routes, Route, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import { checkAuth } from './store/authSlice'
import { fetchShopData } from './store/shopSlice'

// Import pages
import Login from './pages/Login'
import Signup from './pages/Signup'
import Verify from './pages/Verify'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Transactions from './pages/Transactions'
import TransactionDetail from './pages/TransactionDetail'
import CreateTransaction from './pages/CreateTransaction'
import Customers from './pages/Customers'
import NotFound from './pages/NotFound'

// Import layout
import Layout from './components/layout/Layout'

function App() {
  const { i18n } = useTranslation()
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector(state => state.auth)
  
  // Check authentication when app loads
  useEffect(() => {
    console.log('App mounted - checking auth status')
    dispatch(checkAuth())
  }, [dispatch])
  
  // Set the document direction based on the current language
  useEffect(() => {
    document.documentElement.dir = i18n.dir()
    document.documentElement.lang = i18n.language
  }, [i18n, i18n.language])
  
  // Log current state for debugging
  useEffect(() => {
    console.log('Auth state changed:', { isAuthenticated, user })
  }, [isAuthenticated, user])
  
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<Verify />} />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              <Layout requireAuth>
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        <Route 
          path="/products" 
          element={
            isAuthenticated ? (
              <Layout requireAuth>
                <Products />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        <Route 
          path="/products/:id" 
          element={
            isAuthenticated ? (
              <Layout requireAuth>
                <ProductDetail />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        <Route 
          path="/transactions" 
          element={
            isAuthenticated ? (
              <Layout requireAuth>
                <Transactions />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        <Route 
          path="/transactions/new" 
          element={
            isAuthenticated ? (
              <Layout requireAuth>
                <CreateTransaction />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        <Route 
          path="/transactions/:id" 
          element={
            isAuthenticated ? (
              <Layout requireAuth>
                <TransactionDetail />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        <Route 
          path="/customers" 
          element={
            isAuthenticated ? (
              <Layout requireAuth>
                <Customers />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* Home route - Redirect to dashboard if authenticated, otherwise to login */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={i18n.dir() === 'rtl'}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  )
}

export default App 