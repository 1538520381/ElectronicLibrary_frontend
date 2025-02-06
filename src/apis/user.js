import request from '@/utils/request'

export function userLogin(loginForm) {
    return request({
        url: '/user/login', method: 'POST', data: {
            account: loginForm.account, password: loginForm.password
        }
    })
}