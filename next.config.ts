import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["@libsql/sqlite3", "sqlite3"],
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@libsql/sqlite3', 'sqlite3');
    }
    return config;
  }
};

export default nextConfig;
