/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações para PWA
  // Nota: Headers de segurança agora são aplicados via middleware (src/middleware.ts)
  // Mantendo apenas headers específicos de arquivos estáticos
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
