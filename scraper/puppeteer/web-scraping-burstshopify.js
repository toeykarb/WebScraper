const { is } = require("cheerio/lib/api/traversing");
const puppeteer = require("puppeteer");
const { IMAGES_EXTENSION, stockphotoTags } = require("./utils");
const downloadFile = require("./test-fetch-burstshopify");
const data = {
  tags: [],
  internalTags: [],
  isCC0: false,
  authorTags: "",
  articleId: null,
};

(async (config = {}) => {
  var url = "https://burst.shopify.com/photos/red-textured-wall";
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on("console", (consoleObj) => console.log(consoleObj.text()));
  await page.setViewport({ width: 1200, height: 600, deviceScaleFactor: 1 });
  await page.goto(url, {
    waitUntil: ["networkidle0", "domcontentloaded"],
  });
  await page.waitForTimeout(3000);

  data.imageLink = await page.evaluate(() => {
    const results = document.querySelectorAll(".photo__download form");
    if (results && results[0]) {
      const actionLink = results[0].getAttribute("action");
      var imageLink = `https://burst.shopify.com/${actionLink}?quality=premium`;
      return imageLink;
    }
    return null;
  });
  console.log(data.imageLink);

  const [imageBuffer, imageMetadata, imageExtension] = await downloadFile(
    data.imageLink
  );

  console.log(imageExtension);

  let { authorLink, authorText } = await page.evaluate(() => {
    const authorIndex = [
      // @ts-ignore
      ...document.querySelectorAll(".photo__details .photo__meta *"),
    ].findIndex((node) => node.textContent.trim() === "Photo by:");

    if (authorIndex !== -1) {
      // @ts-ignore
      const rawAuthorSource = [
        ...document.querySelectorAll(".photo__details .photo__meta *"),
      ][authorIndex + 1];
      if (rawAuthorSource) {
        return {
          authorLink: rawAuthorSource.getAttribute("href"),
          authorText: rawAuthorSource.innerText,
        };
      }
    }
    return {
      authorLink: "",
      authorText: "",
    };
  });

  data.authorTags = authorText.length
    ? [
        `#${authorText
          .trim()
          .toLowerCase()
          .replace(
            new RegExp(
              "[^\u0400-\u04FF\u3131-\uD79D\u0E00-\u0E7Fa-z0-9]",
              "gi"
            ),
            ""
          )
          .replace(new RegExp(" ", "gi"), "")
          .trim()}`,
      ]
    : [];
  console.log(data.authorTags);
  console.log(authorLink);

  data.articleId = await page.evaluate(() => {
    const results = document.querySelectorAll(
      ".photo__download-cta .marketing-button--block"
    );
    if (results && results[0]) {
      return results[0].getAttribute("data-photo-id");
    }
    return null;
  });
  console.log(data.articleId);
  data.description = "";
  data.description_more = "";
  const description = await page.evaluate(
    `document.querySelector('.photo__details .photo__info p') ? document.querySelector('.photo__details .photo__info p').innerText : ''`
  );
  data.description = description;
  data.description_more = `View public domain image source <a href="${url}" target="_blank" rel="noopener noreferrer nofollow">here</a>`;
  console.log(data.description);
  console.log(data.description_more);

  console.log("Get tags");
  try {
    const tags =
      (await page.evaluate(
        `[...document.querySelectorAll('.photo__details .photo__meta .nowrap')].map(a => a.innerText.trim().toLowerCase())`
      )) || [];

    data.tags.push(...tags);
  } catch (error) {
    console.log(error);
  }
  console.log(data.tags);
  await browser.close();
})();
