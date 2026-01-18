import { memo, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { useModuleStore } from "@/store/moduleStore";
import { NameModal } from "./NameModal";
import { LogOut } from "lucide-react";

const MainLayout = () => {
  const userName = useUserStore((state) => state.userName);
  const resetUser = useUserStore((state) => state.resetUser);
  const setOpenNameModal = useUserStore((state) => state.setOpenNameModal);
  const clearResults = useModuleStore((state) => state.clearResults);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const navigate = useNavigate();

  const handleLogout = () => {
    // Reset user store (clears persisted session-storage entry as well)
    resetUser();

    // Clear module progress
    clearResults();

    // Clear session storage keys (redundant but explicit)
    sessionStorage.removeItem('user-storage');
    sessionStorage.removeItem('module-storage');

    // Return to main page
    // Open Name modal so user can choose continue or reset
    setOpenNameModal(true);
    navigate('/');
  };
  
  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    setOpenNameModal(true);
    navigate('/');
  };

  const adminToken = localStorage.getItem('adminToken');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-xs font-bold text-white shadow-lg shadow-indigo-200">
              PDPR
            </div>

            <div className="flex flex-col justify-center">
              <h1 className="text-sm font-bold leading-tight text-slate-900 md:text-base">
                Kasbiy kompetensiyalar platformasi
              </h1>
              <p className="text-xs font-medium text-slate-500">
                Modullar va amaliy topshiriqlar to'plami
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-4">
            {userName && (
              <>
                <span className="text-sm font-medium text-slate-600 hidden sm:inline">
                  {userName}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Chiqish"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Chiqish</span>
                </button>
              </>
            )}
            
            {!userName && adminToken && (
              <>
                 <span className="text-sm font-bold text-indigo-600 hidden sm:inline">
                  Administrator
                </span>
                <Link
                  to="/admin"
                   className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  Panel
                </Link>
                <button
                  onClick={handleAdminLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Chiqish"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Chiqish</span>
                </button>
              </>
            )}

            {!userName && !adminToken && (
              <button
                onClick={() => setOpenNameModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                Kirish
              </button>
            )}
            <Link
              to="/"
              className="group relative text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600">
              Modullar
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <NameModal />
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default memo(MainLayout);
