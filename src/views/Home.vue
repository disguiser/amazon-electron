<template>
  <div class="home">
    <n-card title="Amazon 产品爬虫" class="main-card">
      <div class="control-panel">
        <n-form label-placement="left" label-width="80">
          <n-form-item label="站点选择">
            <n-select
              v-model:value="chosenSite"
              :options="sites"
              label-field="key"
              value-field="key"
              class="selector"
            />
          </n-form-item>

          <n-form-item label="抓取间隔">
            <n-input-number
              v-model:value="sleepSecond"
              :disabled="inProcess"
              :min="1"
              class="input-number"
            />
            <span class="unit">秒</span>
          </n-form-item>

          <n-form-item label="产品 ID 列表">
            <n-input
              v-model:value="ids"
              type="textarea"
              :disabled="inProcess || !chosenSite"
              placeholder="请输入产品ID，每行一个"
              :autosize="{ minRows: 6, maxRows: 10 }"
            />
            <template #feedback>
              <div class="hint">每行输入一个产品ID</div>
            </template>
          </n-form-item>
        </n-form>

        <div class="action-bar">
          <n-button
            type="primary"
            @click="startSpider"
            :disabled="inProcess"
            :loading="inProcess"
          >
            {{ inProcess ? '处理中...' : '开始抓取' }}
          </n-button>
        </div>
      </div>
    </n-card>

    <n-card title="日志" class="log-card">
      <template #header-extra>
        <n-button quaternary type="info" @click="clearLog" size="small">
          清空日志
        </n-button>
      </template>
      <n-spin :show="inProcess">
        <div class="log-container" ref="logContainer" v-html="logMessages || '暂无日志信息...'"></div>
        <template #description>
          <span v-if="inProcess">正在处理中...</span>
        </template>
      </n-spin>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch, nextTick } from 'vue'
import {
  NButton,
  NCard,
  NSelect,
  NInput,
  NInputNumber,
  NForm,
  NFormItem,
  NSpin,
  useMessage
} from 'naive-ui'

// 初始化消息组件
const message = useMessage()

const logMessages = ref('')
const ids = ref('');
const sleepSecond = ref(10);
const chosenSite = ref('');
const sites = [
  {
    key: 'AU',
    url: 'https://www.amazon.com.au/dp/'
  },
  {
    key: 'UK',
    url: 'https://www.amazon.co.uk/dp/'
  },
  {
    key: 'US',
    url: 'https://www.amazon.com/dp/'
  }
]
const siteObj = sites.reduce((acc, site) => {
  acc[site.key] = site.url;
  return acc;
}, {} as Record<string, string>);
const inProcess = ref(false);
const logContainer = ref<HTMLDivElement | null>(null);

// 发送消息到主进程
const startSpider = () => {
  if (!ids.value.trim()) {
    message.warning('请输入至少一个产品ID');
    return;
  }

  const urlArr = Array.from(new Set(ids.value.trim().split('\n')))
    .filter(id => id.trim())
    .map(id => `${siteObj[chosenSite.value]}${id.trim()}`);

  if (urlArr.length === 0) {
    message.warning('没有有效的产品ID');
    return;
  }

  inProcess.value = true;
  message.success(`开始处理，共 ${urlArr.length} 个产品`);
  logMessages.value += `<span class="log-info">开始处理，共 ${urlArr.length} 个产品</span><br/>`;
  window.electronAPI.send('do-spider', { urls: urlArr, sleepSecond: sleepSecond.value });
}

// 清除日志
const clearLog = () => {
  logMessages.value = '';
  message.info('日志已清空');
}

// 在组件挂载时注册事件监听器
onMounted(() => {
  window.electronAPI.on('spider-log', (msg) => {
    logMessages.value += `<span class="log-time">[${new Date().toLocaleTimeString()}]</span> ${msg}<br/>`;
  });

  window.electronAPI.on('process-done', () => {
    inProcess.value = false;
    logMessages.value += '<span class="log-success">所有任务已完成!</span><br/>';
    message.success('所有任务已完成!');
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
});
</script>

<style scoped>
.home {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.main-card {
  margin-bottom: 20px;
}

.control-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.unit {
  margin-left: 5px;
}

.selector {
  width: 200px;
}

.input-number {
  width: 100px;
}

.hint {
  font-size: 12px;
  color: #999;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.log-card {
  margin-top: 20px;
}

.log-container {
  height: 300px;
  overflow-y: auto;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.log-time {
  color: #7e7e7e;
  font-weight: 500;
}

.log-info {
  color: #2080f0;
  font-weight: 500;
}

.log-success {
  color: #18a058;
  font-weight: 500;
}
</style>