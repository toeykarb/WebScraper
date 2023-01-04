const { is } = require("cheerio/lib/api/traversing");
const puppeteer = require("puppeteer");
const {
  stockphotoTags,
  IGNORE_WORD,
  IMAGES_EXTENSION,
  splitText,
} = require("./utils");
const domains_in_blacklist = [
  "cm.g.doubleclick.net",
  "ssum-sec.casalemedia.com",
  "pagead2.googlesyndication.com",
  "www.googletagservices.com",
  "tpc.googlesyndication.com",
  "googleads.g.doubleclick.net",
  "www.google-analytics.com",
  "www.googletagservices.com",
  "cms.quantserve.com",
  "rtb.openx.net",
  "image6.pubmatic.com",
  "pixel.rubiconproject.com",
  "cc.adingo.jp",
  "unitedstateslibraryofcongress.demdex.net",
];
(async (
  url = "https://www.flickr.com/photos/oregoncityhighschool/52477285838/",
  config = {
    descriptionSelector: [".meta-field.photo-title", ".meta-field.photo-desc"],
  }
) => {
  const requests_blocked = [];
  var projectTags = ["#pdgroupflickrnasa1"];
  var internalTags = [];

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on("console", (consoleObj) => console.log(consoleObj.text()));

  await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 1 });
  await page.goto(url, { timeout: 5000, waitUntil: ["domcontentloaded"] });

  await page.waitForTimeout(2000);
  const data = {
    projectTags,
    url,
    tags: [],
    internalTags: [],
  };
  await page.waitForSelector(
    ".sub-photo-additional-info-view .additional-info"
  );
  await page.waitForTimeout(2000);
  data.articleId = url.replace("://", "").split("/")[3];
  const cookieCloseButton = await page.$(".cookie-banner-view .button.dismiss");
  if (cookieCloseButton) {
    try {
      // cookieCloseButton.click();
      await cookieCloseButton.evaluate((b) => b.click());
    } catch (error) {
      console.log(error);
    }
    await page.waitForTimeout(500);
  }
  await page.evaluate(() => {
    document.head.insertAdjacentHTML(
      "beforeend",
      `<style>.moola-sticky-view-main-container { display: none; }</style>`
    );
  });

  await page.waitForTimeout(4000);
  let downloadButton = await page.$(".photo-engagement-view .download a");
  if (!downloadButton) {
    await page.waitForTimeout(4000);
    downloadButton = await page.$(".photo-engagement-view .download a");
  }

  try {
    const closeAd = await page.$(".close-button-container .close-ad-button");
    if (closeAd) {
      await closeAd.evaluate((b) => b.click());
      // closeAd.click();
    }
  } catch (error) {
    // catch the error
  }
  // await page.waitForSelector(".auto-size .sizes");
  // await page.screenshot({
  //   path: "test.jpeg",
  //   type: "jpeg",
  //   fullPage: true,
  //   quality: 50,
  // });
  // console.log("Get Image Link");
  // data.imageLink = await page.evaluate(() => {
  //   var link;
  //   var checkImagelink = document.querySelector(
  //     ".auto-size .sizes .Original a"
  //   );
  //   var metatag = document.querySelector(`[property='og:image']`);
  //   if (checkImagelink) {
  //     link = checkImagelink.getAttribute("href");
  //   } else if (metatag) {
  //     link = metatag.getAttribute("content").split("https:")[1];
  //   }
  //   return link;
  // });
  // if (!data.imageLink) {
  //   console.log(`No image link for ${url} - skip scraping`);
  //   return {
  //     statusCode: 200,
  //     body: {
  //       message: `Image link not present on page - skip scraping  ${url}`,
  //     },
  //   };
  // }

  // if (data.imageLink.startsWith("//")) {
  //   data.imageLink = `https:${data.imageLink}`;
  // }
  // console.log("Get License Text");
  let licenseText = "";
  try {
    licenseText = await page.evaluate(
      "document.querySelector('.photo-license-url') ? document.querySelector('.photo-license-url').innerText.toLowerCase() : ''"
    );
    if (licenseText == "") {
      licenseText = await page.evaluate(
        `document.querySelector('[rel="license"]') ? document.querySelector('[rel="license"]').innerText.toLowerCase() : ''`
      );
    }
  } catch (error) {
    console.log(error);
  }
  if (projectTags.some((str) => str.includes("nasa"))) {
    data.isCC0 =
      licenseText.includes("creative commons cc0") ||
      licenseText.includes("creative commons zero") ||
      licenseText.includes("public domain") ||
      licenseText.includes("united states government work") ||
      licenseText.includes("no known copyright restrictions");
    data.internalTags.push("#test1");
  } else {
    data.isCC0 =
      licenseText.includes("creative commons cc0") ||
      licenseText.includes("creative commons zero") ||
      licenseText.includes("public domain") ||
      licenseText.includes("united states government work");
    data.internalTags.push("#test2");
  }

  data.internalTags.push(
    `#${licenseText
      .trim()
      .toLowerCase()
      .replace(new RegExp("[^a-z0-9]", "gi"), "")
      .replace(new RegExp(" ", "gi"), "")
      .trim()}`
  );
  if (data.isCC0) {
    data.internalTags.push("#nolicenseissue");

    if (data.internalTags.includes("#unitedstatesgovernmentwork")) {
      data.tags.push("U.S. government work");
    }
  } else {
    data.internalTags.push("#licenseissue");
  }
  console.log(licenseText);
  console.log(data.internalTags);
  // Get author tags and link
  console.log("Get Author Link");
  let rawAuthorLink = "";
  let rawAuthorText = "";
  try {
    rawAuthorLink = await page.evaluate(
      "document.querySelector('.attribution-info a.owner-name') ? document.querySelector('.attribution-info a.owner-name').getAttribute('href') : ''"
    );
    rawAuthorText = await page.evaluate(
      "document.querySelector('.attribution-info .owner-name').innerText"
    );
  } catch (error) {
    console.log(error);
  }
  if (rawAuthorLink && rawAuthorLink.startsWith("/")) {
    rawAuthorLink = `https://www.flickr.com${rawAuthorLink}`;
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
  console.log("data.authorTags", data.authorTags);

  data.description = "";
  data.description_more = "";
  try {
    const descriptionSelector = Array.isArray(config.descriptionSelector)
      ? config.descriptionSelector
      : [".meta-field.photo-desc"];

    const descriptions = [];
    for (let index = 0; index < descriptionSelector.length; index += 1) {
      const text = await page.evaluate(
        `document.querySelector('${descriptionSelector[index]}') && document.querySelector('${descriptionSelector[index]}').innerText`
      );
      if (
        text &&
        text.length &&
        (text.trim().length < 10 || text.trim().includes(" "))
      ) {
        descriptions.push(text);
      }
    }

    const description = descriptions.join("\n");

    data.description =
      description && description.length
        ? description.replace(new RegExp("\\n", "gi"), "<br/>")
        : "";
  } catch (error) {
    console.log(error);
  }
  const warningTag = stockphotoTags.some(
    (substring) =>
      data.description.toLowerCase().includes(substring.toLowerCase()) ||
      data.description.includes("AP")
  );
  if (warningTag) {
    data.internalTags.push("#licensewarning");
  }
  const descriptionLink = `Original public domain image from <a href="${url}" target="_blank" rel="noopener noreferrer nofollow">Flickr</a>`;
  data.description_more = descriptionLink;
  const descriptionKeywords = [];
  if (data.description?.length) {
    let keywordDescription = data.description
      .replace(new RegExp("[^a-z0-9]", "gi"), " ")
      .split(" ");
    keywordDescription = keywordDescription.map((element) =>
      element.toLowerCase().trim()
    );
    const wordToDeleteSet = new Set(IGNORE_WORD);
    keywordDescription = keywordDescription.filter((word) => {
      if (word.length > 2) {
        return !wordToDeleteSet.has(word);
      }
      return false;
    });

    data.tags.push(...keywordDescription);
  }
  // console.log("Get ArticleId");
  data.articleId = url.replace("://", "").split("/")[3];
  console.log("data.articleId ", data.articleId);
  if (!parseInt(data.articleId, 10)) {
    console.log(
      `incorrect articleId ${data.articleId} for ${url} - skip scraping`
    );
    // return {
    //   statusCode: 200,
    //   body: {
    //     message: `Image link not present on page - skip scraping  ${url}`,
    //   },
    // };
  }

  // // // -------------------------------------------------------------------------------------------
  // // Get tags
  // // Warning: From here chrome is not on the main URL.

  // console.log("Get tags");
  try {
    const tags = await page.evaluate(
      "[...document.querySelectorAll('.tags-list a:not(.remove-tag)')].map(a => a.innerText.trim().toLowerCase())"
    );

    if (Array.isArray(tags)) {
      if (!data.internalTags.includes("#licensewarning")) {
        var joinTags = tags.join(" ");
        const checkTags = stockphotoTags.some(
          (substring) =>
            joinTags.toLowerCase().includes(substring.toLowerCase()) ||
            joinTags.includes("AP")
        );
        if (checkTags) {
          data.internalTags.push("#licensewarning");
        }
      }

      data.tags.push(...tags);
    }
  } catch (error) {
    console.log(error);
  }
  data.tags = Array.from(new Set(data.tags));
  // console.log(data.tags);
  console.log(data);
  await page.screenshot({
    path: "flickr2.jpeg",
    type: "jpeg",
    fullPage: true,
    quality: 50,
  });
  await browser.close();
})();
