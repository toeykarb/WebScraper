const puppeteer = require('puppeteer');
const { IMAGES_EXTENSION, stockphotoTags } = require('./utils');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fileType = require('file-type');

const data = {
  tags: [],
  internalTags: [],
  isCC0: false,
  authorTags: '',
  articleId: null,
};
(async (config = {}) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', (consoleObj) => console.log(consoleObj.text()));
  await page.setViewport({ width: 2000, height: 1200, deviceScaleFactor: 1 });
  //   await page.goto("https://pxhere.com/en/photo/1168447", {
  //     waitUntil: ["networkidle0", "domcontentloaded"],
  //   });
  await page.goto(
    'https://www.foodiesfeed.com/free-food-photo/grilles-asparagus-with-limes-and-sesame-seeds/',
    {
      waitUntil: ['networkidle0', 'domcontentloaded'],
    }
  );
  try {
    await page.waitForSelector('.sp-image-wrap');
  } catch (error) {
    console.log(error);
  }

  await page.waitForTimeout(3000);

  const checkimage = await page.evaluate(() => {
    try {
      //page.waitForSelector('.sp-image-wrap');
      return document.querySelector('.sp-image-wrap .sp-image');
    } catch (error) {
      return null;
    }
  });
  console.log(checkimage);
  if (!checkimage) {
    console.log('Error No image');
  }
  const downloadLink = await page.evaluate(() => {
    try {
      const results = document.querySelector('.sp-download .sp-download-button');
      return results.getAttribute('href');
    } catch (error) {
      return null;
    }
  });
  if (!downloadLink) {
    console.log(`No Image download link present on this page - skip scraping`);
  }
  console.log(downloadLink);
  // const imageExtension = data.imageLink.split(".").pop().toLowerCase();
  // console.log(imageExtension);
  let licenseText = '';
  try {
    licenseText = await page.evaluate(
      `document.querySelector('.sp-col-right-inner .sp-info .hover-u') ? document.querySelector('.sp-col-right-inner .sp-info .hover-u').innerText.toLowerCase():'';`
    );
  } catch (error) {
    console.log(error);
  }
  console.log(licenseText);
  data.isCC0 = licenseText.includes('cc0 license');

  if (data.isCC0) {
    console.log('#nolicenseissue');
    //data.internalTags.push("#picography");
  } else {
    console.log('licenseissue');
  }

  let rawAuthorLink = '';
  let rawAuthorText = '';
  try {
    rawAuthorLink = await page.evaluate(
      "document.querySelector(`.sp-author-box .sp-author a`) ? document.querySelector(`.sp-author-box .sp-author a`).getAttribute('href') : ''"
    );

    rawAuthorText = await page.evaluate(
      "document.querySelector(`.sp-author-box .sp-author a`)  ? document.querySelector(`.sp-author-box .sp-author a`).innerText : ''"
    );
  } catch (error) {
    console.log(error);
  }

  data.authorLink = rawAuthorLink && rawAuthorLink.length ? rawAuthorLink : '';
  data.authorTags = rawAuthorText.length
    ? [
        `#${rawAuthorText
          .trim()
          .toLowerCase()
          .replace(new RegExp('[^a-z0-9]', 'gi'), '')
          .replace(new RegExp(' ', 'gi'), '')
          .trim()}`,
      ]
    : [];
  console.log(data.authorLink);
  console.log(data.authorTags);
  data.articleId = await page.evaluate(() => {
    const results = document.querySelector('.like-content .unfav-button');

    if (results) {
      return results.getAttribute('data-post_id');
    }
    return null;
  });
  console.log(data.articleId);

  console.log('Get tags');
  try {
    const tags =
      (await page.evaluate(
        `[...document.querySelectorAll('.sp-tags .sp-tag .label')].map(a => a.innerText.trim().toLowerCase())`
      )) || [];

    data.tags.push(...tags);
  } catch (error) {
    console.log(error);
  }
  console.log(data.tags);

  // await page.screenshot({
  //   path: "foodiesfeed.jpeg",
  //   type: "jpeg",
  //   fullPage: true,
  //   quality: 50,
  // });
  await page.goto(downloadLink, {
    waitUntil: ['networkidle0', 'domcontentloaded'],
  });
  await page.waitForTimeout(10000);
  await page.waitForSelector('.dow-fail');

  data.imageLink = await page.evaluate(() => {
    try {
      const results = document.querySelector('.dow-fail a');
      return results.getAttribute('href');
    } catch (error) {
      return null;
    }
  });
  if (!data.imageLink) {
    return {
      statusCode: 200,
      body: {
        message: `No Image download link present on this page - skip scraping  ${data.imageLink}`,
      },
    };
  }
  console.log(data.imageLink);
  const [imageBuffer, imageMetadata, imageExtension] = await downloadFile(data.imageLink);
  console.log(imageBuffer);
  console.log(imageMetadata);
  console.log(imageExtension);
  console.log('done');

  await browser.close();
})();

const downloadFile = async (url) => {
  const response = await fetch(url);
  const contentType = await response.headers.get('content-type');
  const buffer = await response.buffer();

  const imageType = await fileType.fromBuffer(buffer);
  if (!imageType?.ext) {
    throw new Error('Invalid image');
  }
  const imageExtension = imageType.ext;
  return [buffer, contentType, imageExtension];
};
