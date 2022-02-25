const { is } = require("cheerio/lib/api/traversing");
const puppeteer = require("puppeteer");
const { IMAGES_EXTENSION, stockphotoTags } = require("./utils");

(async (url = "https://www.loc.gov/item/2018674323/", config = {}) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on("console", (consoleObj) => console.log(consoleObj.text()));

  if (url.includes("loc.gov")) {
    await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: ["networkidle0", "domcontentloaded"] });
    await page.setViewport({ width: 1800, height: 1200, deviceScaleFactor: 1 });
    await page.goto(url);

    await page.waitForSelector(".link-list .search-results .item");
    await page.waitForTimeout(5000);

    await page.screenshot({
      path: `screen-shot2.jpeg`,
      type: "jpeg",
      fullPage: true,
      quality: 50,
    });
    var alltags = [];
    var internalTags = [];
    // var imageLink = await page.evaluate(() => {
    //   const results = document.querySelectorAll(
    //     `#select-resource0 [data-file-download="TIFF"]`
    //   );

    //   console.log("testttt :" + results);

    //   if (results) {
    //     console.log("have img");
    //     return results.getAttribute("value");
    //   } else {
    //     console.log("no img");
    //   }

    //   return null;
    // }); https://www.loc.gov/resource/nclc.01491/
    const checkUrl = url.includes("resource");
    console.log(checkUrl);
    var imageLink = "";
    if (checkUrl) {
      imageLink = await page.$eval(
        `#download [data-file-download="TIFF"]`,
        (node) => node.value
      );
    } else {
      imageLink = await page.$eval(
        `#select-resource0 [data-file-download="TIFF"]`,
        (node) => node.value
      );
    }
    console.log(imageLink);
    const imageExtension = imageLink.split(".").pop().toLowerCase();
    console.log(imageExtension);
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

    rawAuthorLink = await page.evaluate(
      "document.querySelector(`.short-list [data-field-label='Contributors']`) ? document.querySelector(`.short-list [data-field-label='Contributors']`).getAttribute('href') : ''"
    );
    rawAuthorText = await page.evaluate(
      "document.querySelector(`.short-list [data-field-label='Contributors']`) ? document.querySelector(`.short-list [data-field-label='Contributors']`).innerText : ''"
    );

    console.log(rawAuthorLink);
    var authorTags = rawAuthorText.length
      ? [
          `#${rawAuthorText
            .trim()
            .toLowerCase()
            .replace(new RegExp("[^a-z0-9]", "gi"), "")
            .replace(new RegExp(" ", "gi"), "")
            .trim()}`,
        ]
      : [];
    console.log(authorTags);
    var articleId = "";
    if (checkUrl) {
      articleId = url.replace("://", "").split("/")[2];
      articleId = articleId.split(".")[1];
    } else {
      articleId = url.replace("://", "").split("/")[2];
    }

    console.log(articleId);
    // -------------------------------------------------------------------------------------------
    // Get tags
    // Warning: From here chrome is not on the main URL.

    console.log("--------------Get tags-----------------");

    const CC0_TAGS = [
      "photo",
      "image",
      "cc0",
      "creative commons",
      "creative commons 0",
      "public domain",
    ];

    var description = await page.evaluate(
      "document.querySelector('.about-this-item-content').innerText;"
    );
    console.log(description.toLowerCase());
    const resulttest = stockphotoTags.some(
      (substring) =>
        description.toLowerCase().includes(substring.toLowerCase()) ||
        description.includes("AP")
    );
    console.log("--------------Check Tags-----------------");
    console.log(resulttest);
    let licenseText = "";
    try {
      licenseText = await page.evaluate(
        "document.querySelector('.rights-and-access-content ul li span').innerText.toLowerCase();"
      );
    } catch (error) {
      console.log(error);
    }
    var sourceCollection = "xr";
    if (sourceCollection.length) {
      console.log("notpass");
    } else {
      console.log("test pass");
    }
    sourceCollection = await page.evaluate(() => {
      const sourceCollectionIndex = [
        ...document.querySelectorAll(".item-cataloged-data *"),
      ].findIndex((node) => node.textContent.trim() === "Source Collection");
      const textSource =
        sourceCollectionIndex !== -1
          ? [...document.querySelectorAll(".item-cataloged-data *")][
              sourceCollectionIndex + 1
            ].textContent
          : "";

      return textSource;
    });
    console.log(!sourceCollection.length);
    if (sourceCollection.length) {
      var sourcetag = `#${sourceCollection
        .trim()
        .toLowerCase()
        .replace(new RegExp("[^a-z0-9]", "gi"), "")
        .replace(new RegExp(" ", "gi"), "")
        .trim()}`;

      internalTags.push(sourcetag);
    }

    console.log(sourceCollection);

    var isCC0 =
      licenseText.includes("creative commons cc0") ||
      licenseText.includes("creative commons zero") ||
      licenseText.includes("public domain") ||
      licenseText.includes("no known restrictions on publication");

    console.log(isCC0);

    if (isCC0) {
      internalTags.push("#nolicenseissue");
    } else {
      internalTags.push("#licenseissue");
    }
    console.log(internalTags);

    try {
      const tags =
        (await page.evaluate(
          "[...document.querySelectorAll(`.short-list a[data-field-label='Subjects']`)].map(a => a.innerText.trim().toLowerCase())"
        )) || [];
      if (Array.isArray(tags)) {
        alltags.push(...tags);
      }
      console.log(alltags);
    } catch (error) {
      console.log(error);
    }
    await browser.close();
  } else {
    console.log("not found url");
  }
})();
