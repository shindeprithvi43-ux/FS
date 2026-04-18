import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import LoginPage from './pages/LoginPage.jsx'
import LandingPage from './pages/LandingPage.jsx'

import DashboardPage from './pages/user/DashboardPage.jsx'
import AttendancePage from './pages/user/AttendancePage.jsx'
import PerformancePage from './pages/user/PerformancePage.jsx'
import SessionsPage from './pages/user/SessionsPage.jsx'
import AnnouncementsPage from './pages/user/AnnouncementsPage.jsx'
import MatchesPage from './pages/user/MatchesPage.jsx'

import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminPlayersPage from './pages/admin/AdminPlayersPage.jsx'
import AdminBatchesPage from './pages/admin/AdminBatchesPage.jsx'
import AdminAttendancePage from './pages/admin/AdminAttendancePage.jsx'
import AdminPerformancePage from './pages/admin/AdminPerformancePage.jsx'
import AdminSessionsPage from './pages/admin/AdminSessionsPage.jsx'
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage.jsx'
import AdminMatchesPage from './pages/admin/AdminMatchesPage.jsx'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/user/dashboard" element={
            <ProtectedRoute role="player"><DashboardPage /></ProtectedRoute>
          } />
          <Route path="/user/attendance" element={
            <ProtectedRoute role="player"><AttendancePage /></ProtectedRoute>
          } />
          <Route path="/user/performance" element={
            <ProtectedRoute role="player"><PerformancePage /></ProtectedRoute>
          } />
          <Route path="/user/sessions" element={
            <ProtectedRoute role="player"><SessionsPage /></ProtectedRoute>
          } />
          <Route path="/user/announcements" element={
            <ProtectedRoute role="player"><AnnouncementsPage /></ProtectedRoute>
          } />
          <Route path="/user/matches" element={
            <ProtectedRoute role="player"><MatchesPage /></ProtectedRoute>
          } />

          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/players" element={
            <ProtectedRoute role="admin"><AdminPlayersPage /></ProtectedRoute>
          } />
          <Route path="/admin/batches" element={
            <ProtectedRoute role="admin"><AdminBatchesPage /></ProtectedRoute>
          } />
          <Route path="/admin/attendance" element={
            <ProtectedRoute role="admin"><AdminAttendancePage /></ProtectedRoute>
          } />
          <Route path="/admin/performance" element={
            <ProtectedRoute role="admin"><AdminPerformancePage /></ProtectedRoute>
          } />
          <Route path="/admin/sessions" element={
            <ProtectedRoute role="admin"><AdminSessionsPage /></ProtectedRoute>
          } />
          <Route path="/admin/announcements" element={
            <ProtectedRoute role="admin"><AdminAnnouncementsPage /></ProtectedRoute>
          } />
          <Route path="/admin/matches" element={
            <ProtectedRoute role="admin"><AdminMatchesPage /></ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
