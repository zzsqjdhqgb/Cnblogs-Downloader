const path = require('path');
const fs = require('fs');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

const TemperMonkeyHeader = fs.readFileSync('./src/temperMonkeyHeader.js', 'utf-8');

module.exports = {
    entry: './src/main.js',
    mode: "production",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        iife: true,
    },
    // mode: "development",
    optimization: {
        avoidEntryIife: false,
        minimizer: [
            new TerserPlugin({
                include: []
            })
        ]
    },
    plugins: [
        new webpack.BannerPlugin({
            banner: TemperMonkeyHeader,
            raw: true,
            entryOnly: true
        })
    ],
};