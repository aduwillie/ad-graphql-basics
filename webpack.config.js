const path = require('path');

module.exports = {
    entry: {
        'angular-app': './src/frontend/angularjs/index.js',
    },
    output: {
        path: path.resolve(__dirname, 'src/backend/server/public'),
        filename: '[name].min.js',
    },
    devtool: 'source-map',
    mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                '@babel/preset-env'
                            ],
                        },
                    },
                ],
            },
            {
                test: /\.(html)$/,
                use: [
                    {
                        loader: 'html-loader',
                    },
                ],
            },
        ],
    },
};
