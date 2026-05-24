import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

// Validación de variables de entorno en tiempo de build
const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar] && process.env.NODE_ENV === "production") {
    throw new Error(`Falta la variable de entorno obligatoria: ${envVar}`);
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Cabeceras de seguridad
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
