<template>
  <div id="bookManagement">
    <Header></Header>

    <div class="middle">
      <SidebarMenu :user-type="'admin'" :active="'0'"></SidebarMenu>
      <div class="main">
        <div class="searchContainer">
          <el-select class="searchInput" v-model="queryPageForm.categoryId" placeholder="书本类别" clearable>
            <el-option v-for="(item, index) in categoryList" :label="item.name" :value="item.id"/>
          </el-select>
          <el-input class="searchInput" v-model="queryPageForm.name" prefix-icon="el-icon-search"
                    placeholder="书本名称"></el-input>
        </div>
        <div class="controlContainer">
          <el-button class="controlButton" type="primary"
                     @click="queryPageBook({page: page,pageSize: pageSize,categoryId: queryPageForm.categoryId,name: queryPageForm.name})">
            搜索
          </el-button>
          <el-button class="controlButton" type="primary" @click="openAddBookDialog">新增</el-button>
          <el-button icon="el-icon-refresh-right" circle
                     @click="queryPageBook({page: page,pageSize: pageSize,categoryId: queryPageForm.categoryId,name: queryPageForm.name})"></el-button>
        </div>
        <el-scrollbar class="tableContainer">
          <el-table class="table" ref="table" :data="bookList" empty-text="暂无书本">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column class="tableColumn" label="类别">
              <template slot-scope="scope">
                <div>
                  {{
                    isEmpty(categoryIdToCategory(scope.row.categoryId)) ? scope.row.categoryId : categoryIdToCategory(scope.row.categoryId).name
                  }}
                </div>
              </template>
            </el-table-column>
            <el-table-column class="tableColumn" prop="name" label="名称"></el-table-column>
            <el-table-column class="tableColumn" label="封面">
              <template slot-scope="scope">
                <div id="coverImageTemplate">
                  <el-image class="coverImage"
                            :src="'/api/document/download/' + scope.row.coverDocumentId" fit="contain"
                            @click="downloadDocument({
                              id: scope.row.coverDocumentId
                            })"></el-image>
                </div>
              </template>
            </el-table-column>
            <el-table-column class="tableColumn" label="文件">
              <template slot-scope="scope">
                <div>
                  <el-button type="primary" @click="downloadDocument({id: scope.row.originalDocumentId})">下载文件
                  </el-button>
                </div>
              </template>
            </el-table-column>
            <el-table-column class="tableColumn" prop="createTime" label="上传时间"></el-table-column>
            <el-table-column class="tableColumn" label="处理状态">
              <template slot-scope="scope">
                <div>
                  {{
                    scope.row.handlingFlag === 0 ? '处理完成' : (scope.row.handlingFlag === 1 ? '处理中' : '处理失败')
                  }}
                </div>
              </template>
            </el-table-column>
            <el-table-column class="tableColumn" fixed="right" label="操作">
              <template slot-scope="scope">
                <el-popconfirm title="确定删除吗?" @confirm="deleteBookById({
                  id: scope.row.id
                })">
                  <el-button style="color: #ff0000" type="text" size="small" slot="reference">删除</el-button>
                </el-popconfirm>
                <el-divider direction="vertical"></el-divider>
                <el-button type="text" size="small" slot="reference" @click="openUpdateBookDialog(scope.row)">更新
                </el-button>
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

    <el-dialog class="addBookDialog" title="新增书本" :visible.sync="addBookDialogVis"
               :close-on-click-modal="false" width="500px">
      <el-form class="addBookForm">
        <el-form-item class="addBookFormItem" label="书本类别" :label-width="addBookDialogFormItemLabelWidth">
          <el-select class="addBookFormInput" v-model="addBookForm.bookCategoryId" placeholder="请选择类别">
            <el-option v-for="(item, index) in categoryList" :label="item.name" :value="item.id"/>
          </el-select>
          <el-button class="addBookFormButton" @click="openCategoryManagementDialog">类别管理</el-button>
        </el-form-item>
        <el-form-item class="addBookFormItem" label="书本名称" :label-width="addBookDialogFormItemLabelWidth">
          <el-input class="addBookFormInput" v-model="addBookForm.bookName" maxlength="150"
                    placeholder="请输入书本名称"></el-input>
        </el-form-item>
        <el-form-item class="addBookFormItem" label="书本文件" :label-width="addBookDialogFormItemLabelWidth">
          <el-button class="addBookFormButton" type="primary" v-loading="uploadBookDocumentLoading"><label
              for="uploadBookDocument">导入</label></el-button>
          <input type="file" id="uploadBookDocument" ref="upload" style="display: none"
                 @change="uploadBookDocument($event,'add')"/>
          <div class="originalDocumentName" v-if="!isEmpty(addBookForm.document)" @click="downloadDocument({
            id: addBookForm.document.id
          })">
            {{ addBookForm.document.originalDocumentName }}
          </div>
        </el-form-item>
        <el-form-item class="addBookFormItem" label="封面文件" :label-width="addBookDialogFormItemLabelWidth">
          <el-button class="addBookFormButton" type="primary" v-loading="uploadBookCoverDocumentLoading"><label
              for="uploadBookCoverDocument">导入</label>
          </el-button>
          <input type="file" id="uploadBookCoverDocument" ref="upload" style="display: none"
                 @change="uploadBookCoverDocument($event,'add')"/>
          <el-image class="coverImage" v-if="!isEmpty(addBookForm.coverDocument)"
                    :src="'/api/document/download/' + addBookForm.coverDocument.id" fit="contain" @click="downloadDocument({
                              id: addBookForm.coverDocument.id
                            })"></el-image>
        </el-form-item>
      </el-form>

      <div class="addBookDialogFooter">
        <el-button @click="closeAddBookDialog">取消</el-button>
        <el-button type="primary"
                   @click="addBook({categoryId: addBookForm.bookCategoryId,name: addBookForm.bookName,coverDocumentId: addBookForm.coverDocument.id,originalDocumentId: addBookForm.document.id})">
          确定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog class="categoryManagementDialog" title="类别管理" :visible.sync="categoryManagementDialogVis"
               :close-on-click-modal="false" width="450px">
      <el-form class="categoryManagementForm">
        <el-form-item class="categoryManagementFormItem" label="类别"
                      :label-width="categoryManagementDialogFormItemLabelWidth">
          <el-input class="categoryManagementFormInput" v-model="categoryManagementForm.categoryName"
                    placeholder="请输入类别"/>
        </el-form-item>
      </el-form>
      <el-button class="categoryManagementFormButton" type="primary" @click="addCategory({
        name: categoryManagementForm.categoryName
        })">
        新增类别
      </el-button>
      <el-divider class="divider"></el-divider>
      <div class="categoryList">
        <draggable v-model="categoryList" @end="updateCategorySort({
        categoryList: categoryList
        })">
          <div class="categoryListItem" v-for="(item,index) in categoryList">
            {{ item.name }}
            <span class="categoryDeleteButton" @click="deleteCategoryById({
            id: item.id
            })">×</span>
          </div>
        </draggable>
      </div>
    </el-dialog>

    <el-dialog class="updateBookDialog" title="更新书本" :visible.sync="updateBookDialogVis"
               :close-on-click-modal="false" width="500px">
      <el-form class="updateBookForm">
        <el-form-item class="updateBookFormItem" label="书本类别" :label-width="updateBookDialogFormItemLabelWidth">
          <el-select class="updateBookFormInput" v-model="updateBookForm.bookCategoryId" placeholder="请选择类别">
            <el-option v-for="(item, index) in categoryList" :label="item.name" :value="item.id"/>
          </el-select>
          <el-button class="updateBookFormButton" @click="openCategoryManagementDialog">类别管理</el-button>
        </el-form-item>
        <el-form-item class="updateBookFormItem" label="书本名称" :label-width="updateBookDialogFormItemLabelWidth">
          <el-input class="updateBookFormInput" v-model="updateBookForm.bookName" maxlength="150"
                    placeholder="请输入书本名称"></el-input>
        </el-form-item>
        <el-form-item class="updateBookFormItem" label="书本文件" :label-width="updateBookDialogFormItemLabelWidth">
          <el-button class="updateBookFormButton" type="primary" v-loading="uploadBookDocumentLoading"><label
              for="uploadBookDocument">导入</label></el-button>
          <input type="file" id="uploadBookDocument" ref="upload" style="display: none"
                 @change="uploadBookDocument($event,'update')"/>
          <div class="originalDocumentName" v-if="!isEmpty(updateBookForm.document)" @click="downloadDocument({
            id: updateBookForm.document.id
          })">
            {{ updateBookForm.document.originalDocumentName }}
          </div>
        </el-form-item>
        <el-form-item class="updateBookFormItem" label="封面文件" :label-width="updateBookDialogFormItemLabelWidth">
          <el-button class="updateBookFormButton" type="primary" v-loading="uploadBookCoverDocumentLoading"><label
              for="uploadBookCoverDocument">导入</label>
          </el-button>
          <input type="file" id="uploadBookCoverDocument" ref="upload" style="display: none"
                 @change="uploadBookCoverDocument($event,'update')"/>
          <el-image class="coverImage" v-if="!isEmpty(updateBookForm.coverDocument)"
                    :src="'/api/document/download/' + updateBookForm.coverDocument.id" fit="contain" @click="downloadDocument({
                              id: updateBookForm.coverDocument.id
                            })"></el-image>
        </el-form-item>
      </el-form>

      <div class="updateBookDialogFooter">
        <el-button @click="closeAddBookDialog">取消</el-button>
        <el-button type="primary"
                   @click="updateBook({id: updateBookForm.id,categoryId: updateBookForm.bookCategoryId,name: updateBookForm.bookName,coverDocumentId: updateBookForm.coverDocument.id,originalDocumentId: updateBookForm.document.id})">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import draggable from "vuedraggable";

