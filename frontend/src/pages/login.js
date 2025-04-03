import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AuthPage = ({ isSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, signup, user } = useAuth();

  useEffect(() => {
    // Redirect to home if already logged in
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = isSignup
        ? await signup(name, email, password)
        : await login(email, password);

      if (!result.success) {
        throw new Error(result.error);
      }
      // Successful auth will trigger the useEffect above and redirect
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // If user is logged in, don't render the form
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm backdrop-filter">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
            {isSignup ? "Create an Account" : "Welcome Back!"}
          </h2>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-500 rounded-lg text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            {isSignup && (
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none text-gray-900"
                  required
                />
              </div>
            )}

            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none text-gray-900"
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none text-gray-900"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              disabled={isLoading}
              className={`w-full bg-black text-white py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              type="submit"
            >
              {isLoading
                ? isSignup
                  ? "Creating Account..."
                  : "Logging in..."
                : isSignup
                ? "Sign Up"
                : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isSignup ? "Already signed up? " : "New user? "}
              <Link
                href={isSignup ? "/login" : "/signup"}
                className="text-blue-500 hover:text-blue-600 font-medium hover:underline transition-colors duration-200"
              >
                {isSignup ? "Login now" : "Create an account"}
              </Link>
            </p>
          </div>

          {!isSignup && (
            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Admin?{" "}
                <Link
                  href="/admin/login"
                  className="text-red-500 hover:text-red-600 font-semibold hover:underline transition-colors duration-200"
                >
                  Login here
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AuthWrapper() {
  const router = useRouter();
  const isSignup = router.pathname === "/signup";
  return <AuthPage isSignup={isSignup} />;
}
