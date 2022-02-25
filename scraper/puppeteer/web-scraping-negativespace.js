const { is } = require("cheerio/lib/api/traversing");
const puppeteer = require("puppeteer");
const { imageExtension, stockphotoTags } = require("./utils");
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
  await page.goto("https://negativespace.co/computer-board-background-cards/", {
    waitUntil: ["networkidle0", "domcontentloaded"],
  });
  await page.waitForTimeout(3000);

  data.imageLink = await page.evaluate(() => {
    const results = document.querySelectorAll(
      '.download-buttons [itemprop="contentUrl"]'
    );
    if (results && results[0]) {
      return results[0].getAttribute("href");
    }
    return null;
  });
  const imageExtension = data.imageLink.split(".").pop().toLowerCase();
  console.log(imageExtension);
  let licenseText = "";
  try {
    licenseText = await page.evaluate(
      "document.querySelector('.entry-content p span').innerText.toLowerCase();"
    );
  } catch (error) {
    console.log(error);
  }
  data.isCC0 = licenseText.includes("cc0 license");

  if (data.isCC0) {
    data.internalTags.push("#nolicenseissue");

    console.log(data.internalTags);
    console.log(data.isCC0);
  } else {
    console.log(data.isCC0);
  }

  console.log(data.imageLink);

  rawAuthorText = await page.evaluate(
    `document.querySelector('.photographer [itemprop="author"]') ? document.querySelector('.photographer [itemprop="author"]').innerText : ''`
  );
  console.log(rawAuthorText);

  data.articleId = await page.evaluate(() => {
    const results = document.querySelectorAll("#content article");

    if (results && results[0]) {
      return results[0].getAttribute("id").split("-")[1];
    }
    return null;
  });

  console.log(!parseInt(data.articleId, 10));

  console.log("Get tags");
  try {
    const tags =
      (await page.evaluate(
        `[...document.querySelectorAll('[itemprop="keywords"] ul li a')].map(a => a.innerText.trim().toLowerCase())`
      )) || [];

    data.tags.push(...tags);
  } catch (error) {
    console.log(error);
  }
  console.log(data.tags);

  await page.screenshot({
    path: "negativespace.jpeg",
    type: "jpeg",
    fullPage: true,
    quality: 50,
  });

  data.description = "";

  const descriptions = await page.evaluate(() => {
    var getTitle = document.querySelector(".article-wrap .entry-title")
      ? // @ts-ignore
        document.querySelector(".article-wrap .entry-title").innerText
      : "";
    console.log(getTitle);
    if (getTitle.length) {
      const description = getTitle.split("No Cost Stock Image")[0];
      return description;
    }
  }, "");
  console.log(descriptions);
  await browser.close();
})();
