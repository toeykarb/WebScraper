const puppeteer = require("puppeteer");
const { IMAGES_EXTENSION, stockphotoTags } = require("./utils");

const data = {
  tags: [],
  internalTags: [],
  isCC0: false,
  authorTags: "",
  articleId: null,
};
(async (config = {}) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on("console", (consoleObj) => console.log(consoleObj.text()));
  await page.setViewport({ width: 1200, height: 600, deviceScaleFactor: 1 });
  //   await page.goto("https://pxhere.com/en/photo/1168447", {
  //     waitUntil: ["networkidle0", "domcontentloaded"],
  //   });
  await page.goto("https://www.flickr.com/photos/123749873@N03/51280331760/", {
    waitUntil: ["networkidle0", "domcontentloaded"],
  });
  await page.waitForTimeout(3000);
  await page.waitForTimeout(4000);
  let downloadButton = await page.$(".photo-engagement-view .download a");
  if (!downloadButton) {
    await page.waitForTimeout(5000);
    downloadButton = await page.$(".photo-engagement-view .download a");
  }
  if (!downloadButton) {
    await page.waitForTimeout(7000);
    downloadButton = await page.$(".photo-engagement-view .download a");
  }
  if (!downloadButton) {
    await page.waitForTimeout(8000);
    downloadButton = await page.$(".photo-engagement-view .download a");
  }

  // Use to screenshot what's up,
  // will be on s3://rawpixel-dam-prod/tests/xxx
  // await page.waitForTimeout(1000);
  // const testScreenshotBuffer = await takeScreenshot(page, url);
  // await putToS3(testScreenshotBuffer, `tests/flickr-test3-${data.articleId}.jpg`);

  //downloadButton.click();
  console.log(downloadButton);
  var checkVideo = await page.evaluate(
    "document.querySelector('.videoplayer video');"
  );
  if (checkVideo) {
    console.log(checkVideo);
  } else {
    console.log("check log");
  }

  await browser.close();
})();
