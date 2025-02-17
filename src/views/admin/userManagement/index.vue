<template>
  <div id="userManagement">
    <Header></Header>

    <div class="middle">
      <SidebarMenu :user-type="'admin'" :active="'1'"></SidebarMenu>
      <div class="main">
        <div class="searchContainer">
          <el-input class="searchInput" v-model="queryPageForm.name" prefix-icon="el-icon-search"
                    placeholder="姓名"></el-input>
          <el-input class="searchInput" v-model="queryPageForm.phone" prefix-icon="el-icon-search"
                    placeholder="手机"></el-input>
          <el-input class="searchInput" v-model="queryPageForm.company" prefix-icon="el-icon-search"
                    placeholder="单位"></el-input>
          <el-select class="searchInput" v-model="queryPageForm.status" placeholder="状态" clearable>
            <el-option v-for="(item, index) in statusOptions" :label="item.name" :value="item.value"/>
          </el-select>
        </div>
        <div class="controlContainer">
          <el-button class="controlButton" type="primary"
                     @click="queryUserPage({page: page,pageSize: pageSize,name:queryPageForm.name,phone: queryPageForm.phone,company: queryPageForm.company,status: queryPageForm.status})">
            搜索
          </el-button>
          <el-button class="controlButton" type="primary" @click="openAddUserDialog">新增</el-button>
        </div>
        <el-scrollbar class="tableContainer">
          <el-table class="table" ref="table" :data="userList" empty-text="暂无用户">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column class="tableColumn" prop="name" label="姓名"></el-table-column>
            <el-table-column class="tableColumn" prop="phone" label="手机"></el-table-column>
            <el-table-column class="tableColumn" prop="company" label="单位"></el-table-column>
            <el-table-column class="tableColumn" label="状态">
              <template slot-scope="scope">
                {{ scope.row.status ? '正常' : '禁用' }}
              </template>
            </el-table-column>
            <el-table-column class="tableColumn" prop="createTime" label="导入时间"></el-table-column>
            <el-table-column class="tableColumn" fixed="right" label="操作">
              <template slot-scope="scope">
                <el-popconfirm title="确定删除吗?" @confirm="deleteUserById({
                  id: scope.row.id
                })">
                  <el-button style="color: #ff0000" type="text" size="small" slot="reference">删除</el-button>
                </el-popconfirm>

                <el-divider direction="vertical" v-if="scope.row.status"></el-divider>
                <el-button style="color: #ff0000" type="text" size="small" slot="reference"
                           @click="updateUserById({id: scope.row.id,status: false})" v-if="scope.row.status">禁用
                </el-button>

                <el-divider direction="vertical" v-if="!scope.row.status"></el-divider>
                <el-button type="text" size="small" slot="reference"
                           @click="updateUserById({id: scope.row.id,status: true})" v-if="!scope.row.status">启用
                </el-button>

                <el-divider direction="vertical"></el-divider>
                <el-popconfirm title="确定处理化吗?" @confirm="initializePassword({id: scope.row.id})">
                  <el-button type="text" size="small" slot="reference">初始化密码
                  </el-button>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
              :page-size="pageSize"
              :total="total"
              layout="prev, pager, next"
              @current-change="selectPage">
          </el-pagination>
        </el-scrollbar>
      </div>
    </div>

    <el-dialog class="addUserDialog" title="新增用户" :visible.sync="addUserDialogVis"
               :close-on-click-modal="false" width="450px">
      <el-form class="addUserForm">
        <el-form-item class="addUserFormItem" label="姓名" :label-width="addUserDialogFormItemLabelWidth">
          <el-input class="addUserFormInput" v-model="addUserForm.name" maxlength="150"
                    placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item class="addUserFormItem" label="手机号" :label-width="addUserDialogFormItemLabelWidth">
          <el-input class="addUserFormInput" v-model="addUserForm.phone" maxlength="150"
                    placeholder="请输入手机"></el-input>
        </el-form-item>
        <el-form-item class="addUserFormItem" label="单位" :label-width="addUserDialogFormItemLabelWidth">
          <el-input class="addUserFormInput" v-model="addUserForm.company" maxlength="150"
                    placeholder="请输入单位"></el-input>
        </el-form-item>
      </el-form>

      <div class="addUserDialogFooter">
        <el-button @click="closeAddUserDialog">取消</el-button>
        <el-button type="primary"
                   @click="addUser({name: addUserForm.name,phone: addUserForm.phone,company: addUserForm.company,type: 1})">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Header from "@/components/header/index.vue";
