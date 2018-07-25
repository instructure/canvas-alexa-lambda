"use strict";

const path = require("path");
const webpack = require("webpack");
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const ArchivePlugin = require("webpack-archive-plugin");

module.exports = {
  entry: "./src/index.js",
  target: "node",
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    // FIXME: we need to wait for a release on this guy to be able to uglify
    // because UglifyJSPlugin freaks out when it sees es6
    // new UglifyJSPlugin({
    //   compress: false,
    //   mangle: false,
    //   sourceMap: true,
    // }),
    new ArchivePlugin({
      output: process.env.buildPath || path.join(__dirname, "build/lambda"),
      format: "zip"
    })
  ],
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, "build"),
    filename: "index.js"
  }
};
