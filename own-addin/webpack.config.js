const devCerts = require("office-addin-dev-certs");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require('webpack');

module.exports = async (env, options)  => {
  const dev = options.mode === "development";
  let domain = "localhost:3000";
  if (env && env.DOMAIN) {
    domain = env.DOMAIN;
  }
  const config = {
    devtool: "source-map",
    entry: {
      vendor: [
        'react',
        'react-dom',
        'core-js',
        'office-ui-fabric-react'
      ],
    },
    resolve: {
      extensions: [".ts", ".tsx", ".html", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
              'react-hot-loader/webpack',
              'ts-loader'
          ],
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
          use: {
              loader: 'file-loader',
              query: {
                  name: 'assets/[name].[ext]'
              },
          },
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new CopyWebpackPlugin(
        {
          patterns: [
            {
              from: "./assets",
              to: "assets",
              globOptions: {
                ignore: ['*.scss'],
              },
            },
            {
              to: "manifest.xml",
              from: "./manifest.xml",
              transform(content) {
                return content
                    .toString()
                    .replace(/localhost:3000/g, domain);
              },
            },
            {
              to: "Launchevent.js",
              from: "./src/launchevent/Launchevent.js"
            },
          ]
        }
      ),
      new webpack.DefinePlugin({
        __DOMAIN__: JSON.stringify(domain)
      }),
      new ExtractTextPlugin('[name].[hash].css'),
      new HtmlWebpackPlugin({
        filename: "loader.html",
          template: './src/loader.html',
          chunks: ['taskpane', 'vendor', 'polyfills', 'loader']
      }),
      // new HtmlWebpackPlugin({
      //   filename: "dialog.html",
      //   template: "./src/taskpane/components/Login/dialog.html"
      // }),
      new webpack.ProvidePlugin({
        Promise: ["es6-promise", "Promise"]
      })
    ],
    devServer: {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "login, password, db"
      },
      https: (options.https !== undefined) ? options.https : await devCerts.getHttpsServerOptions(),
      port: process.env.npm_package_config_dev_server_port || 3000
    }
  };
  return config;
};
