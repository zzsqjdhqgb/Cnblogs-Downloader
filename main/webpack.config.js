const path = require('path');
const fs = require('fs');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

const temperMonkeyHeaderFile = path.resolve(__dirname, './src/temperMonkeyHeader.js');
const DEBUGtemperMonkeyHeaderFile = path.resolve(__dirname, './src/DEBUGtemperMonkeyHeader.js');

// const TemperMonkeyHeader = fs.readFileSync(DEBUGtemperMonkeyHeaderFile, 'utf-8');
const TemperMonkeyHeader = fs.readFileSync(temperMonkeyHeaderFile, 'utf-8');

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