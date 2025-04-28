const { contextBridge, ipcRenderer } = require('electron');

// 安全地将 `ipcRenderer` 方法暴露给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, data) => ipcRenderer.send(channel, data), // 单向通信
  invoke: (channel, data) => ipcRenderer.invoke(channel, data), // 双向通信
  on: (channel, callback) => {
    ipcRenderer.on(channel, (event, data) => callback(data))
  }, // 响应
});