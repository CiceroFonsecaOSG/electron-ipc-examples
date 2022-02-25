const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
let mainWindow = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  secondWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile('index.html');
  secondWindow.loadFile('index.html');
};

app.whenReady().then(() => {
  createWindow();
});

// Renderer to Main Process
ipcMain.on('send-message', (event, args) => {
  console.log(args);
});

// Main to renderer process
ipcMain.on('open-file-from-user', () => {
  dialog
    .showOpenDialog(secondWindow, {
      properties: ['openFile'],
    })
    .then((res) => {
      secondWindow.webContents.send(
        'send-message-from-main',
        `Here is the file: ${res.filePaths[0]}`
      );
    });

  newDialog
    .showOpenDialog(mainWindow, {
      properties: ['openFile'],
    })
    .then((res) => {
      mainWindow.webContents.send(
        'send-message-from-main',
        `Here is the file: ${res.filePaths[0]}`
      );
    });
});

// Renderer to Main and back to Renderer
ipcMain.handle('hey-main-send-me-stuff', (event, args) => {
  console.log(args); // hey, send me a message! (from renderer process)

  return 'There you go!';
});
