import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import DashboardLayout from './components/layout/DashboardLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PatientManagement from './pages/PatientManagement'
import Registrations from './pages/Registrations'
import QueueManagement from './pages/QueueManagement'
import DoctorExamination from './pages/DoctorExamination'
import MedicalHistory from './pages/MedicalHistory'

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes dengan Dashboard Layout */}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients" element={<PatientManagement />} />
          <Route path="/registrations" element={<Registrations />} />
          <Route path="/queues" element={<QueueManagement />} />
          <Route path="/examination" element={<DoctorExamination />} />
          <Route path="/medical-history" element={<MedicalHistory />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
