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

ipcMain.on('do-spider', async (event, { urls, sleepSecond }) => {
  console.log('get urls from vue:', urls);
  const { setSendLog, doSpider } = await import('./spider.mjs');
  setSendLog(sendSpiderLog);
  try {
    for (let i = 0; i < urls.length; i++) {
      sendSpiderLog(`------------- ${urls[i]} -------------`);
      await doSpider(urls[i]);
      await sleep(sleepSecond * 1000);
    }
  } finally {
    win.webContents.send('process-done');
  }
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function sendSpiderLog(msg) {
  console.log(msg);
  win.webContents.send('spider-log', msg);
}
