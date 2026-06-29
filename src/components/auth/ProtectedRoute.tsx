import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export const ProtectedRoute = () => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
        <div className="absolute w-72 h-72 bg-green-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-full border-2 border-slate-800 border-t-green-500 animate-spin"></div>
          <div className="absolute w-12 h-12 bg-white rounded-full blur-md opacity-95 -z-10 shadow-[0_0_25px_#ffffff]"></div>
          <img src="/logo.png" alt="SunoSarkar Logo" className="absolute w-14 h-14 object-contain p-0 m-0 border-0 drop-shadow-md brightness-[1.35] animate-pulse" />
        </div>
        <h2 className="text-base font-bold font-heading tracking-tight text-slate-200">SunoSarkar<span className="text-green-400">.AI</span></h2>
        <p className="text-xs font-mono text-slate-500 mt-1 animate-pulse">Verifying Citizen Credentials & Telemetry...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
