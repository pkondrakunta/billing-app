'use strict';

const {
  app,
  Menu,
  BrowserWindow
} = require('electron');

// require('electron-reload')(__dirname);


function createWindow() {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    show: false
  })
  
  win.maximize();
  win.loadFile('home.html');
  win.show();
}

// Menu.setApplicationMenu(null);
app.on('ready', createWindow)

