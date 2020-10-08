'use strict';

const path                    = require('path');

const utils                   = require('./roderic/utils');

const webpack                 = require('webpack');

const MiniCssExtractPlugin    = require('mini-css-extract-plugin');

const TerserPlugin            = require('terser-webpack-plugin');

const { CleanWebpackPlugin }  = require('clean-webpack-plugin');

const log                     = require('inspc');

const config                  = require('./config.js')(process.env.NODE_ENV);

require('colors');

utils.setup(config);

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  // I'm using mode 'prod..' setting DefinePlugin manually to get rid of evals from transpiled output
  // more info: https://webpack.js.org/guides/production/#specify-the-mode
  //            https://webpack.js.org/configuration/mode/#mode-production
  mode: 'production',

  entry: utils.entries(),
  output: { // https://webpack.js.org/configuration/output/#outputpath
    path: config.output,
    filename: "[name].bundle.js",
  },

  node: {
    // https://github.com/webpack/webpack/issues/1599
    __dirname: true,
    __filename: true
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            presets: [
              "@babel/preset-env",
              "@babel/preset-react",
            ],
          }
        }
      },
      {
        test: /\.s[ac]ss$/i,
        // include: [
        //   config.node_modules,
        //   // path.resolve(__dirname, 'path/to/imported/file/dir'),
        // ],
        use: [
          // // Creates `style` nodes from JS strings
          // 'style-loader', i will relay on MiniCssExtractPlugin
          MiniCssExtractPlugin.loader,
          // Translates CSS into CommonJS
          'css-loader', // https://webpack.js.org/loaders/css-loader/
          // Compiles Sass to CSS
          'sass-loader', // https://webpack.js.org/loaders/sass-loader/#root
        ],
      },
    ]
  },
  optimization: {
    minimize: isProd,
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  plugins: [
    // https://webpack.js.org/guides/production/
    // https://webpack.js.org/guides/output-management/#cleaning-up-the-dist-folder
    new CleanWebpackPlugin(),

    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: `[name].bundle.css`,
      // chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
    }), // https://webpack.js.org/plugins/mini-css-extract-plugin/#root
    new webpack.DefinePlugin({ // https://webpack.js.org/plugins/define-plugin/
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
  ],
  performance: {
    hints: false,
  }
};

console.log( ("\nbuild "+ (new Date()).toISOString().substring(0, 19).replace('T', ' ') + "\n").green );