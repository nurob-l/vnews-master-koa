const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  mode: isProd ? 'production' : 'development',
  devtool: isProd
    ? false
    : 'cheap-module-source-map',
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/dist/',
    filename: isProd ? '[name].[contenthash].js' : '[name].bundle.js'
  },
  resolve: {
    alias: {
      'public': path.resolve(__dirname, '../public')
    }
  },
  module: {
    // noParse: /es6-promise\.js$/, // avoid webpack shimming process
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.css$/i,
        use: [
          isProd
            // 分离提取CSS
            ? MiniCssExtractPlugin.loader
            // vue-style-loader会应用到普通的 `.css` 文件
            // 以及 `.vue` 文件中的 `<style>` 块
            : 'vue-style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.styl(us)?$/,
        use: [
          isProd
            // 分离提取CSS
            ? MiniCssExtractPlugin.loader
            // vue-style-loader会应用到普通的 `.css` 文件
            // 以及 `.vue` 文件中的 `<style>` 块
            : 'vue-style-loader',
          'css-loader',
          'stylus-loader'
        ]
      },
      // 它会应用到普通的 `.js` 文件
      // 以及 `.vue` 文件中的 `<script>` 块
      // 配置参考： https://webpack.js.org/loaders/babel-loader/
      //            https://www.webpackjs.com/loaders/babel-loader/
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader?cacheDirectory=true',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime']
          }
        }
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  performance: {
    maxEntrypointSize: 300000,
    hints: isProd ? 'warning' : false
  },
  plugins: [
    new VueLoaderPlugin(),
    ...(isProd
      ? [
          new MiniCssExtractPlugin({
            filename: 'style.css'
          })
        ]
      : []
    )
  ]
}
