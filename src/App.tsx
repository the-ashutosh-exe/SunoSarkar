import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useSettingsStore } from './store/useSettingsStore';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { Spinner } from './components/ui/Spinner';
import { ToastProvider } from './components/ui/Toast';
import { ThemeOnboardingModal } from './components/features/ThemeOnboardingModal';

const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const ReportIssue = lazy(() => import('./pages/ReportIssue').then(m => ({ default: m.ReportIssue })));
const InteractiveMap = lazy(() => import('./pages/InteractiveMap').then(m => ({ default: m.InteractiveMap })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const JoinSquad = lazy(() => import('./pages/JoinSquad').then(m => ({ default: m.JoinSquad })));
const Squads = lazy(() => import('./pages/Squads').then(m => ({ default: m.Squads })));

function App() {
  const { initialize } = useAuthStore();
  const { themeMode } = useSettingsStore();

  useEffect(() => {
    const unsubscribe = initialize();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [initialize]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  const pageLoader = (
    <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center space-y-4">
      <Spinner className="w-12 h-12 text-[#F4B400]" />
      <p className="text-sm font-bold text-white tracking-wider animate-pulse">OPTIMIZING MUNICIPAL INTELLIGENCE...</p>
    </div>
  );

  return (
    <BrowserRouter>
      <ToastProvider>
        <ThemeOnboardingModal />
        <Suspense fallback={pageLoader}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/join" element={<JoinSquad />} />
            
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/report" element={<ReportIssue />} />
                <Route path="/map" element={<InteractiveMap />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/squads" element={<Squads />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
