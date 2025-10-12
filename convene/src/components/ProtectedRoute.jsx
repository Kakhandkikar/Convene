import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking, true = authenticated, false = not authenticated
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      // First check localStorage for quick access
      const localAuth = localStorage.getItem("isAuthenticated");
      const localUser = localStorage.getItem("user");
      
      if (localAuth === "true" && localUser) {
        // Verify with backend
        const response = await fetch("http://localhost:5000/api/auth/me", {
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setIsAuthenticated(true);
            setUser(data.user);
            // Update localStorage with fresh data
            localStorage.setItem("user", JSON.stringify(data.user));
            return;
          }
        }
      }
      
      // If we get here, user is not authenticated
      setIsAuthenticated(false);
      // Clear any stale localStorage data
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Authentication check failed:", error);
      setIsAuthenticated(false);
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("user");
    }
  };

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (isAuthenticated === false) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected component
  return children;
}





