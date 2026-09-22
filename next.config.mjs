/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fully static site: Cloudflare Pages serves the exported `out/` folder
  // as a static site (no functions / SSR needed for this content hub).
  output: "export",
};

export default nextConfig;
