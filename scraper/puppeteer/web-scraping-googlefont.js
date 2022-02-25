const puppeteer = require("puppeteer");
const { IMAGES_EXTENSION, stockphotoTags } = require("./utils");

const data = {
  title: "",
  tags: [],
  internalTags: [],
  isCC0: false,
  authorTags: "",
  articleId: null,
};
(async (config = {}) => {
  var url = "https://fonts.google.com/specimen/Lato";
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on("console", (consoleObj) => console.log(consoleObj.text()));
  await page.setViewport({ width: 1200, height: 600, deviceScaleFactor: 1 });
  //   await page.goto("https://pxhere.com/en/photo/1168447", {
  //     waitUntil: ["networkidle0", "domcontentloaded"],
  //   });
  await page.goto(url, {
    waitUntil: ["networkidle0", "domcontentloaded"],
  });
  await page.waitForTimeout(10000);

  const checkTemplate = url.toLowerCase().includes("noto");
  if (checkTemplate) {
    try {
      await page.waitForSelector(".noto-specimen__header", {
        timeout: 3000,
      });
    } catch (error) {}
    data.title = await page.evaluate(
      "document.querySelector('.noto-specimen__header h1') ? document.querySelector('.noto-specimen__header h1').innerText : ''"
    );
    data.uniqueId = data.title.length
      ? `${data.title
          .trim()
          .toLowerCase()
          .replace(new RegExp("[^a-z0-9]", "gi"), "")
          .replace(new RegExp(" ", "gi"), "")
          .trim()}`
      : "";
    if (data.uniqueId.length) {
      console.log(
        `incorrect uniqueId ${data.uniqueId} for ${url} - skip scraping`
      );
    }
    console.log("x", data.uniqueId.length);
    console.log(data.uniqueId);
    data.link = "";
    data.fontLink = "";
    data.link = await page.evaluate(
      "document.querySelector('.container .ng-star-inserted a') ? document.querySelector('.container .ng-star-inserted a').getAttribute('href') : ''"
    );
    let linkName = "";
    if (data.link.length) {
      linkName = data.link.replace("://", "").split("/")[3];
      if (linkName.length) {
        data.fontLink = `https://fonts.google.com/download?family=${linkName}`;
      }
      const licensePage = `${data.link}/about`;
      console.log("licensePage", licensePage);
      await page.goto(licensePage, {
        waitUntil: ["networkidle0", "domcontentloaded"],
      });
      await page.waitForTimeout(3000);
      let licenseText = "";
      try {
        licenseText = await page.evaluate(
          "document.querySelector(`.about__license p a`) ? document.querySelector(`.about__license p a`).getAttribute('href').toLowerCase() : ''"
        );
        console.log(licenseText);
      } catch (error) {
        console.log(error);
      }
      data.noLicense =
        licenseText.includes("apache.org") || licenseText.includes("sil.org");
      if (!data.noLicense) {
        console.log("License");
      }
      console.log("noLicense", data.noLicense);
    }
    console.log("data.link", data.link);
    console.log("data.fontLink", data.fontLink);
    // Get tags
    data.tags.push("");
  } else {
    try {
      await page.waitForSelector(".mat-text--title", {
        timeout: 3000,
      });
    } catch (error) {}
    // Get font title
    data.title = await page.evaluate(
      "document.querySelector('.sticky-header h1') ? document.querySelector('.sticky-header h1').innerText : ''"
    );
    // Generate a font unique id based on the font name
    // (no space, lowercase alphanumeric characters, dashes)
    data.uniqueId = data.title.length
      ? `${data.title
          .trim()
          .toLowerCase()
          .replace(new RegExp("[^a-z0-9]", "gi"), "")
          .replace(new RegExp(" ", "gi"), "")
          .trim()}`
      : "";
    console.log("x", data.uniqueId.length);
    if (!data.uniqueId > 0) {
      console.log(
        `incorrect uniqueId ${data.uniqueId} for ${url} - skip scraping`
      );
    }
    console.log(data.uniqueId);
    // Get zip link
    data.fontLink = "";
    if (data.title.length) {
      data.fontLink = `https://fonts.google.com/download?family=${data.title}`;
    }
    // Get author name
    let rawAuthorText = "";
    try {
      rawAuthorText = await page.evaluate(
        "document.querySelector(`[subtitle] span a`) ? document.querySelector(`[subtitle] span a`).innerText : ''"
      );
    } catch (error) {
      console.log(error);
    }
    data.author = rawAuthorText.length
      ? [
          `#${rawAuthorText
            .trim()
            .toLowerCase()
            .replace(new RegExp("[^a-z0-9]", "gi"), "")
            .replace(new RegExp(" ", "gi"), "")
            .trim()}`,
        ]
      : [];

    // Get google font page link
    let pageLink = "";
    data.link = "";
    try {
      pageLink = await page.evaluate(
        "document.querySelector(`[rel='canonical']`) ? document.querySelector(`[rel='canonical']`).getAttribute('href') : ''"
      );
    } catch (error) {
      console.log(error);
    }
    if (pageLink.length) {
      data.link = `https://fonts.google.com${pageLink}`;
    }
    // Get tags
    data.tags.push("");
    //Check License
    let licenseText = "";
    try {
      licenseText = await page.evaluate(
        "document.querySelector(`#license p a`) ? document.querySelector(`#license p a`).getAttribute('href').toLowerCase() : ''"
      );
    } catch (error) {
      console.log(error);
    }
    data.noLicense =
      licenseText.includes("apache.org") || licenseText.includes("sil.org");
    if (!data.noLicense) {
      console.log("License");
    }
  }
  await browser.close();
})();
