/** @type {import('next').NextConfig} */
const nextConfig = {
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
  basePath: '/web_definitiva',
  assetPrefix: '/web_definitiva/',
  
  // NUEVAS OPTIMIZACIONES
  compress: true,
  swcMinify: true,
  reactStrictMode: true,
  
  webpack: (config, { isServer }) => {
    // Optimizar three.js
    config.resolve.alias = {
      ...config.resolve.alias,
      'three': 'three/build/three.module.js',
    };
    
    // Code splitting mejorado
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          three: {
            test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
            name: 'three',
            priority: 10,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            priority: 5,
          },
        },
      };
    }
    
    return config;
  },
}

export default nextConfig