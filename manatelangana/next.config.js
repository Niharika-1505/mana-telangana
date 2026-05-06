const path = require('path')
const nextConfig = {
  images: { domains: ['res.cloudinary.com'] },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src')
    return config
  },
}
module.exports = nextConfig
