/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/charlie-management",
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: "/charlie-management",
  },
};

export default nextConfig;
