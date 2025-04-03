import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { useRouter } from "next/router";
import Footer from "../components/Footer";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import Layout from "../components/Layout";

const inter = Inter({ subsets: ["latin"] });

// Add paths that require authentication
const protectedPaths = [
  "/checkout",
  "/profile",
  "/orders",
  "/", // Add home page to protected paths
  "/products",
  "/cart",
];

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith("/admin");
  const isProtectedRoute = protectedPaths.includes(router.pathname);
  const isPublicRoute = ["/login", "/signup", "/forgot-password"].includes(
    router.pathname
  );

  return (
    <AuthProvider>
      <CartProvider>
        <Layout>
          {isProtectedRoute ? (
            <ProtectedRoute>
              <Component {...pageProps} />
            </ProtectedRoute>
          ) : (
            <Component {...pageProps} />
          )}
          {!isAdminPage && !isPublicRoute && <Footer />}
        </Layout>
      </CartProvider>
    </AuthProvider>
  );
}
