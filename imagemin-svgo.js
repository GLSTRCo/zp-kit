const imagemin = require('imagemin');
const imageminSvgo = require('imagemin-svgo');
const rimraf = require('rimraf');

rimraf('src/assets/images/svg/clean-svg', () => {});


(async () => {
    await imagemin(['src/assets/images/svg/inline-svg/*.svg'], {
        destination: 'src/assets/images/svg/clean-svg',
        plugins: [
            imageminSvgo({
                plugins: [
                    { removeAttrs: { attrs: '(fill|stroke)' } },
                    { removeViewBox: false },
                    {
                        cleanupIDs: {
                            remove: true,
                            minify: true,
                            prefix: {
                                toString() {
                                    this.counter = this.counter || 0;
                                    return 'id' + this.counter++;
                                },
                            },
                            force: true,
                        },
                    },
                ],
                multipass: true,
            }),
        ],
    });
})();
