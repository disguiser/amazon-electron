<template>
  <div class="home">
    <div>
      每个链接抓取间隔
      <input v-model="sleepSecond" type="number" :disabled="inProcess" />
      秒
      <input type="button" @click="startSpider" :disabled="inProcess" value="开始" class="button" />
    </div>
    <textarea v-model="ids" :disabled="inProcess" rows="10" cols="50"></textarea>
    日志
    <div class="log" ref="logContainer" v-html="logMessages"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch, nextTick } from 'vue'

export default defineComponent({
  name: 'Home',
  components: {
  },
  setup() {
    const logMessages = ref('')
    const ids = ref('');
    const sleepSecond = ref(10);
    const inProcess = ref(false);
    const validated = ref(true);
    const logContainer = ref<HTMLDivElement | null>(null);

    // 发送消息到主进程
    const startSpider = () => {
      if (ids.value.trim()) {
        const urlArr = Array.from(new Set(ids.value.trim().split('\n')))
        .map(e => 'https://www.amazon.com.au/dp/' + e);
        inProcess.value = true
        window.electronAPI.send('do-spider', { urls: urlArr, sleepSecond: sleepSecond.value });
      }
    }
    // 在组件挂载时注册事件监听器
    onMounted(() => {
      window.electronAPI.on('spider-log', (msg) => {
        logMessages.value += msg + '<br/>'
      });
      
      window.electronAPI.on('process-done', () => {
        inProcess.value = false;
      });
    });

    // 监听 logMessages 的变化
    watch(logMessages, async () => {
      // 等待 DOM 更新
      await nextTick();
      // 滚动到底部
      if (logContainer.value) {
        logContainer.value.scrollTop = logContainer.value.scrollHeight;
      }
    })

    return {
      ids,
      logMessages,
      sleepSecond,
      inProcess,
      validated,
      startSpider,
      logContainer
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

.button {
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.button:hover:not(:disabled) {
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

.log {
  border: 1px solid #eee;
  padding: 10px;
  height: 400px;
  overflow-y: auto;
  background-color: #f5f5f5;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>