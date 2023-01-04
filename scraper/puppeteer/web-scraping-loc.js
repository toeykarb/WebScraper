const puppeteer = require("puppeteer");
const { IMAGES_EXTENSION, stockphotoTags, IGNORE_WORD } = require("./utils");
const url = "https://www.loc.gov/item/2017877351/";
console.log("url", url);
const data = {
  // projectTags,
  tags: [],
  internalTags: [],
  authorTags: [],
};
var checkErrorUrl = url.includes("govhttps://") || url.includes(".jpg");
console.log("checkErrorUrl", checkErrorUrl);
if (checkErrorUrl) {
  return false;
}

const onlyUnique = (value, index, self) => {
  return self.indexOf(value) === index;
};

(async (config = {}) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // page.on('console', (consoleObj) => console.log(consoleObj.text()));
  await page.setViewport({ width: 1800, height: 1000, deviceScaleFactor: 1 });
  await page.goto(url, {
    waitUntil: ["networkidle0", "domcontentloaded"],
  });
  await page.waitForTimeout(3000);

  var checkErrorUrl = url.includes("govhttps://") || url.includes(".jpg");
  if (checkErrorUrl) {
    console.log("Image link error - skip scraping");
  }

  const checkImageresource = await page.$("#resources");

  if (!checkImageresource) {
    const checkImageview = await page.$("#viewer-image");
    if (!checkImageview) {
      console.log(`errrrrrrrrrrrrrorrrrrrrrrrrr`);
    }
  }

  const openLicenseSection = await page.$(".js-expandmore #label_expand_1");
  if (openLicenseSection) {
    try {
      openLicenseSection.click();
    } catch (error) {
      console.log(error);
    }
    await page.waitForTimeout(500);
  }
  const checkUrl = url.includes("resource");
  let imageLink = [];
  if (checkUrl) {
    const checkDownloadOption = await page.$("#download");
    if (!checkDownloadOption) {
      console.log("no DownloadOption");
      return false;
    }
    // imageLink = await page.evaluate(
    //   "[...document.querySelectorAll(`#download [data-file-download='TIFF']`)].map(a => a.getAttribute('value'))"
    // );
    // if (imageLink.length <= 0) {
    //   imageLink = await page.evaluate(
    //     "[...document.querySelectorAll(`#download [data-file-download='JPEG']`)].map(a => a.getAttribute('value'))"
    //   );
    // }
    imageLink = await page.evaluate(
      "[...document.querySelectorAll(`#download option`)].map(a => a.getAttribute('value'))"
    );
  } else {
    const checkDownloadOption = await page.$("#select-resource0");
    if (!checkDownloadOption) {
      console.log("no DownloadOption");
      return false;
    }
    // imageLink = await page.evaluate(
    //   "[...document.querySelectorAll(`#select-resource0 [data-file-download='TIFF']`)].map(a => a.getAttribute('value'))"
    // );
    // if (imageLink.length <= 0) {
    //   imageLink = await page.evaluate(
    //     "[...document.querySelectorAll(`#select-resource0 [data-file-download='JPEG']`)].map(a => a.getAttribute('value'))"
    //   );
    // }
    imageLink = await page.evaluate(() => {
      const test = [...document.querySelectorAll(`#select-resource0 option`)].map((a) => {
        a.getAttribute("value");
      });
    });
  }

  console.log("imageLink", imageLink);
  let licenseText = await page.evaluate(
    "document.querySelector('.rights-and-access-content ul li span') ? document.querySelector('.rights-and-access-content ul li span').innerText.toLowerCase() : '';"
  );
  data.isCC0 =
    licenseText.includes("no known restrictions") ||
    licenseText.includes("no known copyright restriction") ||
    licenseText.includes("no copyright restriction known");
  console.log(data.isCC0);

  const getCatalogData = await page.evaluate(
    "document.querySelector(`.item-cataloged-data`) ? document.querySelector(`.item-cataloged-data`).innerText.toLowerCase() : ''"
  );
  console.log(getCatalogData);
  const isNYWTS = getCatalogData.includes("nywt&s staff") || getCatalogData.includes("nywts staff");
  console.log(isNYWTS);
  // data.imageLink = imageLink[imageLink.length - 1];

  console.log("data.imageLink :", data.imageLink);
  if (!data.imageLink || !data.imageLink.length) {
    console.log("No image link - skip scraping " + url);
  } else {
    const imageExtension = data.imageLink.split(".").pop().toLowerCase();
    if (![...IMAGES_EXTENSION].includes(imageExtension)) {
      console.log(`Invalid image extension ${imageExtension} for ${url} - skip scraping`);
    }
    console.log("imageExtension :", imageExtension);
  }
  // let licenseText = '';
  // try {
  //   licenseText = await page.evaluate(
  //     "document.querySelector('.rights-and-access-content ul li span') ? document.querySelector('.rights-and-access-content ul li span').innerText.toLowerCase() : '';"
  //   );
  // } catch (error) {
  //   console.log(error);
  // }
  // data.isCC0 = licenseText.includes('no known restrictions');
  // data.internalTags.push('#loc');
  // if (data.isCC0) {
  //   data.internalTags.push('#nolicenseissue');
  //   // data.tags.push(...CC0_TAGS);
  // } else {
  //   data.internalTags.push('#licenseissue');
  // }
  // // Get author tags and link
  // let rawAuthorLink = '';
  // //let rawAuthorText = '';
  // try {
  //   rawAuthorLink = await page.evaluate(
  //     "document.querySelector(`.short-list [data-field-label='Contributors']`) ? document.querySelector(`.short-list [data-field-label='Contributors']`).getAttribute('href') : ''"
  //   );
  // } catch (error) {
  //   console.log(error);
  // }
  // data.authorLink = rawAuthorLink && rawAuthorLink.length ? rawAuthorLink : '';

  // var getrawAuthorText = await page.evaluate(() => {
  //   const rawAuthorText = [
  //     ...document.querySelectorAll(`.short-list [data-field-label='Contributors']`),
  //   ]
  //     ? [...document.querySelectorAll(`.short-list [data-field-label='Contributors']`)].map(
  //         (a) =>
  //           `#${a.innerText
  //             .trim()
  //             .toLowerCase()
  //             .replace(new RegExp('@', 'gi'), '')
  //             .replace(new RegExp('[^a-z0-9]', 'gi'), '')
  //             .replace(new RegExp(' ', 'gi'), '')
  //             .trim()}`
  //       )
  //     : '';
  //   return rawAuthorText;
  // });
  // var getrawAuthorText = await page.evaluate(() => {
  //   const rawAuthorText = [
  //     ...document.querySelectorAll(`.short-list [data-field-label='Contributors']`),
  //   ]
  //     ? [...document.querySelectorAll(`.short-list [data-field-label='Contributors']`)].map((a) =>
  //         a.innerText.toLowerCase()
  //       )
  //     : '';
  //   return rawAuthorText;
  // });
  // console.log('getrawAuthorText', getrawAuthorText);
  // if (getrawAuthorText?.length) {
  //   const allAuthorTag = getrawAuthorText.map(
  //     (a) =>
  //       `#${a
  //         .trim()
  //         .replace(new RegExp('@', 'gi'), '')
  //         .replace(new RegExp('[^a-z0-9]', 'gi'), '')
  //         .replace(new RegExp(' ', 'gi'), '')
  //         .trim()}`
  //   );
  //   data.authorTags.push(...allAuthorTag);

  //   const authorKeyword = getrawAuthorText.map((a) => {
  //     let reveseText = a.split(',').reverse().join(' ').trim();
  //     return reveseText;
  //   });
  //   console.log('authorKeyword', authorKeyword);
  //   data.tags.push(...authorKeyword);
  // }

  // console.log('authorLink : ', data.authorLink);
  // console.log('authorTags : ', data.authorTags);
  // //  getAnotherarticleId = await page.evaluate(() => {
  // //       const articleIdIndex = [
  // //         // @ts-ignore
  // //         ...document.querySelectorAll('.item-cataloged-data *'),
  // //       ].findIndex((node) => node.textContent.trim() === 'LCCN Permalink');

  // //       const aricleSource =
  // //         articleIdIndex !== -1
  // //           ? // @ts-ignore
  // //             [...document.querySelectorAll('.item-cataloged-data *')][articleIdIndex + 1].textContent
  // //           : '';
  // //       return aricleSource;
  // //     });
  // //     if (getAnotherarticleId.length == 0) {
  // //       ImageId = url.replace('://', '').split('/')[2];
  // //       data.articleId = ImageId.length
  // //         ? `${ImageId.trim()
  // //             .toLowerCase()
  // //             .replace(new RegExp('[^a-z0-9]', 'gi'), '')
  // //             .replace(new RegExp(' ', 'gi'), '')
  // //             .trim()}`
  // //         : '';
  // //     } else {
  // //       data.articleId = getAnotherarticleId.replace('://', '').split('/')[1].trim();
  // //     }

  // // version 1
  // try {
  //   let dateResult = '';
  //   const getDates = await page.evaluate(
  //     "document.querySelector(`.short-list [data-field-label='Dates']`) ? document.querySelector(`.short-list [data-field-label='Dates']`).innerText : ''"
  //   );
  //   if (getDates?.length) {
  //     dateResult = `#${getDates
  //       .trim()
  //       .toLowerCase()
  //       .replace(new RegExp('[^a-z0-9]', 'gi'), '')
  //       .replace(new RegExp(' ', 'gi'), '')
  //       .trim()}`;
  //     console.log('Dates : ', dateResult);
  //     data.internalTags.push(dateResult);
  //   } else {
  //     dateResult = '#nodates';
  //     console.log('Dates : ', dateResult);
  //     data.internalTags.push(dateResult);
  //   }
  // } catch (error) {
  //   console.log(error);
  // }

  // // version 2
  // // try {
  // //   let dateResult = '';
  // //   const getDates = await page.evaluate(
  // //     "document.querySelector(`.short-list [data-field-label='Dates']`) ? document.querySelector(`.short-list [data-field-label='Dates']`).innerText : ''"
  // //   );
  // //   if (getDates?.length) {
  // //     if (getDates.includes('to')) {
  // //       let dateArray = getDates.split('to');
  // //       dateArray = dateArray.map((a) =>
  // //         a.length
  // //           ? `#${a
  // //               .trim()
  // //               .toLowerCase()
  // //               .replace(new RegExp('[^a-z0-9]', 'gi'), '')
  // //               .replace(new RegExp(' ', 'gi'), '')
  // //               .trim()}s`
  // //           : ''
  // //       );
  // //       data.internalTags.push(...dateArray);
  // //       console.log('Dates : ', dateArray);
  // //     } else {
  // //       dateResult = `#${getDates
  // //         .trim()
  // //         .toLowerCase()
  // //         .replace(new RegExp('[^a-z0-9]', 'gi'), '')
  // //         .replace(new RegExp(' ', 'gi'), '')
  // //         .trim()}s`;
  // //       console.log('Dates : ', dateResult);
  // //       data.internalTags.push(dateResult);
  // //     }
  // //   } else {
  // //     dateResult = '#nodates';
  // //     console.log('Dates : ', dateResult);
  // //     data.internalTags.push(dateResult);
  // //   }
  // // } catch (error) {
  // //   console.log(error);
  // // }
  // console.log('internalTags :', data.internalTags);

  // if (checkUrl) {
  //   var getAnotherarticleId = '';
  //   let ImageId = url.replace('://', '').split('/')[2];
  //   data.articleId = ImageId.length
  //     ? `${ImageId.trim()
  //         .toLowerCase()
  //         .replace(new RegExp('[^a-z0-9]', 'gi'), '')
  //         .replace(new RegExp(' ', 'gi'), '')
  //         .trim()}`
  //     : '';
  // } else {
  //   data.articleId = url.replace('://', '').split('/')[2].trim();
  // }
  // const checkPage = url.includes('sp=');
  // if (!data.articleId && !data.articleId.length) {
  //   console.log(`incorrect articleId ${data.articleId} for ${url} - skip scraping`);
  // } else if (checkPage) {
  //   let currentpage = url
  //     .split('sp=')[1]
  //     .trim()
  //     .toLowerCase()
  //     .replace(new RegExp('[^a-z0-9]', 'gi'), '')
  //     .replace(new RegExp(' ', 'gi'), '')
  //     .trim();
  //   data.articleId = `${data.articleId}sp${currentpage}`;
  // }
  // console.log('articleId :', data.articleId);

  console.log("Get tags");
  try {
    const tags =
      (await page.evaluate(
        "[...document.querySelectorAll(`.short-list a[data-field-label='Subjects']`)].map(a => a.innerText.trim().toLowerCase().replace(new RegExp('[^a-z0-9_ ]', 'gi'), ''))"
      )) || [];
    if (Array.isArray(tags)) {
      data.tags.push(...tags);
    }
    console.log(tags);
  } catch (error) {
    console.log(error);
  }
  var description = "";
  description = await page.evaluate(() => {
    const descriptionIndex = [
      // @ts-ignore
      ...document.querySelectorAll(".item-cataloged-data *"),
    ].findIndex((node) => node.textContent.trim() === "Title");
    const textSource =
      descriptionIndex !== -1
        ? // @ts-ignore
          [...document.querySelectorAll(".item-cataloged-data *")][descriptionIndex + 1].textContent
        : "";
    return textSource;
  });

  if (description.length > 0) {
    // testkeyword
    let keywordDescription = description.replace(new RegExp("[^a-z0-9]", "gi"), " ").split(" ");

    keywordDescription = keywordDescription.map((element) => element.toLowerCase().trim());
    // console.log('keywordDescription Change', keywordDescription);
    const wordToDeleteSet = new Set(IGNORE_WORD);
    keywordDescription = keywordDescription.filter((word) => {
      if (word.length > 2) {
        return !wordToDeleteSet.has(word);
      }
      return false;
    });
    console.log("keywordDescription1", keywordDescription);
    // console.log('keywordDescription After delete', keywordDescription);
    data.tags.push(...keywordDescription);
  }
  data.tags.push("commuters");
  data.tags = Array.from(new Set(data.tags));
  console.log(data.tags);

  // const warningTag = stockphotoTags.some(
  //   (substring) =>
  //     description.toLowerCase().includes(substring.toLowerCase()) || description.includes('AP')
  // );
  // if (warningTag) {
  //   data.internalTags.push('#licensewarning');
  // }
  description = description + "negro" + "negro" + "negro" + "negro";
  console.log("description before : ", description);
  const ignoreWord = ["Negro", "Negroes", "nigger"];
  var newignoreJoin = ignoreWord.join("|");
  var newDes = description.replace(new RegExp("(" + newignoreJoin + ")", "gi"), "remove");
  console.log("newDes", newDes);
  data.description = description;
  data.description_more = `View public domain image source <a href="${url}" target="_blank" rel="noopener noreferrer nofollow">here</a>`;
  console.log("description", data.description);
  console.log("description_more", data.description_more);
  //console.log(data.tags);
  // console.log('internalTags :', data.internalTags);
  // // await page.screenshot({
  // //   path: 'loc.jpeg',
  // //   type: 'jpeg',
  // //   fullPage: true,
  // //   quality: 50,
  // // });
  // // console.log('done');

  await browser.close();
})();
