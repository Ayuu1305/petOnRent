/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export", // Required for static site generation
  images: {
    unoptimized: true, // Required for static site generation
  },
  env: {
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  },
  // Disable server-side features for static export
  trailingSlash: true,
};

export default nextConfig;
