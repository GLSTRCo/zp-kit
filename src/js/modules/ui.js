/**
 * @type {Number}
 * cached value of scroll bar width
 */
let scrollBarWidth = null;

/**
 * @type {HTMLElement[]}
 * fixed elements to toggle padding on changing body overflow
 *
 * caching nodelist
 */
let fixedNodes;

/**
 * @description typedef for slideIn/slideOut functions
 * @typedef {Object} slideFunctionReturn
 * @property {Promise} slideFunctionReturn.promise
 * @property {Function} slideFunctionReturn.cancel - abort animation, reset no initial state immediately
 */

/**
 * @description
 * firstly checks if has cached value in this.scrollBarWidth =>
 * than calcs it if absent
 *
 * @returns {Number} width of scroll bar
 */
function getScrollbarWidth() {
    if (scrollBarWidth || scrollBarWidth === 0) return scrollBarWidth;

    /** copy from <https://htmldom.dev/calculate-the-size-of-scrollbar/> */
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    const inner = document.createElement('div');
    outer.appendChild(inner);
    document.body.appendChild(outer);
    scrollBarWidth = outer.offsetWidth - inner.offsetWidth;
    document.body.removeChild(outer);

    // scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    return scrollBarWidth;
}

/**
 * @description when setting overflow:hidden on body (i.e. on modal open)
 * it's better to compensate hidden scroll bar width with padding
 * sets padding-right for body and defined fixed nodes (position: fixed)
 * @param {('set'|'reset')} action
 */
function compensateScrollbarWidth(action, ...anotherBlocks) {
    const scrollBarWidth = getScrollbarWidth();

    if (!fixedNodes) {
        fixedNodes = [
            /** just an example */
            // document.querySelector('.main-header'),
            // document.querySelector('.main-header.fixed'),
        ];
    }

    if (action === 'set') {
        document.body.style.paddingRight = scrollBarWidth + 'px';

        [...fixedNodes, ...anotherBlocks].forEach(node => {
            if (node) node.style.paddingRight = scrollBarWidth + 'px';
        });
    } else if (action === 'reset') {
        document.body.style.paddingRight = null;

        [...fixedNodes, ...anotherBlocks].forEach(node => {
            if (node) node.style.paddingRight = null;
        });
    } else {
        console.warn(`unknown action: ${action}`);
    }
}

/**
 * @description
 * relies on window width.
 * should correspond to variables.scss media
 */
const deviceType = {
    mobileMedia: window.matchMedia('(max-width: 767px)'),
    get isMobile() {
        return this.mobileMedia.matches;
    },
    tabletMedia: window.matchMedia(
        '(min-width: 768px) and (max-width: 1023px)'
    ),
    get isTablet() {
        return this.tabletMedia.matches;
    },
    laptopMedia: window.matchMedia(
        '(min-width: 1024px) and (max-width: 1279px)'
    ),
    get isLaptop() {
        return this.laptopMedia.matches;
    },
    desktopMedia: window.matchMedia('(min-width: 1280px)'),
    get isDesktop() {
        return this.desktopMedia.matches;
    },
    /** additional properties */
    minimumLaptopMedia: window.matchMedia('(min-width: 1024px)'),
};

/**
 * @param {HTMLElement} el
 * @param {Object} props
 * @param {String} [props.display='block'] - display property
 * @param {Number} [props.speed = 160] - animation speed
 * @param {String} [props.toggleClass = ''] - classList to toggle on animation end
 * @returns {Promise}
 */
function fadeIn(el, { display = 'block', speed = 160, toggleClass = '' } = {}) {
    return new Promise(resolve => {
        /* no need to show again a visible element */
        if (!isHidden(el)) resolve();

        const animationSpeed = 16 / speed;
        el.style.opacity = '0';
        el.style.display = display;

        const fade = () => {
            let id;
            var val = parseFloat(el.style.opacity);
            if (!((val += animationSpeed) > 1)) {
                el.style.opacity = val.toString();
                id = requestAnimationFrame(fade);
            } else {
                el.style.opacity = '1';
                if (toggleClass) el.classList.toggle(toggleClass);
                resolve();
            }

            return id;
        };

        fade();
    });
}

/**
 * @param {HTMLElement} el
 * @param {Object} props
 * @param {Number} [props.speed = 160] - animation speed
 * @param {String} [props.toggleClass = ''] - classList to toggle on animation end
 * @returns {Promise}
 */
