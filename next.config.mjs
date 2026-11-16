/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['docusign-esign'],
  },
  // Mapa da demo (HTML estático em public/) acessível em /demo-map
  async rewrites() {
    return [{ source: '/demo-map', destination: '/demo-map.html' }]
  },
}

export default nextConfig
