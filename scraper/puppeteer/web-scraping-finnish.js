const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const fileType = require("file-type");
const https = require("https");
const { lowerFirst } = require("lodash");
const puppeteer = require("puppeteer");
const cookie = require("cookie");
const {
  stockphotoTags,
  IMAGES_EXTENSION,
  splitText,
  mimeTypeMapping,
} = require("./utils");
const { translateText, translateDocs } = require("puppeteer-google-translate");

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
const IGNORE_WORD = [
  "which",
  "what",
  "where",
  "when",
  "how",
  "many",
  "much",
  "be",
  "this",
  "will",
  "or",
  "in",
  "on",
  "at",
  "the",
  "of",
  "is",
  "am",
  "are",
  "and",
  "by",
  "for",
  "you",
  "we",
  "they",
  "it",
  "its",
  "de",
  "la",
  "par",
  "le",
  "an",
  "to",
  "if",
  "cannot",
  "with",
  "over",
  "negro",
  "negroes",
  "negros",
  "nigger",
  "fuck",
  "shit",
  "slut",
];
let pushtoTags = async (tags, keywordArr) => {
  if (keywordArr?.length) {
    tags.push(...keywordArr);
  }
};

/**
 * @param {import('puppeteer').Page} page
 */
const waitForSelector = async (page, yourSelector, timeout) => {
  try {
    await page.waitForFunction(
      `document.querySelector("${yourSelector}").clientHeight != 0`,
      {
        timeout,
      }
    );
  } catch (e) {
    // ignore
  }
};

