<template>
  <div id="bookReader">
    <div class="book" ref="book">
      <div v-for="(page, index) in pages" :key="index" class="page">
        <h3>{{ page.title }}</h3>
        <p>{{ page.content }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import $ from 'jquery';
import '@/utils/turn';

export default {
  data() {
    return {
      pages: [
        {title: '封面', content: '封面内容'},
        {title: '第一页', content: '第一页内容'},
        {title: '第二页', content: '第二页内容'},
        {title: '封底', content: '封底内容'}
      ]
    };
  },
  mounted() {
    this.initTurnJs();
  },
  methods: {
    initTurnJs() {
      $(this.$refs.book).turn({
        width: this.$refs.book.clientHeight / 3 * 4,
        height: this.$refs.book.clientHeight,
        autoCenter: true
      });
    }
  }
};
</script>

<style scoped>
#bookReader {
  width: 100%;
  height: 100%;
}

#bookReader .book {
  height: 90%;
  aspect-ratio: 4 / 3;
}

#bookReader .book .page {
  width: 100%;
  height: 100%;
  background-color: #fff;
  text-align: center;
  box-sizing: border-box;
}
</style>