import Header from "@/components/header/index.vue";
import SidebarMenu from "@/components/sidebarMenu/index.vue";

import {documentUpload, documentUploadBook} from "@/apis/document";

import {isEmpty} from "@/utils/common";
import {categoryAdd, categoryDeleteById, categoryGetListSortBySort, categoryUpdateList} from "@/apis/category";
import {bookAdd, bookDeleteById, bookQueryPage, bookUpdate} from "@/apis/book";
import {userGetUserByToken} from "@/apis/user";

export default {
  name: "BookManagement",
  components: {draggable, SidebarMenu, Header},
  data() {
    return {
      user: {},

      queryPageForm: {
        categoryId: null,
        name: null
      },

      bookList: [],
      categoryList: [],

      page: 1,
      pageSize: 3,
      total: 0,

      addBookDialogVis: false,
      addBookDialogFormItemLabelWidth: '80px',
      addBookForm: {
        bookCategoryId: null,
        bookName: null,
        document: {},
        coverDocument: {},
      },

      categoryManagementDialogVis: false,
      categoryManagementDialogFormItemLabelWidth: '50px',
      categoryManagementForm: {
        categoryName: null,
      },

      updateBookDialogVis: false,
      updateBookDialogFormItemLabelWidth: '80px',
      updateBookForm: {
        id: null,
        bookCategoryId: null,
        bookName: null,
        document: {},
        coverDocument: {},
      },

      uploadBookDocumentLoading: false,
      uploadBookCoverDocumentLoading: false,
    }
  },
  async created() {
    await this.getUserByToken()

    this.initQueryPageForm()
    this.initAddBookForm()
    this.initCategoryManagementForm()
    this.initUpdateBookForm()

    this.queryPageBook({
      page: this.page,
      pageSize: this.pageSize,
      categoryId: this.queryPageForm.categoryId,
      name: this.queryPageForm.name
    })
    this.getCategoryList()
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
        categoryId: null,
        name: null
      }
    },
    initAddBookForm() {
      this.addBookForm = {
        bookCategoryId: null,
        bookName: null,
        document: {},
        coverDocument: {}
      }
    },
    initCategoryManagementForm() {
      this.categoryManagementForm = {
        categoryName: null,
      }
    },
    initUpdateBookForm(book) {
      if (!isEmpty(book)) {
        this.updateBookForm = {
          id: book.id,
          bookCategoryId: book.categoryId,
          bookName: book.name,
          document: book.document,
          coverDocument: book.coverDocument,
        }
      }
    },

    addBook(addBookForm) {
      if (isEmpty(addBookForm.categoryId)) {
        this.$message.error("请选择书本类别")
        return
      } else if (isEmpty(addBookForm.name)) {
        this.$message.error("请输入书本名称")
        return
      } else if (isEmpty(addBookForm.originalDocumentId)) {
        this.$message.error("请上传书本文件")
        return
      } else if (isEmpty(addBookForm.coverDocumentId)) {
        this.$message.error("请上传封面文件")
        return
      }

      bookAdd({
        categoryId: addBookForm.categoryId,
        name: addBookForm.name,
        coverDocumentId: addBookForm.coverDocumentId,
        originalDocumentId: addBookForm.originalDocumentId,
      }).then((res) => {
        if (res.data.code === 200) {
          this.closeAddBookDialog()
          this.queryPageBook({
            page: this.page,
            pageSize: this.pageSize,
            categoryId: this.queryPageForm.categoryId,
            name: this.queryPageForm.name
          })
          this.$message.success("新增成功")
        } else {
          console.log(res)
          this.$message.error(res.data.msg)
        }
      }).catch((err) => {
        console.log(err)
        this.$message.error("服务器异常，请联系管理员")
      })
    },
    queryPageBook(queryPageBookForm) {
      bookQueryPage({
        page: queryPageBookForm.page,
        pageSize: queryPageBookForm.pageSize,
        categoryId: isEmpty(queryPageBookForm.categoryId) ? null : queryPageBookForm.categoryId,
        name: isEmpty(queryPageBookForm.name) ? null : queryPageBookForm.name,
      }).then((res) => {
        if (res.data.code === 200) {
          this.bookList = res.data.bookPage.records
          this.total = res.data.bookPage.total

          if (res.data.bookPage.pages < this.page) {
            this.page = res.data.bookPage.pages
            this.queryPageBook({
              page: res.data.bookPage.pages,
              pageSize: queryPageBookForm.pageSize,
              categoryId: isEmpty(queryPageBookForm.categoryId) ? null : queryPageBookForm.categoryId,
              name: isEmpty(queryPageBookForm.name) ? null : queryPageBookForm.name,
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
    deleteBookById(deleteBookByIdForm) {
      bookDeleteById({
        id: deleteBookByIdForm.id
      }).then((res) => {
        if (res.data.code === 200) {
          this.queryPageBook({
            page: this.page,
            pageSize: this.pageSize,
            categoryId: this.queryPageForm.categoryId,
            name: this.queryPageForm.name
          })
          this.$message.success("删除成功")
        } else {
          console.log(res)
          this.$message.error(res.data.msg)
        }
      }).catch((err) => {
        console.log(err)
        this.$message.error("服务器异常，请联系管理员")
      })
    },
    uploadBookDocument(event, type) {
      if (event.target.files[0] === undefined) {
        return
      } else if (event.target.files[0].name.substring(event.target.files[0].name.lastIndexOf('.') + 1) !== 'pdf') {
        this.$message.error("只支持pdf类型")
        return
      }

      this.uploadBookDocumentLoading = true
      documentUploadBook({
        document: event.target.files[0],
      }).then((res) => {
        if (res.data.code === 200) {
          if (type === 'add') {
            this.addBookForm.document = res.data.addDocumentVO
            this.addBookForm.coverDocument = isEmpty(this.addBookForm.coverDocument) ? res.data.coverDocument : this.addBookForm.coverDocument
          } else if (type === 'update') {
            this.updateBookForm.document = res.data.addDocumentVO
            this.updateBookForm.coverDocument = isEmpty(this.updateBookForm.coverDocument) ? res.data.coverDocument : this.updateBookForm.coverDocument
          }
          this.$message.success("上传成功")
        } else {
          console.log(res)
          this.$message.error(res.data.msg)
        }
      }).catch((err) => {
        console.log(err)
        this.$message.error("服务器异常，请联系管理员")
      }).finally(() => {
        document.getElementById('uploadBookDocument').value = null
        this.uploadBookDocumentLoading = false
      })
    },
    uploadBookCoverDocument(event, type) {
      if (event.target.files[0] === undefined) {
        return
      } else if (['png', 'jpg'].indexOf(event.target.files[0].name.substring(event.target.files[0].name.lastIndexOf('.') + 1)) === -1) {
        this.$message.error("只支持png或jpg类型")
        return
      }

      this.uploadBookCoverDocumentLoading = true
      documentUpload({
        document: event.target.files[0],
      }).then((res) => {
        if (res.data.code === 200) {
          if (type === 'add') {
            this.addBookForm.coverDocument = res.data.addDocumentVO
          } else if (type === 'update') {
            this.updateBookForm.coverDocument = res.data.addDocumentVO
          }
          this.$message.success("上传成功")
        } else {
          console.log(res)
          this.$message.error(res.data.msg)
        }
      }).catch((err) => {
        console.log(err)
        this.$message.error("服务器异常，请联系管理员")
      }).finally(() => {
        document.getElementById('uploadBookCoverDocument').value = null
        this.uploadBookCoverDocumentLoading = false
      })
    },
    addCategory(addCategoryForm) {
      if (isEmpty(addCategoryForm.name)) {
        this.$message.error("类别名称不能为空")
        return
      }

      categoryAdd({
        name: addCategoryForm.name
      }).then((res) => {
        if (res.data.code === 200) {
          this.initCategoryManagementForm()
          this.getCategoryList()
          this.$message.success("新增成功")
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
    updateCategorySort(updateCategorySortForm) {
      for (let i = 0; i < updateCategorySortForm.categoryList.length; i++) {
        updateCategorySortForm.categoryList[i].sort = i + 1;
      }
      categoryUpdateList({
        categoryList: updateCategorySortForm.categoryList
      }).then((res) => {
        if (res.data.code === 200) {
          this.getCategoryList();
        } else {
          console.log(res)
          this.$message.error(res.data.msg)
        }
      }).catch((err) => {
        console.log(err)
        this.$message.error("服务器异常，请联系管理员")
      })
    },
    deleteCategoryById(deleteCategoryByIdForm) {
      categoryDeleteById({
        id: deleteCategoryByIdForm.id
      }).then((res) => {
        if (res.data.code === 200) {
          for (let i = 0; i < this.categoryList.length; i++) {
            if (this.categoryList[i].id === deleteCategoryByIdForm.id) {
              this.categoryList.splice(i, 1)
              break
            }
          }
          this.updateCategorySort({
            categoryList: this.categoryList
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
    downloadDocument(downloadFileForm) {
      let a = document.createElement('a')
      a.href = '/api/document/download/' + downloadFileForm.id
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    },
    updateBook(updateBookForm) {
      console.log(this.updateBookForm)
      if (isEmpty(updateBookForm.id)) {
        this.$message.error("服务器异常，请联系管理员")
        return;
      } else if (isEmpty(updateBookForm.categoryId)) {
        this.$message.error("请选择书本类别")
        return
      } else if (isEmpty(updateBookForm.name)) {
        this.$message.error("请输入书本名称")
        return
      } else if (isEmpty(updateBookForm.originalDocumentId)) {
        this.$message.error("请上传书本文件")
        return
      } else if (isEmpty(updateBookForm.coverDocumentId)) {
        this.$message.error("请上传封面文件")
        return
      }

      bookUpdate({
        id: updateBookForm.id,
        categoryId: updateBookForm.categoryId,
        name: updateBookForm.name,
        coverDocumentId: updateBookForm.coverDocumentId,
        originalDocumentId: updateBookForm.originalDocumentId,
      }).then((res) => {
        if (res.data.code === 200) {
          this.closeUpdateBookDialog()
          this.queryPageBook({
            page: this.page,
            pageSize: this.pageSize,
            categoryId: this.queryPageForm.categoryId,
            name: this.queryPageForm.name
          })
          this.$message.success("新增成功")
        } else {
          console.log(res)
          this.$message.error(res.data.msg)
        }
      }).catch((err) => {
        console.log(err)
        this.$message.error("服务器异常，请联系管理员")
      })
    },

    openAddBookDialog() {
      this.initAddBookForm();
      this.addBookDialogVis = true;
    },
    closeAddBookDialog() {
      this.addBookDialogVis = false;
    },
    openCategoryManagementDialog() {
      this.initCategoryManagementForm()
      this.categoryManagementDialogVis = true
    },
    openUpdateBookDialog(book) {
      this.initUpdateBookForm({
        id: book.id,
        categoryId: book.categoryId,
        name: book.name,
        document: book.document,
        coverDocument: book.coverDocument
      })
      this.updateBookDialogVis = true
    },
    closeUpdateBookDialog() {
      this.updateBookDialogVis = false;
    },

    selectPage(page) {
      this.page = page
      this.queryPageBook({
        page: this.page,
        pageSize: this.pageSize,
        categoryId: this.queryPageForm.categoryId,
        name: this.queryPageForm.name
      })
    },

    categoryIdToCategory(categoryId) {
      for (let i = 0; i < this.categoryList.length; i++) {
        if (this.categoryList[i].id === categoryId) {
          return this.categoryList[i]
        }
      }
      return null;
    },

    toLogin() {
      this.$router.push("/login")
    },

    isEmpty,
  }
}
</script>

<style scoped>
#bookManagement {
  display: flex;

  flex-flow: column;

  width: 100%;
  height: 100%;
}

#bookManagement .middle {
  display: flex;

  flex-flow: row;

  flex: 1;

  width: 100%;
  height: 0;
}

#bookManagement .middle .main {
  display: flex;

  flex-flow: column;

  flex: 1;

  width: 0;
  height: 100%;
}

#bookManagement .middle .main .searchContainer {
  width: 100%;
}

#bookManagement .middle .main .searchContainer .searchInput {
  margin: 20px 0 0 20px;

  width: 200px;
}

#bookManagement .middle .main .controlContainer .controlButton {
  margin: 10px 0 0 20px;
}

#bookManagement .middle .main .tableContainer {
  flex: 1;

  text-align: center;
}

#bookManagement .middle .main .tableContainer /deep/ .el-scrollbar__wrap {
  overflow-x: hidden;
  overflow-y: hidden;
}

#bookManagement .middle .main .tableContainer .table {
  margin: 0 auto 0 auto;

  width: 90%;
}

#bookManagement .addBookDialog .addBookForm .addBookFormItem {
  margin: 0 0 10px 0;
}

#bookManagement .addBookDialog .addBookForm .addBookFormItem .addBookFormInput {
  width: 240px;
}

#bookManagement .addBookDialog .addBookForm .addBookFormItem .addBookFormButton {
  padding-right: 0;
  padding-left: 0;

  width: 80px;

  text-align: center;
}

#bookManagement .addBookDialog .addBookForm .addBookFormItem .originalDocumentName {
  cursor: pointer;
}

#bookManagement .addBookDialog .addBookForm .addBookFormItem .coverImage {
  display: block;

  margin: 3px 0 0 0;

  width: 100px;
  height: 150px;

  border: 1px solid #aaaaaa;

  cursor: pointer;
}

#bookManagement .addBookDialog .addBookDialogFooter {
  text-align: right;
}

