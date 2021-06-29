const isDev = process.env.NODE_ENV === 'development';

module.exports = {
    plugins: {
        'postcss-import': {},
        'postcss-preset-env': {
            browsers: 'last 2 versions',
            stage: 0,
        },
        cssnano: !isDev
    },
};
