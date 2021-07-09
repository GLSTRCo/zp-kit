import '@/scss/main.scss';

import '@/js/polyfills';

import baseSliderInit from '@/blocks/base-slider/base-slider';
import commonFormInit from '@/blocks/common-form/common-form';
import Modal from '@/js/plugins/Modal';
baseSliderInit()

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('js-loaded')
    Modal.listenTriggers()

    commonFormInit();
})