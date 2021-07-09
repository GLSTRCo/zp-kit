import SliderControls from '@/js/components/slider-controls/slider-controls';
import Flickity from 'flickity';
import 'flickity/dist/flickity.min.css';

Flickity.prototype._createResizeClass = function () {
    this.element.classList.add('flickity-resize');
};

Flickity.createMethods.push('_createResizeClass');

var resize = Flickity.prototype.resize;
Flickity.prototype.resize = function () {
    this.element.classList.remove('flickity-resize');
    resize.call(this);
    this.element.classList.add('flickity-resize');
};


export default function () {
    const baseSlider = document.querySelector('.base-slider');
    if (!baseSlider) return;

    const sliderNode = baseSlider.querySelector('.base-slider__slides');
    const slider = new Flickity(sliderNode, {
        wrapAround: true,
        prevNextButtons: false,
        pageDots: false,
        imagesLoaded: true,
        cellAlign: 'left',
    });

    // const firstImage = sliderNode.querySelector('img.lazy-img');
    // if (firstImage) {
    //     firstImage.onload = () => {
    //         slider.resize();
    //     };
    // }

    new SliderControls(slider, baseSlider);

    return slider;
}
