# Electron IPC Pattern

## What is IPC?

IPC stands for Inter-process Communication. It is a operating system mechanism that allows processes to communicate with each other and synchronize their actions. It is like a method of co-operation between them. As a OS mechanism, this is not an Electron specific feature.

## Types of IPC

There are a few ways to implement IPC. The most common ones are:

- Shared Memory
- Message Passing (used in Electron)

### Message Passing

The message passing method does not use any kind of shared memory. If two processes want to communicate with each other, they:

1. Establish a communication link
2. Start exchanging messages using basic send() and receive()

## Electron Process Model

In order to understand why Electron uses the IPC mechanism, we need first to understand the Electron architecture.

Electron uses a multi-process architecture inherited from Chromium, that’s what makes the app look pretty much the same as a web browser. On Chromium you can have multiple windows with their own processes in memory, limiting the harm that some buggy code could cause to the app.

In Electron, we can control two types of processes: main and renderer.

### Main Process

The main process is responsible for controlling the app’s lifecycle, creating and managing the app’s windows, and run in a full Node.js environment, which means it has the ability to `require` modules and use all of Node.js APIs. It is not a server per se, but we can make an analogy that this would be our server running in the client.

So the main process is the starting point of our application, where the window and menus will be created, global shortcuts registered, and more.

### Renderer Process

A renderer is responsible for _rendering_ web content. The code run in the renderer process should follow the web standards that we are all used to, such as having an HTML file as an entry point for the renderer process, using CSS, and execute JS through the `<script>` element.

Now, you might be wondering how the renderer process can interact with the main Electron’s native desktop functionalities. If it was a regular website we’d use something like http requests but in Electron here is where the IPC mechanism comes handy.

## Electron IPC

IPC is the only way to perform tasks, such as calling a native API from our UI or triggering changes in our web content from native menus.

In Electron, the communication is made by passing messages through channels that we can name whatever we want, as seen in the examples below.

### Preload Scripts

Preload scripts are executed after the renderer process creating but before its content begins loading. Preload Scripts are granted more privileges and have access to some of the Node.js APIS.

These scripts share a global `window` interface between processes so our renderer can consume data coming from the main process via `window`.

## Examples

### Renderer to main process

```javascript
// preload.js
const { contextBridge, ipcRenderer } = require('electron');

const API = {
	sendMessage: (message) => ipcRenderer.send('send-message', message);
}

contextBridge.exposeInMainWorld('myApi', API);

// renderer.js
sendMessageBtn.addEventListener('click', () => {
  window.myApi.sendMessage(message);
});

// main.js
const { ipcMain } = require('electron');

ipcMain.on('send-message', (event, args) => {
	console.log(args);
});
```

### Main to renderer process

```javascript
// main.js
mainWindow.webContents.send('send-message-from-main', message);

// preload.js
const { contextBridge, ipcRenderer } = require('electron');

const API = {
  receiveMsgFromMain: (callback) => {
    ipcRenderer.on('send-message-from-main', (event, args) => {
      callback(args);
    });
  },
};

contextBridge.exposeInMainWorld('myAPI', API);

// renderer.js
window.myAPI.receiveMsgFromMain((data) => {
  console.log(data);
});
```

### Render to Main and back with return

```javascript
// renderer.js
getTwoWayMsg.addEventListener('click', async () => {
  const messageFromMain = await window.myApi.fetchMsgFromMain(
    'hey, send me a message!'
  );

  console.log(messageFromMain); // There you go! (from main process)
});

// preload.js
const { contextBridge, ipcRenderer } = require('electron');

const API = {
  fetchMsgFromMain: (message) =>
    ipcRenderer.invoke('hey-main-send-me-stuff', message),
};

contextBridge.exposeInMainWorld('myAPI', API);

// main.js
ipcMain.handle('hey-main-send-me-stuff', (event, args) => {
  console.log(args); // hey, send me a message! (from renderer process)

  return 'There you go!';
});
```
