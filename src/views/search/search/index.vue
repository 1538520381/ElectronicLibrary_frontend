<template>
  <div id="search">
    <div class="header">
      <div class="title">汉语大藏经</div>
      <el-menu class="menu" :default-active="menuActive" mode="horizontal">
        <el-menu-item index="1">检索</el-menu-item>
      </el-menu>
    </div>
    <div class="inputContainer">
      <el-input class="input" placeholder="请输入关键词" v-model="searchText">
        <!--        <template slot="prepend">-->
        <!--          <el-select v-model="value" placeholder="请选择">-->
        <!--            <el-option-->
        <!--                v-for="item in options"-->
        <!--                :key="item.value"-->
        <!--                :label="item.label"-->
        <!--                :value="item.value">-->
        <!--            </el-option>-->
        <!--          </el-select>-->
        <!--        </template>-->
        <template slot="append">
          <el-button icon="el-icon-search" @click="search">搜索</el-button>
        </template>
      </el-input>
    </div>
    <div class="mainContainer" v-loading="searchLoading">
      <el-scrollbar class="treeContainer">
        <el-tree
            class="tree"
            ref="tree"
            :props="treeProps"
            :data="treeData"
            show-checkbox
            @check-change="handleCheckChange"
            node-key="id">
        </el-tree>
      </el-scrollbar>
      <el-scrollbar class="contentContainer">
        <div :id="'contentItem' + item.id" class="contentItem" v-for="(item,index) in paragraphs"
             v-if="visibleIds.indexOf(item.id) !== -1" @click="getFile(item.path,item.fileName)">
          <div class="fileName">
            {{ item.fileName }}
          </div>
          <div class="content" v-html="highlightParagraph(item.paragraph)">
          </div>
        </div>
      </el-scrollbar>
    </div>

    <el-drawer
        class="documentDrawer"
        size="50%"
        :title="this.document.fileName"
        :visible.sync="drawerVis"
        :direction="'rtl'">
      <div class="content">{{ this.document.content }}</div>
    </el-drawer>
  </div>
</template>

<script>
import {searchGetFile, searchSearch} from "@/apis/search";
import {isEmpty} from "@/utils/common";

export default {
  name: 'Search',
  data() {
    return {
      menuActive: '1',

      searchText: '',

      searchLoading: false,
      treeProps: {
        label: 'name',
        children: 'child'
      },
      treeData: [],
      paragraphs: [],
      searchTextBackup: '',
      visibleIds: [],
      handleFlag: 0,

      drawerVis: false,
      document: {}
    }
  },
  methods: {
    search() {
      if (isEmpty(this.searchText) || this.searchText.length <= 3) {
        this.$message.error("关键词长度需要大于3")
        return
      }
      this.searchTextBackup = this.searchText
      this.searchLoading = true
      searchSearch({
        text: this.searchText
      }).then((res) => {
        if (res.data.code === 200) {
          this.treeData = [res.data.fileTree]
          this.paragraphs = []
          this.handleFlag = 0
          this.extractParagraphs(this.treeData[0], this.treeData[0].name, "")
        } else {
          console.log(res)
          this.$message.error(res.data.msg)
        }
      }).finally(() => {
        this.searchLoading = false
        this.$refs.tree.setChecked(this.treeData[0].id, true, true);
      })
    },
    getFile(path, fileName) {
      searchGetFile({
        path: path
      }).then((res) => {
        this.document = {
          fileName: fileName,
          content: res.data.content
        }
        this.drawerVis = true
      })
    },
    extractParagraphs(node, fileName, path) {
      this.handleFlag++
      if (!isEmpty(node.child)) {
        node.child.forEach(child => {
          this.extractParagraphs(child, fileName + '  >  ' + child.name, path + "/" + child.name);
        });
      } else if (!isEmpty(node.content)) {
        let paragraphs = node.content.split(/\r\n/);
        paragraphs.forEach(paragraph => {
          if (paragraph.includes(this.searchTextBackup)) {
            this.visibleIds.push(node.id)
            this.paragraphs.push({
              id: node.id,
              fileName: fileName,
              paragraph: paragraph,
              path: path
            });
          }
        });
      }
      this.handleFlag--;
    },
    handleCheckChange(data, checked, indeterminate) {
      if (!indeterminate) {
        if (!isEmpty(data.child)) {
          data.child.forEach(child => {
            this.handleCheckChange(child, checked, indeterminate);
          });
        } else {
          if (checked) {
            if (this.visibleIds.indexOf(data.id) === -1) {
              this.visibleIds.push(data.id)
            }
          } else {
            while (this.visibleIds.indexOf(data.id) !== -1) {
              this.visibleIds.splice(this.visibleIds.indexOf(data.id), 1);
            }
          }
        }
      }
    },
    highlightParagraph(paragraph) {
      const encodedParagraph = this.escapeHtml(paragraph);
      const regex = new RegExp(this.searchTextBackup, "gi");
      return encodedParagraph.replace(regex, '<span style="color: red">' + this.searchTextBackup + '</span>');
    },
    escapeHtml(text) {
      return text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
    }
  }
}
</script>

<style scoped>
#search {
  display: inline-flex;

  flex-flow: column;

  width: 100%;
  height: 100%;
}

#search .header {
  display: inline-flex;

  flex-flow: row;

  width: 100%;
}

#search .header .title {
  font-size: 18px;
  font-weight: 400;

  display: inline-block;

  padding: 0 30px 0 30px;

  line-height: 60px;

  border-bottom: solid 1px #e6e6e6;
}

#search .header .menu {
  display: inline-block;

  flex: 1;

  width: 0;
}

#search .inputContainer {
  background-color: #F5F5DC;

  padding: 20px 0 20px 0;

  text-align: center;
}

#search .inputContainer .input {
  width: 60%;
}

#search .mainContainer {
  display: inline-flex;

  flex: 1;
  flex-flow: row;

  height: 0;
  width: 100%;

  background-color: #F6F6FC;
}

#search .mainContainer .treeContainer {
  padding: 10px 0 0 0;
  width: calc(30%);
  height: calc(100% - 10px);
}

#search .mainContainer .treeContainer /deep/ .is-horizontal {
  display: none;
}

/*
#search .mainContainer .treeContainer /deep/ .is-vertical{
  display: none;
}
 */

#search .mainContainer .treeContainer .tree {
  margin: 0 15px 0 15px;

  min-width: calc(100% - 15px * 2);

  display: inline-block !important;

  background-color: #F6F6FC;
}

#search .mainContainer .contentContainer {
  flex: 1;

  width: 0;
  height: calc(100% - 20px);

  padding: 20px 0 0 0;

  text-align: center;
}

#search .mainContainer .contentContainer /deep/ .el-scrollbar__wrap {
  overflow-x: hidden;
}

#search .mainContainer .contentContainer .contentItem {
  width: 80%;

  background-color: white;

  margin: 10px auto 10px auto;

  border: 1px solid rgb(230, 235, 245);

  font-size: 18px;
  font-weight: 400;

  text-align: left;
}

#search .mainContainer .contentContainer .contentItem:hover {
  box-shadow: #dddddd 0px 0px 6px;

  cursor: pointer;
}

#search .mainContainer .contentContainer .contentItem .fileName {
  padding: 18px 20px 18px 20px;
  border-bottom: 1px solid rgb(230, 235, 245);
}

#search .mainContainer .contentContainer .contentItem .content {
  padding: 18px 20px 18px 20px;
}

#search .documentDrawer .content {
  white-space: pre-wrap;

  margin: 20px 20px 20px 20px;
}

</style>