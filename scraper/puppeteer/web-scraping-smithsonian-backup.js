const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const fileType = require("file-type");
const puppeteer = require("puppeteer");
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
  "around",
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

/**
 * @param {import('puppeteer').Page} page
 */
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
  url = "https://www.si.edu/object/portrait-charles-j-f-henault-1685-1770:chndm_1931-94-138",
  config = {}
) => {
  const requests_blocked = [];
  var projectTags = ["#pdgroupflickrnasa1"];
  var internalTags = [];

  const browser = await puppeteer.launch({ headless: true, devtools: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 2000, height: 1200, deviceScaleFactor: 1 });
  page.on("console", (consoleObj) => console.log(consoleObj.text()));

  //await page.setViewport({ width: 2000, height: 1200, deviceScaleFactor: 1 });

  await page.goto(url, {
    timeout: 6 * 1000,
    waitUntil: ["domcontentloaded"],
  });
  console.log("Start......");
  // await page.waitForTimeout(3000);
  let tags = [];
  const data = {
    url,
    tags: [],
    internalTags: [],
  };
  // get articleId
  let articleId = await page.evaluate(
    "document.querySelector(`.media-container .media-metadata`) ? document.querySelector(`.media-container .media-metadata`).getAttribute('data-idsid') :''"
  );

  data.articleId = articleId
    .trim()
    .replace(new RegExp("[^a-z0-9]", "gi"), "")
    .replace(new RegExp(" ", "gi"), "")
    .trim();
  if (!data.articleId && !data.articleId.length) {
    console.log("article id error");
    return false;
  }
  // await page.waitForSelector(".media-inner a .b-loaded", { timeout: 5000 });
  await waitForSelector(page, ".media-inner a .b-loaded", 5000);
  // get imageLink
  data.imageLink = `https://ids.si.edu/ids/download?id=${articleId}.tif`;
  const fetchStatusTIFF = await checkImageLink(data.imageLink);
  console.log("fetchStatusTIFF", `${fetchStatusTIFF}    ${data.imageLink}`);
  if (fetchStatusTIFF !== 200) {
    data.imageLink = `https://ids.si.edu/ids/download?id=${articleId}.jpg`;
    const fetchStatusJPG = await checkImageLink(data.imageLink);
    console.log("fetchStatusJPG", fetchStatusJPG);
    if (fetchStatusJPG !== 200) {
      let imageLink = await page.evaluate(() => {
        let downloadLink = "";
        const downloadOptionIndex = [
          // @ts-ignore
          ...document.querySelectorAll(".popover-body ul li *"),
        ];
        let screenImageIndex = downloadOptionIndex.findIndex(
          (node) => node.textContent.trim() === "Screen Image"
        );

        if (screenImageIndex !== -1) {
          downloadLink = [...document.querySelectorAll(".popover-body ul li *")][
            screenImageIndex
          ].getAttribute("href");
        }
        if (!downloadLink.length) {
          console.log("test");
          downloadLink = document.querySelector(`.media-inner .image img`)
            ? document.querySelector(`.media-inner .image img`).getAttribute("src")
            : "";
        }
        return downloadLink;
      });
      data.imageLink = imageLink;
    }
  }
  console.log("imagelink", data.imageLink);

  // get license
  let licenseText = "";
  try {
    licenseText = await page.evaluate(
      "document.querySelector('.field-freetextobjectrights dd') ? document.querySelector('.field-freetextobjectrights dd').innerText.toLowerCase():''"
    );
  } catch (error) {
    console.log(error);
  }
  data.isCC0 = licenseText.includes("cc0") || licenseText.includes("public domain");
  console.log("CC0", data.isCC0);
  if (data.isCC0) {
    data.internalTags.push("#nolicenseissue");
    data.internalTags.push("#smithsonian");
    // data.tags.push(...CC0_TAGS);
  } else {
    console.log(`CC0 ignored - ${url}`);
    return {
      statusCode: 200,
      url: url,
      message: "CC0 ignored",
    };
  }

  // get description
  let description = await page.evaluate(() => {
    let getDescription = "";
    let descriptionIndex = [
      // @ts-ignore
      ...document.querySelectorAll(".field-freetextnotes *"),
    ].findIndex((node) => node.textContent.trim() === "Description");
    if (descriptionIndex !== -1) {
      // @ts-ignore
      getDescription = [...document.querySelectorAll(".field-freetextnotes *")][
        descriptionIndex + 1
      ].textContent;
    }

    return getDescription;
  });
  console.log("long description : ", description);
  if (description?.length) {
    let keywordDescription = description.replace(new RegExp("[^a-z0-9]", "gi"), " ").split(" ");
    keywordDescription = keywordDescription.map((element) => element.toLowerCase().trim());
    const wordToDeleteSet = new Set(IGNORE_WORD);
    keywordDescription = keywordDescription.filter((word) => {
      if (word.length > 2) {
        return !wordToDeleteSet.has(word);
      }
      return false;
    });
    // descriptionKeywords.push(...keywordDescription);

    data.tags.push(...keywordDescription);
  }

  // get description from title
  data.description = await page.evaluate(
    "document.querySelector('.page-title h1') ? document.querySelector('.page-title h1').textContent:''"
  );

  const descriptionKeywords = [];
  if (data.description?.length) {
    let keywordDescription = data.description
      .replace(new RegExp("[^a-z0-9]", "gi"), " ")
      .split(" ");
    keywordDescription = keywordDescription.map((element) => element.toLowerCase().trim());
    const wordToDeleteSet = new Set(IGNORE_WORD);
    keywordDescription = keywordDescription.filter((word) => {
      if (word.length > 2) {
        return !wordToDeleteSet.has(word);
      }
      return false;
    });
    // descriptionKeywords.push(...keywordDescription);

    data.tags.push(...keywordDescription);
  }

  console.log("description : ", data.description);

  // get Artist
  // artist keyword
  let getArstist = await page.evaluate(() => {
    let artists = [];
    artists = document.querySelectorAll(".field-freetextname dd")
      ? [...document.querySelectorAll(".field-freetextname dd")].map((a) =>
          a.innerText.toLowerCase()
        )
      : [];
    if (artists.includes("unknown")) {
      artists = [];
    }
    return artists;
  });
  getArstist.map((a) => (a.includes(",") ? tags.push(a.split(",")[0]) : tags.push(a)));
  console.log(getArstist);
  // artist internalTag
  let getArstistTags = await page.evaluate(() => {
    let atistTags = [];

    const authorKeyword = ["Artist", "Designer", "Print Maker", "Photograph by", "Created by"];
    for (var i = 0; i < authorKeyword.length; i++) {
      let atistTag = "";
      let artistIndex = [...document.querySelectorAll(".field-freetextname *")].findIndex(
        (node) => node.textContent.trim() === authorKeyword[i]
      );
      if (artistIndex !== -1) {
        atistTag = [...document.querySelectorAll(".field-freetextname *")][
          artistIndex + 1
        ].textContent.toLowerCase();
      }

      if (atistTag.length && !atistTag.includes("unknown")) {
        if (atistTag.includes(",")) {
          atistTag = atistTag.split(",")[0];
        }
        atistTags.push(atistTag);
      }
    }

    return atistTags;
  });
  console.log("getArstistTags", getArstistTags);
  data.authorTags = [];
  if (getArstistTags.length) {
    getArstistTags.map((getArstistTag) =>
      data.authorTags.push(
        `#${getArstistTag
          .trim()
          .replace(new RegExp("[^a-z0-9]", "gi"), "")
          .replace(new RegExp(" ", "gi"), "")
          .trim()}`
      )
    );
  }
  console.log("authorTags", data.authorTags);
  let rawgalleryText = "";
  let galleryLink = await page.evaluate(
    "document.querySelector('.panel-pane .field--name-field-tagline a') ? document.querySelector('.panel-pane .field--name-field-tagline a').getAttribute('href') :''"
  );
  let galleryText = await page.evaluate(
    "document.querySelector(`.panel-pane .field--name-field-tagline a`) ? document.querySelector(`.panel-pane .field--name-field-tagline a`).innerText:''"
  );
  if (galleryLink && galleryLink.startsWith("/")) {
    galleryLink = `https://www.si.edu${galleryLink}`;
  }
  data.authorLink = galleryLink && galleryLink.length ? galleryLink : "";
  rawgalleryText = galleryText.length
    ? `#${galleryText
        .trim()
        .toLowerCase()
        .replace(new RegExp("[^a-z0-9]", "gi"), "")
        .replace(new RegExp(" ", "gi"), "")
        .trim()}`
    : "";
  data.authorTags.push(rawgalleryText);
  // get tags
  let objectType = await page.evaluate(
    "document.querySelectorAll('.field-freetextobjecttype dd') ? [...document.querySelectorAll('.field-freetextobjecttype dd')].map((a)=> a.innerText.toLowerCase()):[]"
  );
  tags.push(...objectType);

  let topicTag = [];
  let gettopicTag = await page.evaluate(
    "document.querySelectorAll('.field-freetexttopic dd') ? [...document.querySelectorAll('.field-freetexttopic dd')].map((a)=> a.innerText.toLowerCase().replace(new RegExp('[^a-z0-9_ ]', 'gi'), ',').trim()):[]"
  );
  if (gettopicTag.length) {
    gettopicTag = gettopicTag.join(",").split(",");
    topicTag = gettopicTag.map((item) => item.replace(new RegExp("[^a-z0-9_ ]", "gi"), "").trim());
    data.tags.push(...topicTag);
    tags.push(...topicTag);
  }

  let mediumTag = "";
  mediumTag = await page.evaluate(() => {
    let getMedium = "";
    let mediumIndex = [
      ...document.querySelectorAll(".field-freetextphysicaldescription *"),
    ].findIndex((node) => node.textContent.trim() === "Medium");
    if (mediumIndex !== -1) {
      getMedium = [...document.querySelectorAll(".field-freetextphysicaldescription *")][
        mediumIndex + 1
      ].textContent.toLowerCase();
    }
    return getMedium;
  });
  tags.push(mediumTag);

  let countryTag = [];

  let getCountry = await page.evaluate(() => {
    let countryArr;
    countryArr = document.querySelectorAll(".field-freetextplace dd")
      ? [...document.querySelectorAll(".field-freetextplace dd")].map((a) =>
          a.innerText.toLowerCase().replace(new RegExp("[^a-z0-9_ ]", "gi"), ",").trim()
        )
      : [];
    return countryArr;
  });
  if (getCountry.length) {
    getCountry = getCountry.join(",").split(",");
    countryTag = getCountry.map((item) => item.replace(new RegExp("[^a-z0-9_ ]", "gi"), "").trim());
    console.log("countryTag", countryTag);
    data.tags.push(...countryTag);
  }

  tags.map((tag) => data.tags.push(tag.replace(new RegExp("[^a-z0-9_ ]", "gi"), "")));
  data.tags = Array.from(new Set(data.tags));
  console.log(data);

  [imageBuffer, imageMetadata, imageExtension] = await downloadFile(data.imageLink);
  console.log(imageBuffer);
  console.log(imageExtension);
  await page.screenshot({
    path: "smithsonian-7.jpeg",
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

const checkImageLink = async (url) => {
  const response = await fetch(url);
  const checkStatus = response.status;
  return checkStatus;
};