function fadeOut(el, { speed = 160, toggleClass = '' } = {}) {
    return new Promise(resolve => {
        /* no need to hide again an invisible element */
        if (isHidden(el)) resolve();

        const animationSpeed = 16 / speed;
        el.style.opacity = '1';

        const fade = () => {
            let id;
            const currentOpacity = parseFloat(el.style.opacity);
            const newOpacity = currentOpacity - animationSpeed;
            if (newOpacity < 0) {
                el.style.display = 'none';
                if (toggleClass) el.classList.toggle(toggleClass);
                resolve();
            } else {
                el.style.opacity = newOpacity.toString();
                id = requestAnimationFrame(fade);
            }

            return id;
        };

        fade();
    });
}

/**
 * @param {HTMLElement} el
 * @param {Object} props
 * @param {Number} [props.speed = 200] - animation speed
 * @param {String} [props.display='block'] - display property
 * @param {String} [props.toggleClass = ''] - classList to toggle on animation end
 */
function fadeToggle(
    el,
    { speed = 200, display = 'block', toggleClass = '' } = {}
) {
    if (isHidden(el)) {
        fadeIn(el, { speed, display, toggleClass });
    } else {
        fadeOut(el, { speed });
    }
}

/**
 * @param {HTMLElement} el
 * @param {Object} props
 * @param {String} [props.display='block'] - display property
 * @param {String|Array} [props.classList] - additional class (classes) to add
 */
function show(el, { display = 'block', classList = '' } = {}) {
    el.style.display = display;

    if (classList.length > 0) {
        if (typeof classList === 'string') el.classList.add(classList);
        else if (Array.isArray(classList))
            classList.forEach(val => el.classList.add(val));
    }
}

/**
 * @param {HTMLElement} el
 * @param {Object} props
 * @param {String|Array} [props.classList] - class (classes) to remove
 */
function hide(el, { classList = '' } = {}) {
    el.style.display = 'none';

    if (classList.length > 0) {
        if (typeof classList === 'string') el.classList.remove(classList);
        else if (Array.isArray(classList))
            classList.forEach(val => el.classList.remove(val));
    }
}

/**
 * @param {HTMLElement} el
 * @param {Object} props
 * @param {String} [props.display='block'] - display property
 * @param {String} [props.classList] - additional class to toggle
 */
function toggle(el, { display = 'block', classList = '' } = {}) {
    if (getComputedStyle(el).display === 'none') {
        el.style.display = display;
        if (classList.length > 0) el.classList.add(classList);
    } else {
        el.style.display = 'none';
        if (classList.length > 0) el.classList.remove(classList);
    }
}

/**
 * @param {HTMLElement} el
 * @param {Object} [props]
 * @param {Number} [props.speed = 120] - animation speed
 * @param {String} [props.display='block'] - display property
 *
 * @returns {slideFunctionReturn}
 */
function slideDown(el, { speed = 120, display = 'block' } = {}) {
    let resolve, reject, cancelled;

    const promise = new Promise((promiseResolve, promiseReject) => {
        resolve = promiseResolve;
        reject = promiseReject;

        let startHeight = 0;
        let startPaddingTop = 0;
        let startPaddingBottom = 0;

        const elStyles = window.getComputedStyle(el);
        const paddingTop = parseInt(elStyles.paddingTop);
        const paddingBottom = parseInt(elStyles.paddingBottom);

        el.style.height = startHeight + 'px';
        el.style.overflow = 'hidden';
        el.style.display = 'block';
        const height = el.scrollHeight;

        el.style.paddingTop = startPaddingTop.toString();
        el.style.paddingBottom = startPaddingBottom.toString();

        const heightAnimationSpeed = (height / speed) * 16;
        const paddingTopAnimationSpeed = (paddingTop / speed) * 16;
        const paddingBottomAnimationSpeed = (paddingBottom / speed) * 16;
        el.style.display = display;

        const slide = () => {
            let id;
            let newHeight = (startHeight += heightAnimationSpeed);
            let newPaddingTop = (startPaddingTop += paddingTopAnimationSpeed);
            let newPaddingBottom = (startPaddingBottom +=
                paddingBottomAnimationSpeed);
            el.style.height = newHeight + 'px';
            el.style.paddingTop = newPaddingTop + 'px';
            el.style.paddingBottom = newPaddingBottom + 'px';

            if (cancelled) {
                el.style.cssText = `display: none`;

                return;
            }

            if (newHeight > height) {
                el.style.cssText = `display: ${display}`;
                resolve();
            } else {
                requestAnimationFrame(slide);
            }

            return id;
        };

        slide();
    });

    return {
        promise,
        cancel: () => {
            cancelled = true;
            reject({ reason: 'cancelled' });
        },
    };
}

