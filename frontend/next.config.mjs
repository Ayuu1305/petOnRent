/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  // Disable server features for static export
  trailingSlash: true,
  // Indicate that the export should be treated as standalone
  distDir: "out",
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    // Use the public key from environment
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  },
  // Don't expose Razorpay keys in client bundle
  serverRuntimeConfig: {
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  },
  publicRuntimeConfig: {
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  },
};

export default nextConfig;
