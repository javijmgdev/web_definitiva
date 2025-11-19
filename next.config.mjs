/** @type {import('next').NextConfig} */
const nextConfig = {
  // Export estático (GitHub Pages / hosting estático)
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },

  // Mantén esto solo si realmente sirves desde /web_definitiva (ej: GitHub Pages)
  basePath: '/web_definitiva',
  assetPrefix: '/web_definitiva/',

  // Optimizaciones generales
  compress: true,
  reactStrictMode: true,

  // Turbopack: bloque vacío para evitar el warning de root/config
  // Si más adelante quieres añadir reglas: https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack
  turbopack: {
    // optimizeCss: true,   // (opcional futuro)
    // rules: [],           // (opcional futuro)
  },

  // NOTA:
  // Se elimina la función webpack para evitar el conflicto con Turbopack.
  // Si necesitas ese comportamiento (alias + splitChunks), usa:
  //   1) next build --webpack
  //   2) Añade de nuevo el bloque webpack y elimina turbopack
};

export default nextConfig;