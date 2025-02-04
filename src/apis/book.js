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