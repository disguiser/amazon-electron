<template>
  <div class="home">
    <div>
      <button @click="startSpider">开始</button>
    </div>
    <textarea v-model="urls" rows="10" cols="50"></textarea>
    <div class="log">{{ logMessages }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'Home',
  components: {
  },
  setup() {
    const logMessages = ref('')
    const urls = ref('');

    // 发送消息到主进程
    const startSpider = () => {
      const urlArr = urls.value.split('\n');
      console.log(urlArr); 
      window.electronAPI.send('renderer-to-main', urlArr);
    }
    window.electronAPI.on('spider-log', (msg) => {
      logMessages.value += msg + '\n'
    })
    return {
      urls,
      logMessages,
      startSpider
    }
  }
})
</script>

<style scoped>
.home {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

button {
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #3aa876;
}

textarea {
  width: 100%;
  min-height: 300px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
}
</style>