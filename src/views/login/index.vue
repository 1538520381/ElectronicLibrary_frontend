<template>
  <div id="login">
    <el-image class="background" :src="assets.background"></el-image>

    <el-tabs class="loginContainer" v-model="tabsActive" type="border-card">
      <el-tab-pane v-if="tabFlag === 0" label="用户登录">
        <el-input class="input" v-model="loginForm.account" placeholder="请输入手机"
                  prefix-icon="el-icon-user"></el-input>
        <el-input class="input" v-model="loginForm.password" placeholder="请输入密码（初始密码为手机后6位）"
                  prefix-icon="el-icon-lock" show-password></el-input>
        <el-button class="formButton" @click="login({
          account: loginForm.account,
          password: loginForm.password,
        })">登录
        </el-button>
      </el-tab-pane>
      <el-tab-pane v-if="tabFlag === 0" label="管理员登录">
        <el-input class="input" v-model="loginForm.account" placeholder="请输入账号"
                  prefix-icon="el-icon-user"></el-input>
        <el-input class="input" v-model="loginForm.password" placeholder="请输入密码"
                  prefix-icon="el-icon-lock" show-password></el-input>
        <el-button class="formButton" @click="loginAdmin({
          account: loginForm.account,
          password: loginForm.password,
        })">登录
        </el-button>
      </el-tab-pane>
      <el-tab-pane v-if="tabFlag === 1" label="首次登录修改密码">
        <el-input class="input" v-model="updatePasswordForm.password" placeholder="请输入密码"
                  prefix-icon="el-icon-user" show-password></el-input>
        <el-input class="input" v-model="updatePasswordForm.passwordAgain" placeholder="请再次输入密码"
                  prefix-icon="el-icon-lock" show-password></el-input>
        <el-button class="formButton" @click="updatePassword({
          id: user.id,
          password: updatePasswordForm.password
        })">确定
        </el-button>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import background from '@/assets/pictures/background.jpg'

import {isEmpty} from "@/utils/common";
import {userGetUserByToken, userLogin, userLoginAdmin, userUpdateById} from "@/apis/user";
import {isPassword} from "@/utils/validate";

export default {
  name: 'Login',
  data() {
    return {
      user: null,

      assets: {
        background: background
      },

      loginForm: {},
      forgetPasswordForm: {},
      updatePasswordForm: {},

      tabsActive: '0',
      tabFlag: 0,
    }
  },
  created() {
    this.initLoginForm()
    this.initUpdatePasswordForm()
  },
  methods: {
    getUserByToken() {
      userGetUserByToken().then((res) => {
        if (res.data.code === 200) {
          this.user = res.data.user
        } else {
          this.loginTab()
          this.$message.error("用户未登录")
        }
      }).catch((err) => {
        console.log(err)
        this.$message.error("服务器异常，请联系管理员")
      })
    },

    initLoginForm() {
      this.loginForm = {
        account: null,
        password: null
      }
    },
    initUpdatePasswordForm() {
      this.updatePasswordForm = {
        password: null,
        passwordAgain: null
      }
    },

    login(loginForm) {
      if (isEmpty(this.loginForm.account) || isEmpty(this.loginForm.account.trim())) {
        this.$message.error("账号不能为空")
        return
      } else if (isEmpty(this.loginForm.password) || isEmpty(this.loginForm.password.trim())) {
        this.$message.error("密码不能为空")
        return
      }

      userLogin({
        account: loginForm.account,
        password: loginForm.password
      }).then((res) => {
        if (res.data.code === 200) {
          localStorage.setItem('token', res.data.token)
          localStorage.setItem('userType', 'user')
          this.getUserByToken()
          if (res.data.hasNotLoginFlag) {
            this.updatePasswordTab()
          } else {
            this.toBookLibrary()
          }
          this.$message.success("登录成功")
        } else {
          console.log(res)
          this.$message.error(res.data.msg)
        }
      }).catch((err) => {
        console.log(err)
        this.$message.error("服务器异常，请联系管理员")
      })
    },
    loginAdmin(loginAdminForm) {
      if (isEmpty(this.loginForm.account) || isEmpty(this.loginForm.account.trim())) {
        this.$message.error("账号不能为空")
        return
      } else if (isEmpty(this.loginForm.password) || isEmpty(this.loginForm.password.trim())) {
        this.$message.error("密码不能为空")
        return
      }

      userLoginAdmin({
        account: loginAdminForm.account,
        password: loginAdminForm.password
      }).then((res) => {
        if (res.data.code === 200) {
          localStorage.setItem('token', res.data.token)
          localStorage.setItem('userType', 'admin')
          this.getUserByToken()
          if (res.data.hasNotLoginFlag) {
            this.updatePasswordTab()
          } else {
            this.toBookManagement()
          }
          this.$message.success("登录成功")
        } else {
          console.log(res)
          this.$message.error(res.data.msg)
        }
      }).catch((err) => {
        console.log(err)
        this.$message.error("服务器异常，请联系管理员")
      })
    },
    updatePassword(updatePasswordForm) {
      let userType = localStorage.getItem('userType')
      if (isEmpty(userType)) {
        this.loginTab()
        this.$message.error("请先登录")
        return;
      } else if (isEmpty(this.updatePasswordForm.password) || isEmpty(this.updatePasswordForm.password.trim())) {
        this.$message.error("密码不能为空")
        return
      } else if (!isPassword(this.updatePasswordForm.password.trim())) {
        this.$message.error("请输入包含英文字母和数字的8-30位密码")
        return
      } else if (isEmpty(this.updatePasswordForm.passwordAgain) || isEmpty(this.updatePasswordForm.passwordAgain.trim())) {
        this.$message.error("请再次输入密码")
        return
      } else if (this.updatePasswordForm.password.trim() !== this.updatePasswordForm.passwordAgain.trim()) {
        this.$message.error("两次输入的密码不一致")
        return
      }

      userUpdateById({
        id: updatePasswordForm.id,
        password: updatePasswordForm.password
      }).then((res) => {
        if (res.data.code === 200) {
          if (userType === 'user') {
            this.toBookLibrary()
          } else {
            this.toBookManagement()
          }
          this.$message.success("修改成功")
        } else {
          console.log(res)
          this.$message.error(res.data.msg)
        }
      }).catch((err) => {
        console.log(err)
        this.$message.error("服务器异常，请联系管理员")
      })
    },

    loginTab() {
      this.initLoginForm()
      this.tabsActive = '0'
      this.tabFlag = 0
    },
    updatePasswordTab() {
      this.initUpdatePasswordForm()
      this.tabsActive = '0'
      this.tabFlag = 1
    },

    toBookLibrary() {
      this.$router.push("/user/bookLibrary")
    },
    toBookManagement() {
      this.$router.push("/admin/bookManagement")
    }
  }
}
</script>

<style scoped>
#login {
  display: flex;

  align-items: center;

  width: 100%;
  height: 100%;
}

#login .background {
  position: absolute;

  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

#login .loginContainer {
  position: absolute;

  right: 100px;

  background: white;
}

#login .loginContainer .input {
  display: block;

  margin: 10px 0 0 0;

  width: 300px;
}

#login .loginContainer .formButton {
  margin: 5px 0 0 0;

  width: 300px;
}
</style>