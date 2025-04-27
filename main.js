const { app, BrowserWindow, Notification } = require('electron')
// const path = require('path')

const createWindow = async () => {
  const win = new BrowserWindow({
    show: false,
    // webPreferences: {
    //   preload: path.join(__dirname, 'preload.js')
    // }
  })
  win.maximize()
  win.show()

  win.loadFile('index.html')
}
const NOTIFICATION_TITLE = 'Basic Notification'
const NOTIFICATION_BODY = 'Notification from the Main process'

function showNotification () {
  new Notification({ title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY }).show()
}
app.whenReady().then(() => {
  createWindow()
  showNotification()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})