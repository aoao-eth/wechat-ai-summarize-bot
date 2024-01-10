import { app, ipcMain, shell } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import { summarize } from './summarize';
import { getAllDirs } from './helpers/getAllDirs';
import { getConfig, setConfig } from './config';
import { botAccount, botStatus, logoutBot, sendAudio, sendImage, sendText, startBot } from './startBot';
import path from 'path';
import { BASE_PATH, delay, getChatHistoryFromFile, PUBLIC_PATH, saveData } from './util';
import fs from 'fs';

const isProd: boolean = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
  await app.whenReady();
  // pie.initialize(app);
  const mainWindow = createWindow('main', {
    width: 1200,
    height: 800,
    title: '群聊总结智囊',
    icon: path.join(__dirname, PUBLIC_PATH, 'logo.png'),
    backgroundColor: '#ffffff',
  });

  if (isProd) {
    await mainWindow.loadURL('app://./home.html');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    // mainWindow.webContents.openDevTools();
  }
  ipcMain.on('get-bot-status', (event, title) => {
    mainWindow.webContents.send('bot-status-reply', {
      status: botStatus,
      account: botAccount,
    });
  });
  ipcMain.on('get-chat-content', (event, args) => {
    const date = args.date;
    const roomName = args.roomName;
    const filePath = path.join(BASE_PATH, date, roomName);
    const chats = getChatHistoryFromFile(filePath);

    mainWindow.webContents.send('chat-content-replay', {
      date,
      roomName,
      chats,
    });
  });
  ipcMain.on('logout-bot', (event, title) => {
    logoutBot();
  });
  ipcMain.on('summarize', (event, { dateDir, chatFileName }) => {
    const summarizeEvent = summarize(path.join(BASE_PATH, dateDir, chatFileName));
    summarizeEvent.addListener('update', (info) => {
      console.log('summarize update', info);
      mainWindow.webContents.send('toast', info);
    });
    summarizeEvent.addListener('end', () => {
      console.log('summarize end');
      mainWindow.webContents.send('summarize-end');
      const dirs = getAllDirs();
      // 将文件夹列表发送给渲染进程
      event.sender.send('get-all-dirs-reply', dirs);
    });
  });
  ipcMain.on('get-all-dirs', (event, title) => {
    const dirs = getAllDirs();
    // 将文件夹列表发送给渲染进程
    event.sender.send('get-all-dirs-reply', dirs);
  });

  ipcMain.on('save-config', async (event, config) => {
    setConfig(config);
    // if (config.PADLOCAL_API_KEY) {
    // 更新 padlocal token 后，重新启动 bot
    await startBot(mainWindow);
    // }
    mainWindow.webContents.send('toast', `Config saved`);
  });

  ipcMain.on('show-config', async (event, config) => {
    mainWindow.webContents.send('show-config', getConfig());
  });

  ipcMain.on('start-robot', async (event, config) => {
    await startBot(mainWindow);
  });

  ipcMain.on('show-file', (e, _path) => {
    shell.showItemInFolder(path.join(BASE_PATH, _path));
  });
  ipcMain.on('open-url', (e, url) => {
    shell.openExternal(url);
  });
  ipcMain.on('send-summarize', async (e, { dateDir, chatFileName }) => {
    await sendImage(
      chatFileName.replace('.txt', ''),
      path.join(BASE_PATH, dateDir, chatFileName.replace('.txt', ' 的今日群聊总结.png'))
    );
    await delay(2000);
    try {
      await sendAudio(
        chatFileName.replace('.txt', ''),
        path.join(BASE_PATH, dateDir, chatFileName.replace('.txt', ' 的今日群聊总结.mp3'))
      );
      await delay(2000);
    } catch (e) {}

    try {
      const file = path.join(BASE_PATH, dateDir, chatFileName.replace('.txt', ' 的今日群聊总结.txt'));
      const summarized = fs.readFileSync(file).toString();
      const 评价 = summarized.match(/整体评价.*?\n/);
      const 我的建议 = summarized.match(/我的建议.*?\n/);
      const 活跃发言者 = fs
        .readFileSync(path.join(BASE_PATH, dateDir, chatFileName.replace('.txt', ' 的今日群聊总结-rank.txt')))
        .toString();

      if (评价) {
        await delay(2000);
        await sendText(
          chatFileName.replace('.txt', ''),
          评价[0] +
            '\n' +
            (我的建议 ? 我的建议[0] : '') +
            '\n' +
            活跃发言者 +
            '\n\n--------------\n' +
            (getConfig().LAST_MESSAGE ||
              '由免费、快捷、智能的 https://zhinang.ai 『智囊 AI』技术支持，你可以直接 @我 提问问题，我会自动回复你的消息')
        );
      } else {
        await sendText(
          chatFileName.replace('.txt', ''),
          活跃发言者 +
            '\n\n--------------\n' +
            (getConfig().LAST_MESSAGE ||
              '由免费、快捷、智能的 https://zhinang.ai 『智囊 AI』技术支持，你可以直接 @我 提问问题，我会自动回复你的消息')
        );
      }
    } catch (e) {}

    mainWindow.webContents.send('toast', `发送成功`);
    saveData(dateDir, chatFileName.replace('.txt', ''), {
      sended: true,
      send_time: new Date().getTime(),
    });
  });
  ipcMain.on('send-chat-content', (event, arg) => {
    const roomName = arg.roomName;
    const content = arg.content;
    sendText(roomName, content);
    console.log('send-chat-content', roomName, content);
    mainWindow.webContents.send('toast', `发送成功`);
  });
})();

app.on('window-all-closed', () => {
  app.quit();
});
