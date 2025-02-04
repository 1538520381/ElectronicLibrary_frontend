import request from '@/utils/request'

export function categoryAdd(addForm) {
    return request({
        url: '/category/add', method: 'POST', data: {
            name: addForm.name
        }
    })
}

export function categoryGetListSortBySort() {
    return request({
        url: '/category/getListSortBySort', method: 'GET'
    })
}

export function categoryUpdateList(updateListForm) {
    return request({
        url: '/category/updateList', method: 'PUT', data: {
            categoryList: updateListForm.categoryList
        }
    })
}

export function categoryDeleteById(deleteByIdForm) {
    return request({
        url: '/category/deleteById/' + deleteByIdForm.id, method: 'DELETE'
    })
}