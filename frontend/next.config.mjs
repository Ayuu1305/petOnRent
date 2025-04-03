/** @type {import('next').NextConfig} */
const nextConfig = {
 
  reactStrictMode: true,
  env: {
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  },
};

export default nextConfig;
