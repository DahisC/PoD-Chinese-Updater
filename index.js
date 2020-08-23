const fs = require("fs");
const https = require("https");
const path = require("path");
const AdmZip = require("adm-zip");
const readline = require("readline");

const repo = "MarsFlyPig/PoDChineseUpdate";

const headers = {
  "User-Agent": "PoD Chinese Localization Updater",
};

const showApplicationInfo = () => {
  console.log("PoD 中文化下載器 v1.0");
  console.log("下載器作者：Dahis");
  console.log("中文化作者：MarsFlyPig");
  console.log("--------------------");
};

const checkInstallationPath = () => new Promise((resolve, reject) => {});

const getLatestVersionInfo = () =>
  new Promise((resolve, reject) => {
    console.log("[PoD 中文化下載器] - 正在取得最新的版本資訊 ...");
    let buffer = "";
    https.get(
      `https://api.github.com/repos/${repo}/releases/latest`,
      { headers },
      (res) => {
        res.on("data", (chunk) => {
          buffer += chunk;
        });
        res.on("end", () => {
          const versionInfo = JSON.parse(buffer);
          console.log("[PoD 中文化下載器] 成功取得版本資訊");
          console.log("\n");
          console.log("-------------------------");
          console.log("版本：");
          console.log(`v${versionInfo.tag_name}`);
          console.log("\n");
          console.log("更新日期：");
          console.log(new Date(versionInfo.published_at).toLocaleDateString());
          console.log("\n");
          console.log("更新內容：");
          console.log(versionInfo.body);
          console.log("-------------------------");
          console.log("\n");

          resolve(versionInfo);
        });
        res.on("error", (err) => {
          console.log("[PoD 中文化下載器] 失敗，無法取得最新中文化版本");
          reject(error);
        });
      }
    );
  });

const downloadLatestFile = (latestVersion) =>
  new Promise((resolve, reject) => {
    console.log("[PoD 中文化下載器] - 正在下載最新版本的中文化 ...");
    https.get(
      `https://codeload.github.com/${repo}/zip/${latestVersion}`,
      { headers },
      (res) => {
        // const ws = fs.createWriteStream(__dirname + '/456.zip');
        const ws = fs.createWriteStream(path.join("./", `1.zip`));
        res.pipe(ws);
        ws.on("finish", () => {
          console.log("[PoD 中文化下載器] 檔案下載完成");
          resolve("Download succeeded.");
        });
        ws.on("error", (err) => {
          console.log(err);
          console.log("[PoD 中文化下載器] 檔案下載失敗");
          reject("Download failed.");
        });
      }
    );
  });

const uncompressZipFile = (latestVersion) =>
  new Promise(async (resolve, reject) => {
    console.log("[PoD 中文化下載器] - 正在安裝中文化 ...");
    const zip = new AdmZip(path.join("./", `1.zip`));
    const zipEntries = zip.getEntries();
    zipEntries.forEach((entry) => {
      if (entry.entryName.split("/")[1] === "data" && entry.isDirectory) {
        zip.extractEntryTo(entry, path.join("./", "data"), false, true);
        console.log("[PoD 中文化下載器] 安裝完成");
      }
    });
  });

const execute = async () => {
  const versionInfo = await getLatestVersionInfo();
  const latestVersion = versionInfo.tag_name;
  await downloadLatestFile(latestVersion);
  await uncompressZipFile(latestVersion);
  readline
    .createInterface(process.stdin, process.stdout)
    .question("Press [Enter] to exit...", function () {
      //process.exit();
    });
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
