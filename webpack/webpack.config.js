'use strict';

const path                  = require('path');

const utils                 = require('./roderic/utils');

const webpack               = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const log                   = require('inspc');

const config                = require(path.resolve(__dirname, 'config.js'))(process.env.NODE_ENV);

require('colors');

utils.setup(config);

log.dump({
  'process.env.NODE_ENV': process.env.NODE_ENV
})

module.exports = {
  mode: 'production',
  entry: utils.entries(),
  module: {
    rules: [
      {
        test: /\.jsx$/,
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
    minimize: process.env.NODE_ENV === 'production',
  },
  plugins: [
    new MiniCssExtractPlugin(), // https://webpack.js.org/plugins/mini-css-extract-plugin/#root
    new webpack.DefinePlugin({ // https://webpack.js.org/plugins/define-plugin/
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
  ],
  performance: {
    hints: false,
  }
};

console.log( ("\nbuild "+ (new Date()).toISOString().substring(0, 19).replace('T', ' ') + "\n").green );