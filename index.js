const fs = require("fs");
const https = require("https");
const path = require("path");
const AdmZip = require("adm-zip");
const readline = require("readline");
const child_process = require("child_process");

const repo = "MarsFlyPig/PoDChineseUpdate";

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

          resolve(versionInfo);
        });
        res.on("error", (err) => {
          reject("無法取得最新中文化版本");
        });
      }
    );
  });

const compareVersion = (latestVersion) =>
  new Promise((resolve, reject) => {
    console.log("[PoD 中文化下載器] - 正在檢查本地端中文化版本 ...");
    fs.readdir("./", (err, files) => {
      if (!files.includes("version.json")) {
        console.log(
          "[PoD 中文化下載器] 無法確認本地端版本，開始自動更新至最新版本"
        );

        resolve();
      } else {
        fs.readFile("version.json", (err, data) => {
          console.log(err, data);
        });
      }
    });
  });

const downloadLatestFile = (latestVersion) =>
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

const uncompressZipFile = (latestVersion) =>
  new Promise(async (resolve, reject) => {
    console.log("[PoD 中文化下載器] - 正在解壓縮中文化檔案 ...");
    const zip = new AdmZip(path.join("./", `${fileName}.zip`));
    const zipEntries = zip.getEntries();
    zipEntries.forEach((entry) => {
      console.log(entry.entryName);
      if (entry.entryName === fileName + "/data/" && entry.isDirectory) {
        zip.extractEntryTo(entry, path.join("./"), true, true);
        console.log("[PoD 中文化下載器] 解壓縮完成"); ///////////////////////////////寫道這
        // fs.unlink(`${fileName}.zip`);
        resolve();
      }
    });
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
    await compareVersion(latestVersion);
    await downloadLatestFile(latestVersion);
    await uncompressZipFile(latestVersion);
    // openLauncher();
    showExtraInfo();
    console.log("\n");
    await askQuestion(
      "[PoD 中文化下載器] 安裝完成！感謝使用 <3。\n\n輸入 Enter 取得矮人之星並退出安裝程序 ..."
    );
  } catch (err) {
    console.log("\n");
    console.error("[PoD 中文化下載器] ***** 警告，安裝已被中止 *****");
    console.log("\n");
    console.log("原因：", err);
    console.log("\n");
    await askQuestion(
      "[PoD 中文化下載器] 安裝失敗QQ。\n\n按下 Enter 退出安裝程序 ..."
    );
  }
};

execute();