import SidebarMenu from "@/components/sidebarMenu/index.vue";

import {isEmpty} from "@/utils/common";
import {
  userAdd,
  userDeleteById,
  userGetUserByToken,
  userInitializePassword,
  userQueryPage,
  userUpdateById
} from "@/apis/user";

export default {
  name: "UserManagement",
  components: {SidebarMenu, Header},
  data() {
    return {
      user: {},

      queryPageForm: {
        name: null,
        phone: null,
        company: null,
        status: null
      },
      statusOptions: [
        {
          name: '正常',
          value: true,
        },
        {
          name: '禁用',
          value: false
        }
      ],

      userList: [],

      page: 1,
      pageSize: 5,
      total: 0,

      addUserDialogVis: false,
      addUserDialogFormItemLabelWidth: '80px',
      addUserForm: {
        phone: null,
        company: null
      },
    }
  },
  async created() {
    await this.getUserByToken()

    this.initQueryPageForm()
    this.initAddUserForm()

    this.queryUserPage({
      page: this.page,
      pageSize: this.pageSize,
      name: this.queryPageForm.name,
      phone: this.queryPageForm.phone,
      company: this.queryPageForm.company,
      status: this.queryPageForm.status
    })
  },
  methods: {
    getUserByToken() {
      return userGetUserByToken().then((res) => {
        if (res.data.code === 200) {
          if (res.data.user.type !== 0) {
            this.toLogin()
            this.$message.error("用户无权限")
          } else {
            this.user = res.data.user
          }
        } else {
          this.toLogin()
          this.$message.error("用户未登录")
        }
      }).catch((err) => {
        this.toLogin()
        console.log(err)
        this.$message.error("服务器异常，请联系管理员")
      })
    },

    initQueryPageForm() {
      this.queryPageForm = {
        name: null,
        phone: null,
        company: null,
        status: null
      }
    },
    initAddUserForm() {
      this.addUserForm = {
        phone: null,
        company: null
      }
    },

    queryUserPage(queryUserPageForm) {
      userQueryPage({
        page: queryUserPageForm.page,
        pageSize: queryUserPageForm.pageSize,
        name: isEmpty(queryUserPageForm.name) ? null : queryUserPageForm.name,
        phone: isEmpty(queryUserPageForm.phone) ? null : queryUserPageForm.phone,
        company: isEmpty(queryUserPageForm.company) ? null : queryUserPageForm.company,
        status: isEmpty(queryUserPageForm.status) ? null : queryUserPageForm.status,
      }).then((res) => {
        if (res.data.code === 200) {
          this.userList = res.data.userPage.records
          this.total = res.data.userPage.total

          if (res.data.userPage.pages < this.page) {
            this.page = res.data.userPage.pages
            this.queryUserPage({
              page: res.data.userPage.pages,
              pageSize: queryUserPageForm.pageSize,
              name: queryUserPageForm.name,
              phone: queryUserPageForm.phone,
              company: queryUserPageForm.company,
              status: queryUserPageForm.status,
            })
          }
        } else {
          console.log(res)
          this.$message.error(res.data.msg)
        }
      }).catch((err) => {
        console.log(err)
        this.$message.error("服务器异常，请联系管理员")
      })
    },
    addUser(addUserForm) {
      if (isEmpty(addUserForm.name)) {
        this.$message.error("姓名不能为空")
        return
      } else if (isEmpty(addUserForm.phone)) {
        this.$message.error("手机不能为空")
        return
      } else if (addUserForm.phone.length !== 11) {
        this.$message.error("请输入11位手机号")
        return;
      }

      userAdd({
        name: isEmpty(addUserForm.name) ? null : addUserForm.name,
        phone: isEmpty(addUserForm.phone) ? null : addUserForm.phone,
        company: isEmpty(addUserForm.company) ? null : addUserForm.company,
      }).then((res) => {
        if (res.data.code === 200) {
          this.$message.success("新增成功")
          this.queryUserPage({
            page: this.page,
            pageSize: this.pageSize,
            name: this.queryPageForm.name,
            phone: this.queryPageForm.phone,
            company: this.queryPageForm.company,
            status: this.queryPageForm.status
          })
          this.closeAddUserDialog()
        } else {
          console.log(res)
          this.$message.error(res.data.msg)
        }
      }).catch((err) => {
        console.log(err)
        this.$message.error("服务器异常，请联系管理员")
      })
    },
    deleteUserById(deleteUserByIdForm) {
      userDeleteById({
        id: deleteUserByIdForm.id
      }).then((res) => {
        if (res.data.code === 200) {
          this.$message.success("删除成功")
          this.queryUserPage({
            page: this.page,
            pageSize: this.pageSize,
            name: this.queryPageForm.name,
            phone: this.queryPageForm.phone,
            company: this.queryPageForm.company,
            status: this.queryPageForm.status
          })
        } else {
          console.log(res)
          this.$message.error(res.data.msg)
        }
      }).catch((err) => {
        console.log(err)
        this.$message.error("服务器异常，请联系管理员")
      })
    },
    updateUserById(updateUserByIdForm) {
      userUpdateById({
        id: updateUserByIdForm.id,
        status: isEmpty(updateUserByIdForm.status) ? null : updateUserByIdForm.status
      }).then((res) => {
        if (res.data.code === 200) {
          this.queryUserPage({
            page: this.page,
            pageSize: this.pageSize,
            name: this.queryPageForm.name,
            phone: this.queryPageForm.phone,
            company: this.queryPageForm.company,
            status: this.queryPageForm.status
          })
        } else {
          console.log(res)
          this.$message.error(res.data.msg)
        }
      }).catch((err) => {
        console.log(err)
        this.$message.error("服务器异常，请联系管理员")
      })
    },
    initializePassword(initializePasswordForm) {
      userInitializePassword({
        id: initializePasswordForm.id
      }).then((res) => {
        if (res.data.code === 200) {
          this.$message.success("密码初始化成功")
        } else {
          console.log(res)
          this.$message.error(res.data.msg)
        }
      }).catch((err) => {
        console.log(err)
        this.$message.error("服务器异常，请联系管理员")
      })
    },

    selectPage(page) {
      this.page = page
      this.queryUserPage({
        page: this.page,
        pageSize: this.pageSize,
        name: this.queryPageForm.name,
        phone: this.queryPageForm.phone,
        company: this.queryPageForm.company,
        status: this.queryPageForm.status
      })
    },

    openAddUserDialog() {
      this.initAddUserForm()
      this.addUserDialogVis = true
    },
    closeAddUserDialog() {
      this.addUserDialogVis = false
    },

    toLogin() {
      this.$router.push("/login")
    },

    isEmpty,
  }
}
</script>

