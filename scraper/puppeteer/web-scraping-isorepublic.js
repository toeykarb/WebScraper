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
  await page.goto("https://isorepublic.com/photo/dusk-evening-canyon/", {
    waitUntil: ["networkidle0", "domcontentloaded"],
  });
  await page.waitForTimeout(3000);

  data.imageLink = await page.evaluate(() => {
    const results = document.querySelectorAll(".media-actions .btn-download");
    if (results) {
      const imageLink = results[0].getAttribute("href");
      return imageLink;
    }
    return results;
  });
  console.log(data.imageLink);
  const imageExtension = data.imageLink.split(".").pop().toLowerCase();
  console.log(imageExtension);
  let licenseText = "";
  try {
    licenseText = await page.evaluate(() => {
      const results = document.querySelector(".media-header .CC0");

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
    //data.internalTags.push("#picography");
  } else {
    console.log("licenseissue");
  }

  let { rawAuthorLink, rawAuthorText } = await page.evaluate(() => {
    const authorIndex = [
      // @ts-ignore
      ...document.querySelectorAll(".media-sidebar .media-details *"),
    ].findIndex((node) => node.textContent.trim() === "Author");
    if (authorIndex !== -1) {
      const authorSource = [
        ...document.querySelectorAll(".media-sidebar .media-details *"),
      ][authorIndex + 2];
      if (authorSource) {
        return {
          rawAuthorLink: authorSource.getAttribute("href"),
          rawAuthorText: authorSource.innerText,
        };
      }
    }
    return {
      rawAuthorLink: "",
      rawAuthorText: "",
    };
  });
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
    const results = document.querySelectorAll(".media-post .media-article ");

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
        `[...document.querySelectorAll('.row-full .keyword-tags li')].map(a => a.innerText.trim().toLowerCase())`
      )) || [];

    data.tags.push(...tags);
  } catch (error) {
    console.log(error);
  }
  console.log(data.tags);
  // await page.screenshot({
  //   path: "picography.jpeg",
  //   type: "jpeg",
  //   fullPage: true,
  //   quality: 50,
  // });
  // console.log("done");

  await browser.close();
})();
