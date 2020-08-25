const fs = require("fs");
const https = require("https");
const path = require("path");
const AdmZip = require("adm-zip");
const readline = require("readline");
const child_process = require("child_process");

const repo = "MarsFlyPig/PoDChineseUpdate";

let latestVersion;
let localVersion;

const headers = {
  "User-Agent": "PoD Chinese Localization Updater",
};

let fileName = "PoDChineseUpdate";

const checkInstallationPath = () =>
  new Promise((resolve, reject) => {
    console.log("[PoD 中文化下載器] - 正在檢查路徑 ...");
    fs.readdir("./", (err, files) => {
      if (!files.includes("Path of Diablo Launcher.exe")) {
        console.log("[PoD 中文化下載器] 路徑正確");
        resolve();
      } else {
        reject(
          "路徑錯誤，請將此執行檔放至 Path of Diablo 啟動器所在的資料夾中"
        );
      }
    });
  });

const showApplicationInfo = () => {
  console.log("--------------------");
  console.log("PoD 中文化下載器 v1.0");
  console.log("下載器作者：Dahis");
  console.log("中文化作者：MarsFlyPig");
  console.log("--------------------");
  console.log("\n");
};

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

          fileName = fileName + "-" + versionInfo.tag_name;
          latestVersion = versionInfo.tag_name;

          resolve(versionInfo);
        });
        res.on("error", (err) => {
          reject("無法取得最新中文化版本");
        });
      }
    );
  });

const compareVersion = () =>
  new Promise((resolve, reject) => {
    console.log("[PoD 中文化下載器] - 正在檢查本地端中文化版本 ...");

    fs.readdir("./", (err, files) => {
      console.log(files);
      if (!files.includes("data")) {
        console.log("[PoD 中文化下載器] 尚未安裝中文化，開始安裝");
        resolve();
      } else {
        fs.readdir("./data", (err, files) => {
          if (!files.includes("version.json")) {
            console.log(
              "[PoD 中文化下載器] 無法確認本地端版本，開始自動更新至最新版本"
            );

            resolve();
          } else {
            fs.readFile("version.json", (err, data) => {
              const localVersion = JSON.parse(data.toString()).version;
              if (localVersion === latestVersion) {
                console.log(
                  `[PoD 中文化下載器] 本地端版本 ${localVersion}，最新版本 ${latestVersion}，版本不相符，開始自動更新`
                );
                resolve();
              } else {
                reject("已安裝最新版本");
              }
            });
          }
        });
      }
    });
  });

const downloadLatestFile = () =>
  new Promise((resolve, reject) => {
    console.log("[PoD 中文化下載器] - 正在下載最新版本的中文化 ...");
    https.get(
      `https://codeload.github.com/${repo}/zip/${latestVersion}`,
      { headers },
      (res) => {
        const ws = fs.createWriteStream(path.join("./", `${fileName}.zip`));
        res.pipe(ws);
        ws.on("finish", () => {
          console.log("[PoD 中文化下載器] 檔案下載完成");
          resolve("Download succeeded.");
        });
        ws.on("error", (err) => {
          reject("檔案下載失敗");
        });
      }
    );
  });

const uncompressZipFile = () =>
  new Promise(async (resolve, reject) => {
    console.log("[PoD 中文化下載器] - 正在解壓縮中文化檔案 ...");
    const zip = new AdmZip(path.join("./", `${fileName}.zip`));
    zip.extractEntryTo(
      `${fileName}/data/`,
      path.join(__dirname + "/data"),
      true,
      true
    );
    // const zipEntries = zip.getEntries();
    // zipEntries.forEach((entry) => {
    //   if (entry.entryName === fileName + "/data/" && entry.isDirectory) {
    //     zip.extractEntryTo(entry.entryName, path.join(__dirname), true, true);
    //     console.log("[PoD 中文化下載器] 解壓縮完成"); ///////////////////////////////寫道這
    //     // fs.unlink(`${fileName}.zip`);
    //     resolve();
    //   }
    // });
  });

const showExtraInfo = () => {
  console.log("\n");
  console.log("累了嗎？看點網站吧 ...");
  console.log("\n");

  console.log("[1] Path of Diablo 中文過濾器：");
  console.log(
    "https://raw.githubusercontent.com/MarsFlyPig/PoD-Filter/master/item.filter　／　作者：MarsFlyPig"
  );

  console.log("[2] PoD 卷軸 - Path of Diablo 中文資料站：");
  console.log("https://pod-scroll.herokuapp.com　／　作者：Dahis");

  console.log("[3] PoD 中文技能模擬器");
  console.log(
    "https://pod-website.herokuapp.com/#/skill_calculator　／　作者：Dahis"
  );
};

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

// const openLauncher = () => {
//   child_process.execFile("Path of Diablo Launcher.exe", (err, data) => {
//     console.log(data);
//   });
// };

const execute = async () => {
  try {
    showApplicationInfo();
    await checkInstallationPath();
    const versionInfo = await getLatestVersionInfo();
    const latestVersion = versionInfo.tag_name;
    await compareVersion();
    await downloadLatestFile();
    await uncompressZipFile();
    // openLauncher();
    showExtraInfo();
    console.log("\n");
    await askQuestion(
      "[PoD 中文化下載器] 安裝完成！感謝使用 <3。\n\n輸入 Enter 取得矮人之星並退出安裝程序 ..."
    );
  } catch (err) {
    console.log("\n");
    console.error("[PoD 中文化下載器] ***** 安裝並未完成 *****");
    console.log("\n");
    console.log("原因：", err);
    console.log("\n");
    await askQuestion("[PoD 中文化下載器] \n\n按下 Enter 退出安裝程序 ...");
  }
};

execute();
