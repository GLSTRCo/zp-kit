import { hide, show } from '@/js/common/plugins';

export default class SliderContols {

    /**
     *Creates an instance of SliderContols.
     * @param {Flickity} slider
     * @param {HTMLElement} [parentNode=null]
     * @memberof SliderContols
     */
    constructor(slider, parentNode = null) {
        this.slider = slider;
        this.parentNode = parentNode || this.slider.element.parentNode;

        this.init();
    }

    init() {
        this.controls = this.parentNode.querySelector('.slider-controls');

        this.prevButton = this.controls.querySelector('.prev');
        this.nextButton = this.controls.querySelector('.next');

        this.prevButton.addEventListener('click', () => {
            this.slider.previous();
        });

        this.nextButton.addEventListener('click', () => {
            this.slider.next();
        });
    }

    disablePrev() {
        this.prevButton.disabled = true;
    }

    disableNext() {
        this.nextButton.disabled = true;
    }

    enablePrev() {
        this.prevButton.disabled = false;
    }

    enableNext() {
        this.nextButton.disabled = false;
    }

    hide() {
        hide(this.controls.parentNode);
    }

    show() {
        show(this.controls.parentNode);
    }

    toggle() {
        const slides = this.slider.getCellElements();
        const slidesWidth = slides.reduce((acc, slide) => {
            acc = acc + slide.getBoundingClientRect().width;
            return acc;
        }, 0);
        const viewportWidth = this.slider.viewport.getBoundingClientRect().width;
        if (slidesWidth <= viewportWidth) {
            this.slider.unbindDrag();
            this.hide();
        } else {
            this.show();
        }
    }
}
