const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const fileType = require("file-type");
const https = require("https");
const { lowerFirst } = require("lodash");
const puppeteer = require("puppeteer");
const cookie = require("cookie");
const { stockphotoTags, IMAGES_EXTENSION, splitText } = require("./utils");
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
      `document.querySelector('${yourSelector}').clientHeight != 0`,
      {
        timeout,
      }
    );
  } catch (e) {
    // ignore
  }
};
(async (
  url = "https://www.slam.org/collection/objects/54962/",
  config = {}
) => {
  const requests_blocked = [];

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on("console", (consoleObj) => console.log(consoleObj.text()));

  await page.goto(url, { waitUntil: "networkidle2" });
  await page.setViewport({ width: 1200, height: 600, deviceScaleFactor: 1 });
  console.log("Start......");
  await page.waitForTimeout(3000);
  await waitForSelector(page, ".rights-and-access-content", 2000);
  let tags = [];
  const data = {
    url,
    tags: [],
    internalTags: [],
    authorTags: [],
  };

  data.articleId = url.replace("://", "").split("/")[3];
  if (!data.articleId && !data.articleId.length) {
    console.log("article id error");
    return false;
  }

  let licenseText = "";
  licenseText = await page.evaluate(() => {
    const licenseIndex = [
      // @ts-ignore
      ...document.querySelectorAll(".mb-0 .mb-4 *"),
    ].findIndex((node) => node.textContent.toLowerCase().trim() === "rights");
    const getLicenseText =
      licenseIndex !== -1
        ? // @ts-ignore
          [...document.querySelectorAll(".mb-0 .mb-4 *")][
            licenseIndex + 1
          ].textContent.toLowerCase()
        : "";
    return getLicenseText;
  });
  console.log("licenseText", licenseText);
  data.isCC0 =
    licenseText.includes("public domain") || licenseText.includes("cc0");
  if (data.isCC0) {
    data.internalTags.push("#nolicenseissue");
    data.internalTags.push("#slam");
  } else {
    data.internalTags.push("#licenseissue");
  }
  data.imageLink = await page.evaluate(
    "document.querySelector(`.viewer-download-buttons [title='Download']`) ? document.querySelector(`.viewer-download-buttons [title='Download']`).getAttribute('href') : '';"
  );
  [imageBuffer, imageMetadata, imageExtension] = await downloadFile(
    data.imageLink
  );
  console.log(imageBuffer);
  console.log(imageExtension);

  // get author
  let rawAuthorText = [];
  const authorKeyword = [
    "artist",
    "printer",
    "maker",
    "designer",
    "photographer",
  ];
  for (var i = 0; i < authorKeyword.length; i++) {
    let authorSubject = authorKeyword[i];
    let getArstistTags = [];
    getArstistTags = await page.evaluate((authorSubject) => {
      let arrAtistTag = [];
      let artistIndex = [
        // @ts-ignore
        ...document.querySelectorAll(".mb-0 .mb-4 *"),
      ].findIndex(
        (node) => node.textContent.toLowerCase().trim() === authorSubject
      );
      if (artistIndex !== -1) {
        // @ts-ignore
        arrAtistTag = [...document.querySelectorAll(".mb-0 .mb-4 *")][
          artistIndex + 1
        ].innerHTML
          .toLowerCase()
          .replace("photographed by", "")
          .replaceAll("<br>or", ",")
          .replaceAll("<br>and", ",")
          .replaceAll("–", ",")
          .split(/<br\s*\/?>/i);
      }

      return arrAtistTag;
    }, authorSubject);
    if (getArstistTags.length) {
      getArstistTags.map((artistTag) => {
        if (artistTag.includes(",")) {
          let arrTag = [];
          arrTag = artistTag
            .split(/[;,]+/)
            .map((a) =>
              a
                .trim()
                .replace(new RegExp("[^äöüÄÖÜßōéÉèa-z0-9_ ]", "gi"), " ")
                .replace(new RegExp("  ", "gi"), " ")
                .trim()
            );
          tags.push(...arrTag);
          rawAuthorText.push(arrTag[0]);
        } else {
          tags.push(artistTag);
          rawAuthorText.push(artistTag);
        }
      });
    }
  }
  rawAuthorText = Array.from(new Set(rawAuthorText));
  data.authorTags = rawAuthorText.length
    ? rawAuthorText.map(
        (a) =>
          `#${a
            .trim()
            .replace(new RegExp("[^äöüÄÖÜßōéÉèa-z0-9]", "gi"), "")
            .replace(new RegExp(" ", "gi"), "")
            .trim()}`
      )
    : [];
  console.log("data.authorTags", data.authorTags);

  // Get Tags
  let getMaterial = await getEachSubject(page, "MATERIAL");
  console.log("getMaterial", getMaterial);
  await pushtoTags(tags, getMaterial);

  let getEngraver = await getEachSubject(page, "ENGRAVER");
  console.log("getEngraver", getEngraver);
  await pushtoTags(tags, getEngraver);

  let getDesigned = await getEachSubject(page, "DESIGNED");
  if (getDesigned?.length) {
    getDesigned = getDesigned.map((a) =>
      a
        .trim()
        .replace("designed in", "")
        .replace(new RegExp("  ", "gi"), " ")
        .trim()
    );
    console.log("getDesigned", getDesigned);
    await pushtoTags(tags, getDesigned);
  }

  let getClassification = await getEachSubject(page, "CLASSIFICATION");
  console.log("getClassification", getClassification);
  await pushtoTags(tags, getClassification);

  let getMadeIn = await getEachSubject(page, "MADE IN");
  if (getMadeIn?.length) {
    getMadeIn = getMadeIn.map((a) =>
      a
        .trim()
        .replace("possibly made in", "")
        .replace("made in", "")
        .replace(new RegExp("  ", "gi"), " ")
        .trim()
    );
    console.log("getMadeIn", getMadeIn);
    await pushtoTags(tags, getMadeIn);
  }

  let getAssociated = await getEachSubject(page, "ASSOCIATED");
  if (getAssociated?.length) {
    getAssociated = getAssociated.map((a) =>
      a
        .trim()
        .replace("with ", "")
        .replace("associated with", "")
        .replace(new RegExp("  ", "gi"), " ")
        .trim()
    );
    console.log("getAssociated", getAssociated);
    await pushtoTags(tags, getAssociated);
  }

  let getPhotographedIn = await getEachSubject(page, "PHOTOGRAPHED IN");
  if (getPhotographedIn?.length) {
    getPhotographedIn = getPhotographedIn.map((a) =>
      a
        .trim()
        .replace("photographed in", "")
        .replace(new RegExp("  ", "gi"), " ")
        .trim()
    );
    console.log("getPhotographedIn", getPhotographedIn);
    await pushtoTags(tags, getPhotographedIn);
  }

  let getCollected = await getEachSubject(page, "COLLECTED");
  if (getCollected?.length) {
    getCollected = getCollected.map((a) =>
      a
        .trim()
        .replace("collected or", "")
        .replace("acquired in", "")
        .replace(new RegExp("  ", "gi"), " ")
        .trim()
    );
    console.log("getCollected", getCollected);
    await pushtoTags(tags, getCollected);
  }

  let getCastIn = await getEachSubject(page, "CAST IN");
  console.log("getCastIn", getCastIn);
  await pushtoTags(tags, getCastIn);

  let getCalligrapher = await getEachSubject(page, "CALLIGRAPHER");
  console.log("getCalligrapher", getCalligrapher);
  await pushtoTags(tags, getCalligrapher);

  let getReign = await getEachSubject(page, "REIGN");
  console.log("getReign", getReign);
  await pushtoTags(tags, getReign);

  let getArtistCulture = await getEachSubject(page, "ARTIST CULTURE");
  console.log("getArtistCulture", getArtistCulture);
  await pushtoTags(tags, getArtistCulture);

  let getPeriod = await getEachSubject(page, "PERIOD");
  console.log("getPeriod", getPeriod);
  await pushtoTags(tags, getPeriod);

  let getDepicted = await getEachSubject(page, "DEPICT");
  if (getDepicted?.length) {
    getDepicted = getDepicted.map((a) =>
      a
        .trim()
        .replace("depicts", "")
        .replace(new RegExp("  ", "gi"), " ")
        .trim()
    );
    console.log("getDepicted", getDepicted);
    await pushtoTags(tags, getDepicted);
  }

  let getPublishedIn = await getEachSubject(page, "PUBLISHED IN");
  if (getPublishedIn?.length) {
    getPublishedIn = getPublishedIn.map((a) =>
      a
        .trim()
        .replace("printed in", "")
        .replace("published in", "")
        .replace(new RegExp("  ", "gi"), " ")
        .trim()
    );
    console.log("getPublishedIn", getPublishedIn);
    await pushtoTags(tags, getPublishedIn);
  }

  let getPrintedIn = await getEachSubject(page, "PRINTED IN");
  if (getPrintedIn?.length) {
    getPrintedIn = getPrintedIn.map((a) =>
      a
        .trim()
        .replace("printed in", "")
        .replace(new RegExp("  ", "gi"), " ")
        .trim()
    );
    console.log("getPrintedIn", getPrintedIn);
    await pushtoTags(tags, getPrintedIn);
  }

  let getPublisher = await getEachSubject(page, "PUBLISHER");
  console.log("getPublisher", getPublisher);
  await pushtoTags(tags, getPublisher);

  let getAttribution = await getEachSubject(page, "ATTRIBUTION");
  console.log("getAttribution", getAttribution);
  await pushtoTags(tags, getAttribution);

  let getPainter = await getEachSubject(page, "PAINTER");
  console.log("getPainter", getPainter);
  await pushtoTags(tags, getPainter);

  let getAfter = await getEachSubject(page, "AFTER");
  console.log("getAfter", getAfter);
  await pushtoTags(tags, getAfter);

  let getFrom = await getEachSubject(page, "FROM");
  if (getFrom?.length) {
    getFrom = getFrom.map((a) =>
      a.startsWith
        ? a
            .trim()
            .replace("from", "")
            .replace("possibly from", "")
            .replace(new RegExp("  ", "gi"), " ")
            .trim()
        : a
            .trim()
            .replace("possibly from", "")
            .replace(new RegExp("  ", "gi"), " ")
            .trim()
    );
    console.log("getFrom", getFrom);
    await pushtoTags(tags, getFrom);
  }

  let getDynasty = await getEachSubject(page, "DYNASTY");
  console.log("getDynasty", getDynasty);
  await pushtoTags(tags, getDynasty);

  let getModeler = await getEachSubject(page, "MODELER");
  console.log("getModeler", getModeler);
  await pushtoTags(tags, getModeler);

  let getCulturalRegion = await getEachSubject(page, "CULTURAL REGION");
  console.log("getCulturalRegion", getCulturalRegion);
  await pushtoTags(tags, getCulturalRegion);

  let getDate = await getEachSubject(page, "DATE");
  console.log("getDate", getDate);
  await pushtoTags(tags, getDate);

  let getExcavatedIn = await getEachSubject(page, "EXCAVATED IN");
  console.log("getExcavatedIn", getExcavatedIn);
  await pushtoTags(tags, getExcavatedIn);

  let getNotes = await page.evaluate(
    "document.querySelector(`.artwork-notes`) ? document.querySelector(`.artwork-notes`).textContent : '';"
  );
  if (getNotes?.length) {
    const wordToDeleteSet = new Set(IGNORE_WORD);
    let notesTags = getNotes
      .replaceAll("  ", " ")
      .replace(new RegExp("[^äöüÄÖÜßōéÉèa-z0-9_ ]", "gi"), "")
      .toLowerCase()
      .split(" ");
    notesTags = notesTags.filter((word) => {
      if (word.length > 2) {
        return !wordToDeleteSet.has(word);
      }
      return false;
    });
    console.log("Notes Tag", notesTags);
    // tags.push(...titleTags);
  }

  // get description from title
  data.description = await page.evaluate(
    "document.querySelector('header .container h1') ? document.querySelector('header .container h1').textContent:''"
  );
  data.description_more = `Original public domain image from <a href="${url}" target="_blank" rel="noopener noreferrer nofollow">Saint Louis Art Museum</a>`;
  if (data.description?.length) {
    let keywordDescription = data.description
      .replace(new RegExp("[^äöüÄÖÜßōéÉèa-z0-9]", "gi"), " ")
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
  tags.map((tag) =>
    data.tags.push(
      tag.trim().replace(new RegExp("[^äöüÄÖÜßōéÉèa-z0-9_ ]", "gi"), "")
    )
  );
  data.tags = Array.from(new Set(data.tags));
  // console.log("tags", tags);

  console.log(data);

  await page.screenshot({
    path: "slam.jpeg",
    type: "jpeg",
    fullPage: true,
    quality: 50,
  });
  await browser.close();
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
      ...document.querySelectorAll(".mb-0 .mb-4 *"),
    ].findIndex((node) => node.innerText.trim().includes(subject));
    if (subjectIndex !== -1) {
      subjectValue = [
        // @ts-ignore
        ...document.querySelectorAll(".mb-0 .mb-4 *"),
      ][subjectIndex + 1].innerHTML;
    }

    return subjectValue;
  }, subject);
  if (getSubjectValue?.length) {
    subjectIemArr.push(
      ...getSubjectValue
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
    );
  }
  return subjectIemArr;
};