(async (
  url = "https://www.kansallisgalleria.fi/en/object/506247",
  config = {}
) => {
  const requests_blocked = [];

  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  // page.on("console", (consoleObj) => console.log(consoleObj.text()));
  await page.setViewport({ width: 1200, height: 600, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "networkidle2" });
  console.log("Start......");
  await page.waitForTimeout(3000);
  const opt = { from: "sk", to: "en", timeout: 5000, headless: true };
  let tags = [];
  const data = {
    url,
    tags: [],
    internalTags: [],
    authorTags: [],
  };
  const cookieCloseButton = await page.$(
    "#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll"
  );
  if (cookieCloseButton) {
    try {
      cookieCloseButton.click();
    } catch (error) {
      // ignore
    }
    await page.waitForTimeout(500);
  }
  await waitForSelector(page, "[property='og:url']", 2000);
  // data.articleId = await page.evaluate(() => {
  //   let getArticleId = document.querySelector("[property='og:url']")
  //     ? document.querySelector("[property='og:url']").getAttribute("content")
  //     : "";

  //   getArticleId = getArticleId.includes("imageId=") ? getArticleId.split("imageId=")[1] : "";
  //   return getArticleId;
  // });
  let notSelectFirstImg = false;
  const getTypeTags = await page.evaluate(
    "document.querySelectorAll('.Tags--14jnn3d a') ? [...document.querySelectorAll('.Tags--14jnn3d a')].map(a => a.innerText.trim().toLowerCase()) : []"
  );
  // console.log("getTags", getTags);
  tags.push(...getTypeTags);
  data.isCC0 = getTypeTags.includes("copyright free");
  console.log("isCC0", data.isCC0);
  if (data.isCC0) {
    data.internalTags.push("#nolicenseissue");
    data.internalTags.push("#finnishnationalgallery");
    // data.tags.push(...CC0_TAGS);
  } else {
    let imageGroup = await page.evaluate(
      "document.querySelectorAll(`[data-test-id='object-thumbnails']>button`).length"
    );
    if (imageGroup < 0) {
      console.log(`CC0 ignored - ${url}`);
    }
    let checkLicense = false;
    for (var i = 2; i <= imageGroup; i++) {
      await page.click(`[data-test-id='object-thumbnails'] :nth-child(${i})`);
      const getTypeTags2 = await page.evaluate(
        "document.querySelectorAll('.Tags--14jnn3d a') ? [...document.querySelectorAll('.Tags--14jnn3d a')].map(a => a.innerText.trim().toLowerCase()) : []"
      );
      checkLicense = getTypeTags2.includes("copyright free");
      if (checkLicense) {
        break;
      }
      console.log(checkLicense);
      await page.waitForTimeout(700);
    }
    if (checkLicense) {
      notSelectFirstImg = true;
      data.isCC0 = checkLicense;
    } else {
      console.log(`CC0 ignored - ${url}`);
    }

    console.log(`CC0 ignored - ${url}`);
    // return {
    //   statusCode: 200,
    //   url: url,
    //   message: `CC0 ignored - ${url}`,
    // };
  }

  const getArticleId = await page.evaluate(
    "document.querySelector(`[property='og:url']`) ? document.querySelector(`[property='og:url']`).getAttribute('content'): ''"
  );

  data.articleId = getArticleId.includes("imageId=")
    ? getArticleId.split("imageId=")[1]
    : "";
  console.log("articleId", data.articleId);
  if (!data.articleId && !data.articleId.length) {
    console.log(
      `Incorrect articleId ${data.articleId} for ${url} - skip scraping`
    );
    // return {
    //   statusCode: 200,
    //   body: {
    //     message: `Image link not present on page - skip scraping  ${url}`,
    //   },
    // };
  }
  let imageLink = "";
  if (notSelectFirstImg) {
    imageLink = await page.evaluate(
      "document.querySelector(`[data-test-id='object-thumbnails'] [aria-pressed='true']`) ? document.querySelector(`[data-test-id='object-thumbnails'] [aria-pressed='true']`).getAttribute('data-identifier'): ''"
    );
  } else {
    const getOgimage = await page.evaluate(
      "document.querySelector(`[property='og:image']`) ? document.querySelector(`[property='og:image']`).getAttribute('content'): ''"
    );
    imageLink = getOgimage.includes("filename=")
      ? getOgimage.split("filename=")[1]
      : "";
  }

  if (!imageLink.length) {
    console.log(`No image link - skip scraping - ${url}`);
    return {
      statusCode: 200,
      body: {
        message: `No image link - skip scraping  ${url}`,
      },
    };
  }
  let downloadLink = await getImageLink(imageLink);
  console.log("downloadLink", downloadLink);
  [imageBuffer, imageMetadata, imageExtension] = await downloadFile(
    downloadLink
  );
  console.log("imageBuffer", imageBuffer);
  console.log("imageExtension", imageExtension);
  console.log("imageMetadata1", imageMetadata);
  imageMetadata.contentType = await mimeTypeMapping(imageExtension);
  console.log("imageMetadata2", imageMetadata);

  // get author
  let rawAuthorText = "";
  data.authorTags = [];
  let rawAuthorLink = "";
  rawAuthorText = await page.evaluate(
    "document.querySelector(`.person-name [data-test-id='person-name']`)  ? document.querySelector(`.person-name [data-test-id='person-name']`).textContent.toLowerCase() : ''"
  );
  rawAuthorLink = await page.evaluate(
    "document.querySelector(`.person-name [data-test-id='person-name']`)  ? document.querySelector(`.person-name [data-test-id='person-name']`).getAttribute('href') : ''"
  );
  if (rawAuthorLink && rawAuthorLink.startsWith("/")) {
    rawAuthorLink = `https://www.kansallisgalleria.fi${rawAuthorLink}`;
  }
  data.authorLink = rawAuthorLink && rawAuthorLink.length ? rawAuthorLink : "";
  if (rawAuthorText.length > 0) {
    data.authorTags = [
      `#${rawAuthorText
        .trim()
        .toLowerCase()
        .replace(new RegExp("[^a-z0-9]", "gi"), "")
        .replace(new RegExp(" ", "gi"), "")
        .trim()}`,
    ];
    console.log("rawAuthorText", rawAuthorText);
    tags.push(rawAuthorText);
  }
  let collectionTag = await page.evaluate(
    "document.querySelector(`.WorkDetails--1r4y48b [data-test-id='collection-name']`) ? document.querySelector(`.WorkDetails--1r4y48b [data-test-id='collection-name']`).innerText.trim().toLowerCase().replace('collection:','').trim() : ''"
  );
  if (collectionTag?.length) {
    tags.push(collectionTag);
  }
  const imageDetail = await page.evaluate(
    "document.querySelectorAll('.WorkDetails--1r4y48b>ul>li') ? [...document.querySelectorAll('.WorkDetails--1r4y48b>ul>li')].map(a => a.innerText.trim().toLowerCase()) : []"
  );
  console.log("imageDetail", imageDetail);
  if (imageDetail?.length) {
    let imageDetailTag = [];
    imageDetail.map((el) => {
      imageDetailTag.push(
        ...el
          .replace("owner:", "")
          .replace("collection:", "")
          .split(" ")
          .map((a) =>
            a
              .trim()
              .replace(new RegExp("[^À-úa-z0-9]", "gi"), "")
              .replace(new RegExp("  ", "gi"), " ")
              .trim()
          )
      );
    });
    console.log("imageDetailTag", imageDetailTag);
    if (imageDetailTag?.length) {
      const wordToDeleteSet = new Set(IGNORE_WORD);
      let imageTag = imageDetailTag.filter((word) => {
        if (word.length > 2) {
          return !wordToDeleteSet.has(word);
        }
        return false;
      });
      console.log("imageTag", imageTag);
      // tags.push(...imageTag);
    }
  }
  let getTitle = await page.evaluate(
    "document.querySelector(`.Title--2jdaiw`) ? document.querySelector(`.Title--2jdaiw`).innerText.trim().toLowerCase() : ''"
  );
  if (getTitle?.length) {
    data.description = getTitle;
    const wordToDeleteSet = new Set(IGNORE_WORD);
    let titleTags = getTitle
      .replaceAll("  ", " ")
      .replace(new RegExp("[^À-úa-z0-9_ ]", "gi"), "")
      .toLowerCase()
      .split(" ");
    titleTags = titleTags.filter((word) => {
      if (word.length > 2) {
        return !wordToDeleteSet.has(word);
      }
      return false;
    });
    console.log("titleTags", titleTags);
    // tags.push(...titleTags);
  }
  // console.log("tags", tags);
  try {
    const keywordTags = await page.evaluate(
      "[...document.querySelectorAll('.KeyWords--t2hnji a')].map(a => a.innerText.trim().toLowerCase())"
    );
    console.log("keywordTags", keywordTags);
    tags.push(...keywordTags);
  } catch (err) {
    console.log(err);
  }

  tags.map((tag) =>
    data.tags.push(tag.trim().replace(new RegExp("[^À-úa-z0-9_ ]", "gi"), ""))
  );
  data.tags = Array.from(new Set(data.tags));

  console.log(data);
  await page.screenshot({
    path: "finnish.jpeg",
    type: "jpeg",
    fullPage: true,
    quality: 50,
  });
  await browser.close();
})();

