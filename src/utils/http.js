import $ from 'jquery'
import store from '@/store'

export var base;
base = "http:" + '//' + "127.0.0.1";
// base = "http:" + '//' + "106.55.62.69";
// if (process.env.NODE_ENV === 'development') { //如果是开发环境
//     // base = window.location.protocol + '//' + "127.0.0.1";
//     base = "http:" + '//' + "127.0.0.1";
// } else {
//     // base = window.location.protocol + '//' + window.location.hostname + ":" + window.location.port
//     base = "http:" + '//' + "127.0.0.1" + ":" + "80"
// }
export let flask = 'http://127.0.0.1:5000'
export const postRequest = (url, params, success, error) => {
    return $.ajax({
        url: base + url,
        data: params,
        type: "post",
        headers: {
            Authorization: "Bearer " + store.state.user.jwtToken,
        },
        success,
        error,
    });
}
export const getRequest = (url, params, success, error) => {
    return $.ajax({
        url: base + url,
        data: params,
        type: "get",
        headers: {
            Authorization: "Bearer " + store.state.user.jwtToken,
        },
        success,
        error,
    });
}

export const loginRequest = (url, params, success, error) => {
    return $.ajax({
        url: base + url,
        data: params,
        type: "post",
        success,
        error,
    });
}

export const pureRequest = (url, params, success, error) => {
    return $.ajax({
        url: base + url,
        data: params,
        type: "post",
        success,
        error,
    });
}

export const flaskRequest = (url, params, success, error) => {
    return $.ajax({
        url: flask + url,
        data: params,
        dataType: "json",
        headers: {
            Authorization: "Bearer " + store.state.user.jwtToken,
        },
        type: "post",
        success,
        error,
    });
}

export const imageRequest = (url, params, success, error) => {
    return $.ajax({
        url: base + url,
        data: params,
        xhrFields: {
            responseType: "blob"
        },
        headers: {
            Authorization: "Bearer " + store.state.user.jwtToken,
        },
        type: "post",
        success,
        error,
    });
}