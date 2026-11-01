import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Fotos das espécies vêm do iNaturalist (importadas por back/: npm run import:inaturalist).
    // Só o caminho das fotos, sem query string: qualquer outro endereço responde 400.
    remotePatterns: [
      { protocol: "https", hostname: "inaturalist-open-data.s3.amazonaws.com", pathname: "/photos/**", search: "" },
      { protocol: "https", hostname: "static.inaturalist.org", pathname: "/photos/**", search: "" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
