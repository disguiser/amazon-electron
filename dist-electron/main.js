"use strict";
const { app, BrowserWindow, Notification } = require("electron");
const path = require("path");
const isDev = process.env.NODE_ENV === "development";
const createWindow = async () => {
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  win.maximize();
  win.show();
  if (isDev) {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../dist", "index.html"));
  }
};
const NOTIFICATION_TITLE = "Vue + TypeScript + Electron";
const NOTIFICATION_BODY = "Your application is now running!";
function showNotification() {
  new Notification({ title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY }).show();
}
app.whenReady().then(() => {
  createWindow();
  showNotification();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin")
    app.quit();
});
