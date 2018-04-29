const webpack = require('webpack')
const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const BUILD_DIR = path.resolve(__dirname, 'ui/public/dist')
const APP_DIR = path.resolve(__dirname, 'ui/app')
const SCSS_DIR = path.resolve(__dirname, 'ui/scss')
const SRC = path.resolve(__dirname, 'ui')

const envPlugin = new webpack.DefinePlugin({
  'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`
})

const prod = process.env.NODE_ENV === 'production'


const plugins = prod ?
  [
    // new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js','common.js'),
    // new webpack.optimize.DedupePlugin(),
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: { warnings: true }
      }
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.LimitChunkCountPlugin({maxChunks: 15}),
    new webpack.optimize.MinChunkSizePlugin({minChunkSize: 10000}),
    new webpack.optimize.AggressiveMergingPlugin(),
    // new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /fr/),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    envPlugin
  ]
  :
  []

const devtool = prod ? 'cheap-module-source-map' : 'inline-sourcemap'
const watch = !prod

const config = {
  context: path.join(__dirname, "src"),
  devtool: devtool,
  entry: APP_DIR + '/index.jsx',
  watch: watch,
  output: {
    path: BUILD_DIR,
    filename: "client.min.js"
  },

  module : {
    loaders : [
      {
        test: /\.(jpe?g|png|gif)$/i,   //to support eg. background-image property
        loader:"file-loader",
        query:{
          name:'[path][name].[ext]',
          outputPath: '../'
        }
      },{
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,    //to support @font-face rule
        loader: "url-loader",
        query:{
          limit:'10000',
          name:'[path][name].[ext]',
          outputPath: '../'
        }
      }, {
        test: /\.jsx?$/,
        include : APP_DIR,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'env', 'stage-0'],
          plugins: ['react-html-attrs', 'transform-decorators-legacy', 'transform-class-properties'],
        }
      },{
        test: /\.(scss|css)$/,
        loaders: ["style-loader","css-loader","sass-loader"]
      }
    ]
  },
  plugins: plugins
}

module.exports = config;
