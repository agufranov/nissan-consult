const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: './src/web/index.tsx',
    output: {
        filename: 'bundle.js'
    },
    mode: 'development',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx']
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/web/index.html'
        })
    ]
}