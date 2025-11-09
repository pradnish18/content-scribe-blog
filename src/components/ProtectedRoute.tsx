import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('adminAuth') === 'true';

  useEffect(() => {
    // Check token expiration if available
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          // Token expired
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminAuth');
        }
      } catch (e) {
        // Invalid token
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminAuth');
      }
    }
  }, []);

  if (!isAuthenticated) {
    // Redirect to login page with return path
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;