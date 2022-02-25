const { is } = require("cheerio/lib/api/traversing");
const puppeteer = require("puppeteer");
const { imageExtension, stockphotoTags } = require("./utils");
var internalTags = [];
var tags = [];
(async (config = {}) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on("console", (consoleObj) => console.log(consoleObj.text()));
  await page.setViewport({ width: 1200, height: 600, deviceScaleFactor: 1 });
  //   await page.goto("https://pxhere.com/en/photo/1168447", {
  //     waitUntil: ["networkidle0", "domcontentloaded"],
  //   });
  await page.goto("https://pxhere.com/en/photo/239571", {
    waitUntil: ["networkidle0", "domcontentloaded"],
  });
  await page.waitForTimeout(3000);

  var isCC0 = await page.evaluate(
    "var data = ''.concat(document.querySelector('.hub-photo-cc') ? document.querySelector('.hub-photo-cc').innerText.toLowerCase() : ''); data.includes('cc0') || data.includes('public domain');"
  );

  console.log(isCC0);
  await browser.close();
})();
