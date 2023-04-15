const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron')
const path = require('path')

var win = null;
const createWindow = () => {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })
    win.maximize();
    win.loadFile('index.html')

}

app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    createWindow()

})


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on("openDevTools", (event, arg) => {
    win.webContents.openDevTools();
});

ipcMain.on('rootDir', (event, arg) => {
    event.returnValue = app.isPackaged ? process.env.PORTABLE_EXECUTABLE_DIR : "";
});


ipcMain.on('saveNewChapter', (event, arg) =>
    event.returnValue = dialog.showSaveDialogSync(win,
        {
            defaultPath: path.join(app.isPackaged ? process.env.PORTABLE_EXECUTABLE_DIR + "/" : "", 'Articles'),
            title: 'save',
            filters: [
                { name: 'NewChapter', extensions: ['json'] }
            ],
        })
);
ipcMain.on("openRootDir", (event, arg) => {
    //open root dir in explorer
    const { exec } = require('child_process');
    exec('explorer.exe ' + path.join(app.isPackaged ? process.env.PORTABLE_EXECUTABLE_DIR + "/" : __dirname, ""), (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(stdout);
    });
});
ipcMain.on("getVersion", (event, arg) => {
    event.returnValue = app.getVersion();
});

