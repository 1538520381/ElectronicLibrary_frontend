import axios from 'axios'

const request = axios.create({
    baseURL: '/api', timeout: 50000,
})

request.interceptors.request.use(config => {
    config.headers['Authorization'] = localStorage.getItem('token')
    return config;
}, error => {
    return Promise.reject(error);
})

request.interceptors.response.use(response => {
    return response;
}, error => {
    return Promise.reject(error);
})

export default request;