<template>
  <div id="bookLibrary">
    <Header></Header>

    <div class="middle">
      <SidebarMenu user-type="user" active="0"></SidebarMenu>

      <div class="main">
        <div class="bookListMain">
          <div class="searchContainer">
            <el-select class="searchInput" v-model="queryPageForm.categoryId" placeholder="书本类别" clearable
                       @change="queryListBook({categoryId: queryPageForm.categoryId,name: queryPageForm.name,})">
              <el-option v-for="(item, index) in categoryList" :label="item.name" :value="item.id"/>
            </el-select>
            <el-input class="searchInput" v-model="queryPageForm.name" prefix-icon="el-icon-search"
                      placeholder="书本名称"
                      @change="queryListBook({categoryId: queryPageForm.categoryId,name: queryPageForm.name,})"></el-input>
          </div>
          <el-scrollbar class="bookListContainer" v-if="!isEmpty(bookList)">
            <div class="bookContainer" v-for="(item, index) in bookList" @click="selectBook(item)">
              <el-image class="bookCover" :src="'/api/document/download/' + item.coverDocumentId"
                        fit="contain"></el-image>
              <el-tooltip
                  :content="item.name"
                  placement="top"
                  effect="dark"
              >
                <div class="bookName">{{ item.name }}</div>
              </el-tooltip>
            </div>
          </el-scrollbar>
          <div class="bookListEmpty" v-else>
            暂无书本
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from "@/components/header/index.vue";
import SidebarMenu from "@/components/sidebarMenu/index.vue";
import {categoryGetListSortBySort} from "@/apis/category";
import {bookQueryList} from "@/apis/book";
import {isEmpty} from "@/utils/common";
import {userGetUserByToken} from "@/apis/user";

export default {
  name: 'BookLibrary',
  components: {SidebarMenu, Header},
  data() {
    return {
      user: null,

      queryPageForm: {
        categoryId: null,
        name: null
      },

      bookList: [],
      categoryList: [],
    }
  },
  async created() {
    await this.getUserByToken()

    this.initQueryPageForm()

    this.queryListBook({
      categoryId: this.queryPageForm.categoryId,
      name: this.queryPageForm.name,
    })
    this.getCategoryList()
  },
  methods: {
    getUserByToken() {
      return userGetUserByToken().then((res) => {
        if (res.data.code === 200) {
          this.user = res.data.user
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
        categoryId: null,
        name: null
      }
    },

    queryListBook(queryListBookForm) {
      bookQueryList({
        categoryId: isEmpty(queryListBookForm.categoryId) ? null : queryListBookForm.categoryId,
        name: isEmpty(queryListBookForm.name) ? null : queryListBookForm.name,
      }).then((res) => {
        if (res.data.code === 200) {
          this.bookList = res.data.bookList
        } else {
          console.log(res)
          this.$message.error(res.data.msg)
        }
      }).catch((err) => {
        console.log(err)
        this.$message.error("服务器异常，请联系管理员")
      })
    },
    getCategoryList() {
      categoryGetListSortBySort().then((res) => {
        if (res.data.code === 200) {
          this.categoryList = res.data.categoryList
        } else {
          console.log(res)
          this.$message.error(res.data.msg)
        }
      }).catch((err) => {
        console.log(err)
        this.$message.error("服务器异常，请联系管理员")
      })
    },

    selectBook(book) {
      this.$router.push({
        path: `/user/bookReader/${book.id}`,
        query: {
          totalPages: book.totalPages // 假设book对象中有总页数信息
        }
      });
    },

    toLogin() {
      this.$router.push("/login")
    },

    isEmpty,
  }
}
</script>

<style scoped>
#bookLibrary {
  display: flex;

  flex-flow: column;

  width: 100%;
  height: 100%;
}

#bookLibrary .middle {
  display: flex;

  flex-flow: row;

  flex: 1;

  width: 100%;
  height: 0;
}

#bookLibrary .middle .main {
  flex: 1;

  width: 0;
  height: 100%;
}

#bookLibrary .middle .main .bookListMain {
  display: flex;

  flex-flow: column;

  width: 100%;
  height: 100%;
}

#bookLibrary .middle .main .bookListMain .searchContainer {
  width: 100%;
}

#bookLibrary .middle .main .bookListMain .searchContainer .searchInput {
  margin: 20px 0 0 20px;

  width: 200px;
}

#bookLibrary .middle .main .bookListMain .bookListContainer {
  flex: 1;

  padding: 20px 20px 20px 20px;

  width: calc(100% - 40px);
  height: 0;
}

#bookLibrary .middle .main .bookListMain .bookListContainer /deep/ .el-scrollbar__wrap {
  overflow-x: hidden;
  overflow-y: hidden;
}

#bookLibrary .middle .main .bookListMain .bookListContainer .bookContainer {
  display: inline-block;

  margin: 5px 5px 5px 5px;
  padding: 10px 10px 10px 10px;

  width: 120px;

  border: 1px solid #aaaaaa;
  border-radius: 10px;

  text-align: center;

  cursor: pointer;
}

#bookLibrary .middle .main .bookListMain .bookListContainer .bookContainer .bookCover {
  width: 120px;
  height: 180px;
}

#bookLibrary .middle .main .bookListMain .bookListContainer .bookContainer .bookName {
  width: 100%;

  font-size: 14px;
  font-weight: bold;

  text-align: center;

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

#bookLibrary .middle .main .bookListMain .bookListEmpty {
  margin: 20px 0 0 0;

  width: 100%;

  color: #aaaaaa;

  text-align: center;
}

#bookLibrary .middle .main .bookReaderMain {
  width: 100%;
  height: 100%;
}
</style>