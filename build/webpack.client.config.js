const webpack = require('webpack')
const merge = require('webpack-merge')
const base = require('./webpack.base.config')
const SWPrecachePlugin = require('sw-precache-webpack-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const Category = require('../src/config/category');

const config = merge(base, {
  entry: './src/entry-client.js',
  resolve: {
    alias: {
      'create-api': './create-api-client.js'
    }
  },
  plugins: [
    // strip dev-only code in Vue source
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.VUE_ENV': '"client"'
    }),
    new VueSSRClientPlugin()
  ],
  
  optimization: {
    moduleIds: 'hashed', // 修复因module.id的修改而导致hash的变化
    runtimeChunk: 'single', // 将 webpack 的样板(boilerplate)和 manifest 提取出来
    splitChunks: { // 将第三方库(library)（例如 lodash 或 react）提取到单独的 vendor chunk 文件中
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        }
      }
    }
  }
})

if (process.env.NODE_ENV === 'production') {
  const categories = Category.map(category => category.title).join('|');
  const categoryUrlPattern = new RegExp('^/(' + categories + ')');
  config.plugins.push(
    // auto generate service worker
    new SWPrecachePlugin({
      cacheId: 'vue-juejin',
      filename: 'service-worker.js',
      minify: true,
      dontCacheBustUrlsMatching: /./,
      staticFileGlobsIgnorePatterns: [/\.map$/, /\.json$/],
      runtimeCaching: [
        {
          urlPattern: '/',
          handler: 'networkFirst'
        },
        {
          urlPattern: categoryUrlPattern,
          handler: 'networkFirst'
        }
      ]
    })
  )
}

module.exports = config
