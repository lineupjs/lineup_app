/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */

const resolve = require('path').resolve;
const pkg = require('./package.json');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

const now = new Date();
const prefix = (n) => (n < 10 ? '0' + n : n.toString());
const buildId = `${now.getUTCFullYear()}${prefix(now.getUTCMonth() + 1)}${prefix(now.getUTCDate())}-${prefix(
  now.getUTCHours()
)}${prefix(now.getUTCMinutes())}${prefix(now.getUTCSeconds())}`;

const year = new Date().getFullYear();
const banner =
  `/*! ${pkg.title || pkg.name} - v${pkg.version} - ${year}\n` +
  (pkg.homepage ? `* ${pkg.homepage}\n` : '') +
  `* Copyright (c) ${year} ${pkg.author.name}; Licensed ${pkg.license} */\n`;

/**
 * generate a webpack configuration
 */
module.exports = (_env, options) => {
  const dev = options.mode.startsWith('d');
  return {
    node: false,
    entry: {
      app: './src/index.ts',
    },
    output: {
      path: resolve(__dirname, 'build'),
      filename: `[name].js`,
      chunkFilename: '[chunkhash].js',
      publicPath: '', //no public path = relative
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.mjs', '.js'],
      symlinks: false,
    },
    plugins: [
      //define magic constants that are replaced
      new webpack.DefinePlugin({
        __DEBUG__: dev,
        __VERSION__: JSON.stringify(pkg.version),
        __LICENSE__: JSON.stringify(pkg.license),
        __BUILD_ID__: JSON.stringify(buildId),
      }),
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: '[name].css',
        chunkFilename: '[id].css',
      }),
      new ForkTsCheckerWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: './src/index.html',
        inject: 'body',
      }),
    ].concat(
      dev
        ? [
            // dev plugins
          ]
        : [
            // production plugins
            new webpack.BannerPlugin({
              banner: banner,
              raw: true,
            }),
            new WorkboxPlugin.GenerateSW({
              // these options encourage the ServiceWorkers to get in there fast
              // and not allow any straggling "old" SWs to hang around
              clientsClaim: true,
              skipWaiting: true,
            }),
          ]
    ),
    externals: {
      lineupjs: 'LineUpJS',
    },
    module: {
      rules: [
        {
          test: /\.s?css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'thread-loader',
              options: {
                // there should be 1 cpu for the fork-ts-checker-webpack-plugin
                workers: require('os').cpus().length - 1,
              },
            },
            {
              loader: 'ts-loader',
              options: {
                configFile: dev ? 'tsconfig.dev.json' : 'tsconfig.json',
                happyPackMode: true, // IMPORTANT! use happyPackMode mode to speed-up  compilation and reduce errors reported to webpack
              },
            },
          ].slice(process.env.CI || !dev ? 1 : 0), // no optimizations for CIs and in production mode
        },
        {
          test: /\.(png|jpg)$/,
          loader: 'url-loader',
          options: {
            limit: 20000, //inline <= 20kb
          },
        },
        {
          test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'url-loader',
          options: {
            limit: 20000, //inline <= 20kb
            mimetype: 'application/font-woff',
          },
        },
        {
          test: /\.svg(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'url-loader',
          options: {
            limit: 10000, //inline <= 10kb
            mimetype: 'image/svg+xml',
          },
        },
        {
          test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          type: 'asset/resource',
        },
        {
          test: /schema\.json$/,
          type: 'javascript/auto',
        },
      ],
    },
    watchOptions: {
      ignored: /node_modules/,
    },
    devServer: {
      static: 'demo',
    },
  };
};