#bookManagement .categoryManagementDialog .categoryManagementForm .categoryManagementFormItem {
  margin: 0 0 6px 0;
}

#bookManagement .categoryManagementDialog .categoryManagementForm .categoryManagementFormItem .categoryManagementFormInput {
  width: 240px;
}

#bookManagement .categoryManagementDialog .divider {
  margin: 6px 0 6px 0;
}

#bookManagement .categoryManagementDialog .categoryList {
  width: 100%;
}

#bookManagement .categoryManagementDialog .categoryList .categoryListItem {
  display: inline-block;

  margin: 2px 2px 2px 2px;
  padding: 3px 6px 3px 6px;

  border-radius: 8px;

  background-color: aquamarine;

  user-select: none;
}

#bookManagement .categoryManagementDialog .categoryList .categoryListItem .categoryDeleteButton {
  cursor: pointer;
}

#coverImageTemplate .coverImage {
  width: 60px;
  height: 90px;

  border: 1px solid #aaaaaa;

  cursor: pointer;
}

#bookManagement .updateBookDialog .updateBookForm .updateBookFormItem {
  margin: 0 0 10px 0;
}

#bookManagement .updateBookDialog .updateBookForm .updateBookFormItem .updateBookFormInput {
  width: 240px;
}

#bookManagement .updateBookDialog .updateBookForm .updateBookFormItem .updateBookFormButton {
  padding-right: 0;
  padding-left: 0;

  width: 80px;

  text-align: center;
}

#bookManagement .updateBookDialog .updateBookForm .updateBookFormItem .originalDocumentName {
  cursor: pointer;
}

#bookManagement .updateBookDialog .updateBookForm .updateBookFormItem .coverImage {
  display: block;

  margin: 3px 0 0 0;

  width: 100px;
  height: 150px;

  border: 1px solid #aaaaaa;

  cursor: pointer;
}

#bookManagement .updateBookDialog .updateBookDialogFooter {
  text-align: right;
}
</style>