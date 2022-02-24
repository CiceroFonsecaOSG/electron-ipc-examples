const { contextBridge, ipcRenderer } = require('electron');

const API = {
  sendMessage: (message) => ipcRenderer.send('send-message', message),
  openFile: () => ipcRenderer.send('open-file-from-user'),
  receiveMsgFromMain: (callback) => {
    ipcRenderer.on('send-message-from-main', (event, args) => {
      callback(args);
    });
  },
  fetchMsgFromMain: (message) =>
    ipcRenderer.invoke('hey-main-send-me-stuff', message),
};

contextBridge.exposeInMainWorld('myApi', API);
