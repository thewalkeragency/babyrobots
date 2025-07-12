/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  // Handle module resolution for absolute imports
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Ensure environment variables are available
    config.plugins.push(
      new webpack.EnvironmentPlugin(['GEMINI_API_KEY'])
    );
    // Important: return the modified config
    return config
  },
}

module.exports = nextConfig
