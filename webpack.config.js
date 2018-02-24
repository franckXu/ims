const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = env => {
    const isProd = env.production ? true : false;
    return {
        devtool: isProd ? 'source-map' : 'eval',
        entry: {
            'babel-polyfill' : 'babel-polyfill',
            'index': './src/index.js'
        },
        output: {
            filename: '[name].bundle.js',
            path: path.resolve(__dirname, 'dist')
        },
        module: {
            rules: [{
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            }, {
                test: /\.html$/,
                exclude: /node_modules/,
                loader: "raw-loader"
            }, {
                test: /\.(less|css)$/,
                use: [{
                    loader: "style-loader"
                }, {
                    loader: "css-loader"
                }, {
                    loader: "less-loader"
                }]
            }]
        },
        resolve: {
            modules: ['node_modules', 'src/common'],
            extensions: ['.js', '.json', '.less', '.html'],
        },
        plugins: (function() {
            const ret = [
                new HtmlWebpackPlugin({
                    title: 'IMS综合监控',
                    filename: 'index.html',
                    template: '!!ejs-loader!src/index.html'
                }),
                new webpack.ProvidePlugin({
                    $: 'jquery',
                    jQuery: 'jquery',
                    Backbone: 'backbone',
                    _: 'underscore'
                }),
                new CopyWebpackPlugin([{
                    from: 'vendor/',
                    to: 'vendor/'
                }, {
                    from: 'WEB-INF/',
                    to: 'WEB-INF/'
                },, {
                    from: 'META-INF/',
                    to: 'META-INF/'
                }, {
                    from: 'assets/',
                    to: 'assets/'
                }]),
                new webpack.DefinePlugin({
                    'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
                    'isProd': JSON.stringify(isProd)
                })
            ]

            if (isProd) {
                ret.push(
                    new UglifyJSPlugin({
                        sourceMap: true
                    })
                )
            }

            return ret;
        })()
    }
}