<style scoped>
#userManagement {
  display: flex;

  flex-flow: column;

  width: 100%;
  height: 100%;
}

#userManagement .middle {
  display: flex;

  flex-flow: row;

  flex: 1;

  width: 100%;
  height: 0;
}

#userManagement .middle .main {
  display: flex;

  flex-flow: column;

  flex: 1;

  width: 0;
  height: 100%;
}

#userManagement .middle .main .searchContainer {
  width: 100%;
}

#userManagement .middle .main .searchContainer .searchInput {
  margin: 20px 0 0 20px;

  width: 200px;
}

#userManagement .middle .main .controlContainer .controlButton {
  margin: 10px 0 0 20px;
}

#userManagement .middle .main .tableContainer {
  flex: 1;

  text-align: center;
}

#userManagement .middle .main .tableContainer /deep/ .el-scrollbar__wrap {
  overflow-x: hidden;
  overflow-y: hidden;
}

#userManagement .middle .main .tableContainer .table {
  margin: 0 auto 0 auto;

  width: 90%;
}

#userManagement .addUserDialog .addUserForm .addUserFormItem {
  margin: 0 0 10px 0;
}

#userManagement .addUserDialog .addUserForm .addUserFormItem .addUserFormInput {
  width: 240px;
}


#userManagement .addUserDialog .addUserDialogFooter {
  text-align: right;
}
</style>