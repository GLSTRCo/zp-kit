import { lazyLoadBackgrounds, lazyLoadImages, lazyLoadPictures } from '@/js/common/helpers';

const lazyImageNodes = document.querySelectorAll('.lazy-img');
lazyLoadImages(lazyImageNodes);

const lazyLoadPictureNodes = document.querySelectorAll('.lazy-picture');
lazyLoadPictures(lazyLoadPictureNodes);

const lazyBackroundNodes = document.querySelectorAll('.lazy-bg');
lazyLoadBackgrounds(lazyBackroundNodes);

