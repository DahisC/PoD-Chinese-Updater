const fs = require('fs');
const https = require('https');
const AdmZip = require('adm-zip');

const headers = {
  'User-Agent': 'PoD Chinese Localization Updater',
};

const getLatestVersionInfo = () =>
  new Promise((resolve, reject) => {
    let buffer = '';
    https.get(
      'https://api.github.com/repos/dahisc/release-test/releases/latest',
      { headers },
      (res) => {
        console.log(res.headers['content-length']);
        res.on('data', (chunk) => {
          buffer += chunk;
        });
        res.on('end', () => {
          resolve(JSON.parse(buffer));
        });
        res.on('error', (err) => {
          reject(error);
        });
      }
    );
  });

const downloadLatestFile = (latestVersion) =>
  new Promise((resolve, reject) => {
    https.get(
      `https://codeload.github.com/DahisC/release-test/zip/${latestVersion}`,
      { headers },
      (res) => {
        const ws = fs.createWriteStream(__dirname + '/123.zip');
        res.pipe(ws);
        ws.on('finish', () => {
          resolve('Download succeeded.');
        });
        ws.on('error', () => {
          reject('Download failed.');
        });
      }
    );
  });

const uncompressZipFile = () =>
  new Promise(async (resolve, reject) => {
    const zip = new AdmZip('./123.zip');
    const zipEntries = zip.getEntries();
    zipEntries.forEach((entry) => {
      if (entry.entryName.split('/')[1] === 'data' && entry.isDirectory) {
        zip.extractEntryTo(entry, __dirname + '/data', false, true);
      }
    });
  });

const execute = async () => {
  const versionInfo = await getLatestVersionInfo();
  const latestVersion = versionInfo.tag_name;
  await downloadLatestFile(latestVersion);
  await uncompressZipFile();
  //fs.unlink(__dirname + '/123.zip');
};

execute();

// https.get(
//   'https://api.github.com/repos/DahisC/release-test/zipball/0.2',
//   {
//     headers: {
//       'User-Agent': 'PoD Updater',
//     },
//   },
//   (res) => {
//     res.on('data', (chunk) => {
//       // chunk.pipe(fs.createWriteStream(__dirname + '/123.zip'));
//       console.log(chunk);
//     });
//   }
// );

// const readStream = fs.createReadStream(__dirname + '/read.txt');

// readStream.pipe(writeStream);

// fs.readdir('./', (err, files) => {
//   console.log(files);
// });

// console.log('歡迎使用 Path of Diablo 中文化更新器 <3');
// console.log('更新器作者：Dahis');
// console.log('中文化作者：MarsFlyPig');

// https://api.github.com/repos/DahisC/release-test/releases/latest

// https.get(
//   'https://raw.githubusercontent.com/DahisC/release-test/master/version.json',
//   (response) => {
//     console.log('中文化');
//     response.on('data', function (chunk) {
//       const patchInfo = JSON.parse(chunk.toString());
//       console.log(patchInfo.version);
//     });
//   }
// );

// const latestUpdate = https.get(
//   'https://github.com/DahisC/release-test/archive/0.2.tar.gz'
// );

// https.get(
//   'https://github.com/DahisC/release-test/archive/0.2.tar.gz',
//   (response) => {
//     response.on('data', (chunk) => {
//       console.log(chunk);
//     });
//   }
// );
