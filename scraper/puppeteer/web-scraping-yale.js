const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const fileType = require("file-type");
const https = require("https");
const { lowerFirst } = require("lodash");
const puppeteer = require("puppeteer");
const cookie = require("cookie");
const {
  stockphotoTags,
  IMAGES_EXTENSION,
  splitText,
  cleanupAndSplitTagsInput,
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
let pushtoTags = async (translateTags, keywordArr) => {
  if (keywordArr?.length) {
    translateTags.push(...keywordArr);
  }
};
const waitForSelector = async (page, yourSelector, timeout) => {
  try {
    await page.waitForFunction(`document.querySelector('${yourSelector}').clientHeight != 0`, {
      timeout,
    });
  } catch (e) {
    // ignore
  }
};
(async (url = "https://collections.britishart.yale.edu/catalog/tms:54101", config = {}) => {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();
  let tags = [];
  const data = {
    url,
    tags: [],
    internalTags: [],
    authorTags: [],
  };

  // page.on("console", (consoleObj) => console.log(consoleObj.text()));
  await page.setViewport({ width: 2000, height: 1200, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "networkidle0" });

  // [imageBuffer, imageMetadata, imageExtension] = await downloadFile(data.imageLink);
  // console.log(imageBuffer);
  // console.log(imageMetadata);
  // console.log(imageExtension);
  const openDownloadModal = await page.$("#ycba-downloads-container #ycba-downloads a");
  try {
    if (openDownloadModal) {
      await openDownloadModal.evaluate((b) => b.click());
    }
  } catch (error) {
    // catch the error
  }
  await page.waitForTimeout(500);
  let getArticleId = url.replace("://", "").split("/")[2];
  data.articleId = getArticleId
    .trim()
    .toLowerCase()
    .replace(new RegExp("[^a-z0-9]", "gi"), "")
    .trim();
  if (!data.articleId && !data.articleId.length) {
    console.log(`Incorrect articleId ${data.articleId} for ${url} - skip scraping`);
  }
  data.imageLink = await page.evaluate(
    "document.querySelector('#download-details #tiff-container a') ? document.querySelector('#download-details #tiff-container a').getAttribute('href') : '';"
  );
  if (!data.imageLink?.length) {
    data.imageLink = await page.evaluate(
      "document.querySelector('#download-details #jpeg-container a') ? document.querySelector('#download-details #jpeg-container a').getAttribute('href') : '';"
    );
  }
  console.log(data.imageLink);
  // [imageBuffer, imageMetadata, imageExtension] = await downloadFile(data.imageLink);
  // console.log(imageBuffer);
  // console.log(imageMetadata);
  // console.log(imageExtension);
  // await page.screenshot({
  //   path: "yale.jpeg",
  //   type: "jpeg",
  //   fullPage: true,
  //   quality: 50,
  // });
  let licenseText = "";
  try {
    licenseText = await page.evaluate(
      "document.querySelector(`dd.blacklight-dummy_ort_lido_acc a`) ? document.querySelector(`dd.blacklight-dummy_ort_lido_acc a`).innerText.toLowerCase() : ''"
    );
  } catch (error) {
    console.log(error);
  }
  data.isCC0 = licenseText.includes("public domain") || licenseText.includes("cc0");
  if (data.isCC0) {
    data.internalTags.push("#nolicenseissue");
    data.internalTags.push("#ycba");
    // data.tags.push(...CC0_TAGS);
  } else {
    console.log(`CC0 ignored - ${url}`);
    // return {
    //   statusCode: 200,
    //   url: url,
    //   message: `CC0 ignored - ${url}`,
    // };
  }
  let rawAuthorText = [];
  let rawAuthorLink = "";
  data.authorTags = [];
  let authorValue = [];
  try {
    rawAuthorText = await page.evaluate(
      "document.querySelectorAll(`dd.blacklight-author_ss a`) ? [...document.querySelectorAll(`dd.blacklight-author_ss a`)].map(a => a.innerText) : []"
    );
    rawAuthorLink = await page.evaluate(
      "document.querySelector(`dd.blacklight-author_ss a`)  ? document.querySelector(`dd.blacklight-author_ss a`).getAttribute('href') : ''"
    );
  } catch (err) {
    console.log(err);
  }
  data.authorLink =
    rawAuthorLink && rawAuthorLink.length
      ? `https://collections.britishart.yale.edu${rawAuthorLink}`
      : "";
  if (rawAuthorText?.length) {
    rawAuthorText.forEach((item) => {
      console.log(item);
      if (item.length) {
        data.authorTags.push(
          `#${item
            .split(",")[0]
            .trim()
            .toLowerCase()
            .replace(new RegExp("[^À-ža-z0-9]", "gi"), "")
            .trim()}`
        );
        authorValue.push(
          `${item
            .split(",")[0]
            .trim()
            .replaceAll("&", "and")
            .replace(new RegExp("[^À-ža-z0-9]", "gi"), " ")
            .replace(new RegExp(" {2}", "gi"), " ")
            .trim()}`
        );
      }
    });
    authorValue.map((a) => tags.push(a.toLowerCase()));
  }

  let getDate = await page.evaluate(
    "document.querySelector(`dd.blacklight-publishdate_ss`)  ? document.querySelector(`dd.blacklight-publishdate_ss`).innerText : ''"
  );
  if (getDate?.length) {
    tags.push(getDate);
  }
  let getMedium = await page.evaluate(
    "document.querySelector(`dd.blacklight-format_ss`)  ? document.querySelector(`dd.blacklight-format_ss`).innerText : ''"
  );
  if (getMedium?.length) {
    tags.push(getDate);
  }

  tags.map((tag) => {
    let keysArrayRaw = cleanupAndSplitTagsInput(tag);
    // @ts-ignore
    let cleanKeys = [...new Set(keysArrayRaw)];
    data.tags.push(...cleanKeys);
  });
  console.log("tags ", tags);
  console.log(data);
  await browser.close();
  return true;
})();

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
