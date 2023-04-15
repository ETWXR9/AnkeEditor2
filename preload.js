const { contextBridge, app, clipboard, ipcRenderer, ipcMain } = require("electron");
//path
const path = require("path");
//fs  
const fs = require("fs");
//sortable
const Sortable = require("sortablejs");
//html2canvas
const html2canvas = require('html2canvas');
//request
const { request } = require("@octokit/request");


// Expose protected methods that allow the renderer process to use
contextBridge.exposeInMainWorld(
  "api", {
  rootDir: () => ipcRenderer.sendSync('rootDir'),
  //获取目录url
  join: function (...args) {
    return path.join(...args)
  },
  //获取目录下所有文件夹
  getAllDirs: (dir) => fs.readdirSync(dir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name).sort(compareFileNames),
  //读取目录下所有文件，判断后缀名是否为图片，返回url
  getImageUrl: (dir) => {
    let url = [];
    fs.readdirSync(dir).forEach(file => {
      if (['.jpg', '.png', '.gif', '.jpeg', '.bmp', '.webp'].indexOf(file.substr(-4)) > -1) {
        url.push(path.join(dir, file));

      }
    });
    console.log(url);
    return url;
  },
  readJson: (dir) => {
    //read a json file from dir and return json object
    try {
      const jsonString = fs.readFileSync(dir, 'utf8');
      return JSON.parse(jsonString);
    } catch (err) {
      console.log(err);
      return null;
    }
  },
  getAllFileName: (dir) => {
    //read all filename from dir and return fileNames
    let fileNames = [];
    fs.readdirSync(dir, { withFileTypes: true }).forEach(file => {
      //check if file is a file and not a directory
      if (file.isFile()) {
        fileNames.push(file.name);
      }
    });
    //sort fileNames using windows sort
    fileNames.sort(
      compareFileNames
    );
    return fileNames;
  },
  getAllJson: (dir) => {
    //read all json file from dir and return json object
    let jsonDirs = [];
    fs.readdirSync(dir).forEach(file => {
      if (['.json'].indexOf(file.substr(-5)) > -1) {
        jsonDirs.push(path.join(dir, file));
      }
    });
    return jsonDirs;
  },
  writeJson: (dir, json) => {
    //json to string
    const jsonString = JSON.stringify(json);
    //get file path
    const dirName = path.dirname(dir);
    //create dir if not exist
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName, { recursive: true });
    }
    //write json to dir
    fs.writeFileSync(dir, jsonString, 'utf8');
  },
  createSortable: (el, callback, config) => {
    //create sortable
    if (config) {
      Sortable.create(el, {
        animation: 150,
        onSort: callback,
        ...config
      });
    } else {
      Sortable.create(el, {
        animation: 150,
        onSort: callback,
      });
    }
  },
  getClipboard: () => clipboard.readHTML() ? clipboard.readHTML() : clipboard.readText(),
  saveNewChapter: () => ipcRenderer.sendSync('saveNewChapter'),
  saveScreenshot3: () => {
    const editDiv = document.getElementById('edit_div');
    editDiv.style.overflow = 'visible';
    html2canvas(editDiv, { backgroundColor: window.getComputedStyle(document.body).getPropertyValue('--bg-color') }).then(function (canvas) {
      // create a temporary link element to download the image
      const link = document.createElement('a');
      link.download = 'screenshot.png';
      link.href = canvas.toDataURL();
      link.click();
      editDiv.style.overflow = 'auto';
    });
  },
  openRootDir: () => ipcRenderer.send('openRootDir'),
  openDevTools: () => ipcRenderer.send('openDevTools'),
  checkVersion: () => {
    document.title = "安科编辑器" + ipcRenderer.sendSync('getVersion'),
      console.log("读取github中");
    request('GET /repos/{owner}/{repo}/releases/latest', {
      owner: 'ETWXR9',
      repo: 'AnkeEditor2'
    }).then(function (result) {
      document.getElementById("version-text").innerHTML = "最新版本为" + result.data.name;
      document.getElementById("version-text").addEventListener('click', e => {
        e.preventDefault();
        ipcRenderer.send('openUrl', result.data.html_url);
      })
    });
  },
});


function compareFileNames(a, b) {
  // 先将文件名转换为 Windows 支持的排序格式
  a = a.normalize("NFC").toUpperCase();
  b = b.normalize("NFC").toUpperCase();

  // 按照数字进行排序
  let aNum = parseInt(a);
  let bNum = parseInt(b);
  if (!isNaN(aNum) && !isNaN(bNum)) {
    return aNum - bNum;
  }

  // 按照文件名长度进行排序
  if (a.length !== b.length) {
    return a.length - b.length;
  }

  // 按照字母序进行排序
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  } else {
    return 0;
  }
}