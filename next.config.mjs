/** @type {import('next').NextConfig} */
const nextConfig = {
  // Export estático (GitHub Pages / hosting estático)
  output: 'export',
  
  images: {
    // ✅ CRÍTICO: Con output:'export' DEBES tener unoptimized:true
    // Next.js Image optimization NO funciona en static export
    unoptimized: true,
    
    // ✅ Permite imágenes de Supabase y otros dominios
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**', // ✅ Permite cualquier dominio HTTPS (imgur, etc)
      },
    ],
  },

  // Base path para GitHub Pages (si sirves desde /web_definitiva)
  basePath: '/web_definitiva',
  assetPrefix: '/web_definitiva/',

  // Optimizaciones generales
  compress: true,
  reactStrictMode: true,

  // Turbopack config (Next.js 15+)
  turbopack: {},
};

export default nextConfig;