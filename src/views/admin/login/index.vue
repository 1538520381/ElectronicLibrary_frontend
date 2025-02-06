<template>
  <div id="login">
    <el-image class="background" :src="assets.background"></el-image>

    <el-tabs class="loginContainer" v-model="tabsActive" type="border-card">
      <el-tab-pane label="登录">
        <el-input class="input" v-model="loginForm.account" placeholder="请输入账号"
                  prefix-icon="el-icon-user"></el-input>
        <el-input class="input" v-model="loginForm.password" placeholder="请输入密码"
                  prefix-icon="el-icon-lock" show-password></el-input>
        <el-button class="formButton" @click="login({
          account: loginForm.account,
          password: loginForm.password,
        })">登录
        </el-button>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import background from '@/assets/pictures/background.jpg'

import {isEmpty} from "@/utils/common";
import {userLogin} from "@/apis/user";

export default {
  name: 'Login',
  data() {
    return {
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
  },
  methods: {
    initLoginForm() {
      this.loginForm = {
        account: null,
        password: null
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
          this.toBookManagement()
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