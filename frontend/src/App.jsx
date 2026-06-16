import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from './context/AuthContext'
import api from './services/api'

import Header from './components/Header'
import Sidebar from './components/Sidebar'
import AdminSidebar from './components/AdminSidebar'

import Landing from './pages/Landing'
import Home from './pages/Home'
import Presentes from './pages/Presentes'
import Carrinho from './pages/Carrinho'
import Dashboard from './pages/admin/Dashboard'
import AdminPresentes from './pages/admin/AdminPresentes'
import AdminConfig from './pages/admin/AdminConfig'
import AdminPix from './pages/admin/AdminPix'
import AdminContas from './pages/admin/AdminContas'

function ProtectedRoute({ children }) {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <Navigate to="/home" replace />
  return children
}

function GuestLayout({ config }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0">
        <Header config={config} />
        <main className="flex-1">
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/presentes" element={<Presentes />} />
            <Route path="/carrinho" element={<Carrinho />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function AdminLayout({ config }) {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  if (!isAdminRoute) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0">
          <Header config={config} />
          <main className="flex-1">
            <Routes>
              <Route path="/home" element={<Home />} />
              <Route path="/presentes" element={<Presentes />} />
              <Route path="/carrinho" element={<Carrinho />} />
              <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0">
        <Header config={config} />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/presentes" element={<ProtectedRoute><AdminPresentes /></ProtectedRoute>} />
            <Route path="/admin/config" element={<ProtectedRoute><AdminConfig /></ProtectedRoute>} />
            <Route path="/admin/pix" element={<ProtectedRoute><AdminPix /></ProtectedRoute>} />
            <Route path="/admin/contas" element={<ProtectedRoute><AdminContas /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const { isAdmin } = useAuth()
  const [config, setConfig] = useState(null)
  const location = useLocation()

  useEffect(() => {
    api.get('/config').then(r => setConfig(r.data)).catch(() => {})
  }, [])

  if (location.pathname === '/') return (
    <Routes>
      <Route path="/" element={<Landing />} />
    </Routes>
  )

  if (isAdmin) return <AdminLayout config={config} />
  return <GuestLayout config={config} />
}
