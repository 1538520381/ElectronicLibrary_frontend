export function isPassword(str) {
    const reg = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,30}$/;
    return reg.test(str)
}