/**
 * @param {HTMLElement} el
 * @param {Object} [props]
 * @param {Number} [props.speed = 120] - animation speed
 *
 *
 * @returns {slideFunctionReturn}
 */
function slideUp(el, { speed = 120 } = {}) {
    let resolve, reject, cancelled;
    const promise = new Promise((promiseResolve, promiseReject) => {
        resolve = promiseResolve;
        reject = promiseReject;

        const elStyles = window.getComputedStyle(el);
        const height = el.offsetHeight;
        const paddingTop = parseInt(elStyles.paddingTop);
        const paddingBottom = parseInt(elStyles.paddingBottom);

        let startHeight = height;
        let startPaddingTop = paddingTop;
        let startPaddingBottom = paddingBottom;

        el.style.height = startHeight + 'px';
        el.style.overflow = 'hidden';

        const heightAnimationSpeed = (height / speed) * 16;
        const paddingTopAnimationSpeed = (paddingTop / speed) * 16;
        const paddingBottomAnimationSpeed = (paddingBottom / speed) * 16;

        const slide = () => {
            let id;
            let newHeight = (startHeight -= heightAnimationSpeed);
            let newPaddingTop = (startPaddingTop -= paddingTopAnimationSpeed);
            let newPaddingBottom = (startPaddingBottom -=
                paddingBottomAnimationSpeed);
            el.style.height = newHeight + 'px';
            el.style.paddingTop = newPaddingTop + 'px';
            el.style.paddingBottom = newPaddingBottom + 'px';

            if (cancelled) {
                el.style.cssText = '';

                return;
            }

            if (newHeight < 0) {
                el.style.cssText = `display: none`;
                resolve();
            } else {
                requestAnimationFrame(slide);
            }

            return id;
        };

        slide();
    });

    return {
        promise,
        cancel: () => {
            cancelled = true;
            reject({ reason: 'cancelled' });
        },
    };
}

/**
 * @param {HTMLElement} el
 * @param {Object} [props]
 * @param {Number} [props.speed = 120] - animation speed
 * @param {String} [props.display='block'] - display property
 */
function slideToggle(el, { speed = 120, display = 'block' } = {}) {
    if (isHidden(el)) {
        return slideDown(el, { speed: speed, display: display });
    } else {
        return slideUp(el, { speed: speed });
    }
}

/**
 * @param {HTMLElement} target - target element to scroll to
 * @param {Number} [offset = 100] - value for top offset
 */
function _scrollTo(target, offset = 100) {
    if (!target) {
        console.log('target: ', target);
        return;
    }
    const scrollPosition = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
        top: scrollPosition - offset,
        behavior: 'smooth',
    });
}

/**
 * @param {HTMLElement} target - target element to scroll to
 * @param {Number} [offset = 50] - value for top offset
 * @param {Number} [duration = 500] - animation speed in ms
 */
function scrollTo(target, offset = 100, duration = 500) {
    return new Promise(resolve => {
        function move(amount) {
            document.documentElement.scrollTop = amount;
            document.body.scrollTop = amount;
        }

        const scrollPosition = target.getBoundingClientRect().top - offset;

        const start = window.scrollY;
        const increment = 20;
        let currentTime = 0;

        const animateScroll = function () {
            // increment the time
            currentTime += increment;
            // find the value with the quadratic in-out easing function
            const value = easeInOutQuad(
                currentTime,
                start,
                scrollPosition,
                duration
            );
            // move the document.body
            move(value);
            // do the animation unless its over
            if (currentTime < duration) {
                requestAnimationFrame(animateScroll);
            } else {
                const scrollPosition =
                    target.getBoundingClientRect().top - offset;
                if (scrollPosition < 0) {
                    scrollTo(target, offset, duration);
                } else {
                    resolve();
                }
            }
        };
        animateScroll();
    });
}

/**
 * @param {HTMLElement} el
 * @returns {Boolean} true if el is hidden via display: none
 */
function isHidden(el) {
    let style = window.getComputedStyle(el);
    return style.display === 'none';
}

/**
 *
 * @param {Number} time delay in ms
 * @returns {Promise}
 */
function delay(time) {
    return new Promise(res => {
        setTimeout(res, time);
    });
}

function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) {
        return (c / 2) * t * t + b;
    }
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
}

export {
    hide,
    show,
    isHidden,
    toggle,
    fadeIn,
    fadeOut,
    fadeToggle,
    slideDown,
    slideUp,
    slideToggle,
    scrollTo,
    getScrollbarWidth,
    deviceType,
    delay,
    compensateScrollbarWidth,
};
