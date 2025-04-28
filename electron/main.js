const { app, BrowserWindow, Notification, ipcMain } = require('electron')
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'

let win;
const createWindow = async () => {
  win = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // 指定预加载脚本
      contextIsolation: true, // 保持启用（安全）
      nodeIntegration: false, // 禁用（安全）
    }
  })
  win.maximize()
  win.show()

  // In development mode, load from vite dev server
  // In production mode, load the built index.html
  if (isDev) {
    win.loadURL('http://localhost:5173')
    // Open DevTools
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../dist', 'index.html'))
  }
}

const NOTIFICATION_TITLE = 'Vue + TypeScript + Electron'
const NOTIFICATION_BODY = 'Your application is now running!'

function showNotification () {
  new Notification({ title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY }).show()
}

app.whenReady().then(async () => {
  createWindow()
  showNotification()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('renderer-to-main', async (event, urls) => {
  console.log('收到渲染进程的消息:', urls);
  const { setSendLog, doSpider } = await import('./hello.mjs');
  setSendLog(sendSpiderLog);
  for (const url of urls) {
    doSpider(url);
  }
});

function sendSpiderLog(msg) {
  win.webContents.send('spider-log', msg);
}
