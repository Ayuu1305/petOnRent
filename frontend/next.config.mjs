/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Enable API routes
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
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