const getImageLink = async (imageId) => {
  let url = `https://www.kansallisgalleria.fi/api/image-download?filename=${imageId}`;
  console.log("url", url);
  const response = await fetch(url);
  let getLink = await response.json();
  let downloadLink = getLink["url"];
  return downloadLink;
};

const downloadFile = async (url) => {
  const response = await fetch(url);
  console.log(response.status);
  const contentType = await response.headers.get("content-type");
  // console.log(response.headers);
  const buffer = await response.buffer();

  const imageType = await fileType.fromBuffer(buffer);
  if (!imageType?.ext) {
    throw new Error("Invalid image");
  }
  const imageExtension = imageType.ext;
  return [buffer, { contentType }, imageExtension];
};

const googleTranslate = async (text) => {
  const browser2 = await puppeteer.launch({
    headless: false,
    args: ["--lang=en-US,en"],
  });
  const page2 = await browser2.newPage();
  try {
    await page2.goto(
      "https://translate.google.com/?sl=sk&tl=en&op=translate&text=" + text
    );
    const el1 = await page2.waitForSelector("span>span>span[jsaction]", {
      timeout: 5000,
    });
    const texts = [await el1.evaluate((e) => e.textContent)];
    console.log("texts", texts);
    const len = (await page2.$$("span>span[data-phrase-index]>span[jsaction]"))
      .length;
    if (len === 1) return texts[0];
    for (let i = 1; i < len; i++) {
      const el = await page2.waitForSelector(
        `span>span[data-phrase-index="${i}"]>span[jsaction]`,
        {
          timeout: 5000,
        }
      );
      texts.push(await el.evaluate((e) => e.textContent));
    }
    return texts.join(" ");
  } catch (err) {
    throw err;
  } finally {
    await browser2.close();
  }
};
