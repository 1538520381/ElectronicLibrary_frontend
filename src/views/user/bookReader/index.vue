<template>
  <div class="image-viewer-container">
    <!-- 左侧图片查看器 -->
    <div
      class="image-viewer-wrapper"
      @click="handleContainerClick"
      @mousemove="handleMouseMove"
    >
      <div class="image-viewer" @dragstart.prevent>
        <img
          ref="viewerImage"
          :src="imageUrl"
          :style="imageStyle"
          alt="Book Image"
        />
      </div>
    </div>

    <!-- 右侧控制面板 -->
    <div class="control-panel">
      <button @click="prevPage">上一页</button>
      <button @click="nextPage">下一页</button>
      <div class="page-jump">
        <input type="number" v-model="jumpPage" :min="1" :max="book.page" />
        <button @click="goToPage">跳转</button>
        <span> / {{ book.page }} 页</span>
      </div>
      <!-- 添加缩放控制条 -->
      <div class="zoom-control">
        <span>缩放: {{ Math.round(scale * 100) }}%</span>
        <input type="range" v-model="scale" min="1" max="3" step="0.1" />
      </div>
    </div>
  </div>
</template>

<script>
import { bookGetById } from "@/apis/book";
import { userGetUserByToken } from "@/apis/user";

export default {
  data() {
    return {
      imageUrl: "",
      scale: 1,
      isDragging: false,
      startX: 0,
      startY: 0,
      translateX: 0,
      translateY: 0,
      jumpPage: 1,
      bookId: null,
      currentPage: 1,
      book: {},
    };
  },
  async created() {
    await this.getUserByToken();

    // 从路由参数获取 bookId
    this.bookId = this.$route.params.bookId;
    this.updateImageUrl();

    this.getBookById();
  },
  watch: {
    // 监听 currentPage 变化，更新图片URL
    currentPage() {
      this.updateImageUrl();
    },
  },
  computed: {
    imageStyle() {
      return {
        transform: `scale(${this.scale}) translate(${this.translateX}px, ${this.translateY}px)`,
        cursor: this.isDragging ? "grabbing" : "grab",
        transition: this.isDragging ? "none" : "transform 0.1s ease",
      };
    },
  },
  methods: {
    getUserByToken() {
      return userGetUserByToken()
        .then((res) => {
          if (res.data.code === 200) {
            this.user = res.data.user;
          } else {
            this.toLogin();
            this.$message.error("用户未登录");
          }
        })
        .catch((err) => {
          this.toLogin();
          console.log(err);
          this.$message.error("服务器异常，请联系管理员");
        });
    },

    getBookById() {
      bookGetById({
        id: this.bookId,
      })
        .then((res) => {
          if (res.data.code === 200) {
            this.book = res.data.book;
          } else {
            this.toUserBookLibrary();
            console.log(res);
            this.$message.error(res.data.msg);
          }
        })
        .catch((err) => {
          console.log(err);
          this.toUserBookLibrary();
          this.$message.error("服务器异常，请联系管理员");
        });
    },
    updateImageUrl() {
      this.imageUrl = `/api/bookPageDocument/downloadByBookIdAndPage/${this.bookId}/${this.currentPage}`;
      // 重置缩放和位置
      this.scale = 1;
      this.translateX = 0;
      this.translateY = 0;
    },
    handleWheel(event) {
      event.preventDefault();
      const delta = Math.sign(event.deltaY);
      const img = this.$refs.viewerImage;
      const container = img.parentElement;

      // 计算最大可移动范围
      const maxY = img.offsetHeight * this.scale - container.offsetHeight;

      // 计算新的位置
      let newY = this.translateY - delta * 50; // 每次滚动移动50px

      // 限制在边界范围内
      this.translateY = Math.max(-maxY, Math.min(0, newY));
    },
    startDrag(event) {
      this.isDragging = true;
      this.startX = event.clientX - this.translateX;
      this.startY = event.clientY - this.translateY;
    },
    onDrag(event) {
      if (this.isDragging) {
        const img = this.$refs.viewerImage;
        const container = img.parentElement;

        // 计算最大可移动范围
        const maxX = img.offsetWidth * this.scale - container.offsetWidth;
        const maxY = img.offsetHeight * this.scale - container.offsetHeight;

        // 计算新的位置
        let newX = event.clientX - this.startX;
        let newY = event.clientY - this.startY;

        // 限制在边界范围内
        this.translateX = Math.max(-maxX, Math.min(0, newX));
        this.translateY = Math.max(-maxY, Math.min(0, newY));
      }
    },
    stopDrag() {
      this.isDragging = false;
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.jumpPage = this.currentPage;
      }
    },
    nextPage() {
      if (this.currentPage < this.book.page) {
        this.currentPage++;
        this.jumpPage = this.currentPage;
      }
    },
    goToPage() {
      const page = parseInt(this.jumpPage);
      if (page > 0 && page <= this.book.page) {
        this.currentPage = page;
      } else {
        this.$message.warning(
          `页码超出范围，请输入1到${this.book.page}之间的数字`
        );
      }
    },

    toUserBookLibrary() {
      this.$router.push("/user/bookLibrary");
    },

    handleContainerClick(event) {
      const container = event.currentTarget;
      const clickX = event.clientX - container.getBoundingClientRect().left;
      const containerWidth = container.offsetWidth;

      if (clickX < containerWidth / 2) {
        this.prevPage();
      } else {
        this.nextPage();
      }
    },

    handleMouseMove(event) {
      const container = event.currentTarget;
      const clickX = event.clientX - container.getBoundingClientRect().left;
      const containerWidth = container.offsetWidth;

      if (clickX < containerWidth / 2) {
        container.style.cursor = "var(--left-cursor)";
        container.style.animation = "leftArrow 1s infinite";
        this.$refs.viewerImage.style.pointerEvents = "none";
      } else {
        container.style.cursor = "var(--right-cursor)";
        container.style.animation = "rightArrow 1s infinite";
        this.$refs.viewerImage.style.pointerEvents = "none";
      }
    },
  },
};
</script>

<style scoped>
/* 添加自定义光标样式 */
@keyframes leftArrow {
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-3px);
  }
  100% {
    transform: translateX(0);
  }
}

@keyframes rightArrow {
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(3px);
  }
  100% {
    transform: translateX(0);
  }
}

.image-viewer-container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
}

.image-viewer-wrapper {
  width: 75%;
  height: 100%;
  overflow: hidden;
  position: relative;
  --left-cursor: url("@/assets/pictures/leftArrow.png") 16 16, w-resize;
  --right-cursor: url("@/assets/pictures/rightArrow.png") 16 16, e-resize;
}

.image-viewer {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  overflow: auto; /* 改为auto以显示滚动条 */
}

.control-panel {
  width: 25%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  border-left: 1px solid #ccc;
}

.control-panel button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

.page-jump {
  display: flex;
  gap: 10px;
  align-items: center;
}

.page-jump input {
  padding: 8px;
  width: 100px;
  font-size: 16px;
}

.page-jump span {
  font-size: 16px;
  color: #666;
}

img {
  width: auto;
  height: 100%;
  max-width: none;
  transform-origin: left top;
  user-select: none;
  object-fit: cover;
  pointer-events: none;
}

.zoom-control {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.zoom-control input[type="range"] {
  width: 100%;
}
</style>