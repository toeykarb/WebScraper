const puppeteer = require("puppeteer");
const { IMAGES_EXTENSION, stockphotoTags, CC0_TAGS } = require("./utils");
const { addExtra } = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
// const { splitText } = require("./split-text");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const url =
  "https://commons.wikimedia.org/wiki/File:Two_scenes_from_Der_Busant.jpg";
const data = {
  tags: [],
  internalTags: [],
};
const REMOVE_DESCRIPTION_WORDS = [
  "negro",
  "negroes",
  "negros",
  "nigger",
  "fuck",
  "shit",
  "slut",
  "Ladies",
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
(async (config = {}) => {
  const puppeteerExtra = addExtra(puppeteer);
  puppeteerExtra.use(StealthPlugin());
  const browser = await puppeteerExtra.launch({
    args: [
      "--disable-dev-shm-usage",
      "--headless",
      "--disable-gpu",
      "--remember-cert-error-decisions",
      "--ignore-certificate-errors",
      "--ignore-ssl-errors",
      "--reduce-security-for-testing",
      "--allow-insecure-localhost",
      "--user-data-dir=/tmp/chrome-user-data",
      "--allow-running-insecure-content", // https://source.chromium.org/search?q=lang:cpp+symbol:kAllowRunningInsecureContent&ss=chromium
      "--autoplay-policy=user-gesture-required", // https://source.chromium.org/search?q=lang:cpp+symbol:kAutoplayPolicy&ss=chromium
      "--disable-component-update", // https://source.chromium.org/search?q=lang:cpp+symbol:kDisableComponentUpdate&ss=chromium
      "--disable-domain-reliability", // https://source.chromium.org/search?q=lang:cpp+symbol:kDisableDomainReliability&ss=chromium
      "--disable-features=AudioServiceOutOfProcess,IsolateOrigins,site-per-process", // https://source.chromium.org/search?q=file:content_features.cc&ss=chromium
      "--disable-print-preview", // https://source.chromium.org/search?q=lang:cpp+symbol:kDisablePrintPreview&ss=chromium
      "--disable-setuid-sandbox", // https://source.chromium.org/search?q=lang:cpp+symbol:kDisableSetuidSandbox&ss=chromium
      "--disable-site-isolation-trials", // https://source.chromium.org/search?q=lang:cpp+symbol:kDisableSiteIsolation&ss=chromium
      "--disable-speech-api", // https://source.chromium.org/search?q=lang:cpp+symbol:kDisableSpeechAPI&ss=chromium
      "--disable-web-security", // https://source.chromium.org/search?q=lang:cpp+symbol:kDisableWebSecurity&ss=chromium
      "--disk-cache-size=503554432", // https://source.chromium.org/search?q=lang:cpp+symbol:kDiskCacheSize&ss=chromium
      "--enable-features=SharedArrayBuffer", // https://source.chromium.org/search?q=file:content_features.cc&ss=chromium
      "--hide-scrollbars", // https://source.chromium.org/search?q=lang:cpp+symbol:kHideScrollbars&ss=chromium
      // '--ignore-gpu-blocklist', // https://source.chromium.org/search?q=lang:cpp+symbol:kIgnoreGpuBlocklist&ss=chromium
      // '--in-process-gpu', // https://source.chromium.org/search?q=lang:cpp+symbol:kInProcessGPU&ss=chromium
      "--mute-audio", // https://source.chromium.org/search?q=lang:cpp+symbol:kMuteAudio&ss=chromium
      "--no-default-browser-check", // https://source.chromium.org/search?q=lang:cpp+symbol:kNoDefaultBrowserCheck&ss=chromium
      "--no-pings", // https://source.chromium.org/search?q=lang:cpp+symbol:kNoPings&ss=chromium
      "--no-sandbox", // https://source.chromium.org/search?q=lang:cpp+symbol:kNoSandbox&ss=chromium
      "--no-zygote", // https://source.chromium.org/search?q=lang:cpp+symbol:kNoZygote&ss=chromium
      // '--use-gl=swiftshader', // https://source.chromium.org/search?q=lang:cpp+symbol:kUseGl&ss=chromium
      "--window-size=2000,1200", // https://source.chromium.org/search?q=lang:cpp+symbol:kWindowSize&ss=chromium
      "--single-process", // https://source.chromium.org/search?q=lang:cpp+symbol:kSingleProcess&ss=chromium
    ],
    defaultViewport: {
      hasTouch: false,
      height: 1200,
      isLandscape: true,
      isMobile: false,
      width: 2000,
    },
    headless: true,
    ignoreHTTPSErrors: true,
    waitForInitialPage: true,
  });
  const page = await browser.newPage();
  // page.on("console", (consoleObj) => console.log(consoleObj.text()));

  await page.goto(url, {
    timeout: 3 * 1000,
  });

  console.log("Start.....");
  data.imageLink = await page.evaluate(() => {
    const results = document.querySelectorAll(".fullMedia > p > a");
    if (results && results[0]) {
      return results[0].getAttribute("href");
    }
    return null;
  });
  if (!data.imageLink || !data.imageLink.length) {
    console.log(`No image link - skip scraping ${url}`);
  }
  const imageExtension = data.imageLink.split(".").pop().toLowerCase();
  console.log("imageExtension", imageExtension);
  if (![...IMAGES_EXTENSION].includes(imageExtension)) {
    console.log(
      `Invalid image extension ${imageExtension} for ${url} - skip scraping`
    );
    console.log(`Image link not present on page - ${url}`);
    return {
      statusCode: 200,
      body: {
        message: `Image link not present on page - skip scraping  ${url}`,
      },
    };
  }
  var checkLOC = await page.evaluate(
    "document.querySelector(`.layouttemplate.sourcetemplate [title='Library of Congress']`) ? document.querySelector(`.layouttemplate.sourcetemplate [title='Library of Congress']`) .innerText.toLowerCase() : '';"
  );
  if (checkLOC?.length) {
    var internalLocTag = `#${checkLOC
      .trim()
      .toLowerCase()
      .replace(new RegExp("[^a-z0-9]", "gi"), "")
      .replace(new RegExp(" ", "gi"), "")
      .trim()}`;
    data.internalTags.push(internalLocTag);
  }

  data.isCC0 = await page.evaluate(
    "var data = ''.concat(document.querySelector('.sourcetemplate') ? document.querySelector('.sourcetemplate').innerText.toLowerCase() : '', ' ', document.querySelector('.licensetpl') ? document.querySelector('.licensetpl').innerText.toLowerCase() : ''); data.includes('creative commons cc0 1.0') || data.includes('creative commons zero') || data.includes('public domain')|| data.includes('use it for any purpose')"
  );
  let getMoreLicense = await page.evaluate(() => {
    let licenseText = document.querySelectorAll(
      ".layouttemplate.mw-content-ltr"
    )
      ? [...document.querySelectorAll(".layouttemplate.mw-content-ltr")].map(
          (item) => item.textContent.toLowerCase()
        )
      : [];
    return licenseText;
  });
  // console.log("getMoreLicense", getMoreLicense);

  // let getLicesnse = await page.evaluate(
  //   "document.querySelector('.rlicense-text') ? document.querySelector('.rlicense-text').innerText.toLowerCase() : ''"
  // );
  // let recheckIsCC0 = getMoreLicense.includes(
  //   "creative commons attribution-share alike 4.0"
  // );
  console.log("getMoreLicense", getMoreLicense);
  let licenseSentence = [];
  getMoreLicense.map((item) => {
    if (
      !item.includes("camera location") &&
      !item.includes("object location")
    ) {
      licenseSentence.push(item);
    }
  });
  console.log("licenseSentence", licenseSentence);
  console.log("licenseSentence length", licenseSentence.length);
  let warningLicese = false;
  if (licenseSentence?.length) {
    for (var i = 0; i < licenseSentence.length; i++) {
      console.log("index", i);
      console.log(licenseSentence[i]);
      let checkWarningLicese =
        licenseSentence[i].includes("public domain in") ||
        licenseSentence[i].includes("public domain within") ||
        licenseSentence[i].includes("protected as a trademark") ||
        licenseSentence[i].includes("pd-art tag") ||
        licenseSentence[i].includes("legal disclaimer") ||
        licenseSentence[i].includes("this image need checking") ||
        licenseSentence[i].includes("wikimania") ||
        licenseSentence[i].includes("supported by") ||
        licenseSentence[i].includes("this file is licensed under") ||
        licenseSentence[i].includes("this file was uploaded") ||
        licenseSentence[i].includes("advertising purposes") ||
        licenseSentence[i].includes("public institutions");
      let checkLicenseIssue =
        licenseSentence[i].includes("public domain") ||
        licenseSentence[i].includes("creative commons zero") ||
        licenseSentence[i].includes("creative commons cc0 1.0") ||
        licenseSentence[i].includes("no known copyright restrictions") ||
        licenseSentence[i].includes("protected as a trademark") ||
        licenseSentence[i].includes(
          "these restrictions are independent of the copyright status"
        ) ||
        licenseSentence[i].includes("pd-art tag") ||
        licenseSentence[i].includes("legal disclaimer") ||
        licenseSentence[i].includes("this file has been superseded") ||
        licenseSentence[i].includes("this image need checking") ||
        licenseSentence[i].includes("use it for any purpose") ||
        licenseSentence[i].includes("original file is very high-resolution") ||
        licenseSentence[i].includes("wikimania") ||
        licenseSentence[i].includes("supported by") ||
        licenseSentence[i].includes("this file is licensed under") ||
        licenseSentence[i].includes("this file was uploaded") ||
        licenseSentence[i].includes("no known restrictions") ||
        licenseSentence[i].includes("advertising purposes") ||
        licenseSentence[i].includes("public institutions");
      if (checkWarningLicese) {
        warningLicese = true;
      }
      if (!checkLicenseIssue) {
        console.log("nolicense ", false);
        data.isCC0 = false;
        break;
      } else {
        console.log("nolicense ", true);
      }
    }
  }
  // console.log("warningLicese", warningLicese);
  if (data.isCC0) {
    if (warningLicese) {
      data.internalTags.push("#needchecklicense");
    }
    data.internalTags.push("#nolicenseissue");
    data.tags.push(...CC0_TAGS);
  } else {
    console.log(`CC0 ignored - ${url}`);
    // return {
    //   statusCode: 200,
    //   url: url,
    //   message: "CC0 ignored",
    // };
  }

  data.sourceLink = await page.evaluate(() => {
    // @ts-ignore
    const links = [...document.querySelectorAll("#fileinfotpl_src + td a")];
    const sourceLink = links[0];
    return sourceLink ? sourceLink.getAttribute("href") : null;
  });
  data.sourceTag = data.sourceLink ? "" : "#nosourcelink";
  if (data.sourceLink && data.sourceLink.startsWith("/")) {
    data.sourceLink = `https://commons.wikimedia.org${data.sourceLink}`;
  }
  if (data.sourceLink) {
    const parsedUrl = new URL(data.sourceLink);
    if (parsedUrl.host.includes("unsplash")) {
      data.sourceTag = "#unsplash";
    } else if (parsedUrl.host.includes("pixabay")) {
      data.sourceTag = "#pixabay";
    } else if (parsedUrl.host.includes("freepik")) {
      data.sourceTag = "#freepik";
    } else if (parsedUrl.host.includes("pexels")) {
      data.sourceTag = "#pexels";
    } else if (parsedUrl.host.includes("wikipedia")) {
      data.sourceTag = "#wikipedia";
    }
  }

  // @ts-ignore
  data.articleId = await page.evaluate(() => window.RLCONF.wgArticleId);

  const imageInfos = await page.evaluate(() => {
    // @ts-ignore
    const fileInfos = [...document.querySelectorAll(".fileinfo-paramfield")];
    return fileInfos.reduce((acc, fileInfo) => {
      if (fileInfo && fileInfo.innerText) {
        const key = fileInfo.innerText;
        try {
          const values = fileInfo.parentNode.querySelectorAll("td");
          const value = values[1].innerText;
          return {
            ...acc,
            [key]: value,
          };
        } catch (error) {
          console.log(error);
        }
        try {
          const value = fileInfo.nextSibling.innerText;
          return {
            ...acc,
            [key]: value,
          };
        } catch (error) {
          console.log(error);
        }
        return { ...acc };
      }
      return acc;
    }, {});
  });
  console.log("image link", data.imageLink);
  console.log("imageInfos", imageInfos);
  console.log("articleId", data.articleId);

  let defaultDescription = "";
  try {
    defaultDescription = await page.evaluate(
      "var content = document.querySelector('td.description .description.en'); content && content.querySelector('span') && content.querySelector('span').remove(); content && content.innerText || '';"
    );
  } catch (error) {}
  /// ************
  if (!defaultDescription || !defaultDescription.length) {
    try {
      defaultDescription = await page.evaluate(
        "var content = document.querySelector('.description .description.en'); content && content.querySelector('span') && content.querySelector('span').remove(); content && content.innerText || '';"
      );
    } catch (error) {}
  }
  /// *************
  if (!defaultDescription || !defaultDescription.length) {
    try {
      defaultDescription = await page.evaluate(
        "var content = document.querySelector('td.description .description'); content && content.querySelector('span') && content.querySelector('span').remove(); content && content.innerText || '';"
      );
    } catch (error) {}
  }
  if (!defaultDescription || !defaultDescription.length) {
    try {
      defaultDescription = await page.evaluate(
        "var content = document.querySelector('td.description'); content && content.querySelector('span') && content.querySelector('span').remove(); content && content.innerText || '';"
      );
    } catch (error) {}
  }
  console.log("description", imageInfos["Description"]);
  data.description = imageInfos["Unsplash description"]
    ? imageInfos["Unsplash description"]
    : imageInfos["Unsplash title"]
    ? imageInfos["Unsplash title"]
    : defaultDescription && defaultDescription.length
    ? defaultDescription
    : imageInfos["Description"]
    ? imageInfos["Description"]
    : "";
  console.log("test description", data.description.trim().toLowerCase());
  if (["unavailable", "none"].includes(data.description.trim().toLowerCase())) {
    data.description = "";
  }
  if (data.description.toLowerCase().includes("this file has no description")) {
    data.description = "";
  }
  // ******************************************
  if (!data.description || !data.description.length) {
    let titleDescription = "";
    try {
      titleDescription = await page.evaluate(() => {
        var content = document.querySelector("#firstHeading")
          ? document
              .querySelector("#firstHeading")
              .innerText.replace("File:", "")
              .replaceAll(".jpg", "")
          : "";
        return content;
      });
    } catch (error) {
      console.log(error);
      console.log("errortext", true);
    }

    if (!titleDescription || !titleDescription.length) {
      titleDescription = await page.evaluate(() => {
        var titleIndex = [
          ...document.querySelectorAll("[valign='top'] td"),
        ].findIndex((node) => node.textContent.trim() === "Title");
        if (titleIndex !== -1) {
          const getTitle = [...document.querySelectorAll("[valign='top'] td")][
            titleIndex + 1
          ]
            ? [...document.querySelectorAll("[valign='top'] td")][
                titleIndex + 1
              ].innerText
            : "";
          return getTitle;
        }
      });
    }
    data.description = titleDescription;
  }
  // ******************************************
  var detectWords = REMOVE_DESCRIPTION_WORDS.join("|");
  data.description = data.description.replace(
    new RegExp("\\b(" + detectWords + ")\\b", "gi"),
    ""
  );
  const warningTag = stockphotoTags.some(
    (substring) =>
      data.description.toLowerCase().includes(substring.toLowerCase()) ||
      data.description.includes("AP")
  );
  if (warningTag) {
    data.internalTags.push("#licensewarning");
  }
  data.description_more = `View public domain image source <a href="${url}" target="_blank" rel="noopener noreferrer nofollow">here</a>`;
  console.log("description", data.description);

  // const descriptionValue = splitText(data.description);

  // data.description = descriptionValue.description;
  // data.description_more = descriptionValue.descriptionMore;
  // Get author tags and link
  let rawAuthorLink = await page.evaluate(
    "document.querySelector('#fileinfotpl_aut') && document.querySelector('#fileinfotpl_aut').nextElementSibling && document.querySelector('#fileinfotpl_aut').nextElementSibling.querySelector('a:not(.image)') ? document.querySelector('#fileinfotpl_aut').nextElementSibling.querySelector('a:not(.image)').getAttribute('href') : ''"
  );
  const rawAuthorTexts =
    rawAuthorLink && rawAuthorLink.length
      ? await page.evaluate(
          "const authors = []; const elements = document.querySelector('#fileinfotpl_aut').nextElementSibling; authors.push(elements.querySelector('a:not(.image)').innerText); elements.querySelectorAll('a').forEach(e => e.remove()); authors.push(elements.innerText); authors;"
        )
      : await page.evaluate(
          "document.querySelector('#fileinfotpl_aut') && document.querySelector('#fileinfotpl_aut').nextElementSibling ? [document.querySelector('#fileinfotpl_aut').nextElementSibling.innerText] : ['']"
        );

  if (rawAuthorLink && rawAuthorLink.startsWith("/")) {
    rawAuthorLink = `https://commons.wikimedia.org${rawAuthorLink}`;
  }
  data.authorLink = rawAuthorLink && rawAuthorLink.length ? rawAuthorLink : "";
  data.authorTags =
    Array.isArray(rawAuthorTexts) && rawAuthorTexts.length
      ? rawAuthorTexts
          .filter((t) => t && t.trim().length)
          .filter((t) => !t.includes("This photo was taken"))
          .map(
            (t) =>
              `#${t
                .trim()
                .toLowerCase()
                .replace(new RegExp("[^a-z0-9]", "gi"), "")
                .replace(new RegExp(" ", "gi"), "")
                .trim()}`
          )
      : [];

  // *******
  var tagFromAuthor =
    Array.isArray(rawAuthorTexts) && rawAuthorTexts.length
      ? rawAuthorTexts
          .filter((t) => t && t.trim().length)
          .filter((t) => !t.includes("This photo was taken"))
          .map(
            (t) =>
              `${t
                .trim()
                .toLowerCase()
                .replace(new RegExp("\\(", "gi"), "")
                .replace(new RegExp("\\)", "gi"), "")
                .replace(new RegExp("/", "gi"), " ")
                .replace(new RegExp("-", "gi"), " ")}`
          )
      : [];
  data.tags.push(...new Set(tagFromAuthor));
  // *******

  data.authorTags = [...new Set(data.authorTags)];
  console.log("AuthorTag", data.authorTags);
  console.log("AuthorLink", data.authorLink);
  if (imageInfos["Categories"]) {
    const categorieTags = imageInfos["Categories"]
      .split("·")
      .map((t) => t.toLowerCase().trim())
      .filter((t) => t && t.length > 1);
    data.tags.push(...categorieTags);
  }

  if (config.withDate === true) {
    let date = "";
    try {
      date = await page.evaluate(
        "document.querySelector('.fileinfotpl-type-information time') && document.querySelector('.fileinfotpl-type-information time').dateTime"
      );
      date = date && date.length >= 10 ? date.substring(0, 10) : "";
      // Try to parse the string in Date element (e.g. 21 August 2012, 22:44:40 (UTC))
      if (!date.length && imageInfos["Date"] && imageInfos["Date"].length) {
        const monthNames = [
          "",
          "january",
          "february",
          "march",
          "april",
          "may",
          "june",
          "july",
          "august",
          "september",
          "october",
          "november",
          "december",
        ];
        const dateElements = imageInfos["Date"]
          .toLowerCase()
          .replace("\r\n", "")
          .replace("\n", "")
          .replace("\r", "")
          .replace("before", "")
          .replace("taken on", "")
          .trim()
          .split(",")[0]
          .trim()
          .split(" ");
        if (
          monthNames.includes(dateElements[1]) &&
          dateElements[2] &&
          dateElements[2].length === 4
        ) {
          let monthNumber = String(
            monthNames.findIndex((e) => e === dateElements[1])
          );
          monthNumber = `${monthNumber.length === 1 ? "0" : ""}${monthNumber}`;
          const dayNumber = `${dateElements[0].length === 1 ? "0" : ""}${
            dateElements[0]
          }`;
          date = `${dateElements[2]}-${monthNumber}-${dayNumber}`;
        }
      }

      if (date && date.length === 10) {
        const d = new Date(date);
        const dateString = `${d.toDateString().split(" ")[2]}${d.toLocaleString(
          "en-US",
          {
            month: "long",
          }
        )}${d.toDateString().split(" ")[3]}`.toLowerCase();
        data.internalTags.push(`#${dateString}`);

        if (
          config.dateLimit &&
          config.dateLimit.length === 10 &&
          date > config.dateLimit
        ) {
          data.internalTags.push("#dateissue");
        }
      } else {
        data.internalTags.push("#dateissue");
      }
    } catch (error) {
      console.log(`Error while scraping the date ${date} for ${url}`);
      data.internalTags.push("#dateissue");
    }
  }
  console.log("internalTags", data.internalTags);

  // *******************************
  console.log("Get Tags");
  var mediumTag = await page.evaluate(() => {
    var mediumIndex = [
      ...document.querySelectorAll("[valign='top'] td"),
    ].findIndex((node) => node.textContent.trim() === "Medium");
    if (mediumIndex !== -1) {
      const getMedium = [...document.querySelectorAll("[valign='top'] td")][
        mediumIndex + 1
      ]
        ? [...document.querySelectorAll("[valign='top'] td")][
            mediumIndex + 1
          ].innerText.trim()
        : "";
      return getMedium;
    }
  });

  var objectTypeTag = await page.evaluate(() => {
    var objectTypeIndex = [
      ...document.querySelectorAll("[valign='top'] td"),
    ].findIndex((node) => node.textContent.trim() === "Object type");
    if (objectTypeIndex !== -1) {
      const getobjectType = [...document.querySelectorAll("[valign='top'] td")][
        objectTypeIndex + 1
      ]
        ? [...document.querySelectorAll("[valign='top'] td")][
            objectTypeIndex + 1
          ].innerText.trim()
        : "";
      return getobjectType;
    }
  });
  if (data.description) {
    var keywordDescription = data.description
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
  if (mediumTag) {
    if (mediumTag.includes("English:")) {
      mediumTag = mediumTag.split("English:")[1].trim();
    }
    data.tags.push(mediumTag);
  }
  if (objectTypeTag) {
    data.tags.push(objectTypeTag);
  }
  data.tags = Array.from(new Set(data.tags));
  console.log("Tag", data.tags);
  console.log(data);
  // ***************************************
  console.log("Download Image");
  let imageBuffer = null;
  let imageMetadata = null;
  try {
    [imageBuffer, imageMetadata] = await downloadFile(data.imageLink);
  } catch (error) {
    console.log(error);
    if (
      error?.message?.includes("Array buffer allocation failed") ||
      String(error).includes("Array buffer allocation failed") ||
      error?.message?.includes("blocked by cloudflare") ||
      String(error).includes("blocked by cloudflare")
    ) {
      throw error;
    }
    console.log(
      `Image for article [${data.articleId}] download link is not working, skip scraping  ${url}`
    );
    return {
      status: 200,
      message: `Image for article [${data.articleId}] download link is not working, skip scraping  ${url}`,
    };
  }
  console.log("imageBuffer", imageBuffer);
  console.log("imageMetadata", imageMetadata);
  console.log("imageExtension", imageExtension);
  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
  await page.setViewport({ width: 1920, height: bodyHeight });
  await page.screenshot({
    path: "wiki.jpeg",
    type: "jpeg",
    fullPage: true,
    quality: 50,
  });
  await browser.close();
  return true;
})();

const downloadFile = async (url) => {
  const encodedUrl = new URL(url);
  console.log(`Downloading: ${encodedUrl.href}`);
  // @ts-ignore
  const result = await fetch(encodedUrl.href)
    .then((response) => {
      if (response.ok) {
        return response;
      }
      if (response.status === 520) {
        return Promise.reject(
          new Error(
            `Failed to fetch, blocked by cloudflare ${response.url}: ${response.status} ${response.statusText}`
          )
        );
      }
      return Promise.reject(
        new Error(
          `Failed to fetch ${response.url}: ${response.status} ${response.statusText}`
        )
      );
    })
    .then(
      /**
       * @param {import('node-fetch').Response} response
       * @return {Promise<[Buffer, {contentType:string}]>}
       */
      (response) => {
        const contentType = response.headers.get("content-type");
        return Promise.all([
          response.buffer(),
          Promise.resolve({
            contentType,
          }),
        ]);
      }
    );
  return result;
};
// const descriptionLink = `Original public domain image from <a href="${url}" target="_blank" rel="noopener noreferrer nofollow">Wikimedia Commons</a>`;
// if (data.description && data.description.trim().length) {
//   data.description = data.description.trim().endsWith('.')
//     ? `${data.description.trim()} ${descriptionLink}`
//     : `${data.description.trim()}. ${descriptionLink}`;
// } else {
//   data.description = descriptionLink;
// }
// const descriptionValue = splitText(data.description);

// data.description = descriptionValue.description;
// data.description_more = descriptionValue.descriptionMore;
