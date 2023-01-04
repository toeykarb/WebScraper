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
(async (url = "https://www.artic.edu/artworks/3812", config = {}) => {
  const browser = await puppeteer.launch({
    headless: false,
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
  let imagePageWtTag = "";
  let imagePage = await page.evaluate(
    "document.querySelector(`head [property='og:url']`) ? document.querySelector(`head [property='og:url']`).getAttribute('content')  : ''"
  );
  console.log(imagePage);
  if (imagePage?.length) {
    imagePageWtTag = `${imagePage}?ef-all_ids=1`;
    await page.goto(imagePageWtTag, { waitUntil: "networkidle0" });
  } else {
    console.log("imagepage error");
  }

  data.articleId = url.replace("://", "").split("/")[2];
  if (!data.articleId && !data.articleId.length) {
    console.log(`incorrect articleId ${data.articleId} for ${url} - skip scraping`);
    // return {
    //   statusCode: 200,
    //   body: {
    //     message: `Incorrect articleId - skip scraping  ${url}`,
    //   },
    // };
  }

  let licenseText = "";
  try {
    licenseText = await page.evaluate(
      "document.querySelector(`[aria-label='credit']`) ? document.querySelector(`[aria-label='credit']`).innerText.toLowerCase() : ''"
    );
  } catch (error) {
    console.log(error);
  }
  data.isCC0 = licenseText.includes("public domain") || licenseText.includes("cc0");
  if (data.isCC0) {
    data.internalTags.push("#nolicenseissue");
    data.internalTags.push("#aichicago");
    // data.tags.push(...CC0_TAGS);
  } else {
    console.log(`CC0 ignored - skip scraping ${url}`);
    // return {
    //   statusCode: 200,
    //   url: url,
    //   message: `CC0 ignored - skip scraping ${url}`,
    // };
  }
  data.imageLink = "";
  let downloadFromThumbnail = true;
  if (downloadFromThumbnail) {
    let imageParameter = "";
    let imageIIIFId = await page.evaluate(
      "document.querySelector(`[data-gallery-hero] [data-iiifid]`) ? document.querySelector(`[data-gallery-hero] [data-iiifid]`).getAttribute('data-iiifid') : ''"
    );
    let imageSource = await page.evaluate(
      "document.querySelector(`[data-gallery-thumbs] [data-gallery-img-download-url]`) ? document.querySelector(`[data-gallery-thumbs] [data-gallery-img-download-url]`).getAttribute('data-gallery-img-srcset') : ''"
    );
    if (imageIIIFId?.length) {
      if (imageSource?.length) {
        let getQualityValue = imageSource.split(" ");
        let qualityValue = [];
        getQualityValue.forEach((element) => {
          if (!element.includes("www.artic.edu")) {
            let imageQuality = element.replace("w", "");
            if (parseInt(imageQuality, 10)) {
              qualityValue.push(parseInt(imageQuality, 10));
            }
          }
        });
        console.log("getQualityValue", qualityValue);
        let bestQuality = qualityValue.sort((a, b) => b - a);
        console.log("bestQuality", bestQuality);
        imageParameter = `/full/${bestQuality[0]},/0/default.jpg`;
      } else {
        imageParameter = "/full/843,/0/default.jpg";
      }
      data.imageLink = `${imageIIIFId}${imageParameter}`;
    } else {
      console.log("Download link error");
    }
  } else {
    data.imageLink = await page.evaluate(
      "document.querySelector(`[data-gallery-thumbs] [data-gallery-img-download-url]`) ? document.querySelector(`[data-gallery-thumbs] [data-gallery-img-download-url]`).getAttribute('data-gallery-img-download-url') : ''"
    );
  }
  console.log("data.imageLink", data.imageLink);
  [imageBuffer, imageMetadata, imageExtension] = await downloadFile(data.imageLink);
  console.log(imageBuffer);
  console.log(imageMetadata);
  console.log(imageExtension);

  let rawAuthorLink = "";
  let rawAuthorText = "";
  try {
    rawAuthorLink = await page.evaluate(
      "document.querySelector(`[itemprop='creator'] a`) ? document.querySelector(`[itemprop='creator'] a`).getAttribute('href') : ''"
    );
    rawAuthorText = await page.evaluate(
      "document.querySelector(`[itemprop='creator'] a`) ? document.querySelector(`[itemprop='creator'] a`).innerText: ''"
    );
  } catch (error) {
    console.log(error);
  }
  data.authorLink = rawAuthorLink && rawAuthorLink.length ? rawAuthorLink : "";

  data.authorTags = rawAuthorText.length
    ? [
        `#${rawAuthorText
          .trim()
          .toLowerCase()
          .replace(new RegExp("[^À-ža-z0-9]", "gi"), "")
          .trim()}`,
      ]
    : [];
  tags.push(
    rawAuthorText
      .trim()
      .replaceAll("&", "and")
      .replace(new RegExp("[^À-ža-z0-9]", "gi"), " ")
      .replace(new RegExp(" {2}", "gi"), " ")
      .trim()
  );
  let departmentTag = await page.evaluate(
    "document.querySelector(`[aria-label='Additional information'] .list a`) ? document.querySelector(`[aria-label='Additional information'] .list a`).textContent : ''"
  );
  if (departmentTag?.length) {
    data.internalTags.push(
      `#${departmentTag.trim().toLowerCase().replace(new RegExp("[^À-ža-z0-9]", "gi"), "").trim()}`
    );
  }
  let getMedium = await page.evaluate(
    `document.querySelector("[itemprop='material'] .f-secondary") ? document.querySelector("[itemprop='material'] .f-secondary").textContent : ''`
  );
  if (getMedium?.length) {
    tags.push(
      ...getMedium
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
            .replace(new RegExp("[^a-z0-9_ ]", "gi"), " ")
            .replace(new RegExp("  ", "gi"), " ")
            .trim()
        )
    );
  }
  // await pushtoTags(tags, getMedium);
  console.log("getMedium ", getMedium);

  let getDateCreated = await page.evaluate(
    `document.querySelector("[itemprop='dateCreated'] .f-secondary") ? document.querySelector("[itemprop='dateCreated'] .f-secondary").textContent : ''`
  );
  if (getDateCreated?.length) {
    tags.push(
      ...getDateCreated
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
    );
  }
  // await pushtoTags(tags, getMedium);
  // console.log("getDateCreated ", getDateCreated);

  let getPlace = await page.evaluate(
    `document.querySelector("[itemprop='locationCreated'] .f-secondary") ? document.querySelector("[itemprop='locationCreated'] .f-secondary").textContent : ''`
  );
  if (getPlace?.length) {
    tags.push(getPlace.toLowerCase().replaceAll("(", "$").replaceAll(")", "$").split("$")[0]);
  }

  let getTitle = await page.evaluate(
    `document.querySelector("[itemprop='name'] .f-secondary") ? document.querySelector("[itemprop='name'] .f-secondary").textContent.trim() : ''`
  );
  if (getTitle?.length) {
    data.description = getTitle;
    const wordToDeleteSet = new Set(IGNORE_WORD);
    let titleTags = getTitle
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
  data.description_more = `Original public domain image from <a href="${url}" target="_blank" rel="noopener noreferrer nofollow">Art Institute of Chicago</a>`;
  if (rawAuthorText?.length) {
    data.description += ` by ${rawAuthorText}`;
  }
  let getDescription = await page.evaluate(
    `document.querySelector(".o-article__body [itemprop='description']") ? document.querySelector(".o-article__body [itemprop='description']").textContent.trim() : ''`
  );
  if (getDescription?.length) {
    console.log("getDescription ", getDescription);
    const wordToDeleteSet = new Set(IGNORE_WORD);
    let titleTags = getDescription
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
  // console.log("getMakerSubject", getMakerSubject);
  // const descriptions = [];
  // const selector = ".sr-only";
  // await page.$$eval(selector, (els) => els.forEach((el) => el.remove()));
  // let getTitle = await page.evaluate(
  //   "document.querySelector(`.o-article__inline-header`) ? document.querySelector(`.o-article__inline-header`).innerText: ''"
  // );
  // if (getTitle?.length) {
  //   descriptions.push(getTitle);
  // }

  // let getDescription = await page.evaluate(
  //   "document.querySelector(`[itemprop='description'] p`) ? document.querySelector(`[itemprop='description'] p`).innerText: ''"
  // );
  // if (getDescription?.length) {
  //   descriptions.push(getDescription);
  // }
  // const description = descriptions.join("\n");
  // data.description =
  //   description && description.length ? description.replace(new RegExp("\\n", "gi"), "<br/>") : "";

  // console.log("description ", description);

  let getAllTags = await page.evaluate(() => {
    const allTags = document.querySelectorAll(
      `#exploreFurther [aria-labelledby='h-all-tags-on-this-artwork'] .f-link a`
    )
      ? [
          ...document.querySelectorAll(
            `#exploreFurther [aria-labelledby='h-all-tags-on-this-artwork'] .f-link a`
          ),
        ].map((tag) => tag.innerText)
      : [];

    return allTags;
  });
  if (getAllTags?.length) {
    let subjectIemArr = [];
    getAllTags.map((tag) => {
      tags.push(
        ...tag
          .toLowerCase()
          .replaceAll("&", "$")
          .replaceAll(" and ", "$")
          .replaceAll(" or ", "$")
          .replaceAll("(", "$")
          .replaceAll(")", "$")
          .replaceAll(",", "$")
          .replaceAll("–", "$")
          .replaceAll(";", "$")
          .replaceAll(":", "$")
          .replaceAll("/", "$")
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
    console.log("getAllTags ", getAllTags);
  }
  // console.log("getAllTags ", getAllTags);
  await page.screenshot({
    path: "aichicago.jpeg",
    type: "jpeg",
    fullPage: true,
    quality: 50,
  });
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
  let getMetadata = await page.evaluate(
    `document.querySelector("[itemprop='${subject}'] .f-secondary") ? document.querySelector("[itemprop='${subject}'] .f-secondary").textContent : ''`
  );
  if (getMetadata?.length) {
    subjectIemArr.push(
      ...getMetadata
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
