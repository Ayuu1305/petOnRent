import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Chatbot from "./Chatbot";
import { useRouter } from "next/router";

const Layout = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      setIsAuthenticated(!!token && !!userId);
      setIsLoading(false);

      // List of routes that don't require authentication
      const publicRoutes = ["/login", "/signup", "/forgot-password"];
      const isPublicRoute = publicRoutes.includes(router.pathname);

      // If user is not authenticated and not on a public route, redirect to login
      if (!token && !userId && !isPublicRoute) {
        router.push("/login");
      }
    };

    checkAuth();
    // Add event listener for storage changes
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, [router.pathname]);

  // Don't render anything while checking authentication
  if (isLoading) {
    return null;
  }

  // List of routes that should never show navbar
  const publicRoutes = ["/login", "/signup", "/forgot-password"];
  const isPublicRoute = publicRoutes.includes(router.pathname);
  const isAdminRoute = router.pathname.startsWith("/admin");

  // Only show navbar if:
  // 1. User is authenticated OR
  // 2. It's not a public route (login/signup) AND not an admin route
  const showNavbar = isAuthenticated || (!isPublicRoute && !isAdminRoute);

  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && <Navbar />}
      <main className="flex-grow">{children}</main>
      <Chatbot />
    </div>
  );
};

export default Layout;
