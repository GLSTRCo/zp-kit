export const debounce = function (func, wait, immediate) {
    let timeout;
    return function () {
        const context = this,
            args = arguments;
        const later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

export const throttle = function (func, wait, options) {
    let context, args, result;
    let timeout = null;
    let previous = 0;
    if (!options) options = {};
    const later = function () {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
    };
    return function () {
        const now = Date.now();
        if (!previous && options.leading === false) previous = now;
        const remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
};

export const setCookie = function (key, value, expiry) {
    const expires = new Date();
    expires.setTime(expires.getTime() + expiry * 24 * 60 * 60 * 1000);
    document.cookie =
        key + '=' + value + '; path=/ ;expires=' + expires.toUTCString();
};

/**
 *
 *
 * @export
 * @param {[HTMLImageElement]} imagesNodes
 * @param {*} [opts={}]
 */
export function lazyLoadImages(imagesNodes, opts = {}) {
    const options = {
        rootMargin: opts.rootMargin || '100% 0% 100% 0%',
        root: opts.root || null,
        threshold: opts.threshold || 0,
    };
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(
                    /** @param {IntersectionObserverEntry & {target: HTMLImageElement}} entry */
                    entry => {
                        if (entry.isIntersecting) {
                            const image = entry.target;
                            const src = image.getAttribute('data-src');
                            if (!src) return;

                            image.addEventListener('load', () => {
                                image.classList.add('loaded');
                                observer.unobserve(entry.target);
                            });
                            image.src = src;
                        }
                    }
                );
            },
            {
                rootMargin: options.rootMargin,
                root: options.root,
                threshold: options.threshold,
            }
        );
        imagesNodes.forEach(image => observer.observe(image));
    } else {
        imagesNodes.forEach(image => {
            const src = image.getAttribute('data-src');
            if (!src) return;
            image.src = src;
            image.classList.add('loaded');
        });
    }
}

export function lazyLoadPictures(imagesContainers, opts = {}) {
    const options = {
        rootMargin: opts.rootMargin || '0px 0px 100% 0px',
        root: opts.root || null,
        threshold: opts.threshold || 0,
    };

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const imageContainer = entry.target;

                        /** @type {NodeListOf<HTMLImageElement>} */
                        const image =
                            imageContainer.querySelectorAll('img, source');
                        const imageTag = imageContainer.querySelector('img');

                        image.forEach(img => {
                            if (img.dataset && img.dataset.src) {
                                img.src = img.dataset.src;
                            }

                            if (img.dataset && img.dataset.srcset) {
                                img.srcset = img.dataset.srcset;
                            }
                        });

                        imageTag.addEventListener('load', e => {
                            imageTag.classList.add('loaded');
                            observer.unobserve(entry.target);
                        });
                    }
                });
            },
            {
                rootMargin: options.rootMargin,
                root: options.root,
                threshold: options.threshold,
            }
        );

        imagesContainers.forEach(container => observer.observe(container));
    } else {
        imagesContainers.forEach(container => {
            const image = container.querySelector('img');
            const source = container.querySelector('source');

            image.src = source.dataset.srcset;
        });
    }
}

/**
 *
 *
 * @export
 * @param {[HTMLImageElement]} imagesNodes
 */

export function forceImageLoad(imagesNodes) {
    imagesNodes.forEach(image => {
        const src = image.getAttribute('data-src');
        if (!src) return;

        image.addEventListener('load', () => {
            image.classList.add('loaded');
        });
        image.src = src;
    });
}

/**
 *
 *
 * @export
 * @param {HTMLElement} section section node to watch for
 * @param {Object} opts params for IntersectionObserver
 * @returns {Promise}
 */
export function watchSectionEnterViewport(section, opts = {}) {
    const options = {
        rootMargin: opts.rootMargin || '100% 0px 100% 0px',
        root: opts.root || null,
        threshold: opts.threshold || 0,
    };

    return new Promise(resolve => {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        observer.unobserve(section);

                        resolve();
                    }
                });
            }, options);
            observer.observe(section);
        } else {
            resolve();
        }
    });
}

export function triggerAnimation(items, opts = {}) {
    const options = {
        rootMargin: opts.rootMargin || '0px 0px -20% 0px',
        root: opts.root || null,
        threshold: opts.threshold || 0,
    };

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animated');

                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                rootMargin: options.rootMargin,
                root: options.root,
                threshold: options.threshold,
            }
        );
        items.forEach(item => observer.observe(item));
    } else {
        setTimeout(() => {
            items.forEach(item => {
                item.classList.add('animated');
            });
        }, 300);
    }
}

/**
 * Returns an array with arrays of the given size.
 *
 * @param {[]} arr  array to split
 * @param {number} chunk_size  Size of every group
 */
export function chunkArray(arr, chunk_size) {
    let index = 0;
    const arrayLength = arr.length;
    let tempArray = [];

    for (index = 0; index < arrayLength; index += chunk_size) {
        const chunk = arr.slice(index, index + chunk_size);
        tempArray.push(chunk);
    }

    return tempArray;
}

export function emptyDiv() {
    return document.createElement('div');
}

export function generateCustomDots(slider, parentNode, slideClass) {
    const slidesArray = [...parentNode.querySelectorAll(slideClass)];
    const sliderDots = parentNode.querySelector('.slider-dots');

    slidesArray.forEach((_, index) => {
        const dotButton = document.createElement('button');
        if (index === 0) dotButton.classList.add('is-selected');
        sliderDots.appendChild(dotButton);
    });

    const dotsArray = [...sliderDots.children];

    slider.on('select', function () {
        const previousSelectedDot = sliderDots.querySelector('.is-selected');
        const selectedDot = sliderDots.children[slider.selectedIndex];
        previousSelectedDot.classList.remove('is-selected');
        selectedDot.classList.add('is-selected');
    });

    sliderDots.addEventListener('click', function (e) {
        if (!e.target.matches('button')) {
            return;
        }
        const index = dotsArray.indexOf(e.target);
        slider.select(index);
    });
}

/**
 *
 * @param {Boolean} updateOnResize set listener on window resize to update values
 */
export function setCustomViewportUnits(updateOnResize = true) {
    /** prevent multiple initializations */
    const alreadyDifined =
        !!document.documentElement.style.getPropertyValue('--vh');
    if (alreadyDifined) return;

    let resizeTimeout;

    if (updateOnResize) {
        window.addEventListener('resize', resizeThrottler, false);

        function resizeThrottler() {
            // ignore resize events as long as an actualResizeHandler execution is in the queue
            if (!resizeTimeout) {
                resizeTimeout = setTimeout(function () {
                    resizeTimeout = null;
                    actualResizeHandler();
                }, 66);
            }
        }
    }

    function actualResizeHandler() {
        let vh = window.innerHeight * 0.01;
        let vw = document.documentElement.clientWidth * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        document.documentElement.style.setProperty('--vw', `${vw}px`);
    }

    actualResizeHandler();
}
