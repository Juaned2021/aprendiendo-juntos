import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import LoadingSpinner from './components/LoadingSpinner';
import Toast from './components/Toast';
import './styles/global.css';
import './styles/tables.css';

// Lazy load admin pages
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Usuarios = lazy(() => import('./pages/admin/Usuarios'));
const Clases = lazy(() => import('./pages/admin/Clases'));
const Materias = lazy(() => import('./pages/admin/Materias'));
const AdminHorarios = lazy(() => import('./pages/admin/Horarios'));
const ObservacionesAdmin = lazy(() => import('./pages/admin/Observaciones'));
const AdminRecursos = lazy(() => import('./pages/admin/Recursos'));

// Lazy load profesor pages
const ProfesorDashboard = lazy(() => import('./pages/profesor/ProfesorDashboard'));
const ProfesorRecursosPage = lazy(() => import('./pages/profesor/ProfesorRecursosPage'));
const ProfesorTareasPage = lazy(() => import('./pages/profesor/ProfesorTareasPage'));
const ObservacionesProfesor = lazy(() => import('./pages/profesor/Observaciones'));
const ProfesorHorario = lazy(() => import('./pages/profesor/ProfesorHorario'));

// Lazy load alumno pages
const AlumnoDashboard = lazy(() => import('./pages/alumno/AlumnoDashboard'));
const AlumnoRecursos = lazy(() => import('./pages/alumno/AlumnoRecursos'));
const AlumnoHorario = lazy(() => import('./pages/alumno/AlumnoHorario'));
const AlumnoTareasPage = lazy(() => import('./pages/alumno/AlumnoTareasPage'));
const ObservacionesAlumno = lazy(() => import('./pages/alumno/Observaciones'));

function App() {
  return (
    <>
      <Toast />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Dashboard />
                </Suspense>
              }
            />
            <Route
              path="usuarios"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Usuarios />
                </Suspense>
              }
            />
            <Route
              path="clases"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Clases />
                </Suspense>
              }
            />
            <Route
              path="materias"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Materias />
                </Suspense>
              }
            />
            <Route
              path="horarios"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminHorarios />
                </Suspense>
              }
            />
            <Route
              path="observaciones"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ObservacionesAdmin />
                </Suspense>
              }
            />
            <Route
              path="recursos"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminRecursos />
                </Suspense>
              }
            />
          </Route>

          <Route
            path="/profesor"
            element={
              <ProtectedRoute allowedRoles={['profesor']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ProfesorDashboard />
                </Suspense>
              }
            />
            <Route
              path="horario"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ProfesorHorario />
                </Suspense>
              }
            />
            <Route
              path="recursos"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ProfesorRecursosPage />
                </Suspense>
              }
            />
            <Route
              path="tareas"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ProfesorTareasPage />
                </Suspense>
              }
            />
            <Route
              path="observaciones"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ObservacionesProfesor />
                </Suspense>
              }
            />
          </Route>

          <Route
            path="/alumno"
            element={
              <ProtectedRoute allowedRoles={['alumno']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AlumnoDashboard />
                </Suspense>
              }
            />
            <Route
              path="horario"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AlumnoHorario />
                </Suspense>
              }
            />
            <Route
              path="recursos"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AlumnoRecursos />
                </Suspense>
              }
            />
            <Route
              path="tareas"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AlumnoTareasPage />
                </Suspense>
              }
            />
            <Route
              path="observaciones"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ObservacionesAlumno />
                </Suspense>
              }
            />
          </Route>
          
          {/* Redirección eliminada, landing es la raíz */}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
