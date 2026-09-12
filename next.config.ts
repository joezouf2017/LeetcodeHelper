import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 loads a native .node binary, which the bundler cannot
  // inline. Leaving it external makes the server `require` it at runtime.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
