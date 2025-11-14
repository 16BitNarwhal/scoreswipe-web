import { createSecureHeaders } from "next-secure-headers";

const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
  headers: async () => {
    const headers = createSecureHeaders();
    return [
      {
        source: "/(.*)",
        headers,
      },
    ];
  },
};

export default nextConfig;
