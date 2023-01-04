const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
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
const waitForSelector = async (page, yourSelector, timeout) => {
  try {
    await page.waitForFunction(`document.querySelector('${yourSelector}').clientHeight != 0`, {
      timeout,
    });
  } catch (e) {
    // ignore
  }
};
(async (
  url = "https://sammlung.wienmuseum.at/en/object/143757-entbloesster-oberkoerper-eines-baertigen-alten-mannes/",
  config = {}
) => {
  const requests_blocked = [];

  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();
  let tags = [];
  var translateTags = [];
  const data = {
    url,
    tags: [],
    internalTags: [],
    authorTags: [],
  };

  // page.on("console", (consoleObj) => console.log(consoleObj.text()));
  await page.setViewport({ width: 2000, height: 1200, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "networkidle0" });

  await waitForSelector(page, ".relative figure picture>source", 1000);

  const cookieCloseButton = await page.$(`.fixed [data-consent]`);
  if (cookieCloseButton) {
    try {
      await cookieCloseButton.evaluate((b) => b.click());
    } catch (error) {
      console.log(error);
    }
  }
  await page.waitForTimeout(500);

  var getInventoryNumber = "";
  getInventoryNumber = await page.evaluate(() => {
    const InventoryNumberIndex = [
      // @ts-ignore
      ...document.querySelectorAll(".object-details .row *"),
    ].findIndex((node) => node.textContent.trim() === "Inventory number");
    const textSource =
      InventoryNumberIndex !== -1
        ? // @ts-ignore
          [...document.querySelectorAll(".object-details .row *")][InventoryNumberIndex + 1]
            .textContent
        : "";
    return textSource;
  });

  if (getInventoryNumber?.length) {
    data.articleId = getInventoryNumber
      .trim()
      .toLowerCase()
      .replaceAll(".", "--")
      .replace(new RegExp(" ", "gi"), "__")
      .replaceAll("/", "_")
      .replace(new RegExp("[^a-z0-9-_]", "gi"), "")
      .trim();
  }

  let licenseText = "";
  try {
    licenseText = await page.evaluate(
      "document.querySelector(`[data-object-image] figcaption`) ? document.querySelector(`[data-object-image] figcaption`).innerText.toLowerCase() : ''"
    );
  } catch (error) {
    console.log(error);
  }
  data.isCC0 = licenseText.includes("public domain") || licenseText.includes("cc0");
  if (data.isCC0) {
    data.internalTags.push("#nolicenseissue");
    data.internalTags.push("#wienmuseum");
    // data.tags.push(...CC0_TAGS);
  } else {
    console.log(`CC0 ignored - ${url}`);
    // return {
    //   statusCode: 200,
    //   url: url,
    //   message: `CC0 ignored - ${url}`,
    // };
  }
  data.imageLink = await page.evaluate(
    "document.querySelector(`[data-object-image] picture img`) ? document.querySelector(`[data-object-image] picture img`).getAttribute('data-src') : ''"
  );

  [imageBuffer, imageMetadata, imageExtension] = await downloadFile(data.imageLink);
  console.log(imageBuffer);
  console.log(imageMetadata);
  console.log(imageExtension);

  let rawAuthorText = [];
  let rawAuthorLink = "";
  data.authorTags = [];
  let authorValue = [];
  try {
    rawAuthorText = await page.evaluate(
      "document.querySelectorAll(`[class='sm:mr-10'] .tag`) ? [...document.querySelectorAll(`[class='sm:mr-10'] .tag`)].map(a => a.innerText) : []"
    );
    rawAuthorLink = await page.evaluate(
      "document.querySelector(`[class='sm:mr-10'] .tag`)  ? document.querySelector(`[class='sm:mr-10'] .tag`).getAttribute('href') : ''"
    );
  } catch (err) {
    console.log(err);
  }
  data.authorLink = rawAuthorLink && rawAuthorLink.length ? rawAuthorLink : "";

  console.log("rawAuthorText", rawAuthorText);
  if (rawAuthorText?.length) {
    rawAuthorText.forEach((item) => {
      console.log(item);
      if (item.length) {
        data.authorTags.push(
          `#${item
            .split("(")[0]
            .trim()
            .toLowerCase()
            .replace(new RegExp("[^À-ža-z0-9]", "gi"), "")
            .trim()}`
        );
        authorValue.push(
          `${item
            .split("(")[0]
            .trim()
            .replaceAll("&", "and")
            .replace(new RegExp("[^À-ža-z0-9]", "gi"), " ")
            .replace(new RegExp(" {2}", "gi"), " ")
            .trim()}`
        );
      }
    });
    authorValue.map((a) => data.tags.push(a.toLowerCase()));
  }

  console.log("data.authorTags", data.authorTags);

  let getClassification = await getEachSubject(page, "Classification");
  await pushtoTags(translateTags, getClassification);
  console.log("getClassification", getClassification);

  // let getImageDate = await getEachSubject(page, "Date");
  let getImageDate = await page.evaluate(() => {
    let subjectValues = [];
    let subjectIndex = [
      // @ts-ignore
      ...document.querySelectorAll(".object-details .row *"),
    ].findIndex((node) => node.textContent.trim() == "Date");
    if (subjectIndex !== -1) {
      let getNodeList = [
        // @ts-ignore
        ...document.querySelectorAll(".object-details .row *"),
      ][subjectIndex + 2];
      subjectValues = getNodeList.querySelectorAll("li")
        ? [...getNodeList.querySelectorAll("li")].map((a) => a.textContent)
        : [];
    }

    return subjectValues;
  });

  console.log("getImageDate", getImageDate);
  if (getImageDate?.length) {
    let imageDate = [];
    getImageDate.map((item) =>
      imageDate.push(
        ...item
          .toLowerCase()
          .replaceAll("–", "to")
          .replaceAll(";", "$")
          .replaceAll(":", "$")
          .split("$")
          .map((a) =>
            a
              .trim()
              .replace(new RegExp("[^a-z0-9_ ]", "gi"), " ")
              .replace(new RegExp("  ", "gi"), " ")
              .trim()
          )
      )
    );
    await pushtoTags(tags, imageDate);
  }

  let getMaterial = await getEachSubject(page, "Material");
  await pushtoTags(translateTags, getMaterial);
  console.log("getMaterial", getMaterial);

  let getTechnique = await getEachSubject(page, "Technique");
  await pushtoTags(translateTags, getTechnique);
  console.log("getTechnique", getTechnique);

  let getThemes = await getEachSubject(page, "Themes");
  await pushtoTags(translateTags, getThemes);
  console.log("getThemes", getThemes);

  let getSubjects = await getEachSubject(page, "Subjects");
  await pushtoTags(translateTags, getSubjects);
  console.log("getSubjects", getSubjects);
  console.log(translateTags.join(","));
  const translateTagsVal = await googleTranslate(browser, translateTags.join(","), 3000);
  console.log("translateTagsVal", translateTagsVal);
  const translateTagsArr = translateTagsVal.split(",");

  tags.push(...translateTagsArr);

  let getTitle = await page.evaluate(
    "document.querySelector(`header .flex h1`) ? document.querySelector(`header .flex h1`).textContent : ''"
  );
  if (getTitle?.length) {
    const titleTranslate = await googleTranslate(browser, getTitle);
    console.log("titleTranslate", titleTranslate);
    data.description = titleTranslate;
    const wordToDeleteSet = new Set(IGNORE_WORD);
    let titleTags = titleTranslate
      // @ts-ignore
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
    tags.push(...titleTags);
  }

  data.description_more = `Original public domain image from <a href="${url}" target="_blank" rel="noopener noreferrer nofollow">Wien Museum</a>`;
  if (authorValue?.length) {
    let authorValueSize = authorValue.length;
    for (var i = 0; i < authorValue.length; i++) {
      if (i === 0) {
        data.description += ` by ${authorValue[i]}`;
      } else if (i !== authorValueSize - 1) {
        data.description += `, ${authorValue[i]}`;
      } else {
        data.description += ` and ${authorValue[i]}`;
      }
    }
  }
  tags.map((tag) => {
    if (tag.length > 0) {
      data.tags.push(
        tag
          .trim()
          .toLowerCase()
          .replace(new RegExp("[^À-ža-z0-9_ ]", "gi"), "")
          .replace(new RegExp(" {2}", "gi"), " ")
      );
    }
  });
  data.tags = Array.from(new Set(data.tags));
  console.log(data);
  // await page.screenshot({
  //   path: "wien.jpeg",
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
    let subjectValues = [];
    let subjectIndex = [
      // @ts-ignore
      ...document.querySelectorAll(".object-details .row *"),
    ].findIndex((node) => node.textContent.trim() == subject);
    if (subjectIndex !== -1) {
      let getNodeList = [
        // @ts-ignore
        ...document.querySelectorAll(".object-details .row *"),
      ][subjectIndex + 2];
      subjectValues = getNodeList.querySelectorAll(".tag")
        ? [...getNodeList.querySelectorAll(".tag")].map((a) => a.textContent)
        : [];
    }

    return subjectValues;
  }, subject);
  if (getSubjectValue?.length) {
    getSubjectValue.map((item) =>
      subjectIemArr.push(
        ...item
          .toLowerCase()
          .replaceAll("<br>and ", "$")
          .replaceAll("<br>or ", "$")
          .replaceAll("<br>", " ")
          .replaceAll("", "")
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
              .replace(new RegExp("[^äöüÄÖÜßōéÉèa-z0-9_ ]", "gi"), " ")
              .replace(new RegExp("  ", "gi"), " ")
              .trim()
          )
      )
    );
  }
  return subjectIemArr;
};

const googleTranslate = async (browser, text, timeout = 2000) => {
  const page2 = await browser.newPage();
  var description = "";
  try {
    const allText = [];
    await page2.goto(`https://translate.google.com/?sl=de&tl=en&op=translate&text=${text}`);
    await page2.waitForSelector("span>span>span[jsaction]", {
      timeout: timeout,
    });
    const texts = await page2.evaluate(
      "[...document.querySelectorAll('span>span>span[jsaction]')] ? [...document.querySelectorAll('span>span>span[jsaction]')].map(a => a.textContent) : ''"
    );
    texts.map((a) => {
      if (!a.includes("Google Translate")) {
        allText.push(a);
      }
    });
    description = allText.join("");
  } catch (err) {
    console.log("google translate error");
    console.log(err);
  } finally {
    await page2.close();
  }
  console.log(description.length);
  if (description.length > 0) {
    return description;
  } else {
    return text;
  }
};
