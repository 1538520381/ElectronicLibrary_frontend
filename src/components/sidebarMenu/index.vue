<template>
  <div id="sidebarMenu">
    <el-menu class="menu" :default-active="active">
      <template v-for="(item,index) in menuItems">
        <el-menu-item class="menuItem" :index="item.index"
                      v-if="userType === item.userType" @click="toUrl(item.url)">
          <i class="el-icon-menu"></i>
          <span slot="title">{{ item.title }}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script>
export default {
  name: 'SidebarMenu',
  props: {
    userType: String,

    active: String,
  },
  data() {
    return {
      menuItems: [
        {
          title: '书本管理',
          index: '0',
          userType: 'admin',
          url: '/bookManagement'
        },
      ]
    }
  },
  methods: {
    toUrl(url) {
      if (window.location.pathname !== url) {
        this.$router.push(url)
      }
    }
  }
}
</script>

<style scoped>
#sidebarMenu {
  width: 200px;
  height: 100%;

  background: #F0F9FD;
}

#sidebarMenu .menu {
  width: 100%;
  height: 100%;
}

#sidebarMenu .menu .menuItem:hover {
  background: #FFFFFF;
}

#sidebarMenu .menu .menuItem:focus {
  background: #FFFFFF;
}
</style>