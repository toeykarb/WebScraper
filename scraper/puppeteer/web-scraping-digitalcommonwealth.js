const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const fileType = require("file-type");
const mime = require("mime");
const puppeteer = require("puppeteer");
const tmp = require("tmp");
const etl = require("etl");
const fs = require("fs");
const request = require("request");
const unzipper = require("unzipper");
const PythonShell = require("python-shell");

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

(async (url = "https://www.digitalcommonwealth.org/search/commonwealth:ft848v47x", config = {}) => {
  const requests_blocked = [];
  var projectTags = ["#pdgroupflickrnasa1"];
  var internalTags = [];

  const browser = await puppeteer.launch({ headless: true, devtools: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 2000, height: 1200, deviceScaleFactor: 1 });
  page.on("console", (consoleObj) => console.log(consoleObj.text()));

  //await page.setViewport({ width: 2000, height: 1200, deviceScaleFactor: 1 });

  await page.goto(url, {
    waitUntil: ["networkidle2"],
  });
  console.log("Start......");
  let tags = [];
  const data = {
    url,
    tags: [],
    internalTags: [],
  };

  let articleId = url.replace("://", "").split("/")[2];
  data.articleId = articleId.length
    ? `${articleId
        .trim()
        .toLowerCase()
        .replace(new RegExp("[^a-z0-9]", "gi"), "")
        .replace(new RegExp(" ", "gi"), "")
        .trim()}`
    : "";

  data.imageLink = await page.evaluate(
    "document.querySelector('#img_show_container .img_show test') ? document.querySelector('#img_show_container .img_show test').getAttribute('src') : ''"
  );
  console.log(data.imageLink);
  if (!data.imageLink || !data.imageLink.length) {
    console.log(`No image link - skip scraping ${url}`);
    // return {
    //   statusCode: 200,
    //   body: {
    //     message: `Image link not present on page - skip scraping  ${url}`,
    //   },
    // };
  }
  // let [imageBuffer, imageMetadata, imageExtension] = await checkImageType(data.imageLink);
  // let imageLink = `https://www.digitalcommonwealth.org/start_download/${articleId}?filestream_id=image_primary`;
  // let [imageBuffer, imageMetadata, imageExtension] = await checkImageType(imageLink);
  // console.log("checkStatus", checkStatus);
  // console.log("imageExtension", imageExtension);
  // let destinationDir = `tmp/${articleId}`;

  // const tmpobj = await tmp.fileSync();
  // const tmpobj = tmp.dirSync();
  // const tmpobj2 = tmp.fileSync();
  // console.log(`imageType - ${imageExtension} for ${url}`);
  // if (imageExtension == "zip") {
  //   let extractZipFile = await extractImageZip(imageBuffer);
  //   try {
  //     if (extractZipFile?.length) {
  //       let zipFilePath = "";
  //       for (var i = 0; i < extractZipFile.length; i++) {
  //         if (extractZipFile[i].fileName.startsWith("1_") && !zipFilePath?.length) {
  //           console.log("zipFilePath length", false);
  //           zipFilePath = extractZipFile[i].filePath;

  //           [imageBuffer, imageMetadata, imageExtension] = await readZipBuffer(zipFilePath);
  //         }
  //       }

  //       if (!zipFilePath?.length) {
  //         console.log("zipFilePath length", true);
  //         zipFilePath = extractZipFile[0].filePath;
  //       }

  //       [imageBuffer, imageMetadata, imageExtension] = await readZipBuffer(zipFilePath);

  //       // clear tmp
  //       extractZipFile.map((a) => a.tmpData.removeCallback());
  //     } else {
  //       console.log(`Image for article [${data.articleId}] empty zip file - skip scraping  ${url}`);
  //     }
  //   } catch (error) {
  //     if (extractZipFile && extractZipFile.length) {
  //       console.log("extractZipFile", true);
  //       extractZipFile.map((a) => a.tmpData.removeCallback());
  //     }
  //     console.log(error);
  //     console.log(
  //       `Image for article [${data.articleId}] have error buffer - skip scraping  ${url}`
  //     );
  //   }
  // } else {
  //   console.log("not Zip");
  // }
  // console.log("imageBuffer", imageBuffer);
  // console.log("imageMetadata", imageMetadata);
  // console.log("imageExtension", imageExtension);
  // await page.screenshot({
  //   path: "digitalcommonwealth.jpeg",
  //   type: "jpeg",
  //   fullPage: true,
  //   quality: 50,
  // });
  let getCreator = await getEachSubject(page, "Creator:");
  console.log("getCreator ", getCreator);
  await pushtoTags(tags, getCreator);

  let getDate = await getEachSubject(page, "Date:");
  console.log("getDate ", getDate);

  let getFormat = await getEachSubject(page, "Format:");
  console.log("getFormat ", getFormat);

  let getGenre = await getEachSubject(page, "Genre:");
  console.log("getGenre ", getGenre);

  let getCollection = await getEachSubject(page, "Collection (local):");
  console.log("getCollection ", getCollection);

  let getSubjects = await getEachSubject(page, "Subjects:");
  console.log("getSubjects ", getSubjects);

  let getLocation = await getEachSubject(page, "Location:");
  console.log("getLocation ", getLocation);

  let getPlaces = await getEachSubject(page, "Places:");
  console.log("getPlaces ", getPlaces);

  // let metadataArr = [];
  // let getMetadata = await page.evaluate(() => {
  //   // @ts-ignore
  //   let metadata = [...document.querySelectorAll(".document-metadata .col-md-9")]
  //     ? [...document.querySelectorAll(".document-metadata .col-md-9")].map((a) => a.textContent)
  //     : [];

  //   return metadata;
  // });

  // if (getMetadata?.length) {
  //   getMetadata.map((item) => {
  //     if (!item.includes("https://")) {
  //       metadataArr.push(
  //         ...item
  //           .trim()
  //           .toLowerCase()
  //           .replaceAll(".", "")
  //           .replaceAll(" & ", "$")
  //           .replaceAll(" and ", "$")
  //           .replaceAll(" or ", "$")
  //           .replaceAll("(", "$")
  //           .replaceAll(")", "$")
  //           .replaceAll(",", "$")
  //           .replaceAll(";", "$")
  //           .replaceAll("/", "$")
  //           .replace(/\s+/g, "$")
  //           .split("$")
  //           .map((a) =>
  //             a
  //               .trim()
  //               .replace(new RegExp("[^a-z0-9]", "gi"), "")
  //               .replace(new RegExp("  ", "gi"), " ")
  //               .trim()
  //           )
  //       );
  //     }
  //   });
  // }
  // if (metadataArr?.length) {
  //   const wordToDeleteSet = new Set(IGNORE_WORD);
  //   metadataArr = metadataArr.filter((word) => {
  //     if (word.length > 2) {
  //       return !wordToDeleteSet.has(word);
  //     }
  //     return false;
  //   });
  // }

  // tags.push(...metadataArr);
  tags.map((tag) => data.tags.push(tag.replace(new RegExp("[^a-z0-9]", "gi"), "")));
  data.tags = Array.from(new Set(data.tags));

  console.log("metadataArr", data.tags);
  let { getArtist, getArtistLink } = await page.evaluate(() => {
    let artist = "";
    let artistLink = "";
    let artistIndex = [
      // @ts-ignore
      ...document.querySelectorAll(".document-metadata *"),
    ].findIndex((node) => node.textContent.trim() === "Artist:");
    let creatorIndex = [
      // @ts-ignore
      ...document.querySelectorAll(".document-metadata *"),
    ].findIndex((node) => node.textContent.trim() === "Creator:");
    if (artistIndex !== -1) {
      // @ts-ignore
      artist = [...document.querySelectorAll(".document-metadata *")][artistIndex + 1].textContent
        .toLowerCase()
        .trim();
      artistLink = [...document.querySelectorAll(".document-metadata *")][
        artistIndex + 2
      ].getAttribute("href");
    } else if (creatorIndex !== -1) {
      // @ts-ignore
      artist = [...document.querySelectorAll(".document-metadata *")][creatorIndex + 1].textContent
        .toLowerCase()
        .trim();
      artistLink = [...document.querySelectorAll(".document-metadata *")][
        creatorIndex + 2
      ].getAttribute("href");
    }
    getArtist = artist;
    getArtistLink = artistLink;
    return { getArtist, getArtistLink };
  });

  if (getArtist?.length) {
    data.authorTags = getArtist.length
      ? [
          `#${getArtist
            .trim()
            .toLowerCase()
            .replace(new RegExp("[^\u0400-\u04FF\u3131-\uD79D\u0E00-\u0E7Fa-z0-9]", "gi"), "")
            .replace(new RegExp(" ", "gi"), "")
            .trim()}`,
        ]
      : [];
    let artistTag = getArtist.length
      ? getArtist
          .trim()
          .toLowerCase()
          .replaceAll("&", "and")
          .replace(new RegExp("[^a-z0-9_ ]", "gi"), " ")
          .replace(new RegExp("  ", "gi"), " ")
          .trim()
      : "";
    console.log("artistTag", artistTag);
  }
  if (getArtistLink?.length) {
    data.authorLink =
      getArtistLink && getArtistLink.length
        ? `https://www.digitalcommonwealth.org${getArtistLink}`
        : "";
  }
  console.log("getArtist", data.authorTags);
  console.log("getArtistLink", data.authorLink);

  let getLicense = await page.evaluate(() => {
    let license = "";
    let licenseIndex = [
      // @ts-ignore
      ...document.querySelectorAll(".document-metadata *"),
    ].findIndex((node) => node.textContent.trim() === "Terms of Use:");
    if (licenseIndex !== -1) {
      // @ts-ignore
      license = [...document.querySelectorAll(".document-metadata *")][licenseIndex + 1].textContent
        .toLowerCase()
        .trim();
    }

    return license;
  });
  data.isCC0 =
    getLicense.includes("public domain") ||
    getLicense.includes("cc0") ||
    getLicense.includes("no known copyright restrictions.") ||
    getLicense.includes("no known restrictions on use.");
  if (data.isCC0) {
    data.internalTags.push("#nolicenseissue");
    data.internalTags.push("#digitalcommonwealth");
  } else {
    data.internalTags.push("#licenseissue");
  }

  let getTitle = await page.evaluate(() => {
    let title = "";
    let titleIndex = [
      // @ts-ignore
      ...document.querySelectorAll(".document-metadata *"),
    ].findIndex((node) => node.textContent.trim() === "Title:");
    if (titleIndex !== -1) {
      // @ts-ignore
      title = [...document.querySelectorAll(".document-metadata *")][titleIndex + 1].textContent;
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
    // tags.push(...titleTags);
  }

  let getDescription = await page.evaluate(() => {
    let description = "";
    let descriptionIndex = [
      // @ts-ignore
      ...document.querySelectorAll(".document-metadata *"),
    ].findIndex((node) => node.textContent.trim() === "Description:");
    if (descriptionIndex !== -1) {
      // @ts-ignore
      description = [...document.querySelectorAll(".document-metadata *")][descriptionIndex + 1]
        .textContent;
    }

    return description;
  });
  if (getDescription?.length) {
    const wordToDeleteSet = new Set(IGNORE_WORD);
    let descriptionTags = getDescription
      .replaceAll("  ", " ")
      .replace(new RegExp("[^a-z0-9_ ]", "gi"), "")
      .toLowerCase()
      .split(" ");
    // console.log("titleTags", titleTags);
    descriptionTags = descriptionTags.filter((word) => {
      if (word.length > 2) {
        return !wordToDeleteSet.has(word);
      }
      return false;
    });
    console.log("titleTags", descriptionTags);
    // tags.push(...titleTags);
  }

  console.log("internalTags", data.internalTags);
  console.log(data);
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

const extractImageZip = async function (buffer) {
  // const files = {
  //   fileName: "",
  //   path: "",
  //   tmp: "",
  // };
  const files = [];
  return new Promise((resolve) => {
    const exists = new Set();

    const tmpobjZip = tmp.fileSync();
    console.log(tmpobjZip.name);
    fs.writeFileSync(tmpobjZip.name, buffer, { encoding: "base64" });
    fs.createReadStream(tmpobjZip.name)
      .pipe(unzipper.Parse())
      .on("entry", (entry) => {
        const fileName = entry.path;

        console.log(fileName);
        // const content =  entry.buffer();
        // console.log(entry);
        if (entry.type === "File" && fileName.includes("commonwealth")) {
          exists.add(fileName);
          const tmpobjFile = tmp.fileSync({
            postfix: `.${fileName.split(".").pop().toLowerCase()}`,
          });
          // files.fileName = fileName;
          // files.path = tmpobjFile.name;
          // files.tmp = tmpobjFile;
          files.push({
            fileName: fileName,
            filePath: tmpobjFile.name,
            tmpData: tmpobjFile,
          });
          entry.pipe(fs.createWriteStream(`${tmpobjFile.name}`));
        } else {
          entry.autodrain();
        }
      })
      .on("close", () => {
        tmpobjZip.removeCallback();
        resolve(files);
      });
  });
};
const extractImageZip2 = async function (buffer, destinationDir) {
  const files = [];
  return new Promise((resolve) => {
    const exists = new Set();
    fs.mkdir(destinationDir, { recursive: true }, () => {
      const tmpobj = tmp.fileSync();
      fs.writeFileSync(tmpobj.name, buffer, { encoding: "base64" });
      fs.createReadStream(tmpobj.name)
        .pipe(unzipper.Parse())
        .on("entry", (entry) => {
          const fileName = entry.path;
          // const content =  entry.buffer();
          // console.log(entry);
          if (entry.type === "File" && fileName.includes("commonwealth")) {
            exists.add(fileName);
            files.push({
              name: fileName,
              path: `${tmpobj.name}`,
              // buffer: content,
            });
            entry.pipe(fs.createWriteStream(`${tmpobj.name}`));
          } else {
            entry.autodrain();
          }
        })
        .on("close", async () => {
          let zipFilePath = "";
          for (var i = 0; i < files.length; i++) {
            if (files[i].name.startsWith("2_")) {
              zipFilePath = files[i].path;
              break;
            }
          }

          if (zipFilePath?.length) {
            zipFilePath = extractZipFile[0].path;
          }
          let [imageBuffer, imageMetadata, imageExtension] = await readZipBuffer(zipFilePath);
          tmpobj.removeCallback();
          resolve(imageBuffer, imageMetadata, imageExtension);
        });
    });
  });
};

const checkImageType = async (url) => {
  console.log(url);
  const response = await fetch(url);
  const checkStatus = response.status;
  const contentType = await response.headers.get("content-type");
  const buffer = await response.buffer();
  const imageType = await fileType.fromBuffer(buffer);
  console.log("checkStatus", checkStatus);
  // console.log("buffer", buffer);

  if (!imageType?.ext) {
    throw new Error("Invalid image");
  }
  const imageExtension = imageType.ext;

  return [buffer, { contentType }, imageExtension];
};

const readZipBuffer = async (filepath) => {
  var buffer = fs.readFileSync(filepath);
  const imageType = await fileType.fromBuffer(buffer);
  let contentType = mime.getType(filepath);
  // console.log("contentType", contentType);
  if (!imageType?.ext) {
    throw new Error("Invalid image");
  }
  const imageExtension = imageType.ext;

  return [buffer, { contentType }, imageExtension];
};
const getEachSubject = async (page, subject) => {
  const subjectIemArr = [];
  // eslint-disable-next-line no-shadow
  const getSubjectValue = await page.evaluate((subject) => {
    let subjectValue = "";
    const subjectIndex = [
      // @ts-ignore
      ...document.querySelectorAll(".document-metadata *"),
    ].findIndex((node) => node.textContent.trim() === subject);
    if (subjectIndex !== -1) {
      subjectValue = [
        // @ts-ignore
        ...document.querySelectorAll(".document-metadata *"),
      ][subjectIndex + 1].textContent;
    }

    return subjectValue;
  }, subject);

  if (getSubjectValue?.length) {
    subjectIemArr.push(
      ...getSubjectValue
        .trim()
        .toLowerCase()
        .replaceAll(/\n/g, "$")
        .replaceAll(".", "")
        .replaceAll(" & ", "$")
        .replaceAll(" and ", "$")
        .replaceAll(" or ", "$")
        .replaceAll("(", "$")
        .replaceAll(")", "$")
        .replaceAll(",", "$")
        .replaceAll(";", "$")
        .replaceAll("/", "$")
        .split("$")
        .map((a) =>
          a
            .trim()
            .replace(new RegExp("[^a-z0-9_ ]", "gi"), " ")
            .replace(new RegExp(" {2}", "gi"), " ")
            .trim()
        )
    );
  }
  return subjectIemArr;
};
let pushtoTags = async (tags, keywordArr) => {
  if (keywordArr?.length) {
    tags.push(...keywordArr);
  }
};

// const extractImageZip = async function (buffer, destinationDir) {
//   const files = [];
//   return new Promise((resolve) => {
//     const exists = new Set();
//     fs.mkdir(destinationDir, { recursive: true }, () => {
//       const tmpobj = tmp.fileSync();
//       fs.writeFileSync(tmpobj.name, buffer, { encoding: "base64" });
//       fs.createReadStream(tmpobj.name)
//         .pipe(unzipper.Parse())
//         .on("entry", (entry) => {
//           const fileName = entry.path;
//           // const content =  entry.buffer();
//           // console.log(entry);
//           if (entry.type === "File" && fileName.includes("commonwealth")) {
//             exists.add(fileName);
//             files.push({
//               name: fileName,
//               path: `${destinationDir}/${fileName}`,
//               // buffer: content,
//             });
//             entry.pipe(fs.createWriteStream(`${destinationDir}/${fileName}`));
//           } else {
//             entry.autodrain();
//           }
//         })
//         .on("close", () => {
//           tmpobj.removeCallback();
//           resolve(files);
//         });
//     });
//   });
// };
