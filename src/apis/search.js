import request from '@/utils/request'

export function searchSearch(searchForm) {
    return request({
        url: '/search/search', method: 'GET', params: {
            text: searchForm.text
        }
    })
}

export function searchGetFile(getFileForm) {
    return request({
        url: '/search/getFile', method: 'GET', params: {
            path: getFileForm.path
        }
    })
}