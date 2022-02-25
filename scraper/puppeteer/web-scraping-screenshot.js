const fs = require("fs");
function scraping(url) {
  const puppeteer = require("puppeteer");
  (async () => {
    //console.log(test);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on("console", (consoleObj) => console.log(consoleObj.text()));
    await page.setViewport({ width: 1200, height: 600, deviceScaleFactor: 1 });
    await page.goto(url);
    try {
      await page.waitForSelector(".hub-fleximages-related .item", {
        timeout: 20000,
      });
    } catch (error) {}

    await page.waitForTimeout(300);
    const cookieCloseButton = await page.$(".policy-ok");
    if (cookieCloseButton) {
      cookieCloseButton.click();
      await page.waitForTimeout(1000);
    }
    await page.screenshot({
      path: "test.jpeg",
      type: "jpeg",
      fullPage: true,
      quality: 50,
    });
    console.log("done");
    await browser.close();
  })();
}
async function main() {
  var array1 = ["https://www.stockvault.net/photo/191806/runner"];
  array1.forEach(async (element) => {
    await scraping(element);
  });
}
main();
