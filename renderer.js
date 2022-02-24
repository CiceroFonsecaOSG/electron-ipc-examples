const messageInput = document.querySelector('.input-message');
const sendMsgBtn = document.querySelector('.send-message');
const mainMessageInput = document.querySelector('.main-message');
const openFile = document.querySelector('.get-message');
const getTwoWayMsg = document.querySelector('.get-two-way-message');

// Send message to main process
sendMsgBtn.addEventListener('click', () => {
  window.myApi.sendMessage(messageInput.value);
});

// Receive message from main process
openFile.addEventListener('click', () => {
  window.myApi.openFile();

  window.myApi.receiveMsgFromMain((data) => {
    mainMessageInput.value = data;
  });
});

// Send to Main and get return
getTwoWayMsg.addEventListener('click', async () => {
  const messageFromMain = await window.myApi.fetchMsgFromMain(
    'hey, send me a message!'
  );

  console.log(messageFromMain); // There you go! (from main process)
});
