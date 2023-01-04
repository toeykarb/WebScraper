const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const fileType = require("file-type");
const https = require("https");
const { lowerFirst } = require("lodash");
const puppeteer = require("puppeteer");
const cookie = require("cookie");
const { stockphotoTags, IMAGES_EXTENSION, splitText } = require("./utils");
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
let pushtoTags = async (translateTags, keywordArr) => {
  if (keywordArr?.length) {
    translateTags.push(...keywordArr);
  }
};

/**
 * @param {Array} keyword
 */
// let translateWordArray = async (keyword, timeout = 2000) => {
//   let translateWorkType = [];
//   for (var i = 0; i < keyword.length; i++) {
//     let getWord = await googleTranslate(keyword[i], timeout);
//     translateWorkType.push(getWord);
//   }
//   return translateWorkType;
// };
/**
 * @param {import('puppeteer').Page} page
 */
const waitForSelector = async (page, yourSelector, timeout) => {
  try {
    await page.waitForFunction(
      `document.querySelector('${yourSelector}').clientHeight != 0`,
      {
        timeout,
      }
    );
  } catch (e) {
    // ignore
  }
};

(async (url = "https://open.smk.dk/en/artwork/image/kms8290", config = {}) => {
  const requests_blocked = [];

  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  // page.on("console", (consoleObj) => console.log(consoleObj.text()));

  try {
    await page.goto(url, { waitUntil: "networkidle0" });
  } catch (err) {
    url = await page.goto(url, { waitUntil: "networkidle0" });
  }

  console.log("Start......");
  await page.waitForTimeout(1000);
  let tags = [];
  var translateTags = [];
  const data = {
    url,
    tags: [],
    internalTags: [],
    authorTags: [],
  };

  const cookieCloseButton = await page.$("[aria-label='Tillad alle']");
  if (cookieCloseButton) {
    try {
      await cookieCloseButton.evaluate((b) => b.click());
    } catch (error) {
      console.log(error);
    }
    await page.waitForTimeout(500);
  }
  await waitForSelector(page, ".Hero_image__19Qsp>a>img", 3000);
  let getArticleId = await page.evaluate(() => {
    let articleId = "";
    let articleIdIndex = [
      // @ts-ignore
      ...document.querySelectorAll(".ArtworkItem_artworkItem__2yrsd *"),
    ].findIndex((node) => node.textContent.trim() === "Inventory number");
    if (articleIdIndex !== -1) {
      // @ts-ignore
      articleId = [
        ...document.querySelectorAll(".ArtworkItem_artworkItem__2yrsd *"),
      ][articleIdIndex + 1].textContent;
    }

    return articleId;
  });
  console.log("getArticleId", getArticleId);
  // data.articleId = getArticleId
  //   .trim()
  //   .toLowerCase()
  //   .replace(new RegExp(" ", "gi"), "_")
  //   .replaceAll("/", "_")
  //   .replace(new RegExp("[^a-z0-9-_]", "gi"), "")
  //   .trim();
  data.articleId = getArticleId
    .trim()
    .toLowerCase()
    .replace(new RegExp(".", "gi"), "--")
    .replace(new RegExp(" ", "gi"), "__")
    .replaceAll("/", "_")
    .replace(new RegExp("[^a-z0-9-_]", "gi"), "")
    .trim();
  console.log("data.articleId", data.articleId);
  let [metadataSMK, statusCodeApi] = await getSMKApi(getArticleId);
  console.log("statusCodeApi", statusCodeApi);
  let metadata = "";
  if (statusCodeApi == 200) {
    metadata = JSON.parse(metadataSMK)["items"][0];
  } else {
  }
  data.imageLink = metadata["image_native"] ? metadata["image_native"] : "";
  // const imageExtension2 = data.imageLink.split(".").pop().toLowerCase();
  // console.log("imageExtension", imageExtension2);
  // [imageBuffer, imageMetadata, imageExtension] = await downloadFile(
  //   data.imageLink
  // );
  // console.log(imageBuffer);
  // console.log(imageMetadata);
  // console.log(imageExtension);

  let licenseText = "";
  try {
    licenseText = await page.evaluate(
      "document.querySelector(`.Annotation_publicDomainText__1mhKv`) ? document.querySelector(`.Annotation_publicDomainText__1mhKv`).innerText.toLowerCase() : ''"
    );
  } catch (error) {
    console.log(error);
  }
  data.isCC0 =
    licenseText.includes("public domain") ||
    licenseText.includes("cc0") ||
    licenseText.includes("free to use");
  if (data.isCC0) {
    data.internalTags.push("#nolicenseissue");
    data.internalTags.push("#smk");
  } else {
    data.isCC0 = metadata["public_domain"] ? metadata["public_domain"] : false;
    if (data.isCC0) {
      data.internalTags.push("#nolicenseissue");
      data.internalTags.push("#smk");
    } else {
      console.log(`CC0 ignored - ${url}`);
      // return {
      //   statusCode: 200,
      //   url: url,
      //   message: 'CC0 ignored',
      // };
    }
  }
  let rawAuthorLink = "";
  try {
    rawAuthorLink = await page.evaluate(
      "document.querySelector(`.ArtworkItem_title__wnyp6 a`) ? document.querySelector(`.ArtworkItem_title__wnyp6 a`).getAttribute('href') : ''"
    );
  } catch (err) {
    console.log(error);
  }
  if (rawAuthorLink && rawAuthorLink.startsWith("/")) {
    rawAuthorLink = `https://open.smk.dk/${rawAuthorLink}`;
  }
  data.authorLink = rawAuthorLink && rawAuthorLink.length ? rawAuthorLink : "";
  data.authorTags = [];
  let rawAuthorTag = metadata["production"] ? metadata["production"] : [];
  console.log("rawAuthorTag", rawAuthorTag);
  if (rawAuthorTag.length > 0) {
    rawAuthorTag.map((item) => {
      let getArtist = item["creator"] ? item["creator"] : "";
      getArtist = getArtist.split(",").reverse().join(" ").trim();
      if (getArtist?.length) {
        data.authorTags.push(
          `#${getArtist
            .trim()
            .toLowerCase()
            .replace(new RegExp("[^À-ža-z0-9]", "gi"), "")
            .trim()}`
        );
        tags.push(
          `${getArtist
            .trim()
            .toLowerCase()
            .replace(new RegExp("[^À-ža-z0-9]", "gi"), " ")
            .replace(new RegExp("  ", "gi"), " ")
            .trim()}`
        );
      }
    });
  }
  let getDateNotes = metadata["production_dates_notes"]
    ? metadata["production_dates_notes"]
    : [];
  console.log("getDateNotes", getDateNotes);
  if (getDateNotes.length > 0) {
    let dateTranslate = await googleTranslate(
      browser,
      getDateNotes.join("|").replaceAll(new RegExp("ca.", "gi"), " ")
    );
    let dateNotes = dateTranslate.split("|");
    if (dateNotes?.length) {
      dateNotes.map((item) => {
        if (item.length) {
          data.tags.push(
            `${item
              .trim()
              .replace("-", " to ")
              .replace("approx", "ca")
              .toLowerCase()
              .replace(new RegExp("[^a-z0-9]", "gi"), " ")
              .replace(new RegExp("  ", "gi"), " ")
              .trim()}`
          );
        }
      });
    }
  }
  let getProductionDate = metadata["production_date"]
    ? metadata["production_date"]
    : [];
  console.log("getProductionDate", getProductionDate);
  if (getProductionDate.length > 0) {
    getProductionDate.map((item) => {
      let getPeriod = item["period"] ? item["period"] : "";
      if (getPeriod.length) {
        data.tags.push(
          `${getPeriod
            .trim()
            .replace("-", " to ")
            .toLowerCase()
            .replace(new RegExp("[^a-z0-9]", "gi"), " ")
            .replace(new RegExp("  ", "gi"), " ")
            .trim()}`
        );
      }
    });
  }
  let getWorkType = metadata["object_names"] ? metadata["object_names"] : [];
  console.log("getWorkType", getWorkType);
  if (getWorkType.length > 0) {
    getWorkType.map((item) => {
      let ObjectName = item["name"] ? item["name"] : "";
      tags.push(ObjectName);
    });
  }
  let getMedium = metadata["medium"] ? metadata["medium"] : [];
  console.log("getMedium", getMedium);
  if (getMedium.length > 0) {
    tags.push(...getMedium);
  }
  let getMaterials = metadata["materials"] ? metadata["materials"] : [];
  console.log("getMaterials", getMaterials);
  if (getMaterials.length > 0) {
    tags.push(...getMaterials);
  }
  let getTechniques = metadata["techniques"] ? metadata["techniques"] : [];
  console.log("getTechniques", getTechniques);

  if (getTechniques.length > 0) {
    var techniquesKeyword = [];
    getTechniques.map((item) => {
      techniquesKeyword.push(
        ...item
          .toLowerCase()
          .replace(new RegExp("[\u000A]", "gi"), "$")
          .replaceAll(" & ", "$")
          .replaceAll(" and ", "$")
          .replaceAll(" or ", "$")
          .replaceAll(",", "$")
          .replaceAll(";", "$")
          .replaceAll(":", "$")
          .replaceAll(".", "$")
          .split("$")
          .map((a) =>
            a
              .trim()
              .replace(new RegExp("[^À-ža-z0-9_ ]", "gi"), " ")
              .replace(new RegExp("  ", "gi"), " ")
              .trim()
          )
      );
    });
    console.log("techniquesKeyword", techniquesKeyword);
    tags.push(...techniquesKeyword);
  }
  let getTitle = await page.evaluate(() => {
    let titleId = "";
    let titleIndex = [
      // @ts-ignore
      ...document.querySelectorAll(".ArtworkItem_artworkItem__2yrsd *"),
    ].findIndex((node) => node.textContent.trim() === "Title");
    if (titleIndex !== -1) {
      // @ts-ignore
      titleId = [
        ...document.querySelectorAll(".ArtworkItem_artworkItem__2yrsd *"),
      ][titleIndex + 1].textContent;
    }

    return titleId;
  });
  console.log("getTitle", getTitle);
  if (getTitle?.length) {
    let titleTranslate = await googleTranslate(browser, getTitle);
    data.description = titleTranslate;
    console.log("titleTranslate ", titleTranslate);
    const wordToDeleteSet = new Set(IGNORE_WORD);
    let titleTags = titleTranslate
      .replaceAll("  ", " ")
      .replace(new RegExp("[^À-ža-z0-9_ ]", "gi"), "")
      .toLowerCase()
      .split(" ");
    titleTags = titleTags.filter((word) => {
      if (word.length > 2) {
        return !wordToDeleteSet.has(word);
      }
      return false;
    });
    console.log("titleTags", titleTags);
    tags.push(...titleTags);
  }
  data.description_more = `Original public domain image from <a href="${url}" target="_blank" rel="noopener noreferrer nofollow">Statens Museum for Kunst</a>`;
  tags.map((tag) =>
    data.tags.push(
      tag
        .toLowerCase()
        .trim()
        .replace(new RegExp("[^À-ža-z0-9_ ]", "gi"), "")
        .replace(new RegExp("  ", "gi"), " ")
    )
  );
  data.tags = Array.from(new Set(data.tags));
  await page.screenshot({
    path: "smk.jpeg",
    type: "jpeg",
    fullPage: true,
    quality: 50,
  });
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

let getEachSubject = async (page, subject) => {
  let subjectIemArr = [];
  let getSubjectValue = await page.evaluate((subject) => {
    let subjectValue = "";
    let subjectIndex = [
      // @ts-ignore
      ...document.querySelectorAll(".ArtworkItem_artworkItem__2yrsd *"),
    ].findIndex((node) => node.innerText.trim().includes(subject));
    if (subjectIndex !== -1) {
      subjectValue = [
        // @ts-ignore
        ...document.querySelectorAll(".ArtworkItem_artworkItem__2yrsd *"),
      ][subjectIndex + 1].innerText;
    }

    return subjectValue;
  }, subject);
  if (getSubjectValue?.length) {
    subjectIemArr.push(
      ...getSubjectValue
        .toLowerCase()
        .replace(new RegExp("[\u000A]", "gi"), "$")
        .replaceAll(" › ", "$")
        .replaceAll("–", "$")
        .replaceAll(" & ", "$")
        .replaceAll(" and ", "$")
        .replaceAll(" or ", "$")
        .replaceAll("(", "$")
        .replaceAll(")", "$")
        .replaceAll(",", "$")
        .replaceAll("–", "$")
        .replaceAll(";", "$")
        .replaceAll(":", "$")
        .split("$")
        .map((a) =>
          a
            .trim()
            .replace(new RegExp("[^À-ža-z0-9_ ]", "gi"), " ")
            .replace(new RegExp("  ", "gi"), " ")
            .trim()
        )
    );
  }
  return subjectIemArr;
};
const getSMKApi = async (articleId) => {
  const url = `https://api.smk.dk/api/v1/art/?object_number=${articleId}&lang=en`;
  const response = await fetch(url, {
    method: "GET",
  });
  let statusCodeApi = response.status;
  // console.log(response.status);
  let getMetadata = await response.text();
  // let metadata = JSON.parse(getMetadata);
  // console.log(getMetadata);
  return [getMetadata, statusCodeApi];
};
const googleTranslate = async (browser, text, timeout = 2000) => {
  // const browser2 = await puppeteer.launch({
  //   headless: true,
  // });
  const page2 = await browser.newPage();
  try {
    await page2.goto(
      "https://translate.google.com/?sl=da&tl=en&op=translate&text=" + text
    );
    const el1 = await page2.waitForSelector("span>span>span[jsaction]", {
      timeout: timeout,
    });
    const texts = await page2.evaluate(
      "[...document.querySelectorAll('span>span>span[jsaction]')] ? [...document.querySelectorAll('span>span>span[jsaction]')].map(a => a.textContent) : ''"
    );
    // const texts = [
    //   await [...document.querySelectorAll("span>span>span[jsaction]")].map(
    //     (a) => a.textContent
    //   ),
    // ];
    // const description = [await el1.evaluate((e) => e.textContent)];
    let description = texts.join("");
    await page2.waitForTimeout(2000);
    return description;
  } catch (err) {
    throw err;
  } finally {
    await page2.close();
  }
};
