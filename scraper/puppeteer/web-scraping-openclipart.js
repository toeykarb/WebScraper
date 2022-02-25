const puppeteer = require("puppeteer");
const { IMAGES_EXTENSION, stockphotoTags } = require("./utils");

const data = {
  tags: [],
  internalTags: [],
  isCC0: false,
  authorTags: "",
  articleId: null,
};
var url = "https://openclipart.org/detail/313026/male-anatomy-back-line-art";
(async (config = {}) => {
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
  await page.waitForTimeout(3000);
  const checkLoginUser = await page.evaluate(
    "document.querySelector(`#content p`)  ? document.querySelector(`#content p`).innerText : ''"
  );
  if (
    checkLoginUser.includes(
      "That content is available to registered users only."
    )
  ) {
    await browser.close();
  }
  data.imageLink = await page.evaluate(() => {
    const results = document.querySelectorAll(".card-body a");
    if (results) {
      const imageLink =
        "https://openclipart.org" + results[0].getAttribute("href");
      return imageLink;
    }
    return results;
  });
  console.log(data.imageLink);

  data.articleId = url.replace("://", "").split("/")[2];
  if (!parseInt(data.articleId, 10)) {
    console.log(
      `incorrect articleId ${data.articleId} for ${url} - skip scraping`
    );
    return {
      statusCode: 200,
      body: {
        message: `Image link not present on page - skip scraping  ${url}`,
      },
    };
  }
  console.log(data.articleId);

  var licenseText = "";
  licenseText = await page.evaluate(() => {
    const licenseIndex = [
      // @ts-ignore
      ...document.querySelectorAll(".clipart-detail-meta dl *"),
    ].findIndex((node) => node.textContent.trim() === "Safe for Work?");
    const textSource =
      licenseIndex !== -1
        ? // @ts-ignore
          [...document.querySelectorAll(".clipart-detail-meta dl *")][
            licenseIndex + 1
          ].innerText.toLowerCase()
        : "";
    return textSource;
  });
  console.log("sourceCollection", licenseText);

  data.isCC0 = licenseText.includes("yes");

  if (data.isCC0) {
    console.log("#nolicenseissue");
    data.internalTags.push("#openclipart");
  } else {
    console.log("licenseissue");
  }
  data.description = "";
  const descriptions = await page.evaluate(
    "document.querySelector(`.clipart-detail-meta .row .col-10 h2`)  ? document.querySelector(`.clipart-detail-meta .row .col-10 h2`).innerText : ''"
  );
  data.description = descriptions;
  data.description_more = `View public domain image source <a href="${url}" target="_blank" rel="noopener noreferrer nofollow">here</a>`;
  console.log(data.description);
  console.log(data.description_more);

  // Get favourite
  const getFavourite = await page.evaluate(
    "document.querySelector(`.favs_count`)  ? document.querySelector(`.favs_count`).innerText : '0'"
  );
  console.log("getFavourite", getFavourite);
  if (getFavourite != 0) {
    if (getFavourite != 1) {
      const favouriteValue = `#${getFavourite}hearts`;
      data.internalTags.push(favouriteValue);
    } else {
      const favouriteValue = `#${getFavourite}heart`;
      data.internalTags.push(favouriteValue);
    }
  } else {
    console.log("not favourite");
  }
  console.log(data.internalTags);

  // Get author tags and link
  let rawAuthorLink = "";
  let rawAuthorText = "";
  try {
    rawAuthorLink = await page.evaluate(
      "document.querySelector(`.clipart-detail-meta .row .col-10 a`) ? document.querySelector(`.clipart-detail-meta .row .col-10 a`).getAttribute('href') : ''"
    );

    rawAuthorText = await page.evaluate(
      "document.querySelector(`.clipart-detail-meta .row .col-10 a`)  ? document.querySelector(`.clipart-detail-meta .row .col-10 a`).innerText : ''"
    );
  } catch (error) {
    console.log(error);
  }

  data.authorLink =
    rawAuthorLink && rawAuthorLink.length
      ? "https://openclipart.org" + rawAuthorLink
      : "";
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

  var getRemixAuthor = await page.evaluate(() => {
    const remixAuthor = [...document.querySelectorAll(".media-body h5 small a")]
      ? [...document.querySelectorAll(".media-body h5 small a")].map(
          (a) =>
            `#${a.innerText
              .trim()
              .toLowerCase()
              .replace(new RegExp("@", "gi"), "")
              .replace(new RegExp("[^a-z0-9]", "gi"), "")
              .replace(new RegExp(" ", "gi"), "")
              .trim()}`
        )
      : "";
    return remixAuthor;
  });
  console.log("getRemixAuthor", getRemixAuthor);
  data.authorTags.push(...getRemixAuthor);

  data.authorTags = data.authorTags.filter((item, index, inputArray) => {
    return inputArray.indexOf(item) == index;
  });

  console.log("authorLink", data.authorLink);
  console.log("authorTags", data.authorTags);
  // console.log("Get tags");

  try {
    const tags =
      (await page.evaluate(
        `[...document.querySelectorAll('.clipart-detail-meta dl dd [role="button"]')].map(a => a.innerText.trim().toLowerCase())`
      )) || [];
    var tagvalue = [];
    tags.map((index) => {
      const checkvalue = index.includes("+");
      if (!checkvalue) {
        tagvalue.push(index);
      }
    });
    data.tags.push(...tagvalue);
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
