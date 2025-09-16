import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import useDarkMode from "../hooks/useDarkMode";
import { Sun, Moon } from "lucide-react";
import GoogleLoginButton from "../components/GoogleLoginButton";

export default function AuthPage() {
  const { theme, toggle } = useDarkMode();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  // Check for authentication success from Google OAuth
  useEffect(() => {
    const authStatus = searchParams.get("auth");
    const error = searchParams.get("error");
    
    if (authStatus === "success") {
      // Google OAuth was successful, check user status
      checkAuthStatus();
    } else if (error) {
      // Handle OAuth errors
      if (error === "google_auth_failed") {
        alert("Google authentication failed. Please try again.");
      } else if (error === "server_error") {
        alert("Server error occurred. Please try again later.");
      }
    }
  }, [searchParams]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/me", {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Store user data in localStorage for compatibility
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("user", JSON.stringify(data.user));
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    // Redirect to backend Google OAuth endpoint
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password || (!isLogin && !fullName)) {
      alert("Please fill all required fields.");
      return;
    }

    // Fake auth logic
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user", JSON.stringify({ email, fullName }));

    navigate("/dashboard");
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-6 py-16">
      {/* background blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <svg className="absolute -top-24 -left-24 blur-3xl opacity-40" width="500" height="500" viewBox="0 0 500 500" fill="none">
          <defs>
            <linearGradient id="authg" x1="0" x2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <circle cx="250" cy="250" r="220" fill="url(#authg)" />
        </svg>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/convene-logo.svg" alt="Convene Logo" className="w-8 h-8" />
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">Convene</h1>
          </div>
          <button onClick={toggle} className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />}
          </button>
        </div>

        <div className="rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 backdrop-blur p-6">
          <div className="flex items-center gap-2 mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                isLogin ? "text-indigo-600" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              Login
              {isLogin && (
                <motion.span layoutId="authTab" className="absolute left-0 right-0 -bottom-1 h-0.5 bg-gradient-to-r from-indigo-600 to-pink-500" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                !isLogin ? "text-indigo-600" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              Signup
              {!isLogin && (
                <motion.span layoutId="authTab" className="absolute left-0 right-0 -bottom-1 h-0.5 bg-gradient-to-r from-indigo-600 to-pink-500" />
              )}
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Google Login Button */}
            <GoogleLoginButton 
              onClick={handleGoogleLogin} 
              loading={googleLoading} 
            />
            
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                  or continue with email
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Full name</label>
                <input
                  type="text"
                  placeholder="Ada Lovelace"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full inline-flex justify-center items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-pink-500 text-white font-medium px-4 py-2 shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-300/40 dark:focus:ring-indigo-700/40"
            >
              {isLogin ? "Login" : "Create account"}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
          </form>
        </div>
      </motion.section>
    </main>
  );
}
