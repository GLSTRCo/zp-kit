export { getData, postData, loadModal, loadYandexMap };

const BASE_URL = 'local/ajax'

/**
 *
 *
 * @param {String} url
 * @param {Object} options
 * @param {String} [options.method = post]
 * @param {Object} [options.headers]
 * @param {URLSearchParams | FormData} [options.body]
 * @returns {Promise}
 */
function postData(url, options) {
    const requestOptions = {
        method: 'POST',
        headers: options.headers || {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: options.body,
    };
    return fetch(BASE_URL + url, requestOptions).then(response => {
        return response.json();
        // if  (response.ok) {
        //     return response.json();
        // } else {
        //     window.location.reload()
        // }
    });
}

function getData(url, options) {
    return fetch(BASE_URL + url, options).then(
        response => {
            return response.json();
        },
        e => {}
    );
}

function loadModal(url) {
    return new Promise(resolve => {
        getData(url).then(data => {
            const modalHtml = data.html;
            document.body.insertAdjacentHTML('beforeend', modalHtml);

            resolve();
        });
    });
}

function loadYandexMap(url) {
    return new Promise(resolve => {
        if (window.yandexMapIsLoading) {
            setTimeout(() => resolve(loadYandexMap(url)), 1000);
        } else if (typeof ymaps !== 'undefined') {
            resolve();
        } else {
            // const yandexMapUrl = url;
            window.yandexMapIsLoading = true;
            const yandexMapUrl =
                'https://api-maps.yandex.ru/2.1/?apikey=fddd1435-ad6a-45b6-90bd-e886baf1bd4b&lang=ru_RU';
            const yandexMapScript = document.createElement('script');
            yandexMapScript.type = 'text/javascript';
            yandexMapScript.src = yandexMapUrl;
            document.body.appendChild(yandexMapScript);

            yandexMapScript.onload = function () {
                window.yandexMapIsLoading = false;
                resolve();
            };
        }
    });
}
