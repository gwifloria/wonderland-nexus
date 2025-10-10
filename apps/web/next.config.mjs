const ip = process.env.NEXT_PUBLIC_DEPLOYMENT_URL ?? "http://localhost:8080";
import bundleAnalyzer from "@next/bundle-analyzer";

// Validate required environment variables for authentication
function validateRequiredEnvVars() {
  const requiredVars = ["GITHUB_ID", "GITHUB_SECRET", "NEXTAUTH_SECRET", "GITHUB_TOKEN"];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error(
      "❌ Missing required environment variables for authentication:"
    );
    missingVars.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.error("\n💡 Please set these environment variables in:");
    console.error("   - Local development: .env.local file");
    console.error(
      "   - Vercel deployment: Project settings > Environment Variables"
    );
    console.error("   - GitHub Actions: Repository secrets");

    if (missingVars.includes("NEXTAUTH_SECRET")) {
      console.error("\n🔐 For NEXTAUTH_SECRET, generate a random string:");
      console.error("   openssl rand -base64 32");
    }

    if (missingVars.includes("GITHUB_TOKEN")) {
      console.error("\n🔑 For GITHUB_TOKEN, create a Personal Access Token:");
      console.error("   https://github.com/settings/tokens");
      console.error("   Required scopes: repo (for private repos) or public_repo");
    }

    console.error(
      "\n🚫 Build failed to prevent deployment with missing auth credentials.\n"
    );

    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }

  console.log("✅ Authentication environment variables validated successfully");
}

// Run validation during build (skip for test environment)
if (process.env.NODE_ENV !== "test") {
  validateRequiredEnvVars();
}

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});
const nextConfig = {
  reactStrictMode: false,
  basePath: "",
  assetPrefix: undefined,
  env: {
    NEXT_PUBLIC_BUILD_TIME: new Date().toLocaleString("zh-CN", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
    NEXT_PUBLIC_COMMIT_ID: process.env.NEXT_PUBLIC_COMMIT_ID,
  },
  images: {
    formats: ["image/avif", "image/webp"], // AVIF优先(更小), WebP作为fallback
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)\\.(avif|webp|jpg|jpeg|png|ico|svg)$",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          { key: "Vary", value: "Accept" },
        ],
      },
      {
        source: "/(.*)\\.(js|css|woff|woff2)$",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async rewrites() {
    console.log("🚀 Rewrites configuration loaded");
    return [
      { source: "/floria-service/:path*", destination: `${ip}/:path*` },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
