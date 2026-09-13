import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fotos de licença rastreável vêm do Wikimedia Commons (guia.md §9).
    // A API devolve originais em `upload` e miniaturas em `thumb`.
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org", pathname: "/wikipedia/commons/**" },
      { protocol: "https", hostname: "thumb.wikimedia.org", pathname: "/wikipedia/commons/**" },
    ],
  },
};

export default nextConfig;
