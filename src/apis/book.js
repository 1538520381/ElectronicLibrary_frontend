import request from '@/utils/request'

export function bookAdd(addForm) {
    return request({
        url: '/book/add', method: 'POST', data: {
            categoryId: addForm.categoryId,
            name: addForm.name,
            coverDocumentId: addForm.coverDocumentId,
            originalDocumentId: addForm.originalDocumentId,
        }
    })
}

export function bookQueryPage(queryPageForm) {
    return request({
        url: '/book/queryPage', method: 'GET', params: {
            page: queryPageForm.page,
            pageSize: queryPageForm.pageSize,
            categoryId: queryPageForm.categoryId,
            name: queryPageForm.name
        }
    })
}

export function bookDeleteById(deleteByIdForm) {
    return request({
        url: '/book/deleteById/' + deleteByIdForm.id, method: 'DELETE'
    })
}

export function bookQueryList(queryListForm) {
    return request({
        url: '/book/queryList', method: 'GET', params: {
            page: queryListForm.page,
            pageSize: queryListForm.pageSize,
            categoryId: queryListForm.categoryId,
            name: queryListForm.name
        }
    })
}

export function bookGetById(bookForm) {
    return request({
        url: '/book/getById/' + bookForm.id, method: 'GET'
    })
}