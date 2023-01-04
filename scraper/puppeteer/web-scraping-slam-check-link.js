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
let pushtoTags = async (tags, keywordArr) => {
  if (keywordArr?.length) {
    tags.push(...keywordArr);
  }
};

const scrapeSLAM = async (url) => {
  const requests_blocked = [];

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // page.on("console", (consoleObj) => console.log(consoleObj.text()));

  await page.goto(url, { waitUntil: "networkidle2" });
  console.log("Start......");
  await page.waitForTimeout(3000);
  let tags = [];
  const data = {
    url,
    tags: [],
    internalTags: [],
    authorTags: [],
  };

  data.imageLink = await page.evaluate(
    "document.querySelector(`.viewer-download-buttons [title='Download']`) ? document.querySelector(`.viewer-download-buttons [title='Download']`).getAttribute('href') : '';"
  );
  await browser.close();
  if (!data.imageLink || !data.imageLink.length) {
    return true;
  } else {
    return false;
  }
};

async function getSlam() {
  const haveLink = [];
  const url = [
    "https://www.slam.org/collection/objects/62832/",
    "https://www.slam.org/collection/objects/49249/",
    "https://www.slam.org/collection/objects/57190/",
    "https://www.slam.org/collection/objects/57521/",
    "https://www.slam.org/collection/objects/61104/",
    "https://www.slam.org/collection/objects/56347/",
    "https://www.slam.org/collection/objects/62456/",
    "https://www.slam.org/collection/objects/29671/",
    "https://www.slam.org/collection/objects/43742/",
    "https://www.slam.org/collection/objects/18793/",
    "https://www.slam.org/collection/objects/62954/",
    "https://www.slam.org/collection/objects/491/",
    "https://www.slam.org/collection/objects/8377/",
    "https://www.slam.org/collection/objects/61334/",
    "https://www.slam.org/collection/objects/57502/",
    "https://www.slam.org/collection/objects/61093/",
  ];

  for (var index = 0; index < url.length; index++) {
    const sendtoScrape = await scrapeSLAM(url[index]);
    if (sendtoScrape) {
      haveLink.push(url[index]);
    }
  }
  console.log(haveLink);
  return haveLink;
}
getSlam();
