import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signup, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if already logged in
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signup(
        formData.name,
        formData.email,
        formData.password
      );
      if (!result.success) {
        throw new Error(result.error);
      }
      // Successful signup will trigger the useEffect above and redirect
    } catch (err) {
      setError(err.message || "Failed to create account");
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
            Create an Account
          </h2>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-500 rounded-lg text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none text-gray-900"
                required
              />
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none text-gray-900"
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
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
              type="submit"
              disabled={isLoading}
              className={`w-full bg-black text-white py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6">
            <p className="text-center text-gray-600">
              Already signed up?{" "}
              <Link
                href="/login"
                className="text-blue-500 hover:text-blue-600 font-medium inline-flex items-center hover:underline transition-colors duration-200"
              >
                Login now
                <span className="ml-1">→</span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
