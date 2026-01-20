import  { useEffect, type JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import { toast } from 'sonner';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const userName = useUserStore((s) => s.userName);
  const isAdmin = !!localStorage.getItem('adminToken');

  useEffect(() => {
    if (!userName && !isAdmin) {
      toast('Iltimos, avvalo tizimga kiring');
    }
  }, [userName, isAdmin]);

  if (!userName && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
