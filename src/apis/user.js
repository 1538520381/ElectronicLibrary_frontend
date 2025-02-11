import request from '@/utils/request'

export function userLogin(loginForm) {
    return request({
        url: '/user/login', method: 'POST', data: {
            account: loginForm.account, password: loginForm.password
        }
    })
}

export function userGetUserByToken() {
    return request({
        url: '/user/getUserByToken', method: 'GET'
    })
}

export function userAdd(addForm) {
    return request({
        url: '/user/add', method: 'POST', data: {
            phone: addForm.phone, company: addForm.company,
        }
    })
}

export function userQueryPage(queryPageForm) {
    return request({
        url: '/user/queryPage', method: 'GET', params: {
            page: queryPageForm.page,
            pageSize: queryPageForm.pageSize,
            phone: queryPageForm.phone,
            company: queryPageForm.company,
            status: queryPageForm.status,
        }
    })
}

export function userDeleteById(deleteByIdForm) {
    return request({
        url: '/user/deleteById/' + deleteByIdForm.id, method: 'DELETE'
    })
}

export function userUpdateById(updateByIdForm) {
    return request({
        url: '/user/updateById', method: 'PUT', params: {
            id: updateByIdForm.id, status: updateByIdForm.status
        }
    })
}

export function userInitializePassword(initializePasswordForm) {
    return request({
        url: '/user/initializePassword/' + initializePasswordForm.id, method: 'PUT'
    })
}