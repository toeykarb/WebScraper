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

(async (
  url = "https://www.webumenia.sk/en/dielo/SVK:SNG.O_1803",
  config = {}
) => {
  const requests_blocked = [];

  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  // page.on("console", (consoleObj) => console.log(consoleObj.text()));

  await page.goto(url, { waitUntil: "networkidle2" });
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

  let articleId = url.replace("://", "").split("/")[3]
    ? url.replace("://", "").split("/")[3]
    : "";

  data.articleId = articleId
    .trim()
    .toLowerCase()
    .replace(new RegExp("[^a-z0-9-]", "gi"), "")
    .replace(new RegExp(" ", "gi"), "")
    .trim();
  console.log("articleId", data.articleId);

  let licenseText = "";
  try {
    licenseText = await page.evaluate(
      "document.querySelector(`.table tr [rel='license']`) ? document.querySelector(`.table tr [rel='license']`).innerText.toLowerCase() : ''"
    );
  } catch (error) {
    console.log(error);
  }
  data.isCC0 = licenseText.includes("public domain");
  if (data.isCC0) {
    data.internalTags.push("#nolicenseissue");
    data.internalTags.push("#webumenia");
  } else {
    console.log(`CC0 ignored - ${url}`);
    // return {
    //   statusCode: 200,
    //   url: url,
    //   message: 'CC0 ignored',
    // };
  }

  data.imageLink = await page.evaluate(
    "document.querySelector(`.text-center #download`) ? document.querySelector(`.text-center #download`).getAttribute('href') : ''"
  );
  if (!data.imageLink || !data.imageLink.length) {
    console.log(`No image link - skip scraping - ${url}`);
    // return {
    //   statusCode: 200,
    //   body: {
    //     message: `No image link - skip scraping  ${url}`,
    //   },
    // };
  }
  [imageBuffer, imageMetadata, imageExtension] = await downloadFile(
    data.imageLink
  );
  console.log(imageBuffer);
  console.log(imageMetadata);
  console.log(imageExtension);
  let authorsArr = [];
  let rawAuthorLink = "";
  let rawAuthorText = "";
  let rawAuthorLink2 = "";
  let rawAuthorText2 = "";
  data.authorTags = [];
  try {
    rawAuthorLink = await page.evaluate(
      "document.querySelector(`[itemprop='creator'] a`) ? document.querySelector(`[itemprop='creator'] a`).getAttribute('href') : ''"
    );
    rawAuthorLink2 = await page.evaluate(
      "document.querySelector(`.inline>.underline`) ? document.querySelector(`.inline>.underline`).getAttribute('href') : ''"
    );
    rawAuthorText = await page.evaluate(
      "document.querySelector(`[itemprop='creator'] [itemprop='name']`) ? document.querySelector(`[itemprop='creator'] [itemprop='name']`).innerText : ''"
    );
    rawAuthorText2 = await page.evaluate(
      "document.querySelector(`.inline>.underline`) ? document.querySelector(`.inline>.underline`).innerText : ''"
    );
  } catch (error) {
    console.log(error);
  }
  data.authorLink = rawAuthorLink && rawAuthorLink.length ? rawAuthorLink : "";
  if (!data.authorLink?.length) {
    data.authorLink =
      rawAuthorLink2 && rawAuthorLink2.length ? rawAuthorLink2 : "";
  }
  authorsArr.push(rawAuthorText, rawAuthorText2);
  let authorsArrResult = authorsArr.filter((e) => e);
  let authorTranslate = await googleTranslate(
    browser,
    authorsArrResult.join(",")
  );
  let getAuthor = authorTranslate.split(",");
  console.log("data.authorLink", data.authorLink);
  if (getAuthor?.length) {
    getAuthor.map((item) => {
      if (item.length) {
        data.authorTags.push(
          `#${item
            .trim()
            .toLowerCase()
            .replace(new RegExp("[^À-ža-z0-9]", "gi"), "")
            .trim()}`
        );
        tags.push(
          `${item
            .trim()
            .toLowerCase()
            .replace(new RegExp("[^À-ža-z0-9]", "gi"), " ")
            .replace(new RegExp("  ", "gi"), " ")
            .trim()}`
        );
      }
    });
    console.log("rawAuthorText", getAuthor);
  }
  console.log("data.authorTags", data.authorTags);

  let getDate = await getEachSubject(page, "DATE:");
  await pushtoTags(tags, getDate);
  console.log("getDate", getDate);

  let getWorkType = await getEachSubject(page, "WORK TYPE:");
  console.log("getWorkType", getWorkType);
  await pushtoTags(tags, getWorkType);
  // if (getWorkType?.length) {
  //   let getWorkTypeTranslate = await googleTranslate(
  //     browser,
  //     getWorkType.join(",")
  //   );
  //   let workTypeArr = getWorkTypeTranslate.split(",");
  //   // tags.push(...getWorkTypeTranslate);
  //   await pushtoTags(tags, workTypeArr);
  //   console.log("workTypeArr", workTypeArr);
  // }

  let getObjectType = await getEachSubject(page, "OBJECT TYPE:");
  console.log("getObjectType", getObjectType);
  await pushtoTags(translateTags, getObjectType);
  // if (getObjectType?.length) {
  //   let getObjectTypeTranslate = await googleTranslate(
  //     browser,
  //     getObjectType.join(",")
  //   );
  //   let objTypeArr = getObjectTypeTranslate.split(",");
  //   // tags.push(...getWorkTypeTranslate);
  //   await pushtoTags(tags, objTypeArr);
  //   console.log("objTypeArr", objTypeArr);
  // }
  // await pushtoTags(tags, getObjectType);
  // console.log("getObjectType", getObjectType);

  let getGenre = await getEachSubject(page, "GENRE:");
  await pushtoTags(translateTags, getGenre);
  console.log("getGenre", getGenre);

  let getMaterial = await getEachSubject(page, "MATERIAL:");
  await pushtoTags(translateTags, getMaterial);
  console.log("getMaterial", getMaterial);

  let getTechnique = await getEachSubject(page, "TECHNIQUE:");
  await pushtoTags(translateTags, getTechnique);
  console.log("getTechnique", getTechnique);

  // get tags
  try {
    const keywordTags = await page.evaluate(
      "[...document.querySelectorAll('.attributes .multiline .btn')] ? [...document.querySelectorAll('.attributes .multiline .btn')].map(a => a.innerText.trim().toLowerCase()) : []"
    );
    await pushtoTags(translateTags, keywordTags);
    console.log("keywordTags", keywordTags);
    // if (keywordTags?.length) {
    //   let getKeywordTags = await googleTranslate(
    //     browser,
    //     keywordTags.join(",")
    //   );
    //   let keywordTagsArr = getKeywordTags
    //     .split(",")
    //     .map((a) =>
    //       a
    //         .replaceAll("  ", " ")
    //         .replace(new RegExp("[^À-ža-z0-9_ ]", "gi"), "")
    //         .toLowerCase()
    //     );
    //   // tags.push(...getWorkTypeTranslate);
    //   console.log("getKeywordTags", keywordTagsArr);
    //   tags.push(...keywordTagsArr);
    // }
  } catch (err) {
    console.log(err);
  }

  let getTitle = await page.evaluate(
    "document.querySelector(`.content-section .nadpis-dielo`) ? document.querySelector(`.content-section .nadpis-dielo`).textContent : ''"
  );
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
  data.description_more = `Original public domain image from <a href="${url}" target="_blank" rel="noopener noreferrer nofollow">Web umenia</a>`;

  translateTags = Array.from(new Set(translateTags));

  let tagsTranslate = await googleTranslate(browser, translateTags.join(","));
  let translateTagsArr = tagsTranslate.split(",");
  console.log("translateTagsArr", translateTagsArr);
  tags.push(...translateTagsArr);
  tags.map((tag) =>
    data.tags.push(tag.trim().replace(new RegExp("[^À-ža-z0-9_ ]", "gi"), ""))
  );
  data.tags = Array.from(new Set(data.tags));
  console.log(data);

  // console.log("test2", test2);
  // await page.screenshot({
  //   path: "ume.jpeg",
  //   type: "jpeg",
  //   fullPage: true,
  //   quality: 50,
  // });
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
      ...document.querySelectorAll(".attributes tbody tr *"),
    ].findIndex((node) => node.innerText.trim().includes(subject));
    if (subjectIndex !== -1) {
      subjectValue = [
        // @ts-ignore
        ...document.querySelectorAll(".attributes tbody tr *"),
      ][subjectIndex + 1].innerText;
    }

    return subjectValue;
  }, subject);
  if (getSubjectValue?.length) {
    subjectIemArr.push(
      ...getSubjectValue
        .toLowerCase()
        .replaceAll("okolo", "")
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

const googleTranslate = async (browser, text, timeout = 2000) => {
  // const browser2 = await puppeteer.launch({
  //   headless: true,
  // });
  const page2 = await browser.newPage();
  try {
    await page2.goto(
      "https://translate.google.com/?sl=sk&tl=en&op=translate&text=" + text
    );
    const el1 = await page2.waitForSelector("span>span>span[jsaction]", {
      timeout: timeout,
    });
    const texts = [await el1.evaluate((e) => e.textContent.toLowerCase())];
    await page2.waitForTimeout(2000);
    return texts[0];
  } catch (err) {
    throw err;
  } finally {
    await page2.close();
  }
};
