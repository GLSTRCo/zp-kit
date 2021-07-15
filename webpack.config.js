const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const optimization = () => {
    const vendorsToExclude = []; // For example ['Inputmask', 'Dropzone'];
    const config = {
        splitChunks: {
            chunks(chunk) {
                return !vendorsToExclude.includes(chunk.name);
            },
            name: 'vendor',
        },
    };

    if (isProd) {
        config.minimizer = [new TerserPlugin(), new CssMinimizerPlugin()];
        config.minimize = true;
    }

    return config;
};

const jsLoaders = () => {
    const loaders = ['webpack-import-glob-loader'];

    if (isProd) {
        loaders.unshift('babel-loader');
    }

    return loaders;
};

const PAGES_DIR = path.resolve(__dirname + '/src/pug/pages/');
const PAGES = fs
    .readdirSync(PAGES_DIR)
    .filter(fileName => fileName.endsWith('.pug'));

const commonData = require('./src/data/data.js');
const plugins = [
    ...PAGES.map(page => {
        let pageData = {};
        try {
            pageData = require(`./src/data/pages/${page.replace(
                /\.pug/,
                '.js'
            )}`);
        } catch (e) {}

        const data = {
            ...commonData,
            ...pageData,
        };

        let pageName = page.split('.')[0];
        if (pageName !== 'index') pageName += '-page';

        return new HTMLWebpackPlugin({
            template: `${PAGES_DIR}/${page}`,
            filename: `./${pageName}.html`,
            inject: 'body',
            scriptLoading: 'blocking',
            templateParameters: data,
        });
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
        filename: 'assets/css/[name].css',
    }),
    new CopyPlugin({
        patterns: [
            {
                from: 'src/assets/images/svg/svg-sprite.svg',
                to: 'assets/images/',
            },
        ],
    }),
    // new BundleAnalyzerPlugin(),
];

if (isDev) {
    // only enable hot in development
    plugins.push(new webpack.HotModuleReplacementPlugin());
}

module.exports = {
    entry: '/src/js/index.js',
    output: {
        filename: 'assets/js/[name].bundle.js',
        // chunkFilename: 'assets/js/vendor.bundle.js',
        path: path.resolve(__dirname, './dist'),
    },
    target: 'web',
    devtool: isDev ? 'source-map' : false,
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    optimization: optimization(),
    plugins,
    devServer: {
        liveReload: true,
        hot: true,
        contentBase: path.resolve(__dirname, './'),
        publicPath: '/',
        injectHot: true,
        stats: 'errors-only',
        inline: true,
        watchContentBase: true,
        open: true,
        // host: '192.168.31.232', //-  ipconfig => ipv4
    },
    module: {
        rules: [
            {
                test: /\.html$/i,
                loader: 'html-loader',
            },
            {
                test: /\.pug$/,
                use: [
                    {
                        loader: 'pug-loader',
                        // options: {
                        //     pretty: true,
                        // },
                    },
                ],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: jsLoaders(),
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        // options: {
                        //     publicPath: path.resolve(__dirname, './'),
                        // },
                        /** dirty solution, otherwise got absolute paths in css on build */
                        options: {
                            publicPath: (resourcePath, context) => {
                                if (isDev) {
                                    return '/';
                                } else {
                                    return (
                                        path.relative(
                                            path.dirname(resourcePath),
                                            context
                                        ) + '//'
                                    );
                                }
                            },
                        },
                    },
                    // 'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            modules: {
                                compileType: 'icss',
                            },
                        },
                    },
                    'postcss-loader',
                    'sass-loader',
                    'webpack-import-glob-loader',
                ],
            },
            {
                test: /\.(png|jpg|jpeg|webp|aviff|svg)$/,
                type: 'asset/resource',
                generator: {
                    // filename: 'assets/images/[name][hash][ext]',
                    filename: 'assets/images/[contenthash][ext]',
                },
            },

            {
                test: /\.(woff|woff2)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/fonts/[name][ext]',
                },
            },
        ],
    },
};
