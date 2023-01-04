const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
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

(async (url = "https://www.metmuseum.org/art/collection/search/421993", config = {}) => {
  const requests_blocked = [];
  var projectTags = ["#pdgroupflickrnasa1"];
  var internalTags = [];

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on("console", (consoleObj) => console.log(consoleObj.text()));

  //await page.setViewport({ width: 2000, height: 1200, deviceScaleFactor: 1 });

  await page.goto(url, { waitUntil: "networkidle0" });
  console.log("Start......");
  await page.waitForTimeout(3000);

  let tags = [];
  const data = {
    url,
    tags: [],
    internalTags: [],
    authorTags: [],
  };
  let articleId = await page.evaluate(
    "document.querySelector(`[rel='canonical']`) ? document.querySelector(`[rel='canonical']`).getAttribute('href') :''"
  );

  data.articleId = articleId.replace("://", "").split("/")[4];
  if (!data.articleId && !data.articleId.length) {
    console.log("article id error");
    return false;
  }
  // const metAPI = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${data.articleId}`;
  // let [httpStastus, metData] = await getDatafromMetAPI(metAPI);

  // console.log("httpStastus : ", httpStastus);

  let licenseText = await page.evaluate(
    "document.querySelector('.artwork__access .public-domain__text') ? document.querySelector('.artwork__access .public-domain__text').innerText.toLowerCase() : '';"
  );
  data.isCC0 = licenseText.includes("public domain") || licenseText.includes("cc0");
  if (data.isCC0) {
    data.internalTags.push("#nolicenseissue");
    data.internalTags.push("#met");
  } else {
    data.internalTags.push("#licenseissue");
  }
  data.imageLink = await page.evaluate(
    "document.querySelector('.artwork__interactions .artwork__interaction--download a') ? document.querySelector('.artwork__interactions .artwork__interaction--download a').getAttribute('href') : '';"
  );
  // data.imageLink = metData["primaryImage"] ? metData["primaryImage"] : "";
  if (!data.imageLink || !data.imageLink.length) {
    console.log("error link");
  }

  // let checkAdditionalImages = metData["additionalImages"] ? metData["additionalImages"] : [];
  // if (checkAdditionalImages.length) {
  //   data.internalTags.push("#haveadditional");
  // }
  let rawAuthorText = [];
  let rawAuthorLink = "";
  rawAuthorText = await page.evaluate(
    "document.querySelectorAll(`.artwork__artist__name [itemprop='name'] a`)  ? [...document.querySelectorAll(`.artwork__artist__name [itemprop='name'] a`)].map(a => a.textContent.toLowerCase()) : []"
  );
  rawAuthorLink = await page.evaluate(
    "document.querySelector(`.artwork__artist__name [itemprop='name'] a`)  ? document.querySelector(`.artwork__artist__name [itemprop='name'] a`).getAttribute('href') : ''"
  );

  if (rawAuthorText.length > 0) {
    rawAuthorText.map((item) => {
      if (item.length) {
        data.authorTags.push(
          `#${item
            .trim()
            .toLowerCase()
            .replace(new RegExp("[^a-z0-9]", "gi"), "")
            .replace(new RegExp(" ", "gi"), "")
            .trim()}`
        );
        tags.push(
          `${item
            .trim()
            .toLowerCase()
            .replaceAll("&", "and")
            .replace(new RegExp("[^a-z0-9_ ]", "gi"), " ")
            .replace(new RegExp("  ", "gi"), " ")
            .trim()}`
        );
      }
    });
  }
  data.authorLink =
    rawAuthorLink && rawAuthorLink.length
      ? new URL(`https://www.metmuseum.org${rawAuthorLink}`).href
      : "";

  let rawAuthorCountrys = [];
  rawAuthorCountrys = await page.evaluate(
    "document.querySelectorAll(`.artwork__artist__region`)  ? [...document.querySelectorAll(`.artwork__artist__region`)].map(a => a.textContent.toLowerCase()) : []"
  );

  if (rawAuthorCountrys?.length) {
    rawAuthorCountrys.some((rawAuthorCountry) => {
      if (rawAuthorCountry !== "") {
        tags.push(rawAuthorCountry);
      }
    });
  }
  let getArtistSubject = await page.evaluate(() => {
    let artistSubject = [];
    let artistSubjectIndex = [
      // @ts-ignore
      ...document.querySelectorAll(".artwork-tombstone--item *"),
    ];
    artistSubjectIndex.map((node, index) => {
      var artistSubjectIndex = node.textContent.trim() === "Artist:";
      if (artistSubjectIndex) {
        artistSubject.push(
          [...document.querySelectorAll(".artwork-tombstone--item *")][index + 1].textContent
        );
      }
    });

    return artistSubject;
  });
  if (getArtistSubject?.length) {
    let artistSubjectArr = [];
    getArtistSubject.map((item) => {
      let splitArr = item
        .replaceAll("(", "$")
        .replaceAll(")", "$")
        .replaceAll(",", "$")
        .replaceAll(";", "$")
        .split("$");
      console.log("splitArr", splitArr);

      splitArr.map((a) => {
        artistSubjectArr.push(
          a
            .trim()
            .toLowerCase()
            .replace(new RegExp("[^a-z0-9_ ]", "gi"), " ")
            .replace(new RegExp("  ", "gi"), " ")
            .trim()
        );
      });
    });
    console.log("artistSubjectArr", artistSubjectArr);
    tags.push(...artistSubjectArr);
  }

  // let getImageCountry = await page.evaluate(() => {
  //   let imageCountry = "";
  //   let imageCountryIndex = [
  //     // @ts-ignore
  //     ...document.querySelectorAll(".artwork-tombstone--item *"),
  //   ].findIndex((node) => node.textContent.trim() === "Geography:");
  //   if (imageCountryIndex !== -1) {
  //     // @ts-ignore
  //     imageCountry = [...document.querySelectorAll(".artwork-tombstone--item *")][
  //       imageCountryIndex + 1
  //     ].textContent;
  //   }

  //   return imageCountry;
  // });

  // if (getImageCountry?.length) {
  //   let imageCountryNames = [];
  //   imageCountryNames.push(
  //     ...getImageCountry
  //       .trim()
  //       .toLowerCase()
  //       .split(",")
  //       .map((a) =>
  //         a
  //           .trim()
  //           .replace("made in", "")
  //           .replace("attributed to ", "")
  //           .replace(new RegExp("[^a-z0-9_ ]", "gi"), " ")
  //           .replace(new RegExp("  ", "gi"), "")
  //           .trim()
  //       )
  //   );
  //   console.log("getImageCountry", imageCountryNames);
  //   tags.push(...imageCountryNames);
  // }
  let getImageCountrySubject = await getEachSubject(page, "Geography:");
  if (getImageCountrySubject?.length) {
    getImageCountrySubject = getImageCountrySubject.map((a) =>
      a
        .trim()
        .replace("made in", "")
        .replace("attributed to ", "")
        .replace(new RegExp("  ", "gi"), " ")
        .trim()
    );
    console.log("getImageCountry", getImageCountrySubject);
  }

  let getPublisherSubject = await getEachSubject(page, "Publisher:");
  if (getPublisherSubject?.length) {
    getPublisherSubject = getPublisherSubject.map((a) =>
      a.trim().replace("issued by", "").replace(new RegExp("  ", "gi"), " ").trim()
    );
    console.log("getPublisherSubject", getPublisherSubject);
  }

  let getLithographer = await getEachSubject(page, "Lithographer:");
  console.log("getLithographer", getLithographer);

  let getAuthorSubject = await getEachSubject(page, "Author:");
  console.log("getAuthorSubject", getAuthorSubject);

  let getPeriodSubject = await getEachSubject(page, "Period:");
  console.log("getPeriodSubject", getPeriodSubject);

  let getMakerSubject = await getEachSubject(page, "Maker:");
  console.log("getMakerSubject", getMakerSubject);

  let getCultureSubject = await getEachSubject(page, "Culture:");
  console.log("getCultureSubject", getCultureSubject);

  let getObjectDateSubject = await getEachSubject(page, "Date:");
  console.log("getObjectDateSubject", getObjectDateSubject);

  let getClassification = await getEachSubject(page, "Classification:");
  console.log("getClassification", getClassification);

  let getCreditLine = await getEachSubject(page, "Credit Line:");
  console.log("getCreditLine", getCreditLine);

  let getFactorySubject = await getEachSubject(page, "Factory:");
  console.log("getFactorySubject", getFactorySubject);

  // let getCulture = await page.evaluate(() => {
  //   let culture = "";
  //   let cultureIndex = [
  //     // @ts-ignore
  //     ...document.querySelectorAll(".artwork-tombstone--item *"),
  //   ].findIndex((node) => node.textContent.trim() === "Culture:");
  //   if (cultureIndex !== -1) {
  //     // @ts-ignore
  //     culture = [...document.querySelectorAll(".artwork-tombstone--item *")][cultureIndex + 1]
  //       .textContent;
  //   }

  //   return culture;
  // });
  // if (getCulture?.length) {
  //   let cultureNames = [];
  //   cultureNames.push(
  //     ...getCulture
  //       .trim()
  //       .toLowerCase()
  //       .split(",")
  //       .map((a) =>
  //         a
  //           .trim()
  //           .replace(new RegExp("[^a-z0-9_ ]", "gi"), "")
  //           .replace(new RegExp("  ", "gi"), "")
  //           .trim()
  //       )
  //   );
  //   tags.push(...cultureNames);
  // }

  // let getObjectDate = await page.evaluate(() => {
  //   let objectDate = "";
  //   let objectDateIndex = [
  //     // @ts-ignore
  //     ...document.querySelectorAll(".artwork-tombstone--item *"),
  //   ].findIndex((node) => node.textContent.trim() === "Date:");
  //   if (objectDateIndex !== -1) {
  //     // @ts-ignore
  //     objectDate = [...document.querySelectorAll(".artwork-tombstone--item *")][objectDateIndex + 1]
  //       .textContent;
  //   }

  //   return objectDate;
  // });
  // if (getObjectDate?.length) {
  //   let objectDates = [];
  //   objectDates.push(
  //     ...getObjectDate
  //       .trim()
  //       .toLowerCase()
  //       .split(",")
  //       .map((a) =>
  //         a
  //           .trim()
  //           .replace(new RegExp("[^a-z0-9]", "gi"), " ")
  //           .replace(new RegExp("  ", "gi"), " ")
  //           .trim()
  //       )
  //   );
  //   console.log(objectDates);
  //   tags.push(...objectDates);
  // }

  // let getClassification = await page.evaluate(() => {
  //   let classification = "";
  //   let classificationIndex = [
  //     // @ts-ignore
  //     ...document.querySelectorAll(".artwork-tombstone--item *"),
  //   ].findIndex((node) => node.textContent.trim() === "Classification:");
  //   if (classificationIndex !== -1) {
  //     // @ts-ignore
  //     classification = [...document.querySelectorAll(".artwork-tombstone--item *")][
  //       classificationIndex + 1
  //     ].textContent;
  //   }

  //   return classification;
  // });
  // console.log("classification", getClassification);
  // if (getClassification?.length) {
  //   let classifications = [];
  //   classifications = getClassification.split(/[;,]+/);
  //   classifications.map((classification) =>
  //     tags.push(
  //       classification
  //         .trim()
  //         .replace(new RegExp("[^a-z0-9_ ]", "gi"), " ")
  //         .replaceAll("  ", " ")
  //         .toLowerCase()
  //     )
  //   );
  // }

  let getMedium = await page.evaluate(() => {
    let medium = "";
    let mediumIndex = [
      // @ts-ignore
      ...document.querySelectorAll(".artwork-tombstone--item *"),
    ].findIndex((node) => node.textContent.trim() === "Medium:");
    if (mediumIndex !== -1) {
      // @ts-ignore
      medium = [...document.querySelectorAll(".artwork-tombstone--item *")][mediumIndex + 1]
        .textContent;
    }

    return medium;
  });
  if (getMedium?.length) {
    let mediumTags = [];
    let allMediumTags = [];
    mediumTags = getMedium.split(/[;,]+/);
    mediumTags.map((mediumTag) => {
      if (mediumTag.trim().startsWith("and")) {
        allMediumTags.push(
          mediumTag
            .replace("and", "")
            .trim()
            .toLowerCase()
            .replace(new RegExp("[^a-z0-9_ ]", "gi"), " ")
            .replaceAll("  ", " ")
        );
      } else {
        let splitAnd = [...mediumTag.trim().toLowerCase().replaceAll("  ", " ").split("and")].map(
          (a) => a.trim().replace(new RegExp("[^a-z0-9_ ]", "gi"), " ").replaceAll("  ", " ")
        );

        allMediumTags.push(...splitAnd);
      }
    });
    console.log("allMediumTags", allMediumTags);
    tags.push(...allMediumTags);
  }

  let getTitle = await page.evaluate(() => {
    let title = "";
    let titleIndex = [
      // @ts-ignore
      ...document.querySelectorAll(".artwork-tombstone--item *"),
    ].findIndex((node) => node.textContent.trim() === "Title:");
    if (titleIndex !== -1) {
      // @ts-ignore
      title = [...document.querySelectorAll(".artwork-tombstone--item *")][titleIndex + 1]
        .textContent;
    }

    return title;
  });
  if (getTitle?.length) {
    data.description = getTitle;
    const wordToDeleteSet = new Set(IGNORE_WORD);
    let titleTags = getTitle
      .replaceAll("  ", " ")
      .replace(new RegExp("[^a-z0-9_ ]", "gi"), "")
      .toLowerCase()
      .split(" ");
    // console.log("titleTags", titleTags);
    titleTags = titleTags.filter((word) => {
      if (word.length > 2) {
        return !wordToDeleteSet.has(word);
      }
      return false;
    });
    console.log("titleTags", titleTags);
    tags.push(...titleTags);
  }

  let getTags = await page.evaluate(
    "document.querySelectorAll('.artwork-facet__list li .gtm__category-filter') ? [...document.querySelectorAll('.artwork-facet__list li .gtm__category-filter')].map(a => a.innerText.toLowerCase()) : []"
  );
  if (getTags?.length) {
    let imageTags = [];
    getTags.map((getTag) => {
      let eachTag = getTag.trim();
      if (!eachTag.includes("all related artworks") && !eachTag.includes("in the same gallery")) {
        if (eachTag.startsWith("from ")) {
          eachTag = eachTag.replace("from ", "");
        } else if (eachTag.startsWith("by")) {
          eachTag = eachTag.replace("by", "");
        }
        if (eachTag.includes("department")) {
          eachTag = eachTag.replace("department", "");
        }
        imageTags.push(
          ...eachTag
            .replaceAll(".", "")
            .replaceAll(" & ", "$")
            .replaceAll(" and ", "$")
            .replaceAll(" or ", "$")
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
    });
    console.log("imageTags", imageTags);
    tags.push(...imageTags);
  }
  let description = await page.evaluate(
    "document.querySelector('.artwork__intro__desc p') ? document.querySelector('.artwork__intro__desc p').innerText : ''"
  );

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

    // data.tags.push(...keywordDescription);
  }

  // await page.screenshot({
  //   path: "met.jpeg",
  //   type: "jpeg",
  //   fullPage: true,
  //   quality: 50,
  // });
  tags.map((tag) => data.tags.push(tag.replace(new RegExp("[^a-z0-9_ ]", "gi"), "")));
  data.tags = Array.from(new Set(data.tags));
  console.log(data);

  await browser.close();
})();

const downloadFile = async (url) => {
  const response = await fetch(url, {
    method: "GET",
  });
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

const getDatafromMetAPI = async (url) => {
  const encodedUrl = new URL(url);
  console.log("MET API : ", encodedUrl.href);
  var myHeaders = new Headers();
  myHeaders.append("cache-control", "no-cache");

  const response = await fetch(encodedUrl.href, {
    method: "GET",
    // headers: { myHeaders },
  });
  const checkStatus = response.status;
  const metData = await response.json();

  return [checkStatus, metData];
};

let getEachSubject = async (page, subject) => {
  let subjectIemArr = [];
  let getSubjectValue = await page.evaluate((subject) => {
    let subjectValue = "";
    let subjectIndex = [
      // @ts-ignore
      ...document.querySelectorAll(".artwork-tombstone--item *"),
    ].findIndex((node) => node.textContent.trim() === subject);
    if (subjectIndex !== -1) {
      // @ts-ignore
      subjectValue = [...document.querySelectorAll(".artwork-tombstone--item *")][subjectIndex + 1]
        .textContent;
    }

    return subjectValue;
  }, subject);

  if (getSubjectValue?.length) {
    subjectIemArr.push(
      ...getSubjectValue
        .toLowerCase()
        .replaceAll(".", "")
        .replaceAll(" & ", "$")
        .replaceAll(" and ", "$")
        .replaceAll(" or ", "$")
        .replaceAll("(", "$")
        .replaceAll(")", "$")
        .replaceAll(",", "$")
        .replaceAll(";", "$")
        .split("$")
        .map((a) =>
          a
            .trim()
            .replace(new RegExp("[^a-z0-9_ ]", "gi"), " ")
            .replace(new RegExp("  ", "gi"), " ")
            .trim()
        )
    );
    // tags.push(...makerArr);
  }
  return subjectIemArr;
};
