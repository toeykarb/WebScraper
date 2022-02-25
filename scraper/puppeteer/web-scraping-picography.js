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
  await page.goto("https://picography.co/mobile-phone-screen/", {
    waitUntil: ["networkidle0", "domcontentloaded"],
  });
  await page.waitForTimeout(3000);

  data.imageLink = await page.evaluate(() => {
    const results = document.querySelectorAll(
      ".single-photo-page .download-buttons a"
    );
    if (results) {
      const imageLink = results[0].getAttribute("href");
      return imageLink;
    }
    return results;
  });
  console.log(data.imageLink);
  const imageExtension = data.imageLink.split(".").pop().toLowerCase();
  if (![...IMAGES_EXTENSION].includes(imageExtension)) {
    console.log(
      `Invalid image extension ${imageExtension} for ${url} - skip scraping`
    );
    return {
      statusCode: 200,
      body: {
        message: `Image link not present on page - skip scraping  ${url}`,
      },
    };
  }
  console.log(imageExtension);
  let licenseText = "";
  try {
    licenseText = await page.evaluate(() => {
      const results = document.querySelector(
        ".content .single-photo-image img"
      );

      if (results) {
        const license = results.getAttribute("alt").toLowerCase();
        return license;
      }
      return null;
    });
  } catch (error) {
    console.log(error);
  }
  console.log(licenseText);
  data.isCC0 = licenseText.includes("cc0");

  if (data.isCC0) {
    console.log("#nolicenseissue");
    data.internalTags.push("#picography");
  } else {
    console.log("licenseissue");
  }
  // Get author tags and link
  let rawAuthorLink = "";
  let rawAuthorText = "";
  try {
    rawAuthorLink = await page.evaluate(
      "document.querySelector(`.single-photo-category .photographer-profile [rel='author']`) ? document.querySelector(`.single-photo-category .photographer-profile [rel='author']`).getAttribute('href') : ''"
    );

    rawAuthorText = await page.evaluate(
      "document.querySelector(`.single-photo-category .photographer-profile [rel='author']`)  ? document.querySelector(`.single-photo-category .photographer-profile [rel='author']`) .innerText : ''"
    );
  } catch (error) {
    console.log(error);
  }

  data.authorLink = rawAuthorLink && rawAuthorLink.length ? rawAuthorLink : "";
  data.authorTags = rawAuthorText.length
    ? [
        `#${rawAuthorText
          .trim()
          .toLowerCase()
          .replace(new RegExp("[^a-z0-9]", "gi"), "")
          .replace(new RegExp(" ", "gi"), "")
          .trim()}`,
      ]
    : [];
  console.log(data.authorLink);
  console.log(data.authorTags);
  data.articleId = await page.evaluate(() => {
    const results = document.querySelectorAll(".single-photo-page .content");

    if (results && results[0]) {
      return results[0].getAttribute("id").split("-")[1];
    }
    return null;
  });
  console.log(data.articleId);

  console.log("Get tags");
  try {
    const tags =
      (await page.evaluate(
        `[...document.querySelectorAll('.tags [itemprop="keywords"] li')].map(a => a.innerText.trim().toLowerCase())`
      )) || [];

    data.tags.push(...tags);
  } catch (error) {
    console.log(error);
  }
  console.log(data.tags);
  await page.screenshot({
    path: "picography.jpeg",
    type: "jpeg",
    fullPage: true,
    quality: 50,
  });
  console.log("done");

  await browser.close();
})();
